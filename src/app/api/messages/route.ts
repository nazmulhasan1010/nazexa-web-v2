import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/admin-auth.server';

export async function GET() {
  const adminUser = await getAdminSession();

  // Basic role check - only admins can see messages
  if (!adminUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Assuming roles are checked elsewhere, but we ensure they have an account
  try {
    const messages = await db.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const unreadIds = messages.filter((m) => !m.read).map((m) => m.id);

    if (unreadIds.length > 0) {
      await db.contactMessage.updateMany({
        where: { id: { in: unreadIds } },
        data: { read: true },
      });

      // Background async notification
      try {
        const { publishAdminEvent } = await import('@/lib/socket');
        await publishAdminEvent('contact.messages.read', { count: unreadIds.length });
      } catch (err) {
        console.error('[socket] Failed to publish event:', err);
      }
    }

    return NextResponse.json({ messages });
  } catch (err) {
    console.error('Failed to fetch messages', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
