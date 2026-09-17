import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies, headers } from 'next/headers';
import { db } from '@/lib/db';

const ADMIN_JWT_SECRET =
  process.env.ADMIN_JWT_SECRET || 'fallback-secret-for-development-only-do-not-use-in-prod';
const encodedKey = new TextEncoder().encode(ADMIN_JWT_SECRET);

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createAdminSessionToken(userId: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const sessionId =
    Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  await db.adminSession.create({
    data: {
      id: sessionId,
      userId,
      expiresAt,
    },
  });

  const token = await new SignJWT({ userId, sessionId, adminAuth: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);

  return { token, expiresAt };
}

export function getCookieOptions(expiresAt?: Date) {
  const isProd = process.env.NODE_ENV === 'production';
  const domain = process.env.COOKIE_DOMAIN;

  return {
    httpOnly: true,
    secure: isProd,
    expires: expiresAt,
    sameSite: 'lax' as const,
    path: '/',
    ...(domain ? { domain } : {}),
  };
}

export async function createAdminSession(userId: string) {
  const { token, expiresAt } = await createAdminSessionToken(userId);

  const cookieStore = await cookies();
  cookieStore.set('nazexa_admin_session', token, getCookieOptions(expiresAt));
}

export async function getAdminSession() {
  const headersList = await headers();
  const authHeader = headersList.get('authorization');
  let token: string | undefined = undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    const cookieStore = await cookies();
    token = cookieStore.get('nazexa_admin_session')?.value;
  }

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, encodedKey);

    // Only allow if it's explicitly marked as adminAuth
    if (!payload.adminAuth) {
      console.log('getAdminSession: missing adminAuth in payload');
      (await cookies()).delete('nazexa_admin_session');
      return null;
    }
    if (!payload.userId || !payload.sessionId) {
      console.log('getAdminSession: missing userId or sessionId in payload');
      (await cookies()).delete('nazexa_admin_session');
      return null;
    }

    const session = await db.adminSession.findUnique({
      where: { id: payload.sessionId as string },
      include: { admin_users: true },
    });

    if (!session) {
      console.log('getAdminSession: session not found in DB');
      (await cookies()).delete('nazexa_admin_session');
      return null;
    }

    if (session.expiresAt < new Date()) {
      console.log('getAdminSession: session expired');
      (await cookies()).delete('nazexa_admin_session');
      return null;
    }

    return session.admin_users;
  } catch (error) {
    console.error('getAdminSession: caught error', error);
    (await cookies()).delete('nazexa_admin_session');
    return null;
  }
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('nazexa_admin_session')?.value;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, encodedKey);
      if (payload.sessionId) {
        await db.adminSession
          .delete({
            where: { id: payload.sessionId as string },
          })
          .catch(() => {});
      }
    } catch (_e) {
      // Ignore
    }
  }

  cookieStore.delete({
    name: 'nazexa_admin_session',
    ...getCookieOptions(),
  });
}
