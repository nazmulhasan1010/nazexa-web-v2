import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createSessionToken } from '@/lib/auth';
import { appendSsoHandoff, isExternalProductRedirect } from '@/lib/sso-handoff';

type OAuthState = {
  callback_url?: string;
  auth_perform_from?: string;
};

function parseOAuthState(stateParam: string | null): OAuthState {
  if (!stateParam) return {};
  try {
    return JSON.parse(Buffer.from(stateParam, 'base64url').toString()) as OAuthState;
  } catch {
    return {};
  }
}

function resolveProductBase(from: string | undefined): string | null {
  if (from === 'nazexa-db') {
    return process.env.NEXT_PUBLIC_NAZEXA_DB_URL || 'http://localhost:8000';
  }
  if (from === 'nazexa-socket-platform') {
    return process.env.NEXT_PUBLIC_NAZEXA_SOCKET_URL || 'http://localhost:4000';
  }
  return null;
}

/**
 * After Google login, return the user to the product SSO endpoint with a
 * cross-origin handoff token. Do NOT block product SSO on set-password /
 * verify flows — those apply only when staying on nazexa-web.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  const host = request.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;

  if (error) {
    return NextResponse.redirect(`${baseUrl}/login?error=oauth_rejected`);
  }
  if (!code) {
    return NextResponse.redirect(`${baseUrl}/login?error=no_code`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${baseUrl}/api/auth/callback/google`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${baseUrl}/login?error=google_not_configured`);
  }

  const state = parseOAuthState(url.searchParams.get('state'));
  const authPerformFrom =
    state.auth_perform_from || request.cookies.get('auth_perform_from')?.value || '';

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error('No access token');

    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profileData = await profileRes.json();
    if (!profileData.email) throw new Error('No email returned from Google');

    const ip = request.headers.get('x-forwarded-for') || 'unknown';

    let user = await db.user.findUnique({ where: { email: profileData.email } });

    await db.$transaction(async (tx) => {
      if (!user) {
        user = await tx.user.create({
          data: {
            email: profileData.email,
            name: profileData.name,
            image: profileData.picture,
            emailVerified: new Date(),
            lastLoginAt: new Date(),
            lastLoginIp: ip,
          },
        });
        await tx.userEvent.create({
          data: {
            eventId: crypto.randomUUID(),
            centralUserId: user.id,
            source: 'nazexa-web-core',
            eventType: 'USER_CREATED',
            payload: JSON.stringify({ provider: 'google' }),
          },
        });
      } else {
        const updateData: Record<string, unknown> = {
          lastLoginAt: new Date(),
          lastLoginIp: ip,
          emailVerified: user.emailVerified || new Date(),
        };
        if (!user.image && profileData.picture) updateData.image = profileData.picture;
        user = await tx.user.update({ where: { id: user.id }, data: updateData });
      }

      await tx.userEvent.create({
        data: {
          eventId: crypto.randomUUID(),
          centralUserId: user.id,
          source: 'nazexa-web-core',
          eventType: 'USER_LOGGED_IN',
          payload: JSON.stringify({ ip, provider: 'google' }),
        },
      });

      const account = await tx.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: 'google',
            providerAccountId: profileData.id,
          },
        },
      });
      if (!account) {
        await tx.account.create({
          data: {
            userId: user.id,
            type: 'oauth',
            provider: 'google',
            providerAccountId: profileData.id,
            access_token: tokenData.access_token,
            id_token: tokenData.id_token,
          },
        });
      }
    });

    if (!user || user.status !== 'active') {
      return NextResponse.redirect(`${baseUrl}/login?error=account_disabled`);
    }

    const { token, expiresAt } = await createSessionToken(user.id);

    let redirectUrl = `${baseUrl}/`;

    // 1) Explicit product callback from OAuth state (preferred for SSO)
    if (state.callback_url) {
      try {
        const parsed = new URL(state.callback_url);
        const allowedOrigins = [
          baseUrl,
          process.env.NEXT_PUBLIC_NAZEXA_DB_URL || 'http://localhost:8000',
          process.env.NEXT_PUBLIC_NAZEXA_SOCKET_URL || 'http://localhost:4000',
        ].filter(Boolean);
        const isValidOrigin = allowedOrigins.some((origin) => {
          try {
            return parsed.origin === new URL(origin).origin;
          } catch {
            return false;
          }
        });
        if (
          (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
          isValidOrigin
        ) {
          redirectUrl = state.callback_url;
        }
      } catch {
        // ignore
      }
    } else {
      // 2) Fallback: auth_perform_from → default product SSO path
      const productBase = resolveProductBase(authPerformFrom);
      if (productBase) {
        redirectUrl = `${productBase.replace(/\/$/, '')}/api/auth/sso?redirect=${encodeURIComponent('/dashboard')}`;
      } else if (!user.emailVerified) {
        redirectUrl = `${baseUrl}/verify`;
      } else if (!user.password_hash) {
        // Only when staying on central web — never block product SSO
        redirectUrl = `${baseUrl}/set-password`;
      }
    }

    if (isExternalProductRedirect(redirectUrl, baseUrl)) {
      redirectUrl = appendSsoHandoff(redirectUrl, token);
    }

    const response = NextResponse.redirect(redirectUrl);
    response.cookies.delete('auth_perform_from');

    const isProd = process.env.NODE_ENV === 'production';
    const domain = process.env.COOKIE_DOMAIN;
    response.cookies.set('nazexa_session', token, {
      httpOnly: true,
      secure: isProd,
      expires: expiresAt,
      sameSite: 'lax',
      path: '/',
      ...(domain ? { domain } : {}),
    });
    return response;
  } catch (err) {
    console.error('[google callback]', err);
    return NextResponse.redirect(`${baseUrl}/login?error=oauth_failed`);
  }
}
