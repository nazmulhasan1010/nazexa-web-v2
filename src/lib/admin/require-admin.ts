import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth.server';

export async function requireAdmin(requiredRole?: string, requiredPermission?: string) {
  const session = await getAdminSession();

  if (!session || !session.user) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      user: null,
    };
  }

  const { role, permissions } = session.user;

  if (requiredRole && role !== requiredRole && role !== 'super_admin') {
    return {
      error: NextResponse.json({ error: 'Forbidden: Insufficient role' }, { status: 403 }),
      user: null,
    };
  }

  if (requiredPermission && role !== 'super_admin') {
    if (!permissions.includes('*') && !permissions.includes(requiredPermission)) {
      return {
        error: NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 }),
        user: null,
      };
    }
  }

  return { error: null, user: session.user };
}
