import { db } from '@/lib/db';
import { detectProvider } from '@/lib/ai/usage';
import type { ConnectedProvider } from './types';

export * from './types';
export { syncOpenRouter } from './openrouter';
export { syncGoogle } from './google';
export { parseRateLimitHeaders } from './rate-limit';

/** Same default the queue applies when an agent has no baseUrl. */
const DEFAULT_BASE_URL = 'https://openrouter.ai/api/v1';

/**
 * Derive the set of providers configured in this install that we can sync.
 * One entry per detected vendor; when several agents map to the same vendor we
 * prefer the active agent's key (matching which key the queue actually uses).
 */
export async function getConnectedProviders(): Promise<ConnectedProvider[]> {
  const [agents, config] = await Promise.all([
    db.aiAgent.findMany({ orderBy: { isActive: 'desc' } }),
    db.aiProviderConfig.findUnique({ where: { id: 'global' } }),
  ]);

  const byVendor = new Map<string, ConnectedProvider>();

  // Agents are ordered isActive-first, so the first entry per vendor wins.
  for (const agent of agents) {
    if (!agent.apiKey) continue;
    const baseUrl = agent.baseUrl || DEFAULT_BASE_URL;
    const provider = detectProvider(baseUrl);
    if (!byVendor.has(provider)) {
      byVendor.set(provider, { provider, apiKey: agent.apiKey, baseUrl });
    }
  }

  if (config?.googleApiKey) {
    byVendor.set('google', { provider: 'google', apiKey: config.googleApiKey, baseUrl: null });
  }

  return Array.from(byVendor.values());
}
