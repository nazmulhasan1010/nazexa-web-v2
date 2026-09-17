import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, createAdminSession } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await db.adminUser.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
    }

    if (user.status !== 'active') {
      return NextResponse.json({ error: 'Admin account is disabled' }, { status: 403 });
    }

    await createAdminSession(user.id);

    // Update lastLoginAt
    await db.adminUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Admin login error:', err);
    return NextResponse.json({ error: 'Server error or database unreachable.' }, { status: 500 });
  }
}
