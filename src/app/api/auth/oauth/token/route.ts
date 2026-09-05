import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { issueApplicationToken } from '@/lib/auth';
import { jwtVerify } from 'jose';

const JWT_SECRET =
  process.env.JWT_SECRET || 'fallback-secret-for-development-only-do-not-use-in-prod';
const encodedKey = new TextEncoder().encode(JWT_SECRET);

/**
 * Resolve the central user from either:
 * - Cookie: nazexa_session (browser / forwarded Cookie header)
 * - Body: session_token / handoff (cross-origin SSO handoff)
 */
async function resolveUserFromSessionToken(sessionToken: string | undefined | null) {
  if (!sessionToken) return null;
  try {
    const { payload } = await jwtVerify(sessionToken, encodedKey);
    if (!payload.userId || !payload.sessionId) return null;

    const session = await db.session.findUnique({
      where: { id: payload.sessionId as string },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) return null;
    return session.user;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { client_id, client_secret, grant_type } = body;

    const app = await db.application.findUnique({
      where: { clientId: client_id },
    });

    if (!app || app.clientSecret !== client_secret || app.status !== 'active') {
      return NextResponse.json({ error: 'invalid_client' }, { status: 401 });
    }

    if (grant_type === 'session_exchange') {
      const cookieStore = await cookies();
      const fromCookie = cookieStore.get('nazexa_session')?.value;
      const fromBody =
        (typeof body.session_token === 'string' && body.session_token) ||
        (typeof body.handoff === 'string' && body.handoff) ||
        null;

      const user = await resolveUserFromSessionToken(fromBody || fromCookie);
      if (!user) {
        return NextResponse.json({ error: 'no_active_session' }, { status: 401 });
      }

      if (user.status !== 'active') {
        return NextResponse.json({ error: 'account_disabled' }, { status: 403 });
      }

      const scopes = 'profile email';

      await db.authorization.upsert({
        where: {
          userId_applicationId: { userId: user.id, applicationId: app.id },
        },
        create: { userId: user.id, applicationId: app.id, scopes },
        update: {},
      });

      const access_token = await issueApplicationToken(user.id, app.id, scopes);

      return NextResponse.json({
        access_token,
        token_type: 'Bearer',
        expires_in: 3600,
        user_info: { id: user.id, email: user.email, name: user.name },
      });
    }

    return NextResponse.json({ error: 'unsupported_grant_type' }, { status: 400 });
  } catch (error) {
    console.error('[oauth/token]', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
