import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin/require-admin';

export async function GET() {
  try {
    const { error, user } = await requireAdmin();
    if (error || !user) {
      return error ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [totalUsers, totalRevenueData, activeSubscribers, newsPosts, heatmapEvents] =
      await Promise.all([
        db.user.count(),
        db.paymentTransaction.aggregate({
          _sum: { amount: true },
          where: { status: 'PAID' },
        }),
        db.subscriber.count({ where: { status: 'ACTIVE' } }),
        db.contentItem.count({ where: { collection: 'news' } }),
        db.userEvent.findMany({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
            },
          },
          select: { createdAt: true },
        }),
      ]);

    // Aggregate heatmap data by date string YYYY-MM-DD
    const heatmapData: Record<string, number> = {};
    for (const event of heatmapEvents) {
      const dateStr = event.createdAt.toISOString().split('T')[0];
      heatmapData[dateStr] = (heatmapData[dateStr] || 0) + 1;
    }

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalRevenue: totalRevenueData._sum.amount || 0,
        activeSubscribers,
        newsPosts,
        heatmapData,
      },
    });
  } catch (error) {
    console.error('Overview Stats Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 });
  }
}
