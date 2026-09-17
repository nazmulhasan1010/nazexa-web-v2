import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token missing' }, { status: 400 });
    }

    const config = await db.securitySettings.findUnique({
      where: { id: 'global' },
    });

    if (!config?.turnstileEnabled) {
      return NextResponse.json({ success: true, message: 'Turnstile is disabled' });
    }

    if (!config.turnstileSecretKey) {
      console.error('[Turnstile] Missing secret key in DB');
      return NextResponse.json({ success: false, error: 'Configuration error' }, { status: 500 });
    }

    const formData = new URLSearchParams();
    formData.append('secret', config.turnstileSecretKey);
    formData.append('response', token);

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const data = await res.json();
    if (data.success) {
      return NextResponse.json({ success: true });
    } else {
      console.error('[Turnstile Verify] Failed:', data);
      return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 400 });
    }
  } catch (error) {
    console.error('[Turnstile Verify] Error:', error);
    return NextResponse.json({ success: false, error: 'Verification error' }, { status: 500 });
  }
}
