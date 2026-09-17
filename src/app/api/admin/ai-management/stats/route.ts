import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/admin/require-admin';

export const dynamic = 'force-dynamic';

type Period = 'today' | '7d' | '30d' | 'all';

type UsageRow = {
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costUsd: number | null;
  costSource: string | null;
  latencyMs: number | null;
  status: string;
  createdAt: Date;
};

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function periodStart(period: Period, now: Date): Date | null {
  if (period === 'today') return startOfDay(now);
  if (period === '7d') {
    const d = startOfDay(now);
    d.setDate(d.getDate() - 6);
    return d;
  }
  if (period === '30d') {
    const d = startOfDay(now);
    d.setDate(d.getDate() - 29);
    return d;
  }
  return null; // all time
}

function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const now = new Date();
    const rawPeriod = (req.nextUrl.searchParams.get('period') || '7d') as Period;
    const period: Period = ['today', '7d', '30d', 'all'].includes(rawPeriod) ? rawPeriod : '7d';

    const gte = periodStart(period, now);
    const rows = (await prisma.aiUsageRecord.findMany({
      where: gte ? { createdAt: { gte } } : {},
      select: {
        provider: true,
        model: true,
        inputTokens: true,
        outputTokens: true,
        totalTokens: true,
        costUsd: true,
        costSource: true,
        latencyMs: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    })) as UsageRow[];

    const todayStart = startOfDay(now);

    // ── KPI accumulators ──────────────────────────────────────────────
    let totalRequests = 0;
    let successCount = 0;
    let inputTokens = 0;
    let outputTokens = 0;
    let totalTokens = 0;
    let totalCost = 0;
    let hasActualCost = false;
    let hasEstimatedCost = false;
    let latencySum = 0;
    let latencyCount = 0;
    let requestsToday = 0;
    let tokensToday = 0;

    // ── Per-provider aggregation ──────────────────────────────────────
    type ProviderAgg = {
      provider: string;
      requests: number;
      successCount: number;
      inputTokens: number;
      outputTokens: number;
      totalTokens: number;
      cost: number;
      hasActual: boolean;
      hasEstimated: boolean;
      latencySum: number;
      latencyCount: number;
      lastRequestAt: Date;
      model: string;
      status: string;
    };
    const providerMap = new Map<string, ProviderAgg>();

    // ── Time-series buckets ───────────────────────────────────────────
    const useHourly = period === 'today';
    const bucketMap = new Map<
      string,
      {
        key: string;
        inputTokens: number;
        outputTokens: number;
        totalTokens: number;
        requests: number;
      }
    >();

    const bucketKeyFor = (d: Date): string => (useHourly ? String(d.getHours()) : dayKey(d));

    for (const r of rows) {
      totalRequests += 1;
      if (r.status === 'success') successCount += 1;
      inputTokens += r.inputTokens;
      outputTokens += r.outputTokens;
      totalTokens += r.totalTokens;
      if (typeof r.costUsd === 'number') {
        totalCost += r.costUsd;
        if (r.costSource === 'actual') hasActualCost = true;
        else if (r.costSource === 'estimated') hasEstimatedCost = true;
      }
      if (typeof r.latencyMs === 'number' && r.status === 'success') {
        latencySum += r.latencyMs;
        latencyCount += 1;
      }

      if (r.createdAt >= todayStart) {
        requestsToday += 1;
        tokensToday += r.totalTokens;
      }

      // provider
      let agg = providerMap.get(r.provider);
      if (!agg) {
        agg = {
          provider: r.provider,
          requests: 0,
          successCount: 0,
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
          cost: 0,
          hasActual: false,
          hasEstimated: false,
          latencySum: 0,
          latencyCount: 0,
          lastRequestAt: r.createdAt,
          model: r.model,
          status: r.status,
        };
        providerMap.set(r.provider, agg);
      }
      agg.requests += 1;
      if (r.status === 'success') agg.successCount += 1;
      agg.inputTokens += r.inputTokens;
      agg.outputTokens += r.outputTokens;
      agg.totalTokens += r.totalTokens;
      if (typeof r.costUsd === 'number') {
        agg.cost += r.costUsd;
        if (r.costSource === 'actual') agg.hasActual = true;
        else if (r.costSource === 'estimated') agg.hasEstimated = true;
      }
      if (typeof r.latencyMs === 'number' && r.status === 'success') {
        agg.latencySum += r.latencyMs;
        agg.latencyCount += 1;
      }
      if (r.createdAt >= agg.lastRequestAt) {
        agg.lastRequestAt = r.createdAt;
        agg.model = r.model;
        agg.status = r.status;
      }

      // time bucket
      const bk = bucketKeyFor(r.createdAt);
      let bucket = bucketMap.get(bk);
      if (!bucket) {
        bucket = { key: bk, inputTokens: 0, outputTokens: 0, totalTokens: 0, requests: 0 };
        bucketMap.set(bk, bucket);
      }
      bucket.inputTokens += r.inputTokens;
      bucket.outputTokens += r.outputTokens;
      bucket.totalTokens += r.totalTokens;
      bucket.requests += 1;
    }

    // ── Build a complete (zero-filled) time series skeleton ───────────
    const timeSeries: {
      label: string;
      inputTokens: number;
      outputTokens: number;
      totalTokens: number;
      requests: number;
    }[] = [];

    if (useHourly) {
      for (let h = 0; h < 24; h++) {
        const b = bucketMap.get(String(h));
        timeSeries.push({
          label: `${String(h).padStart(2, '0')}:00`,
          inputTokens: b?.inputTokens || 0,
          outputTokens: b?.outputTokens || 0,
          totalTokens: b?.totalTokens || 0,
          requests: b?.requests || 0,
        });
      }
    } else {
      let days: number;
      if (period === '7d') days = 7;
      else if (period === '30d') days = 30;
      else {
        // all-time: span from the earliest record to today (min 1 day, capped at 180).
        const earliest = rows.length ? startOfDay(rows[0].createdAt) : startOfDay(now);
        const diff = Math.round((startOfDay(now).getTime() - earliest.getTime()) / 86_400_000) + 1;
        days = Math.min(Math.max(diff, 1), 180);
      }
      for (let i = days - 1; i >= 0; i--) {
        const d = startOfDay(now);
        d.setDate(d.getDate() - i);
        const key = dayKey(d);
        const b = bucketMap.get(key);
        timeSeries.push({
          label: key.slice(5), // MM-DD
          inputTokens: b?.inputTokens || 0,
          outputTokens: b?.outputTokens || 0,
          totalTokens: b?.totalTokens || 0,
          requests: b?.requests || 0,
        });
      }
    }

    const providers = Array.from(providerMap.values())
      .map((a) => ({
        provider: a.provider,
        requests: a.requests,
        successRate: a.requests > 0 ? Math.round((a.successCount / a.requests) * 1000) / 10 : 0,
        inputTokens: a.inputTokens,
        outputTokens: a.outputTokens,
        totalTokens: a.totalTokens,
        cost: Math.round(a.cost * 1_000_000) / 1_000_000,
        costSource: a.hasActual ? 'actual' : a.hasEstimated ? 'estimated' : null,
        avgLatencyMs: a.latencyCount > 0 ? Math.round(a.latencySum / a.latencyCount) : null,
        lastRequestAt: a.lastRequestAt,
        model: a.model,
        status: a.status,
      }))
      .sort((a, b) => b.totalTokens - a.totalTokens);

    const providerShare = providers
      .filter((p) => p.totalTokens > 0)
      .map((p) => ({ provider: p.provider, tokens: p.totalTokens }));

    // Active users today = rows in the daily rollup for today's (UTC) key.
    const activeUsersToday = await prisma.aiUserDailyUsage.count({
      where: { date: now.toISOString().split('T')[0] },
    });

    return NextResponse.json({
      period,
      generatedAt: now.toISOString(),
      kpis: {
        totalRequests,
        successRate: totalRequests > 0 ? Math.round((successCount / totalRequests) * 1000) / 10 : 0,
        totalTokens,
        tokensToday,
        requestsToday,
        inputTokens,
        outputTokens,
        avgLatencyMs: latencyCount > 0 ? Math.round(latencySum / latencyCount) : 0,
        totalCost: Math.round(totalCost * 1_000_000) / 1_000_000,
        costSource:
          hasActualCost && hasEstimatedCost
            ? 'mixed'
            : hasActualCost
              ? 'actual'
              : hasEstimatedCost
                ? 'estimated'
                : null,
        activeUsersToday,
        mostUsedProvider: providers[0]?.provider ?? null,
      },
      providers,
      providerShare,
      timeSeries,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error' },
      { status: 500 }
    );
  }
}
