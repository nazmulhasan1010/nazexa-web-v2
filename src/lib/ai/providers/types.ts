/**
 * Normalized provider account-statistics shape (spec §3). Every provider
 * adapter maps its own API response into this structure so the UI never
 * carries provider-specific logic. A `null` metric means the provider does
 * not expose it → the UI renders "Unavailable". We never invent values.
 */

export type RateLimitAxis = {
  limit: number | null;
  remaining: number | null;
  reset: string | null;
};

export type ProviderRateLimits = {
  /** Request-count limits. For Groq this axis is per-day (RPD). */
  requests?: RateLimitAxis;
  /** Token limits. For Groq this axis is per-minute (TPM). */
  tokens?: RateLimitAxis;
  /** Seconds to wait, present only after a 429. */
  retryAfter?: number | null;
};

export type ProviderStatStatus = 'ok' | 'error' | 'unavailable';

export type NormalizedProviderStat = {
  provider: string;
  status: ProviderStatStatus;
  /** Credits/balance remaining (OpenRouter `limit_remaining`). */
  balance: number | null;
  /** Credits/spend used to date (OpenRouter `usage`). */
  usage: number | null;
  /** Account credit limit (OpenRouter `limit`). */
  quota: number | null;
  /** Remaining quota (mirrors balance where meaningful). */
  remaining: number | null;
  /** Provider-reported request count — not exposed by any of our providers. */
  requests: number | null;
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  rateLimits: ProviderRateLimits | null;
  /** Provider-specific extras (usageDaily/weekly/monthly, isFreeTier, notes). */
  extra: Record<string, unknown> | null;
  error: string | null;
  /** ISO timestamp of the last successful account sync (live fetch). */
  syncedAt: string | null;
  /** ISO timestamp of the last rate-limit header capture. */
  headersAt: string | null;
};

/** A provider that is configured in this install and can be synced. */
export type ConnectedProvider = {
  provider: string; // detected vendor: openai | groq | openrouter | google | custom
  apiKey: string;
  baseUrl: string | null;
};

/**
 * What an adapter returns: the normalized stat plus the untouched provider
 * response (persisted to the `raw` column for debugging, never sent to the
 * client).
 */
export type AdapterResult = {
  stat: NormalizedProviderStat;
  raw?: unknown;
};

export function emptyProviderStat(
  provider: string,
  status: ProviderStatStatus = 'unavailable'
): NormalizedProviderStat {
  return {
    provider,
    status,
    balance: null,
    usage: null,
    quota: null,
    remaining: null,
    requests: null,
    inputTokens: null,
    outputTokens: null,
    totalTokens: null,
    rateLimits: null,
    extra: null,
    error: null,
    syncedAt: null,
    headersAt: null,
  };
}
