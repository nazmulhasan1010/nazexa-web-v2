import { NextResponse } from 'next/server';
import { verifyTurnstile } from '@/lib/turnstile';

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token missing' }, { status: 400 });
    }

    const isValid = await verifyTurnstile(token);
    
    if (isValid) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 400 });
    }
  } catch (error) {
    console.error('[Turnstile Verify API] Error:', error);
    return NextResponse.json({ success: false, error: 'Verification error' }, { status: 500 });
  }
}
