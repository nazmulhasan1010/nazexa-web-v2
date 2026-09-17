/**
 * Static public rate tables for AI usage cost ESTIMATION.
 *
 * Prices are approximate USD per 1,000,000 tokens, based on public list pricing.
 * They are used only when a provider does not report a real cost in its response.
 * Any cost derived from these tables is labelled `costSource: "estimated"`.
 *
 * OpenRouter reports the real cost in the response body, so it is labelled
 * `costSource: "actual"` and never uses this table.
 */

export type TokenRate = {
  /** USD per 1M input (prompt) tokens */
  input: number;
  /** USD per 1M output (completion) tokens */
  output: number;
};

type RateEntry = { match: string[]; rate: TokenRate };

// Most specific matches first — the first entry whose `match` substring is
// contained in the (lower-cased) model name wins.
const RATE_TABLE: Record<string, RateEntry[]> = {
  openai: [
    { match: ['gpt-4o-mini'], rate: { input: 0.15, output: 0.6 } },
    { match: ['gpt-4o'], rate: { input: 2.5, output: 10 } },
    { match: ['gpt-4.1-nano'], rate: { input: 0.1, output: 0.4 } },
    { match: ['gpt-4.1-mini'], rate: { input: 0.4, output: 1.6 } },
    { match: ['gpt-4.1'], rate: { input: 2, output: 8 } },
    { match: ['gpt-4-turbo'], rate: { input: 10, output: 30 } },
    { match: ['gpt-4'], rate: { input: 30, output: 60 } },
    { match: ['gpt-3.5'], rate: { input: 0.5, output: 1.5 } },
    { match: ['o4-mini'], rate: { input: 1.1, output: 4.4 } },
    { match: ['o3-mini'], rate: { input: 1.1, output: 4.4 } },
    { match: ['o3'], rate: { input: 2, output: 8 } },
    { match: ['o1-mini'], rate: { input: 1.1, output: 4.4 } },
    { match: ['o1'], rate: { input: 15, output: 60 } },
  ],
  groq: [
    { match: ['llama-3.1-8b', 'llama3-8b'], rate: { input: 0.05, output: 0.08 } },
    {
      match: ['llama-3.3-70b', 'llama-3.1-70b', 'llama3-70b'],
      rate: { input: 0.59, output: 0.79 },
    },
    { match: ['llama-3.2-90b'], rate: { input: 0.9, output: 0.9 } },
    { match: ['mixtral-8x7b', 'mixtral'], rate: { input: 0.24, output: 0.24 } },
    { match: ['gemma2-9b', 'gemma-7b', 'gemma'], rate: { input: 0.2, output: 0.2 } },
    { match: ['qwen'], rate: { input: 0.29, output: 0.39 } },
  ],
  google: [
    {
      match: ['gemini-2.0-flash-lite', 'gemini-1.5-flash-8b'],
      rate: { input: 0.0375, output: 0.15 },
    },
    { match: ['gemini-2.0-flash', 'gemini-1.5-flash'], rate: { input: 0.075, output: 0.3 } },
    { match: ['gemini-2.5-pro', 'gemini-1.5-pro', 'gemini-pro'], rate: { input: 1.25, output: 5 } },
  ],
};

/**
 * Estimate cost in USD from a static rate table. Returns null when the model is
 * not recognised for the given provider (the UI then shows the cost as unknown).
 */
export function estimateCost(
  provider: string,
  model: string,
  inputTokens: number,
  outputTokens: number
): number | null {
  const entries = RATE_TABLE[provider];
  if (!entries) return null;

  const normalized = (model || '').toLowerCase();
  const entry = entries.find((e) => e.match.some((m) => normalized.includes(m)));
  if (!entry) return null;

  const cost =
    (inputTokens / 1_000_000) * entry.rate.input + (outputTokens / 1_000_000) * entry.rate.output;

  // Round to 6 decimals to avoid floating point noise for tiny amounts.
  return Math.round(cost * 1_000_000) / 1_000_000;
}

/**
 * Resolve the final cost for a usage record. A provider-reported cost always
 * wins (labelled "actual"); otherwise we fall back to the static estimate.
 */
export function resolveCost(
  provider: string,
  model: string,
  inputTokens: number,
  outputTokens: number,
  actualCost: number | null | undefined
): { costUsd: number | null; costSource: string | null } {
  if (typeof actualCost === 'number' && Number.isFinite(actualCost) && actualCost >= 0) {
    return { costUsd: actualCost, costSource: 'actual' };
  }

  const estimated = estimateCost(provider, model, inputTokens, outputTokens);
  if (estimated == null) return { costUsd: null, costSource: null };
  return { costUsd: estimated, costSource: 'estimated' };
}
