import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/admin/require-admin';

export const dynamic = 'force-dynamic';

type DayBucket = {
  requests: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
};

/**
 * Per-user (or All-Users when `?userId=all`) AI analytics.
 * - heatmap: daily buckets over the window, from the rollup (spec §6-§8)
 * - totals: all-time requests/tokens/cost/avg-latency
 * - most-used provider & model, recent activity (spec §9)
 */
export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const rawUserId = (req.nextUrl.searchParams.get('userId') || 'all').trim();
    const isAll = rawUserId === 'all' || rawUserId === '';
    const monthsRaw = Number(req.nextUrl.searchParams.get('months')) || 12;
    const months = Math.min(Math.max(monthsRaw, 1), 12);
    // Match ActivityHeatmap's 365-day grid at the 12-month default.
    const windowDays = months >= 12 ? 365 : Math.round(months * 30.4375);

    const now = new Date();
    const since = new Date(now);
    since.setUTCDate(since.getUTCDate() - (windowDays - 1));
    const sinceKey = since.toISOString().split('T')[0];

    // ── Heatmap + all-time totals from the daily rollup ──────────────────
    const daily = await prisma.aiUserDailyUsage.findMany({
      where: isAll ? { date: { gte: sinceKey } } : { userId: rawUserId, date: { gte: sinceKey } },
      select: {
        date: true,
        requests: true,
        inputTokens: true,
        outputTokens: true,
        totalTokens: true,
      },
    });

    const heatmap: Record<string, DayBucket> = {};
    for (const d of daily) {
      const e =
        heatmap[d.date] ||
        (heatmap[d.date] = { requests: 0, inputTokens: 0, outputTokens: 0, totalTokens: 0 });
      e.requests += d.requests;
      e.inputTokens += d.inputTokens;
      e.outputTokens += d.outputTokens;
      e.totalTokens += d.totalTokens;
    }

    const totalsAgg = await prisma.aiUserDailyUsage.aggregate({
      where: isAll ? {} : { userId: rawUserId },
      _sum: {
        requests: true,
        inputTokens: true,
        outputTokens: true,
        totalTokens: true,
        costUsd: true,
      },
    });

    // ── Provider / model / latency / recent activity from usage records ──
    const recWhere = isAll ? {} : { userId: rawUserId };
    const [byProvider, byModel, latencyAgg, recentActivity] = await Promise.all([
      prisma.aiUsageRecord.groupBy({
        by: ['provider'],
        where: recWhere,
        _sum: { totalTokens: true },
        _count: { _all: true },
      }),
      prisma.aiUsageRecord.groupBy({
        by: ['model'],
        where: recWhere,
        _sum: { totalTokens: true },
        _count: { _all: true },
      }),
      prisma.aiUsageRecord.aggregate({
        where: { ...recWhere, status: 'success' },
        _avg: { latencyMs: true },
      }),
      prisma.aiUsageRecord.findMany({
        where: recWhere,
        orderBy: { createdAt: 'desc' },
        take: 15,
        select: {
          id: true,
          userId: true,
          provider: true,
          model: true,
          inputTokens: true,
          outputTokens: true,
          totalTokens: true,
          costUsd: true,
          costSource: true,
          latencyMs: true,
          status: true,
          errorMessage: true,
          createdAt: true,
        },
      }),
    ]);

    const topProvider = [...byProvider].sort(
      (a, b) => (b._sum.totalTokens ?? 0) - (a._sum.totalTokens ?? 0)
    )[0];
    const topModel = [...byModel].sort(
      (a, b) => (b._sum.totalTokens ?? 0) - (a._sum.totalTokens ?? 0)
    )[0];

    const user = isAll
      ? null
      : await prisma.user.findUnique({
          where: { id: rawUserId },
          select: { id: true, name: true, email: true, image: true },
        });

    return NextResponse.json({
      userId: isAll ? 'all' : rawUserId,
      user,
      windowDays,
      heatmap,
      totals: {
        requests: totalsAgg._sum.requests ?? 0,
        inputTokens: totalsAgg._sum.inputTokens ?? 0,
        outputTokens: totalsAgg._sum.outputTokens ?? 0,
        totalTokens: totalsAgg._sum.totalTokens ?? 0,
        costUsd: totalsAgg._sum.costUsd ?? 0,
        avgLatencyMs:
          latencyAgg._avg.latencyMs != null ? Math.round(latencyAgg._avg.latencyMs) : null,
      },
      mostUsedProvider: topProvider
        ? {
            provider: topProvider.provider,
            totalTokens: topProvider._sum.totalTokens ?? 0,
            requests: topProvider._count._all,
          }
        : null,
      mostUsedModel: topModel
        ? {
            model: topModel.model,
            totalTokens: topModel._sum.totalTokens ?? 0,
            requests: topModel._count._all,
          }
        : null,
      recentActivity,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error' },
      { status: 500 }
    );
  }
}
