import { db } from '@/lib/db';
import OpenAI from 'openai';
import {
  detectProvider,
  extractActualCost,
  normalizeGoogleUsage,
  normalizeOpenAiUsage,
  recordAiUsage,
  EMPTY_USAGE,
  type NormalizedUsage,
} from '@/lib/ai/usage';
import { captureRateLimitHeaders } from '@/lib/ai/provider-stats';

export async function processAiJob(jobId: string) {
  const job = await db.aiJob.findUnique({ where: { id: jobId } });
  if (!job) return;

  // Telemetry context — populated as we learn which provider/model handles the job.
  const startTime = Date.now();
  let detectedProvider = 'custom';
  let modelUsed = '';

  try {
    await db.aiJob.update({
      where: { id: jobId },
      data: { status: 'processing' },
    });

    const config = await db.aiProviderConfig.findUnique({ where: { id: 'global' } });
    if (!config) throw new Error('AI configuration not found');

    let responseText = '';
    let providerUsed = config.activeProvider;
    let usage: NormalizedUsage = EMPTY_USAGE;
    let actualCost: number | null = null;

    if (config.activeProvider === 'google') {
      detectedProvider = 'google';
      if (!config.googleApiKey) throw new Error('Google API Key missing');
      modelUsed = config.googleModel || 'gemini-1.5-pro';

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelUsed}:generateContent?key=${config.googleApiKey}`;

      // We will parse the prompt which was sent by Nazexa-DB.
      const fullPrompt = (job.context ? `Context: ${job.context}\n\n` : '') + job.prompt;

      const geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
        }),
      });

      const geminiData = await geminiRes.json();
      if (!geminiRes.ok) {
        throw new Error(geminiData.error?.message || 'Failed to call Google GenAI');
      }
      responseText =
        geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
      usage = normalizeGoogleUsage(geminiData.usageMetadata);
    } else {
      // Find active OpenAI agent
      const agent = await db.aiAgent.findFirst({
        where: { isActive: true },
      });
      if (!agent) throw new Error('No active OpenAI compatible agent found');

      providerUsed = 'openai-compatible';
      modelUsed = agent.model;

      const baseUrl = agent.baseUrl || 'https://openrouter.ai/api/v1';
      detectedProvider = detectProvider(baseUrl);

      const client = new OpenAI({
        apiKey: agent.apiKey,
        baseURL: baseUrl,
      });

      const messages: any[] = [];
      if (job.context) {
        messages.push({ role: 'system', content: job.context }); // Keep context as system prompt
      }
      messages.push({ role: 'user', content: job.prompt });

      const createParams: Record<string, unknown> = {
        model: agent.model,
        messages,
      };
      // OpenRouter reports real spend when usage accounting is requested.
      if (detectedProvider === 'openrouter') {
        createParams.usage = { include: true };
      }

      // Use `.withResponse()` so we can read the live `x-ratelimit-*` headers
      // from the real call — the only rate-limit signal OpenAI/Groq expose.
      const { data: completion, response } = await (
        client.chat.completions.create(createParams as any) as any
      ).withResponse();

      responseText = completion.choices[0]?.message?.content || 'No response generated';
      usage = normalizeOpenAiUsage(completion.usage);
      actualCost = extractActualCost(completion.usage);

      // Best-effort provider telemetry — never throws (see provider-stats).
      await captureRateLimitHeaders(detectedProvider, response.headers);
    }

    await db.aiJob.update({
      where: { id: jobId },
      data: {
        status: 'completed',
        response: responseText,
        provider: providerUsed,
        modelUsed,
      },
    });

    await recordAiUsage({
      jobId,
      provider: detectedProvider,
      model: modelUsed,
      appId: job.appId,
      userId: job.userId,
      usage,
      actualCost,
      latencyMs: Date.now() - startTime,
      status: 'success',
    });
  } catch (error: any) {
    console.error('AI Queue Error processing job:', jobId, error);

    // We will let the polling mechanism or background task handle this.
    // But since this is a simplified inline worker, let's just fail it if it's a hard error like auth.
    const isHardError =
      error.message.toLowerCase().includes('key') ||
      error.message.toLowerCase().includes('auth') ||
      error.message.toLowerCase().includes('unauthorized');

    if (job.retryCount < 2 && !isHardError) {
      await db.aiJob.update({
        where: { id: jobId },
        data: {
          status: 'pending',
          retryCount: { increment: 1 },
          error: error.message || 'Unknown error',
        },
      });
      // Optionally trigger it again after a delay
      setTimeout(() => processAiJob(jobId), 2000);
    } else {
      await db.aiJob.update({
        where: { id: jobId },
        data: {
          status: 'failed',
          error: error.message || 'Unknown error',
        },
      });

      // Terminal failure — record exactly one error usage record for this job.
      await recordAiUsage({
        jobId,
        provider: detectedProvider,
        model: modelUsed || 'unknown',
        appId: job.appId,
        userId: job.userId,
        usage: EMPTY_USAGE,
        latencyMs: Date.now() - startTime,
        status: 'error',
        errorMessage: error.message || 'Unknown error',
      });
    }
  }
}
