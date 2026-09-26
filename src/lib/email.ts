/**
 * Email delivery — Resend API or SMTP (nodemailer).
 *
 * Configure one of:
 *   RESEND_API_KEY + EMAIL_FROM
 *   SMTP_HOST + SMTP_PORT + SMTP_USER + SMTP_PASS + EMAIL_FROM
 *
 * Without config, emails are logged in development and reported as skipped.
 */

import { ConfigService } from './config/service';
import nodemailer from 'nodemailer';

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export type SendEmailResult =
  { sent: true; provider: 'resend' | 'smtp' } | { sent: false; skipped: true; reason: string };

async function getFromAddress(): Promise<string> {
  const name = await ConfigService.getConfig('email.from.name', '');
  const addr = await ConfigService.getConfig('email.from.address', '');
  if (name && addr) return `${name} <${addr}>`;
  if (addr) return addr;
  return process.env.EMAIL_FROM || process.env.SMTP_FROM || 'Nazexa<noreply@localhost>';
}

function getAppBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
}

export function appBaseUrl(): string {
  return getAppBaseUrl();
}

export async function isEmailConfigured(): Promise<boolean> {
  if (process.env.RESEND_API_KEY) return true;
  
  const host = await ConfigService.getConfig('smtp.host');
  const user = await ConfigService.getConfig('smtp.user');
  const pass = await ConfigService.getSecretConfig('smtp.pass');
  
  if (host && user && pass) return true;
  return false;
}

async function sendViaResend(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY!;
  const from = await getFromAddress();
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Resend failed (${res.status}): ${body || res.statusText}`);
  }

  return { sent: true, provider: 'resend' };
}

async function sendViaSmtp(input: SendEmailInput): Promise<SendEmailResult> {
  const host = await ConfigService.getConfig<string>('smtp.host', process.env.SMTP_HOST);
  const port = await ConfigService.getConfig<number>('smtp.port', Number(process.env.SMTP_PORT || 587));
  const user = await ConfigService.getConfig<string>('smtp.user', process.env.SMTP_USER);
  const pass = await ConfigService.getSecretConfig('smtp.pass') || process.env.SMTP_PASS;
  const secure = await ConfigService.getConfig<boolean>('smtp.secure', port === 465);
  const from = await getFromAddress();

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });

  await transporter.sendMail({
    from,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });

  return { sent: true, provider: 'smtp' };
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  if (process.env.RESEND_API_KEY) {
    return sendViaResend(input);
  }

  const configured = await isEmailConfigured();
  if (configured) {
    return sendViaSmtp(input);
  }

  const reason =
    'Email is not configured. Set RESEND_API_KEY or SMTP configs in the database or via environment variables.';
  console.warn('[email] skipped:', reason);
  console.warn('[email] would send to:', input.to, '|', input.subject);
  if (process.env.NODE_ENV !== 'production') {
    console.info('[email] preview text:\n', input.text || input.html.slice(0, 500));
  }

  return { sent: false, skipped: true, reason };
}

// ----------------------------------------------------------------------------
// Centralized Template Email Sender
// ----------------------------------------------------------------------------
import { db } from '@/lib/db';
import { renderTemplateString, TemplateContext } from '@/lib/email/renderer';

export async function sendTemplateEmail(
  templateKey: string,
  to: string,
  context: TemplateContext
): Promise<SendEmailResult> {
  const template = await db.systemEmailTemplate.findUnique({
    where: { key: templateKey },
  });

  if (!template) {
    console.warn(`[email] Template missing: ${templateKey}. Email to ${to} skipped.`);
    return { sent: false, skipped: true, reason: `Template ${templateKey} not found` };
  }

  if (template.status !== 'published') {
    console.warn(`[email] Template ${templateKey} is not published (status: ${template.status}).`);
    return { sent: false, skipped: true, reason: `Template ${templateKey} is not published` };
  }

  const subject = renderTemplateString(template.subject, context);
  const html = renderTemplateString(template.contentHtml, context);

  return sendEmail({
    to,
    subject,
    html,
  });
}
