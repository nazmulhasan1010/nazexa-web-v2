import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyCode } from '@/lib/verification-code';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { client_id, client_secret, userId, code } = body;

    if (!client_id || !client_secret || !userId || !code) {
      return NextResponse.json(
        { error: 'client_id, client_secret, userId, and code are required' },
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
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const result = await verifyCode(user.id, code);

    if (!result.verified) {
      return NextResponse.json({ error: result.reason, verified: false }, { status: 400 });
    }

    return NextResponse.json({ success: true, verified: true });
  } catch (error) {
    console.error('internal confirm-verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
