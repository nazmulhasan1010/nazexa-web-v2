import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ConfigService } from '@/lib/config/service';
import { verifyVerificationCode } from '@/lib/verification-code';
import { hashPassword } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!rateLimit(ip + '_reset_password', 5, 60 * 1000)) {
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

    const { email, code, newPassword } = await request.json().catch(() => ({}));
    if (!email || !code || !newPassword) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await db.user.findUnique({ where: { email: normalizedEmail } });
    if (!user || user.status !== 'active') {
      return NextResponse.json({ error: 'Invalid or expired reset code' }, { status: 400 });
    }

    const verificationResult = await verifyVerificationCode(user.id, code);
    if (!verificationResult.valid) {
      return NextResponse.json({ error: verificationResult.reason || 'Invalid reset code' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(newPassword);
    await db.user.update({
      where: { id: user.id },
      data: { password_hash: hashedPassword },
    });

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully.',
    });
  } catch (error) {
    console.error('[reset-password]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
