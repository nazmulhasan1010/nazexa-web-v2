import { db } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { appBaseUrl } from '@/lib/email';

const BATCH_SIZE = 50;

export async function processNewsletterCampaign(campaignId: string) {
  // Fire and forget background worker
  Promise.resolve().then(async () => {
    try {
      while (true) {
        const campaign = await db.newsletterCampaign.findUnique({ where: { id: campaignId } });
        if (!campaign || campaign.status === 'COMPLETED' || campaign.status === 'FAILED') break;

        const pending = await db.newsletterDelivery.findMany({
          where: { campaignId, status: 'PENDING' },
          take: BATCH_SIZE,
          include: { subscriber: true },
        });

        if (pending.length === 0) {
          // Check if any failed
          const failedCount = await db.newsletterDelivery.count({
            where: { campaignId, status: 'FAILED' },
          });
          const sentCount = await db.newsletterDelivery.count({
            where: { campaignId, status: 'SENT' },
          });

          await db.newsletterCampaign.update({
            where: { id: campaignId },
            data: {
              status: failedCount > 0 ? 'PARTIALLY_FAILED' : 'COMPLETED',
              completedAt: new Date(),
              sentCount,
              failedCount,
            },
          });
          break;
        }

        if (campaign.status === 'QUEUED') {
          await db.newsletterCampaign.update({
            where: { id: campaignId },
            data: { status: 'PROCESSING', startedAt: new Date() },
          });
        }

        const promises = pending.map(async (delivery) => {
          try {
            const unsubscribeUrl = `${appBaseUrl()}/api/subscribers/unsubscribe?token=${delivery.subscriberId}`;

            // Add unsubscribe footer
            const htmlWithFooter = `
              ${campaign.contentHtml}
              <br><br>
              <div style="font-size: 12px; color: #666;">
                You are receiving this email because you subscribed to Nazexa updates.<br>
                <a href="${unsubscribeUrl}">Unsubscribe</a>
              </div>
            `;

            await sendEmail({
              to: delivery.subscriber.email,
              subject: campaign.subject,
              html: htmlWithFooter,
            });

            await db.newsletterDelivery.update({
              where: { id: delivery.id },
              data: { status: 'SENT', sentAt: new Date() },
            });

            await db.newsletterCampaign.update({
              where: { id: campaignId },
              data: { sentCount: { increment: 1 } },
            });
          } catch (err: any) {
            await db.newsletterDelivery.update({
              where: { id: delivery.id },
              data: { status: 'FAILED', error: err.message || 'Unknown error' },
            });
            await db.newsletterCampaign.update({
              where: { id: campaignId },
              data: { failedCount: { increment: 1 } },
            });
          }
        });

        // Wait for batch to complete
        await Promise.all(promises);

        // Add a small delay between batches to respect rate limits
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error('[NewsletterProcessor] Fatal error processing campaign:', error);
      await db.newsletterCampaign.update({
        where: { id: campaignId },
        data: { status: 'FAILED' },
      });
    }
  });
}
