import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/admin-auth.server';

export async function GET() {
  try {
    const adminUser = await getAdminSession();
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const count = await db.paymentTransaction.count({
      where: {
        status: { in: ['PENDING', 'PENDING_REVIEW'] },
      },
    });

    return NextResponse.json({ success: true, count });
  } catch (error: any) {
    console.error('Failed to get pending payment count:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
