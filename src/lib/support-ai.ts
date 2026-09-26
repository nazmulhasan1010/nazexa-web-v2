import { db } from './db';
import OpenAI from 'openai';
import { recordAiUsage, normalizeGoogleUsage, normalizeOpenAiUsage, detectProvider } from './ai/usage';

export async function generateSupportDraft(ticketId: string, adminId: string): Promise<string> {
  const ticket = await db.supportTicket.findUnique({
    where: { id: ticketId },
    include: {
      user: true,
      messages: {
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  if (!ticket) throw new Error('Ticket not found');

  const conversationHistory = ticket.messages.map((m: any) => 
    `${m.senderType === 'USER' ? 'Customer' : 'Support Agent'}: ${m.body}`
  ).join('\n\n');

  const systemPrompt = `You are an expert customer support agent for Nazexa.
Analyze the following support ticket and draft a helpful, professional, and empathetic response.
Keep the tone aligned with Nazexa's brand (modern, developer-friendly, clear).
Do not invent facts or promise features that don't exist.
Sign off as "Nazexa Support".

Ticket Subject: ${ticket.subject}
Customer Name: ${ticket.user.name || 'Customer'}
Customer Email: ${ticket.user.email}

Conversation History:
${conversationHistory}`;

  const config = await db.aiProviderConfig.findUnique({ where: { id: 'global' } });
  if (!config) throw new Error('AI configuration not found');

  let responseText = '';
  const startTime = Date.now();

  if (config.activeProvider === 'google') {
    if (!config.googleApiKey) throw new Error('Google API Key missing');
    const modelUsed = config.googleModel || 'gemini-1.5-pro';
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelUsed}:generateContent?key=${config.googleApiKey}`;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
      }),
    });

    const geminiData = await geminiRes.json();
    if (!geminiRes.ok) {
      throw new Error(geminiData.error?.message || 'Failed to call Google GenAI');
    }
    responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';

    await recordAiUsage({
      jobId: `sync-support-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      userId: adminId,
      appId: 'nazexa-web-support',
      provider: 'google',
      model: modelUsed,
      usage: normalizeGoogleUsage(geminiData.usageMetadata),
      latencyMs: Date.now() - startTime,
      status: 'success'
    });

  } else {
    const agent = await db.aiAgent.findFirst({ where: { isActive: true } });
    if (!agent) throw new Error('No active OpenAI compatible agent found');

    const baseUrl = agent.baseUrl || 'https://openrouter.ai/api/v1';
    const client = new OpenAI({ apiKey: agent.apiKey, baseURL: baseUrl });

    const completion = await client.chat.completions.create({
      model: agent.model,
      messages: [{ role: 'system', content: systemPrompt }],
    });

    responseText = completion.choices[0]?.message?.content || 'No response generated';

    await recordAiUsage({
      jobId: `sync-support-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      userId: adminId,
      appId: 'nazexa-web-support',
      provider: detectProvider(baseUrl),
      model: agent.model,
      usage: normalizeOpenAiUsage(completion.usage),
      latencyMs: Date.now() - startTime,
      status: 'success'
    });
  }

  return responseText;
}
