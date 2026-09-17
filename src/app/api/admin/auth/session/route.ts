import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth.server';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ user: null }, { status: 200 });
    }
    return NextResponse.json(session, { status: 200 });
  } catch (err) {
    console.error('Admin session check error:', err);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
