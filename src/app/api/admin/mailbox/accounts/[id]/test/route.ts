import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth.server';
import { db } from '@/lib/db';
import { testImapConnection } from '@/lib/mail/imap-client';
import { testSmtpConnection } from '@/lib/mail/smtp-client';

// POST /api/admin/mailbox/accounts/[id]/test
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const account = await db.mailAccount.findUnique({ where: { id } });
  if (!account) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

  const results: { imap: boolean; smtp: boolean; imapError?: string; smtpError?: string } = {
    imap: false,
    smtp: false,
  };

  // Test IMAP
  try {
    await testImapConnection(account);
    results.imap = true;
  } catch (err: any) {
    results.imapError = 'IMAP connection failed: ' + (err.message || 'Unknown error').replace(/Password.*/gi, '[hidden]');
  }

  // Test SMTP
  try {
    await testSmtpConnection(account);
    results.smtp = true;
  } catch (err: any) {
    results.smtpError = 'SMTP connection failed: ' + (err.message || 'Unknown error').replace(/Password.*/gi, '[hidden]');
  }

  // Update account status
  const allOk = results.imap && results.smtp;
  await db.mailAccount.update({
    where: { id },
    data: { status: allOk ? 'active' : 'error' },
  });

  return NextResponse.json({ results, ok: allOk });
}
