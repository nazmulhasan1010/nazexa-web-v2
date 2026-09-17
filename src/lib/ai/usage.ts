import { db } from '@/lib/db';
import { resolveCost } from '@/lib/ai/pricing';

export type NormalizedUsage = {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cachedTokens: number;
  reasoningTokens: number;
};

export const EMPTY_USAGE: NormalizedUsage = {
  inputTokens: 0,
  outputTokens: 0,
  totalTokens: 0,
  cachedTokens: 0,
  reasoningTokens: 0,
};

/**
 * The database stores `provider = 'openai-compatible'` for every non-Google
 * provider. We detect the real vendor from the agent's base URL so analytics
 * can distinguish OpenAI vs Groq vs OpenRouter vs a custom endpoint.
 */
export function detectProvider(baseUrl?: string | null, activeProvider?: string | null): string {
  if (activeProvider === 'google') return 'google';

  const url = (baseUrl || '').toLowerCase();
  if (!url) return 'custom';
  if (url.includes('api.openai.com')) return 'openai';
  if (url.includes('groq.com')) return 'groq';
  if (url.includes('openrouter.ai')) return 'openrouter';
  return 'custom';
}

function toInt(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : 0;
}

/** Loosely-typed shape of the usage payloads returned by the various providers. */
type LooseUsage = {
  // OpenAI-compatible (OpenAI, Groq, OpenRouter, custom)
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  prompt_tokens_details?: { cached_tokens?: number };
  completion_tokens_details?: { reasoning_tokens?: number };
  cost?: number;
  total_cost?: number;
  // Google GenAI usageMetadata
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  totalTokenCount?: number;
  cachedContentTokenCount?: number;
  thoughtsTokenCount?: number;
};

/** Normalize an OpenAI-compatible `usage` object (OpenAI, Groq, OpenRouter, custom). */
export function normalizeOpenAiUsage(usage: unknown): NormalizedUsage {
  const u = (usage || {}) as LooseUsage;
  const inputTokens = toInt(u.prompt_tokens);
  const outputTokens = toInt(u.completion_tokens);
  const totalTokens = toInt(u.total_tokens) || inputTokens + outputTokens;
  const cachedTokens = toInt(u.prompt_tokens_details?.cached_tokens);
  const reasoningTokens = toInt(u.completion_tokens_details?.reasoning_tokens);
  return { inputTokens, outputTokens, totalTokens, cachedTokens, reasoningTokens };
}

/** Normalize Google GenAI `usageMetadata`. */
export function normalizeGoogleUsage(usageMetadata: unknown): NormalizedUsage {
  const u = (usageMetadata || {}) as LooseUsage;
  const inputTokens = toInt(u.promptTokenCount);
  const outputTokens = toInt(u.candidatesTokenCount);
  const totalTokens = toInt(u.totalTokenCount) || inputTokens + outputTokens;
  const cachedTokens = toInt(u.cachedContentTokenCount);
  const reasoningTokens = toInt(u.thoughtsTokenCount);
  return { inputTokens, outputTokens, totalTokens, cachedTokens, reasoningTokens };
}

/** Extract a provider-reported real cost from an OpenAI-compatible usage object. */
export function extractActualCost(usage: unknown): number | null {
  const u = (usage || {}) as LooseUsage;
  // OpenRouter returns `cost`; some gateways use `total_cost`.
  const raw = u.cost ?? u.total_cost;
  return typeof raw === 'number' && Number.isFinite(raw) ? raw : null;
}

export type RecordAiUsageInput = {
  jobId: string;
  provider: string;
  model: string;
  appId?: string | null;
  userId?: string | null;
  usage: NormalizedUsage;
  actualCost?: number | null;
  latencyMs?: number | null;
  status: 'success' | 'error';
  errorMessage?: string | null;
};

/**
 * Persist exactly one usage record per job (idempotent via the unique `jobId`)
 * and broadcast it to the admin dashboard over the socket. Best-effort: failures
 * are logged and swallowed so telemetry never breaks AI job processing.
 */
export async function recordAiUsage(input: RecordAiUsageInput): Promise<void> {
  const { costUsd, costSource } = resolveCost(
    input.provider,
    input.model,
    input.usage.inputTokens,
    input.usage.outputTokens,
    input.actualCost
  );

  const data = {
    provider: input.provider,
    model: input.model || 'unknown',
    appId: input.appId ?? null,
    userId: input.userId ?? null,
    inputTokens: input.usage.inputTokens,
    outputTokens: input.usage.outputTokens,
    totalTokens: input.usage.totalTokens,
    cachedTokens: input.usage.cachedTokens,
    reasoningTokens: input.usage.reasoningTokens,
    costUsd,
    costSource,
    latencyMs: input.latencyMs ?? null,
    status: input.status,
    errorMessage: input.errorMessage ?? null,
  };

  // Check existence first so the per-user daily rollup stays idempotent even
  // if a job is (re)processed more than once for the same jobId.
  const existed = await db.aiUsageRecord
    .findUnique({ where: { jobId: input.jobId }, select: { id: true } })
    .catch(() => null);

  let record: Awaited<ReturnType<typeof db.aiUsageRecord.upsert>> | null = null;
  try {
    record = await db.aiUsageRecord.upsert({
      where: { jobId: input.jobId },
      create: { jobId: input.jobId, ...data },
      update: data,
    });
  } catch (err) {
    console.error('[AI Usage] Failed to persist usage record for job', input.jobId, err);
    return;
  }

  // Per-user daily rollup — exactly one increment per newly-created record.
  // Powers the contribution heatmap, active-users count and per-user analytics.
  if (!existed && input.userId) {
    const date = record.createdAt.toISOString().split('T')[0];
    try {
      await db.aiUserDailyUsage.upsert({
        where: { userId_date: { userId: input.userId, date } },
        create: {
          userId: input.userId,
          date,
          requests: 1,
          inputTokens: input.usage.inputTokens,
          outputTokens: input.usage.outputTokens,
          totalTokens: input.usage.totalTokens,
          costUsd: costUsd ?? 0,
        },
        update: {
          requests: { increment: 1 },
          inputTokens: { increment: input.usage.inputTokens },
          outputTokens: { increment: input.usage.outputTokens },
          totalTokens: { increment: input.usage.totalTokens },
          costUsd: { increment: costUsd ?? 0 },
        },
      });
    } catch (err) {
      console.error('[AI Usage] Failed to update daily rollup for user', input.userId, err);
    }
  }

  try {
    const { publishAdminEvent } = await import('@/lib/socket');
    await publishAdminEvent('ai.usage.recorded', {
      id: record.id,
      jobId: record.jobId,
      provider: record.provider,
      model: record.model,
      appId: record.appId,
      userId: record.userId,
      inputTokens: record.inputTokens,
      outputTokens: record.outputTokens,
      totalTokens: record.totalTokens,
      cachedTokens: record.cachedTokens,
      reasoningTokens: record.reasoningTokens,
      costUsd: record.costUsd,
      costSource: record.costSource,
      latencyMs: record.latencyMs,
      status: record.status,
      errorMessage: record.errorMessage,
      createdAt: record.createdAt,
    });
  } catch (err) {
    console.error('[AI Usage] Failed to broadcast usage event for job', input.jobId, err);
  }
}
