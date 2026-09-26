import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/admin-auth.server';

export async function GET() {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const count = await db.supportTicket.count({
      where: {
        status: {
          in: ['OPEN', 'WAITING_FOR_SUPPORT']
        }
      }
    });

    return NextResponse.json({ success: true, count });
  } catch (error) {
    console.error('Support unread count error:', error);
    return NextResponse.json({ success: false, count: 0 });
  }
}
