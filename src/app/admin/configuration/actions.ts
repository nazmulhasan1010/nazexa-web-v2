'use server';

import { ConfigService, ConfigValueType } from '@/lib/config/service';
import { getAdminSession } from '@/lib/admin-auth.server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import nodemailer from 'nodemailer';
import { formatFromAddress } from '@/lib/email';

export async function saveConfigAction(configs: Array<{
  key: string;
  category: string;
  value: any;
  valueType?: string;
  isSecret?: boolean;
  isPublic?: boolean;
  description?: string;
}>) {
  try {
    const session = await getAdminSession();
    if (!session?.user) throw new Error('Unauthorized');
    const admin = session.user;
    
    // Process sequentially or Promise.all
    await Promise.all(
      configs.map(config => 
        ConfigService.updateConfig({
          ...config,
          actorId: admin.id,
          actorName: admin.name || admin.email
        })
      )
    );
    
    revalidatePath('/admin/configuration');
    revalidatePath('/admin/configuration/[...slug]', 'page');
    return { success: true };
  } catch (error: any) {
    console.error('Error saving configs:', error);
    return { success: false, error: error.message };
  }
}

export interface TestEmailConnectionInput {
  host?: string;
  port?: number | string;
  user?: string;
  pass?: string;
  secure?: boolean;
  fromName?: string;
  fromAddress?: string;
  testRecipient?: string;
}

