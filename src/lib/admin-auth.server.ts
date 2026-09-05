'use server';

import { db } from './db';
import {
  verifyPassword,
  createAdminSession as createJwtSession,
  getAdminSession as getJwtSession,
  destroyAdminSession,
} from './admin-auth';

export async function adminLogin(data: { email: string; password: string }) {
  try {
    const user = await db.adminUser.findUnique({ where: { email: data.email } });
    if (!user) return { error: 'Invalid admin credentials' };

    const valid = await verifyPassword(data.password, user.password_hash);
    if (!valid) return { error: 'Invalid admin credentials' };

    if (user.status !== 'active') {
      return { error: 'Admin account is disabled' };
    }

    await createJwtSession(user.id);

    // Update lastLoginAt
    await db.adminUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    return { success: true };
  } catch (err: any) {
    console.error('Admin login error:', err);
    return { error: 'Server error or database unreachable.' };
  }
}

export async function adminLogout() {
  await destroyAdminSession();
  return true;
}

export async function getAdminSession() {
  const user = await getJwtSession();
  if (!user) return null;

  let permissions = ['*']; // Default for super_admin
  if (user.role === 'editor') {
    permissions = ['/admin', '/admin/builder', '/admin/content', '/admin/pages', '/admin/seo', '/admin/messages'];
  } else if (user.role !== 'super_admin') {
    const role = await db.adminRole.findUnique({ where: { name: user.role } });
    if (role && role.permissions) {
      try {
        permissions = JSON.parse(role.permissions);
      } catch (e) {
        permissions = [];
      }
    } else {
      permissions = [];
    }
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions,
    },
  };
}
