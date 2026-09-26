import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth.server';
import { db } from '@/lib/db';

// GET /api/admin/mailbox/folders?accountId=...
export async function GET(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get('accountId');

  const where: any = {};
  if (accountId) where.accountId = accountId;

  const folders = await db.mailFolder.findMany({
    where,
    orderBy: [{ type: 'asc' }, { displayName: 'asc' }],
    include: { account: { select: { email: true, displayName: true } } },
  });

  return NextResponse.json({ folders });
}
