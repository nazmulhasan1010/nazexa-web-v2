import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth.server';
import { db } from '@/lib/db';
import { encrypt } from '@/lib/mail/encryption';

// GET /api/admin/mailbox/accounts/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const account = await db.mailAccount.findUnique({
    where: { id },
    include: {
      folders: { orderBy: { type: 'asc' } },
      _count: { select: { messages: true, drafts: true } },
    },
  });

  if (!account) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

  // Never expose credentials
  const { imapPasswordEnc, smtpPasswordEnc, ...safe } = account;
  return NextResponse.json({ account: safe });
}

// PATCH /api/admin/mailbox/accounts/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const {
    displayName, imapPassword, smtpPassword,
    imapHost, imapPort, imapSecurity, imapUsername,
    smtpHost, smtpPort, smtpSecurity, smtpUsername,
    signature,
  } = body;

  const updateData: any = {};
  if (displayName !== undefined) updateData.displayName = displayName;
  if (signature !== undefined) updateData.signature = signature;
  if (imapHost) updateData.imapHost = imapHost;
  if (imapPort) updateData.imapPort = Number(imapPort);
  if (imapSecurity) updateData.imapSecurity = imapSecurity;
  if (imapUsername) updateData.imapUsername = imapUsername;
  if (imapPassword) updateData.imapPasswordEnc = encrypt(imapPassword);
  if (smtpHost) updateData.smtpHost = smtpHost;
  if (smtpPort) updateData.smtpPort = Number(smtpPort);
  if (smtpSecurity) updateData.smtpSecurity = smtpSecurity;
  if (smtpUsername) updateData.smtpUsername = smtpUsername;
  if (smtpPassword) updateData.smtpPasswordEnc = encrypt(smtpPassword);

  const updated = await db.mailAccount.update({ where: { id }, data: updateData });
  const { imapPasswordEnc, smtpPasswordEnc, ...safe } = updated;
  return NextResponse.json({ account: safe });
}

// DELETE /api/admin/mailbox/accounts/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const account = await db.mailAccount.findUnique({ where: { id } });
  if (!account) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

  // Delete physical attachment files for this account
  const { join } = await import('path');
  const { unlink, readdir } = await import('fs/promises');
  const attachDir = join(process.cwd(), '.data', 'mail-attachments');

  const attachments = await db.mailAttachment.findMany({
    where: { message: { accountId: id } },
    select: { storageKey: true },
  });

  for (const att of attachments) {
    try {
      await unlink(join(attachDir, att.storageKey));
    } catch { /* ignore missing files */ }
  }

  await db.mailAccount.delete({ where: { id } });

  await db.mailAuditLog.create({
    data: {
      actorId: admin.user.id,
      action: 'account_disconnected',
      accountId: id,
      details: `Disconnected account ${account.email}`,
    },
  });

  return NextResponse.json({ success: true });
}