export async function testEmailConnectionAction(input: TestEmailConnectionInput) {
  try {
    const session = await getAdminSession();
    if (!session?.user) throw new Error('Unauthorized');

    // 1. Resolve host
    const host = input.host?.trim() || (await ConfigService.getConfig<string>('smtp.host', process.env.SMTP_HOST)) || '';
    if (!host) {
      return { success: false, error: 'SMTP Host is required to test the connection.' };
    }

    // 2. Resolve port
    const rawPort = input.port ?? (await ConfigService.getConfig<number | string>('smtp.port', process.env.SMTP_PORT || 587));
    const port = Number(rawPort) || 587;

    // 3. Resolve user
    const user = input.user !== undefined ? input.user.trim() : ((await ConfigService.getConfig<string>('smtp.user', process.env.SMTP_USER)) || '');

    // 4. Resolve pass
    let pass = input.pass;
    const isMaskedOrEmpty = !pass || pass.includes('•') || pass === '***' || pass === '__KEEP_EXISTING__';
    if (isMaskedOrEmpty) {
      pass = (await ConfigService.getSecretConfig('smtp.pass')) || process.env.SMTP_PASS || '';
    }

    // 5. Resolve secure
    const secure = typeof input.secure === 'boolean' ? input.secure : (port === 465);

    // 6. Resolve from address
    const fromName = input.fromName !== undefined ? input.fromName : (await ConfigService.getConfig<string>('email.from.name', 'Nazexa'));
    const fromAddress = input.fromAddress !== undefined ? input.fromAddress : (await ConfigService.getConfig<string>('email.from.address', 'no-reply@nazexa.com'));
    const formattedFrom = formatFromAddress(fromName, fromAddress);

    // 7. Create nodemailer transporter with explicit timeouts
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user ? {
        user,
        pass: pass || '',
      } : undefined,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    } as any);

    // 8. Verify SMTP connection
    await transporter.verify();

    // 9. If testRecipient is provided, dispatch a test email
    let emailSent = false;
    const recipient = input.testRecipient?.trim();
    if (recipient) {
      await transporter.sendMail({
        from: formattedFrom,
        to: recipient,
        subject: '[Nazexa] SMTP Configuration Test',
        text: `SMTP Test Successful!\n\nHost: ${host}:${port}\nSecurity: ${secure ? 'SSL/TLS' : 'STARTTLS'}\nSender: ${formattedFrom}\nTimestamp: ${new Date().toISOString()}\n\nYour SMTP configuration on Nazexa is working properly.`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e4e4e7; border-radius: 12px; background: #ffffff;">
            <div style="margin-bottom: 24px;">
              <h2 style="margin: 0 0 8px; color: #09090b; font-size: 20px; font-weight: 700;">SMTP Connection Verified</h2>
              <p style="margin: 0; color: #71717a; font-size: 14px;">This test confirms that Nazexa can successfully deliver outgoing emails using your SMTP settings.</p>
            </div>
            <div style="background: #f4f4f5; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr><td style="color: #71717a; padding: 4px 0; width: 140px;"><strong>SMTP Host</strong></td><td style="color: #09090b; padding: 4px 0;">${host}</td></tr>
                <tr><td style="color: #71717a; padding: 4px 0;"><strong>Port</strong></td><td style="color: #09090b; padding: 4px 0;">${port}</td></tr>
                <tr><td style="color: #71717a; padding: 4px 0;"><strong>Security Mode</strong></td><td style="color: #09090b; padding: 4px 0;">${secure ? 'SSL/TLS (Port 465)' : 'STARTTLS (Port 587)'}</td></tr>
                <tr><td style="color: #71717a; padding: 4px 0;"><strong>Sender Header</strong></td><td style="color: #09090b; padding: 4px 0;">${formattedFrom}</td></tr>
                <tr><td style="color: #71717a; padding: 4px 0;"><strong>Recipient</strong></td><td style="color: #09090b; padding: 4px 0;">${recipient}</td></tr>
                <tr><td style="color: #71717a; padding: 4px 0;"><strong>Timestamp</strong></td><td style="color: #09090b; padding: 4px 0;">${new Date().toUTCString()}</td></tr>
              </table>
            </div>
            <p style="margin: 0; font-size: 13px; color: #16a34a; font-weight: 600;">✔ All transport checks passed.</p>
          </div>
        `,
      });
      emailSent = true;
    }

    return {
      success: true,
      message: emailSent
        ? `SMTP connection verified and test email delivered to ${recipient}.`
        : `SMTP connection and authentication verified successfully with ${host}:${port}.`,
    };
  } catch (error: any) {
    console.error('SMTP test connection failed:', error);
    let friendlyMessage = error.message || 'Failed to connect to SMTP server.';
    if (error.code === 'EAUTH' || friendlyMessage.includes('535') || friendlyMessage.includes('BadCredentials')) {
      friendlyMessage = 'Authentication failed. Please verify your SMTP username and password (for Gmail, ensure you are using an App Password).';
    } else if (error.code === 'ECONNREFUSED') {
      friendlyMessage = 'Connection refused. Please verify that the SMTP host and port are correct and reachable.';
    } else if (error.code === 'ETIMEDOUT' || friendlyMessage.includes('timeout')) {
      friendlyMessage = 'Connection timed out. Check firewall rules or try a different port/encryption setting.';
    }
    return { success: false, error: friendlyMessage };
  }
}

export async function getConfigMapAction(keys: string[]) {
  try {
    const session = await getAdminSession();
    if (!session?.user) throw new Error('Unauthorized');
    
    // Fetch all requested DB records in a single query
    const dbConfigs = await db.systemConfig.findMany({
      where: { key: { in: keys } }
    });
    const dbMap = new Map(dbConfigs.map(c => [c.key, c]));

    const map: Record<string, any> = {};
    const meta: Record<string, { isSecret: boolean; isConfigured: boolean }> = {};

    for (const key of keys) {
      const dbConfig = dbMap.get(key);
      if (dbConfig?.isSecret) {
        const hasSecret = Boolean(dbConfig.valueEncrypted);
        map[key] = hasSecret ? '••••••••••••••••••' : '';
        meta[key] = { isSecret: true, isConfigured: hasSecret };
      } else {
        const val = await ConfigService.getConfig(key);
        map[key] = val;
        meta[key] = { isSecret: false, isConfigured: val !== null && val !== undefined && val !== '' };
      }
    }

    // Special clean handling for email sender if email.from.address holds combined "Name <email>"
    if (keys.includes('email.from.address') && typeof map['email.from.address'] === 'string') {
      const match = map['email.from.address'].match(/^(.*?)\s*<([^>]+)>$/);
      if (match) {
        const parsedName = match[1].replace(/["']/g, '').trim();
        const parsedEmail = match[2].trim();
        if (keys.includes('email.from.name') && (!map['email.from.name'] || map['email.from.name'] === 'Nazexa')) {
          map['email.from.name'] = parsedName || map['email.from.name'] || 'Nazexa';
        }
        map['email.from.address'] = parsedEmail;
      }
    }

    return { success: true, data: map, meta };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
