import { db } from '@/lib/db';
import { processNewsletterCampaign } from './processor';

export async function createNewsCampaign(
  newsId: string,
  title: string,
  excerpt: string,
  body: string
) {
  const existing = await db.newsletterCampaign.findFirst({
    where: { newsId },
  });

  if (existing) {
    console.log('[NewsletterService] Campaign for news already exists, skipping duplicate.');
    return;
  }

  const subscribers = await db.subscriber.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true },
  });

  if (subscribers.length === 0) return;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">${title}</h2>
      <p style="color: #666; font-size: 16px;">${excerpt}</p>
      <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
      <div style="color: #444; line-height: 1.6;">
        ${body}
      </div>
    </div>
  `;

  const campaign = await db.newsletterCampaign.create({
    data: {
      type: 'NEWS',
      newsId,
      subject: `Nazexa Update: ${title}`,
      contentHtml: html,
      status: 'QUEUED',
      totalRecipients: subscribers.length,
      deliveries: {
        create: subscribers.map((sub) => ({
          subscriberId: sub.id,
          status: 'PENDING',
        })),
      },
    },
  });

  processNewsletterCampaign(campaign.id);
}

export async function createCustomCampaign(subject: string, html: string) {
  const subscribers = await db.subscriber.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true },
  });

  if (subscribers.length === 0) {
    throw new Error('No active subscribers found.');
  }

  const campaign = await db.newsletterCampaign.create({
    data: {
      type: 'CUSTOM',
      subject,
      contentHtml: html,
      status: 'QUEUED',
      totalRecipients: subscribers.length,
      deliveries: {
        create: subscribers.map((sub) => ({
          subscriberId: sub.id,
          status: 'PENDING',
        })),
      },
    },
  });

  processNewsletterCampaign(campaign.id);

  return campaign;
}
