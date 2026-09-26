import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth.server';
import { db } from '@/lib/db';
import { sendMail } from '@/lib/mail/smtp-client';
import { join } from 'path';

// POST /api/admin/mailbox/compose — Send an email
export async function POST(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { accountId, to, cc, bcc, subject, html, text, attachmentIds, inReplyTo, references } = body;

  if (!accountId || !to?.length || !subject) {
    return NextResponse.json({ error: 'accountId, to, and subject are required' }, { status: 400 });
  }

  const account = await db.mailAccount.findUnique({ where: { id: accountId } });
  if (!account) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

  const attachments: { filename: string; path: string; contentType?: string }[] = [];
  
  if (body.attachments?.length) {
    for (const att of body.attachments) {
      attachments.push({
        filename: att.filename,
        path: att.url,
      });
    }
  }

  const result = await sendMail(account, {
    to: Array.isArray(to) ? to : [to],
    cc: cc?.length ? cc : undefined,
    bcc: bcc?.length ? bcc : undefined,
    subject,
    html: html || '',
    text: text || undefined,
    attachments,
    inReplyTo,
    references,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error || 'Failed to send' }, { status: 500 });
  }

  // Save to sent messages in DB
  try {
    const folder = await db.mailFolder.findFirst({
      where: { accountId, type: 'sent' },
    });

    await db.mailMessage.create({
      data: {
        accountId,
        folderId: folder?.id || null,
        uid: -Math.floor(Date.now() / 1000), // Negative UID fits in 32-bit Int and avoids IMAP clash
        messageId: result.messageId,
        fromEmail: account.email,
        fromName: account.displayName,
        toAddresses: JSON.stringify(Array.isArray(to) ? to.map((e: string) => ({ email: e })) : [{ email: to }]),
        subject,
        date: new Date(),
        bodyHtml: html || null,
        bodyText: text || null,
        isRead: true,
        folderType: 'sent',
      },
    });
  } catch { /* non-critical */ }

  // Audit log
  await db.mailAuditLog.create({
    data: {
      actorId: admin.user.id,
      action: 'email_sent',
      accountId,
      details: `Sent "${subject}" to ${Array.isArray(to) ? to.join(', ') : to}`,
    },
  });

  return NextResponse.json({ ok: true, messageId: result.messageId });
}
