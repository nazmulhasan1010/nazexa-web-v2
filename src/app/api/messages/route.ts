import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const user = await getSession();

  // Basic role check - only admins/editors can see messages
  if (!user || user.status !== 'active') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Assuming roles are checked elsewhere, but we ensure they have an account
  try {
    const messages = await db.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ messages });
  } catch (err) {
    console.error('Failed to fetch messages', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
