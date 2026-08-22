/**
 * Email delivery — Resend API or SMTP (nodemailer).
 *
 * Configure one of:
 *   RESEND_API_KEY + EMAIL_FROM
 *   SMTP_HOST + SMTP_PORT + SMTP_USER + SMTP_PASS + EMAIL_FROM
 *
 * Without config, emails are logged in development and reported as skipped.
 */

import nodemailer from 'nodemailer';

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export type SendEmailResult =
  { sent: true; provider: 'resend' | 'smtp' } | { sent: false; skipped: true; reason: string };

function getFromAddress(): string {
  return process.env.EMAIL_FROM || process.env.SMTP_FROM || 'Nazexa<noreply@localhost>';
}

function getAppBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
}

export function appBaseUrl(): string {
  return getAppBaseUrl();
}

export function isEmailConfigured(): boolean {
  if (process.env.RESEND_API_KEY) return true;
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) return true;
  return false;
}

async function sendViaResend(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY!;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: getFromAddress(),
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
  const port = Number(process.env.SMTP_PORT || 587);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: getFromAddress(),
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

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return sendViaSmtp(input);
  }

  const reason =
    'Email is not configured. Set RESEND_API_KEY or SMTP_HOST/SMTP_USER/SMTP_PASS + EMAIL_FROM.';
  console.warn('[email] skipped:', reason);
  console.warn('[email] would send to:', input.to, '|', input.subject);
  if (process.env.NODE_ENV !== 'production') {
    console.info('[email] preview text:\n', input.text || input.html.slice(0, 500));
  }

  return { sent: false, skipped: true, reason };
}
