import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth.server';
import { db } from '@/lib/db';

// GET /api/admin/mailbox/messages
// Query params: accountId, folderId, folder (type), isRead, isStarred, isImportant, page, limit, search
export async function GET(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get('accountId');
  const folderId = searchParams.get('folderId');
  const folderType = searchParams.get('folder'); // inbox | sent | trash | spam | archive
  const isRead = searchParams.get('isRead');
  const isStarred = searchParams.get('isStarred');
  const isImportant = searchParams.get('isImportant');
  const search = searchParams.get('search');
  const page = Math.max(1, Number(searchParams.get('page') || 1));
  const limit = Math.min(100, Math.max(10, Number(searchParams.get('limit') || 30)));
  const skip = (page - 1) * limit;

  const where: any = {};

  if (accountId) {
    // Validate the admin owns/can access this account
    const account = await db.mailAccount.findUnique({ where: { id: accountId }, select: { id: true } });
    if (!account) return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    where.accountId = accountId;
  } else {
    // All accounts
    const allAccounts = await db.mailAccount.findMany({ select: { id: true } });
    where.accountId = { in: allAccounts.map(a => a.id) };
  }

  if (folderId) where.folderId = folderId;
  if (folderType) where.folderType = folderType;
  if (isRead !== null && isRead !== undefined && isRead !== '') where.isRead = isRead === 'true';
  if (isStarred === 'true') where.isStarred = true;
  if (isImportant === 'true') where.isImportant = true;

  if (search) {
    where.OR = [
      { subject: { contains: search } },
      { fromEmail: { contains: search } },
      { fromName: { contains: search } },
      { preview: { contains: search } },
    ];
  }

  const [messages, total] = await Promise.all([
    db.mailMessage.findMany({
      where,
      orderBy: { date: 'desc' },
      skip,
      take: limit,
      include: {
        account: { select: { email: true, displayName: true } },
        folder: { select: { name: true, displayName: true } },
        _count: { select: { attachments: true } },
      },
    }),
    db.mailMessage.count({ where }),
  ]);

  return NextResponse.json({
    messages,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}
