import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession, issueApplicationToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { client_id, client_secret, grant_type } = body;

    // Validate Application Client
    const app = await db.application.findUnique({
      where: { clientId: client_id },
    });

    if (!app || app.clientSecret !== client_secret || app.status !== 'active') {
      return NextResponse.json({ error: 'invalid_client' }, { status: 401 });
    }

    if (grant_type === 'session_exchange') {
      const user = await getSession();
      if (!user) {
        return NextResponse.json({ error: 'no_active_session' }, { status: 401 });
      }

      if (user.status !== 'active') {
        return NextResponse.json({ error: 'account_disabled' }, { status: 403 });
      }

      const scopes = 'profile email';

      // Record authorization grant
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
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
