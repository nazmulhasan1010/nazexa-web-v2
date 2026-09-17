import { db } from '@/lib/db';
import {
  getConnectedProviders,
  syncOpenRouter,
  syncGoogle,
  parseRateLimitHeaders,
  emptyProviderStat,
  type NormalizedProviderStat,
  type ProviderRateLimits,
  type ConnectedProvider,
} from '@/lib/ai/providers';

/** OpenRouter is the only live network sync — don't hammer it on rapid reloads. */
const OPENROUTER_STALE_MS = 30_000;
const RAW_CAP = 8_000;

/** Providers whose row status is owned by the header-capture path (no account API). */
const HEADER_OWNED = new Set(['openai', 'groq', 'custom']);

type ProviderRow = NonNullable<Awaited<ReturnType<typeof db.aiProviderStat.findFirst>>>;

function safeParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

/** Map a DB row to the normalized shape (drops `raw`, which never ships to the client). */
function mapRow(row: ProviderRow): NormalizedProviderStat {
  return {
    provider: row.provider,
    status: (row.status as NormalizedProviderStat['status']) || 'unavailable',
    balance: row.balance ?? null,
    usage: row.usage ?? null,
    quota: row.quota ?? null,
    remaining: row.remaining ?? null,
    requests: row.requests ?? null,
    inputTokens: row.inputTokens ?? null,
    outputTokens: row.outputTokens ?? null,
    totalTokens: row.totalTokens ?? null,
    rateLimits: safeParse<ProviderRateLimits>(row.rateLimits),
    extra: safeParse<Record<string, unknown>>(row.extra),
    error: row.error ?? null,
    syncedAt: row.syncedAt ? row.syncedAt.toISOString() : null,
    headersAt: row.headersAt ? row.headersAt.toISOString() : null,
  };
}

/** Overlay captured rate-limit headers (owned by the capture path) onto a fresh stat. */
function withCapturedHeaders(
  stat: NormalizedProviderStat,
  row: ProviderRow | undefined
): NormalizedProviderStat {
  if (!row) return stat;
  const rateLimits = safeParse<ProviderRateLimits>(row.rateLimits);
  return {
    ...stat,
    rateLimits: stat.rateLimits ?? rateLimits,
    headersAt: stat.headersAt ?? (row.headersAt ? row.headersAt.toISOString() : null),
  };
}

async function rowsByProvider(providers: string[]): Promise<Map<string, ProviderRow>> {
  if (providers.length === 0) return new Map();
  const rows = await db.aiProviderStat.findMany({ where: { provider: { in: providers } } });
  return new Map(rows.map((r) => [r.provider, r]));
}

/**
 * Cached read of the currently-connected providers' stats (spec §11 step 1 —
 * load the latest DB snapshot immediately). Providers with no snapshot yet
 * return an empty "unavailable" stat.
 */
export async function readProviderStats(): Promise<NormalizedProviderStat[]> {
  const connected = await getConnectedProviders();
  const rows = await rowsByProvider(connected.map((c) => c.provider));
  return connected.map((c) => {
    const row = rows.get(c.provider);
    return row ? mapRow(row) : emptyProviderStat(c.provider);
  });
}

async function persistAccountStat(
  provider: string,
  stat: NormalizedProviderStat,
  raw: unknown
): Promise<void> {
  const rawStr = raw == null ? null : JSON.stringify(raw).slice(0, RAW_CAP);
  const data = {
    status: stat.status,
    balance: stat.balance,
    usage: stat.usage,
    quota: stat.quota,
    remaining: stat.remaining,
    extra: stat.extra ? JSON.stringify(stat.extra) : null,
    raw: rawStr,
    error: stat.error,
    syncedAt: stat.syncedAt ? new Date(stat.syncedAt) : null,
  };
  await db.aiProviderStat.upsert({
    where: { provider },
    create: { provider, ...data },
    update: data,
  });
}

/** Ensure a row exists for a header-only provider; never clobber captured headers. */
async function persistHeaderOnlyStat(
  provider: string,
  status: NormalizedProviderStat['status']
): Promise<void> {
  await db.aiProviderStat.upsert({
    where: { provider },
    create: { provider, status },
    update: { status, error: null },
  });
}

/**
 * Live refresh of all connected providers (spec §2 / §11 steps 2-4). Each
 * provider is synced independently — one failure never affects the others.
 * OpenRouter fetches live (with a short staleness guard); OpenAI/Groq surface
 * their most-recently-captured rate-limit headers; Google is unavailable.
 */
export async function refreshProviderStats(): Promise<NormalizedProviderStat[]> {
  const connected = await getConnectedProviders();
  const rows = await rowsByProvider(connected.map((c) => c.provider));
  const now = Date.now();

  const results = await Promise.allSettled(
    connected.map((c) => syncOne(c, rows.get(c.provider), now))
  );

  return results.map((r, i) =>
    r.status === 'fulfilled'
      ? r.value
      : { ...emptyProviderStat(connected[i].provider, 'error'), error: 'Sync failed' }
  );
}

async function syncOne(
  c: ConnectedProvider,
  existing: ProviderRow | undefined,
  now: number
): Promise<NormalizedProviderStat> {
  // OpenRouter — real account data, fetched live (unless very recently synced).
  if (c.provider === 'openrouter') {
    const fresh = existing?.syncedAt && now - existing.syncedAt.getTime() < OPENROUTER_STALE_MS;
    if (fresh && existing) return mapRow(existing);

    const { stat, raw } = await syncOpenRouter(c.apiKey);
    await persistAccountStat('openrouter', stat, raw).catch((e) =>
      console.error('[Provider Stats] persist openrouter failed', e)
    );
    return withCapturedHeaders(stat, existing);
  }

  // Google — nothing available via the API key.
  if (c.provider === 'google') {
    const { stat } = await syncGoogle();
    await persistAccountStat('google', stat, null).catch((e) =>
      console.error('[Provider Stats] persist google failed', e)
    );
    return stat;
  }

  // OpenAI / Groq / custom — no account API; surface captured rate-limit headers.
  const hasHeaders = !!existing?.rateLimits;
  const status = hasHeaders ? 'ok' : 'unavailable';
  await persistHeaderOnlyStat(c.provider, status).catch((e) =>
    console.error('[Provider Stats] persist header-only failed', e)
  );
  const base = existing ? mapRow(existing) : emptyProviderStat(c.provider, status);
  return { ...base, status };
}

/**
 * Persist rate-limit headers captured from a real inference call (spec choice:
 * capture from traffic, no probe spend). Best-effort — never throws into job
 * processing. Only touches `rateLimits`/`headersAt` (and status for
 * header-owned providers), so it never clobbers OpenRouter's account sync.
 */
export async function captureRateLimitHeaders(
  provider: string,
  headers: Parameters<typeof parseRateLimitHeaders>[0]
): Promise<void> {
  try {
    const rateLimits = parseRateLimitHeaders(headers);
    if (!rateLimits) return;

    const rlStr = JSON.stringify(rateLimits);
    const headersAt = new Date();
    const ownsStatus = HEADER_OWNED.has(provider);

    await db.aiProviderStat.upsert({
      where: { provider },
      create: {
        provider,
        status: ownsStatus ? 'ok' : 'unavailable',
        rateLimits: rlStr,
        headersAt,
      },
      update: ownsStatus
        ? { rateLimits: rlStr, headersAt, status: 'ok', error: null }
        : { rateLimits: rlStr, headersAt },
    });
  } catch (err) {
    console.error('[Provider Stats] Failed to capture rate-limit headers for', provider, err);
  }
}
