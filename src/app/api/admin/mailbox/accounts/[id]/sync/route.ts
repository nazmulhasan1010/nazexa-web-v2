import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth.server';
import { db } from '@/lib/db';
import { syncMailAccount } from '@/lib/mail/sync';

// POST /api/admin/mailbox/accounts/[id]/sync
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const account = await db.mailAccount.findUnique({ where: { id } });
  if (!account) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

  const result = await syncMailAccount(account);
  return NextResponse.json({ result });
}
