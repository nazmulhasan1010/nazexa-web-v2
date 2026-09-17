import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/admin/require-admin';

export const dynamic = 'force-dynamic';

/**
 * Powers the admin "select any user" control.
 * - `?q=` searches all central users by name/email.
 * - no query → the top users by AI usage (from the daily rollup).
 * Avatars are intentionally omitted (User.image can be a large data URL); the
 * per-user view fetches the image for the single selected user instead.
 */
export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const q = (req.nextUrl.searchParams.get('q') || '').trim();
    const limit = Math.min(Math.max(Number(req.nextUrl.searchParams.get('limit')) || 20, 1), 50);

    if (q) {
      const users = await prisma.user.findMany({
        where: { OR: [{ name: { contains: q } }, { email: { contains: q } }] },
        select: { id: true, name: true, email: true },
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({
        users: users.map((u) => ({
          ...u,
          totalTokens: null as number | null,
          requests: null as number | null,
        })),
      });
    }

    const grouped = await prisma.aiUserDailyUsage.groupBy({
      by: ['userId'],
      _sum: { totalTokens: true, requests: true },
      orderBy: { _sum: { totalTokens: 'desc' } },
      take: limit,
    });

    const ids = grouped.map((g) => g.userId);
    const users = ids.length
      ? await prisma.user.findMany({
          where: { id: { in: ids } },
          select: { id: true, name: true, email: true },
        })
      : [];
    const byId = new Map(users.map((u) => [u.id, u]));

    const result = grouped.map((g) => {
      const u = byId.get(g.userId);
      return {
        id: g.userId,
        name: u?.name ?? null,
        email: u?.email ?? null,
        totalTokens: g._sum.totalTokens ?? 0,
        requests: g._sum.requests ?? 0,
      };
    });

    return NextResponse.json({ users: result });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error' },
      { status: 500 }
    );
  }
}
