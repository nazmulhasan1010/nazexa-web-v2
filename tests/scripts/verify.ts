import { db } from './src/lib/db';

async function verify() {
  // Create a test subscriber
  const testSub = await db.subscriber.upsert({
    where: { email: 'test@example.com' },
    update: { status: 'ACTIVE' },
    create: { email: 'test@example.com', status: 'ACTIVE' },
  });
  console.log('Subscriber:', testSub.email);

  // Publish a news item via the CMS library function
  const { saveContentItems } = await import('./src/lib/cms');
  await saveContentItems([
    {
      id: 'test-news-2',
      collection: 'news',
      published: true,
      title: 'Test News Alert 2',
      subtitle: 'Checking if newsletter works',
      body: 'This is a test.',
      _new: true,
      _deleted: false,
    } as any,
  ]);

  // Wait a little bit for the background job to run
  await new Promise((r) => setTimeout(r, 2000));

  // Check campaigns
  const campaign = await db.newsletterCampaign.findFirst({
    where: { newsId: 'test-news-2' },
  });

  if (campaign) {
    console.log('Campaign queued!', campaign.subject, campaign.status);
    const deliveries = await db.newsletterDelivery.count({ where: { campaignId: campaign.id } });
    console.log('Deliveries queued:', deliveries);
  } else {
    console.error('Campaign NOT queued!');
  }
}
verify().catch(console.error);
