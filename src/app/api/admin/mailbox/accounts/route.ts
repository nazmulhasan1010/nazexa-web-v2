import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth.server';
import { db } from '@/lib/db';
import { encrypt, isEncryptionConfigured } from '@/lib/mail/encryption';
import { testImapConnection } from '@/lib/mail/imap-client';
import { testSmtpConnection } from '@/lib/mail/smtp-client';

// GET /api/admin/mailbox/accounts — List all accounts (no secrets)
export async function GET(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const accounts = await db.mailAccount.findMany({
    orderBy: { createdAt: 'asc' },
    include: {
      _count: { select: { messages: true } },
      folders: {
        where: { type: 'inbox' },
        select: { unreadCount: true },
      },
    },
  });

  // Strip encrypted credentials from response
  const safe = accounts.map(({ imapPasswordEnc, smtpPasswordEnc, ...rest }) => ({
    ...rest,
    unreadCount: rest.folders.reduce((s, f) => s + f.unreadCount, 0),
  }));

  return NextResponse.json({ accounts: safe });
}

// POST /api/admin/mailbox/accounts — Create account
export async function POST(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!isEncryptionConfigured()) {
    return NextResponse.json({
      error: 'MAIL_ENCRYPTION_KEY is not configured. Add a 64-char hex key to your .env file.'
    }, { status: 500 });
  }

  const body = await req.json();
  const {
    displayName, email, provider = 'custom',
    imapHost, imapPort = 993, imapSecurity = 'SSL/TLS', imapUsername, imapPassword,
    smtpHost, smtpPort = 587, smtpSecurity = 'STARTTLS', smtpUsername, smtpPassword,
    signature,
  } = body;

  if (!email || !imapHost || !imapPassword || !smtpHost || !smtpPassword) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const account = await db.mailAccount.create({
      data: {
        displayName: displayName || email,
        email: email.toLowerCase().trim(),
        provider,
        imapHost,
        imapPort: Number(imapPort),
        imapSecurity,
        imapUsername: imapUsername || email,
        imapPasswordEnc: encrypt(imapPassword),
        smtpHost,
        smtpPort: Number(smtpPort),
        smtpSecurity,
        smtpUsername: smtpUsername || email,
        smtpPasswordEnc: encrypt(smtpPassword),
        signature: signature || null,
      },
    });

    // Log action (no credentials)
    await db.mailAuditLog.create({
      data: {
        actorId: admin.user.id,
        action: 'account_connected',
        accountId: account.id,
        details: `Connected account ${email}`,
      },
    });

    const { imapPasswordEnc, smtpPasswordEnc, ...safe } = account;
    return NextResponse.json({ account: safe }, { status: 201 });
  } catch (err: any) {
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
