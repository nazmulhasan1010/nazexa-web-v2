import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/admin/require-admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const limitParam = Number(req.nextUrl.searchParams.get('limit'));
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 100) : 20;

    const records = await prisma.aiUsageRecord.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        jobId: true,
        provider: true,
        model: true,
        appId: true,
        userId: true,
        inputTokens: true,
        outputTokens: true,
        totalTokens: true,
        cachedTokens: true,
        reasoningTokens: true,
        costUsd: true,
        costSource: true,
        latencyMs: true,
        status: true,
        errorMessage: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ records });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error' },
      { status: 500 }
    );
  }
}
