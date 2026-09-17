import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies, headers } from 'next/headers';
import { db } from '@/lib/db';

const JWT_SECRET =
  process.env.JWT_SECRET || 'fallback-secret-for-development-only-do-not-use-in-prod';
const encodedKey = new TextEncoder().encode(JWT_SECRET);

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(userId: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const sessionId =
    Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  await db.session.create({
    data: {
      id: sessionId,
      userId,
      expiresAt,
    },
  });

  const token = await new SignJWT({ userId, sessionId })
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

export async function createSession(userId: string) {
  const { token, expiresAt } = await createSessionToken(userId);

  const cookieStore = await cookies();
  cookieStore.set('nazexa_session', token, getCookieOptions(expiresAt));
}

export async function getSession(options?: { requiredScope?: string }) {
  const headersList = await headers();
  const authHeader = headersList.get('authorization');
  let token: string | undefined = undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    const cookieStore = await cookies();
    token = cookieStore.get('nazexa_session')?.value;
  }

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, encodedKey);

    // If it's an Application Token (OAuth SSO)
    if (payload.applicationId && payload.userId) {
      // Application token verification
      if (!options?.requiredScope) {
        // If no required scope is requested, this endpoint does not accept application tokens.
        return null;
      }

      const tokenScopes = ((payload.scopes as string) || '').split(' ');
      if (!tokenScopes.includes(options.requiredScope)) {
        return null;
      }

      const user = await db.user.findUnique({
        where: { id: payload.userId as string },
      });
      return user;
    }

    // Otherwise, it must be a Session Token
    if (!payload.userId || !payload.sessionId) return null;

    const session = await db.session.findUnique({
      where: { id: payload.sessionId as string },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    return session.user;
  } catch (_error) {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('nazexa_session')?.value;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, encodedKey);
      if (payload.sessionId) {
        await db.session
          .delete({
            where: { id: payload.sessionId as string },
          })
          .catch(() => {});
      }
    } catch (_e) {
      // Ignore
    }
  }

  // To delete a cookie with a domain, we must provide the same domain
  cookieStore.delete({
    name: 'nazexa_session',
    ...getCookieOptions(),
  });
}

export async function issueApplicationToken(userId: string, applicationId: string, scopes: string) {
  // Short lived token (1 hour) for specific application
  return await new SignJWT({ userId, applicationId, scopes })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .setAudience(applicationId)
    .setIssuer('nazexa-web-central')
    .sign(encodedKey);
}
