import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth.server';
import { db } from '@/lib/db';

// GET /api/admin/mailbox/unread-count
export async function GET(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const total = await db.mailMessage.count({
    where: { isRead: false, folderType: 'inbox' },
  });

  const byAccount = await db.mailMessage.groupBy({
    by: ['accountId'],
    where: { isRead: false, folderType: 'inbox' },
    _count: { _all: true },
  });

  return NextResponse.json({ total, byAccount });
}
