import { NextRequest, NextResponse } from 'next/server';

import { getAppUrlsAction } from '@/lib/app-urls.actions';

/**
 * Google OAuth Initiation — with callback_url support
 *
 * Product SSO must survive Google's redirect round-trip without relying on
 * cookies alone. We embed callback_url + auth_perform_from in OAuth `state`.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const rawCallbackUrl = searchParams.get('callback_url');
  const authPerformFrom = searchParams.get('auth_perform_from');
  const host = request.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;

  const urls = await getAppUrlsAction();

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${baseUrl}/api/auth/callback/google`;

  if (!clientId) {
    return NextResponse.json(
      { error: 'Google OAuth not configured in environment' },
      { status: 500 }
    );
  }

  let callbackUrl = '';
  if (rawCallbackUrl) {
    try {
      const parsed = new URL(rawCallbackUrl);
      const allowedOrigins = [baseUrl, urls['nazexa-db'], urls['nazexa-socket-platform']].filter(
        Boolean
      );

      const isValidOrigin = allowedOrigins.some((origin) => {
        try {
          return parsed.origin === new URL(origin).origin;
        } catch {
          return false;
        }
      });

      if ((parsed.protocol === 'http:' || parsed.protocol === 'https:') && isValidOrigin) {
        callbackUrl = rawCallbackUrl;
      }
    } catch {
      // Invalid URL — ignore
    }
  }

  const state = Buffer.from(
    JSON.stringify({
      callback_url: callbackUrl || undefined,
      auth_perform_from: authPerformFrom || undefined,
    })
  ).toString('base64url');

  const authUrlParams = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
    state,
  });

  const response = NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${authUrlParams.toString()}`
  );

  // Best-effort cookie backup (state is the source of truth)
  if (authPerformFrom) {
    response.cookies.set('auth_perform_from', authPerformFrom, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 15,
      sameSite: 'lax',
    });
  }

  return response;
}
