/**
 * SMTP client for sending email using per-account credentials.
 * Uses nodemailer (already installed).
 */
import nodemailer from 'nodemailer';
import { decrypt } from './encryption';
import type { MailAccount } from '@prisma/client';

export interface SendMailOptions {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: SendAttachment[];
  replyTo?: string;
  inReplyTo?: string; // Message-ID for threading
  references?: string; // Space-separated list of message IDs
}

export interface SendAttachment {
  filename: string;
  path: string; // Absolute path to file
  contentType?: string;
}

export type SendResult = {
  ok: true;
  messageId: string;
} | {
  ok: false;
  error: string;
};

/**
 * Build nodemailer transporter for a mail account.
 */
function buildSmtpTransporter(account: MailAccount) {
  const password = decrypt(account.smtpPasswordEnc);
  const port = account.smtpPort;
  const secure = account.smtpSecurity === 'SSL/TLS';

  return nodemailer.createTransport({
    host: account.smtpHost,
    port,
    secure,
    auth: {
      user: account.smtpUsername,
      pass: password,
    },
    tls: {
      rejectUnauthorized: false, // Allow self-signed in dev
    },
  });
}

/**
 * Test SMTP connection for an account.
 */
export async function testSmtpConnection(account: MailAccount): Promise<{ ok: boolean }> {
  const transporter = buildSmtpTransporter(account);
  await transporter.verify();
  return { ok: true };
}

/**
 * Send an email through the account's SMTP configuration.
 */
export async function sendMail(account: MailAccount, options: SendMailOptions): Promise<{ ok: boolean; messageId?: string; error?: string }> {
  try {
    const transporter = buildSmtpTransporter(account);

    const fromAddress = account.displayName
      ? `"${account.displayName}" <${account.email}>`
      : account.email;

    const info = await transporter.sendMail({
      from: fromAddress,
      to: options.to.join(', '),
      cc: options.cc?.join(', '),
      bcc: options.bcc?.join(', '),
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
      inReplyTo: options.inReplyTo,
      references: options.references,
      attachments: options.attachments?.map((a) => ({
        filename: a.filename,
        path: a.path,
        contentType: a.contentType,
      })),
    });

    return { ok: true, messageId: info.messageId };
  } catch (err: any) {
    const errorMsg = err?.message || 'Unknown SMTP error';
    // Strip credentials from error messages
    const sanitized = errorMsg
      .replace(/Password.*/gi, 'Password [hidden]')
      .replace(/auth.*/gi, 'authentication [hidden]');
    return { ok: false, error: sanitized };
  }
}
