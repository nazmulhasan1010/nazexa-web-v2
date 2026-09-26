import { db } from './db';
import { sendEmail } from './email';

export async function sendSupportEmail(
  templateName: string,
  to: string,
  data: Record<string, any>
) {
  const template = await db.supportEmailTemplate.findUnique({
    where: { name: templateName }
  });

  if (!template || !template.active) {
    console.warn(`[Support Email] Template ${templateName} is missing or inactive. Skipping.`);
    return;
  }

  // Helper to resolve nested keys like "user.name"
  const resolvePath = (obj: any, path: string) => {
    return path.split('.').reduce((prev, curr) => (prev ? prev[curr] : ''), obj) || '';
  };

  const render = (text: string) => {
    return text.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key) => {
      const val = resolvePath(data, key);
      return val !== undefined && val !== null ? String(val) : '';
    });
  };

  const subject = render(template.subject);
  
  // Format body, convert line breaks to <br> for simple HTML output
  const bodyText = render(template.body);
  const bodyHtml = `
    <div style="font-family: sans-serif; color: #333; line-height: 1.5; max-width: 600px; margin: 0 auto;">
      ${bodyText.replace(/\n/g, '<br/>')}
    </div>
  `;

  try {
    await sendEmail({
      to,
      subject,
      html: bodyHtml,
      text: bodyText
    });
  } catch (error) {
    console.error(`[Support Email] Failed to send email to ${to}:`, error);
  }
}

export function buildSupportEmailData(ticket: any, user: any, agent?: any, companyName: string = 'Nazexa') {
  return {
    user: {
      name: user?.name || 'Customer',
      email: user?.email || '',
    },
    ticket: {
      id: ticket.id,
      number: ticket.number,
      subject: ticket.subject,
      status: ticket.status,
      priority: ticket.priority,
      product: ticket.application?.name || 'Nazexa',
      createdAt: ticket.createdAt instanceof Date ? ticket.createdAt.toLocaleDateString() : ticket.createdAt,
      updatedAt: ticket.updatedAt instanceof Date ? ticket.updatedAt.toLocaleDateString() : ticket.updatedAt,
    },
    agent: {
      name: agent?.name || 'Support Agent',
    },
    company: {
      name: companyName,
    },
    support: {
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/support/tickets/${ticket.number}`
    }
  };
}
