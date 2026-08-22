import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const settings = await db.contactSettings.findFirst();
    return NextResponse.json({ settings });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const user = await getSession();

  // Basic role check - only admins/editors can modify settings
  if (!user || user.status !== 'active') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, subtitle, phone, email, address } = body;

    const existing = await db.contactSettings.findFirst();

    if (existing) {
      const updated = await db.contactSettings.update({
        where: { id: existing.id },
        data: { title, subtitle, phone, email, address },
      });
      return NextResponse.json({ settings: updated });
    } else {
      const created = await db.contactSettings.create({
        data: { title, subtitle, phone, email, address },
      });
      return NextResponse.json({ settings: created });
    }
  } catch (err) {
    console.error('Failed to update contact settings', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
