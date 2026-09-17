import { emptyProviderStat, type AdapterResult } from './types';

const OPENROUTER_KEY_URL = 'https://openrouter.ai/api/v1/key';
const TIMEOUT_MS = 10_000;

function num(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/**
 * Fetch real account data from OpenRouter using the customer's inference key.
 * `GET /api/v1/key` returns credit limit/remaining and all-time + daily/weekly/
 * monthly usage — the only provider of the four that exposes this to a normal
 * key. Any failure resolves to a `status: 'error'` stat (never throws).
 */
export async function syncOpenRouter(apiKey: string): Promise<AdapterResult> {
  const base = emptyProviderStat('openrouter');

  if (!apiKey) {
    return { stat: { ...base, status: 'error', error: 'Missing OpenRouter API key' } };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(OPENROUTER_KEY_URL, {
      method: 'GET',
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: controller.signal,
      cache: 'no-store',
    });

    const body = await res.json().catch(() => null);

    if (!res.ok) {
      const message =
        (body && (body.error?.message || body.error || body.message)) ||
        `OpenRouter responded ${res.status}`;
      return { stat: { ...base, status: 'error', error: String(message) }, raw: body };
    }

    const data = (body?.data ?? body ?? {}) as Record<string, unknown>;
    const limit = num(data.limit); // null = unlimited
    const remaining = num(data.limit_remaining); // null = unlimited
    const usage = num(data.usage);

    return {
      stat: {
        ...base,
        status: 'ok',
        quota: limit,
        remaining,
        balance: remaining,
        usage,
        extra: {
          usageDaily: num(data.usage_daily),
          usageWeekly: num(data.usage_weekly),
          usageMonthly: num(data.usage_monthly),
          isFreeTier: typeof data.is_free_tier === 'boolean' ? data.is_free_tier : null,
          limitReset: (data.limit_reset as string | null) ?? null,
          label: (data.label as string | null) ?? null,
          unlimited: limit == null,
        },
        error: null,
        syncedAt: new Date().toISOString(),
      },
      raw: body,
    };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.name === 'AbortError'
          ? 'OpenRouter request timed out'
          : err.message
        : 'OpenRouter request failed';
    return { stat: { ...base, status: 'error', error: message } };
  } finally {
    clearTimeout(timer);
  }
}
