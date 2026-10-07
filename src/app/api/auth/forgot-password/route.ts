import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ConfigService } from '@/lib/config/service';
import { generateVerificationCode } from '@/lib/verification-code';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!rateLimit(ip + '_forgot_password', 5, 60 * 1000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const passwordResetEnabled = await ConfigService.getConfig<boolean>('auth.passwordResetEnabled', true);
    if (!passwordResetEnabled) {
      return NextResponse.json(
        { error: 'Password reset is currently disabled.', code: 'PASSWORD_RESET_DISABLED' },
        { status: 403 }
      );
    }

    const { email } = await request.json().catch(() => ({}));
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await db.user.findUnique({ where: { email: normalizedEmail } });

    // Always respond with success to avoid email enumeration
    if (user && user.status === 'active') {
      await generateVerificationCode(user.id, user.email);
    }

    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, password reset instructions have been sent.',
    });
  } catch (error) {
    console.error('[forgot-password]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
