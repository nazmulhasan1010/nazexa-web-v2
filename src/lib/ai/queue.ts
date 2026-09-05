import { db } from '@/lib/db';
import OpenAI from 'openai';

export async function processAiJob(jobId: string) {
  const job = await db.aIJob.findUnique({ where: { id: jobId } });
  if (!job) return;

  try {
    await db.aIJob.update({
      where: { id: jobId },
      data: { status: 'processing' },
    });

    const config = await db.aiproviderconfig.findUnique({ where: { id: 'global' } });
    if (!config) throw new Error('AI configuration not found');

    let responseText = '';
    let providerUsed = config.activeProvider;
    let modelUsed = '';

    if (config.activeProvider === 'google') {
      if (!config.googleApiKey) throw new Error('Google API Key missing');
      modelUsed = config.googleModel || 'gemini-1.5-pro';
      
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelUsed}:generateContent?key=${config.googleApiKey}`;
      
      // We will parse the prompt which was sent by Nazexa-DB.
      const fullPrompt = (job.context ? `Context: ${job.context}\n\n` : '') + job.prompt;

      const geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }]
        })
      });

      const geminiData = await geminiRes.json();
      if (!geminiRes.ok) {
         throw new Error(geminiData.error?.message || 'Failed to call Google GenAI');
      }
      responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
    } else {
      // Find active OpenAI agent
      const agent = await db.aiagent.findFirst({
        where: { isActive: true },
      });
      if (!agent) throw new Error('No active OpenAI compatible agent found');

      providerUsed = 'openai-compatible';
      modelUsed = agent.model;

      const client = new OpenAI({
        apiKey: agent.apiKey,
        baseURL: agent.baseUrl || 'https://openrouter.ai/api/v1',
      });

      const messages: any[] = [];
      if (job.context) {
        messages.push({ role: 'system', content: job.context }); // Keep context as system prompt
      }
      messages.push({ role: 'user', content: job.prompt });

      const completion = await client.chat.completions.create({
        model: agent.model,
        messages,
      });

      responseText = completion.choices[0]?.message?.content || 'No response generated';
    }

    await db.aIJob.update({
      where: { id: jobId },
      data: {
        status: 'completed',
        response: responseText,
        provider: providerUsed,
        modelUsed,
      },
    });
  } catch (error: any) {
    console.error('AI Queue Error processing job:', jobId, error);
    
    // We will let the polling mechanism or background task handle this.
    // But since this is a simplified inline worker, let's just fail it if it's a hard error like auth.
    const isHardError = error.message.toLowerCase().includes('key') || error.message.toLowerCase().includes('auth') || error.message.toLowerCase().includes('unauthorized');
    
    if (job.retryCount < 2 && !isHardError) {
      await db.aIJob.update({
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
      await db.aIJob.update({
        where: { id: jobId },
        data: {
          status: 'failed',
          error: error.message || 'Unknown error',
        },
      });
    }
  }
}
