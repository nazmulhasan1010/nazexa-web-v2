'use server';

import { db } from './db';
import {
  verifyPassword,
  createSession as createJwtSession,
  getSession as getJwtSession,
  destroySession,
} from './auth';

export async function login(data: { email: string; password: string }) {
  try {
    const user = await db.user.findUnique({ where: { email: data.email } });
    if (!user || !user.password_hash) return { error: 'Invalid email or password' };

    const valid = await verifyPassword(data.password, user.password_hash);
    if (!valid) return { error: 'Invalid email or password' };

    // Use the same JWT-based session as OAuth routes
    await createJwtSession(user.id);

    return { success: true };
  } catch (err: any) {
    console.error('Login error:', err);
    return { error: 'Server error or database unreachable.' };
  }
}

export async function logout() {
  await destroySession();
  return true;
}

export async function getSession() {
  const user = await getJwtSession();
  if (!user) return null;

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      emailVerified: user.emailVerified,
      hasPassword: !!user.password_hash,
    },
  };
}
