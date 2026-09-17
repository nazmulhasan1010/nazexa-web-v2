import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const subscribeSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = subscribeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const email = result.data.email.trim().toLowerCase();

    const existing = await db.subscriber.findUnique({ where: { email } });

    if (existing) {
      if (existing.status === 'UNSUBSCRIBED') {
        await db.subscriber.update({
          where: { id: existing.id },
          data: { status: 'ACTIVE', unsubscribedAt: null },
        });
        return NextResponse.json({
          success: true,
          message: 'Welcome back! You have been successfully resubscribed.',
        });
      }
      return NextResponse.json({
        success: true,
        message: "You're already subscribed to Nazexa updates.",
      });
    }

    await db.subscriber.create({
      data: {
        email,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({ success: true, message: 'Thank you for subscribing to Nazexa!' });
  } catch (error) {
    console.error('[subscribe]', error);
    return NextResponse.json(
      { error: 'Failed to process subscription. Please try again later.' },
      { status: 500 }
    );
  }
}
