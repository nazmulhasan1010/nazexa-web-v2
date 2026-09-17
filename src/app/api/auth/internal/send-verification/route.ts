/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateVerificationCode } from '@/lib/verification-code';
import { sendVerificationEmail } from '@/lib/verification-email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { client_id, client_secret, userId } = body;

    if (!client_id || !client_secret || !userId) {
      return NextResponse.json(
        { error: 'client_id, client_secret, and userId are required' },
        { status: 400 }
      );
    }

    const app = await db.application.findUnique({
      where: { clientId: client_id },
    });

    if (!app || app.clientSecret !== client_secret || app.status !== 'active') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, emailVerified: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email is already verified', verified: true },
        { status: 400 }
      );
    }

    const result = await generateVerificationCode(user.id, user.email);

    if ('cooldown' in result && (result as any).cooldown) {
      return NextResponse.json({
        sent: true,
        email: user.email,
        message: 'Existing code is still active.',
      });
    }

    if (result.rateLimited) {
      return NextResponse.json(
        { error: 'Too many verification codes sent. Please try again later.' },
        { status: 429 }
      );
    }

    if (result.code) {
      try {
        await sendVerificationEmail({
          to: user.email,
          name: user.name,
          code: result.code,
        });
      } catch (emailErr) {
        console.error('Failed to send verification email from Central Auth:', emailErr);
        return NextResponse.json(
          { error: 'Failed to send verification email. Please try again.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ sent: true, email: user.email });
  } catch (error) {
    console.error('internal send-verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
