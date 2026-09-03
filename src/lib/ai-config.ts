import { db } from '@/lib/db';

export async function getGlobalAIProviderConfig() {
  let config = await db.aiproviderconfig.findUnique({
    where: { id: 'global' },
  });
  if (!config) {
    config = await db.aiproviderconfig.create({
      data: {
        id: 'global',
        activeProvider: 'openai',
      },
    });
  }
  return config;
}

export async function getActiveAIConfig() {
  const config = await getGlobalAIProviderConfig();

  if (config.activeProvider === 'google') {
    return {
      provider: 'google-genai',
      model: config.googleModel || 'gemini-1.5-pro',
      credentials: {
        apiKey: config.googleApiKey,
      },
    };
  }

  const activeAgent = await db.aiagent.findFirst({
    where: { isActive: true },
  });

  return {
    provider: 'openai-compatible',
    agent: activeAgent
      ? {
          name: activeAgent.name,
          baseUrl: activeAgent.baseUrl,
          model: activeAgent.model,
        }
      : null,
    credentials: {
      apiKey: activeAgent?.apiKey,
    },
  };
}
