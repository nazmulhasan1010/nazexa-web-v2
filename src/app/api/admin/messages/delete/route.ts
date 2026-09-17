import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/admin-auth.server';

export async function DELETE(request: Request) {
  try {
    const adminSession = await getAdminSession();
    const adminUser = adminSession?.user;

    if (
      !adminUser ||
      (!adminUser.permissions.includes('*') && !adminUser.permissions.includes('/admin/messages'))
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    await db.contactMessage.deleteMany({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
