'use server';

import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/admin-auth.server';
import bcrypt from 'bcryptjs';

export async function getAdminUsers() {
  const session = await getAdminSession();
  if (!session || session.user.role !== 'super_admin') {
    throw new Error('Unauthorized');
  }

  const users = await db.adminUser.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      lastLoginAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return users;
}

export async function createAdminUser(data: { name: string; email: string; password?: string; role: string }) {
  const session = await getAdminSession();
  if (!session || session.user.role !== 'super_admin') {
    throw new Error('Unauthorized');
  }

  const existing = await db.adminUser.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new Error('User with this email already exists');
  }

  const salt = await bcrypt.genSalt(12);
  const password_hash = await bcrypt.hash(data.password || 'password123', salt);

  await db.adminUser.create({
    data: {
      name: data.name,
      email: data.email,
      password_hash,
      role: data.role,
    },
  });

  return { success: true };
}

export async function updateAdminUser(id: string, data: { name?: string; role?: string; status?: string; password?: string }) {
  const session = await getAdminSession();
  if (!session || session.user.role !== 'super_admin') {
    throw new Error('Unauthorized');
  }
  
  if (session.user.id === id && data.status === 'disabled') {
    throw new Error('Cannot disable your own account');
  }

  const updateData: any = { ...data };
  
  if (data.password) {
    const salt = await bcrypt.genSalt(12);
    updateData.password_hash = await bcrypt.hash(data.password, salt);
    delete updateData.password;
  }

  await db.adminUser.update({
    where: { id },
    data: updateData,
  });

  return { success: true };
}

export async function deleteAdminUser(id: string) {
  const session = await getAdminSession();
  if (!session || session.user.role !== 'super_admin') {
    throw new Error('Unauthorized');
  }

  if (session.user.id === id) {
    throw new Error('Cannot delete your own account');
  }

  await db.adminUser.delete({
    where: { id },
  });

  return { success: true };
}

export async function getAdminRoles() {
  const session = await getAdminSession();
  if (!session || session.user.role !== 'super_admin') {
    throw new Error('Unauthorized');
  }

  const roles = await db.adminRole.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return roles;
}

export async function createAdminRole(data: { name: string; permissions: string[] }) {
  const session = await getAdminSession();
  if (!session || session.user.role !== 'super_admin') {
    throw new Error('Unauthorized');
  }

  const existing = await db.adminRole.findUnique({ where: { name: data.name } });
  if (existing) {
    throw new Error('Role with this name already exists');
  }

  await db.adminRole.create({
    data: {
      name: data.name,
      permissions: JSON.stringify(data.permissions),
    },
  });

  return { success: true };
}

export async function deleteAdminRole(id: string) {
  const session = await getAdminSession();
  if (!session || session.user.role !== 'super_admin') {
    throw new Error('Unauthorized');
  }

  const role = await db.adminRole.findUnique({ where: { id } });
  if (!role) throw new Error('Role not found');
  if (role.name === 'super_admin' || role.name === 'editor') {
    throw new Error('Cannot delete built-in roles');
  }

  await db.adminRole.delete({
    where: { id },
  });

  return { success: true };
}
