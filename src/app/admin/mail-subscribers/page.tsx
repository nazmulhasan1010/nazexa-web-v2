import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/admin-auth.server';
import { redirect } from 'next/navigation';
import MailSubscribersClient from './MailSubscribersClient';

export default async function MailSubscribersPage() {
  const session = await getAdminSession();
  if (!session?.user) redirect('/admin/login');

  const activeCount = await db.subscriber.count({
    where: { status: 'ACTIVE' },
  });

  const history = await db.newsletterCampaign.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return <MailSubscribersClient activeCount={activeCount} initialHistory={history} />;
}
