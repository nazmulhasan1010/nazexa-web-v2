import { appBaseUrl, sendEmail, type SendEmailResult } from '@/lib/email';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function sendVerificationEmail(params: {
  to: string;
  name?: string | null;
  code: string;
}): Promise<SendEmailResult> {
  const base = appBaseUrl();
  const displayName = params.name?.trim() || 'there';
  const subject = 'Verify your Nazexa account';
  const code = params.code;

  const text = [
    `Hi ${displayName},`,
    '',
    'Welcome to Nazexa! Please verify your email address by entering this code:',
    '',
    `    ${code}`,
    '',
    'This code expires in 5 minutes.',
    '',
    'If you did not create an account, you can ignore this email.',
  ].join('\n');

  const html = `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#f4f4f5;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#18181b;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:520px;background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e4e4e7;">
            <tr>
              <td>
                <img src="${base}/logos/logo.png" alt="Nazexa" width="120" style="display:block;margin:0 0 24px;" />
                <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;">Verify your email</h1>
                <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#3f3f46;">
                  Hi ${escapeHtml(displayName)}, welcome to Nazexa! Enter this verification code to activate your account:
                </p>
                <div style="margin:24px 0;text-align:center;">
                  <span style="display:inline-block;background:#f4f4f5;border:2px solid #e4e4e7;border-radius:12px;padding:16px 32px;font-size:32px;font-weight:700;letter-spacing:8px;font-family:monospace;color:#18181b;">${escapeHtml(code)}</span>
                </div>
                <p style="margin:0 0 0;font-size:13px;line-height:1.5;color:#71717a;">
                  This code expires in <strong>5 minutes</strong>.
                </p>
                <p style="margin:28px 0 0;font-size:12px;line-height:1.5;color:#a1a1aa;">
                  If you did not create a Nazexa account, you can ignore this email.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return sendEmail({
    to: params.to,
    subject,
    html,
    text,
  });
}
