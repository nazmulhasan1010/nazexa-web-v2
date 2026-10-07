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

  const templates = await db.systemEmailTemplate.findMany({
    where: { status: 'published' },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      subject: true,
      contentHtml: true,
    }
  });

  return <MailSubscribersClient activeCount={activeCount} initialHistory={history} templates={templates as any} />;
}
