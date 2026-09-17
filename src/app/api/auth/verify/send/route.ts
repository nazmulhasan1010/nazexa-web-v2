import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { generateVerificationCode } from '@/lib/verification-code';
import { sendVerificationEmail } from '@/lib/verification-email';
import { db } from '@/lib/db';
import { verifyTurnstile } from '@/lib/turnstile';

export async function POST(request: Request) {
  const sessionUser = await getSession();

  if (!sessionUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { turnstileToken } = await request.json();
    const isTurnstileValid = await verifyTurnstile(turnstileToken);

    if (!isTurnstileValid) {
      return NextResponse.json({ error: 'Invalid security verification' }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
  }

  const userId = sessionUser.id;

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true, emailVerified: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: 'Email is already verified' }, { status: 400 });
    }

    const result = await generateVerificationCode(userId, user.email);

    // If cooldown is active, result.code might be null, but we just return success
    if ('cooldown' in result && result.cooldown) {
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
        console.error('Failed to send verification email:', emailErr);
        return NextResponse.json(
          { error: 'Failed to send verification email. Please try again.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ sent: true, email: user.email });
  } catch (err) {
    console.error('Error sending verification code:', err);
    return NextResponse.json({ error: 'Failed to send verification code' }, { status: 500 });
  }
}
