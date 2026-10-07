import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

import { getAppUrlsAction } from '@/lib/app-urls.actions';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const rawCallbackUrl = searchParams.get('callback_url');
  const authPerformFrom = searchParams.get('auth_perform_from');
  const host = request.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;

  const urls = await getAppUrlsAction();

  const { ConfigService } = await import('@/lib/config/service');
  const isEnabled = await ConfigService.getConfig<boolean>('oauth.github.enabled', false);

  if (!isEnabled) {
    return NextResponse.json({ error: 'GitHub Login is disabled' }, { status: 403 });
  }

  const clientId = await ConfigService.getConfig<string>('oauth.github.clientId', process.env.GITHUB_CLIENT_ID);
  const redirectUri = await ConfigService.getConfig<string>('oauth.github.redirectUri') || `${baseUrl}/api/auth/callback/github`;

  if (!clientId) {
    return NextResponse.json(
      { error: 'GitHub OAuth not configured' },
      { status: 500 }
    );
  }

  let callbackUrl = '';
  if (rawCallbackUrl) {
    try {
      const parsed = new URL(rawCallbackUrl);
      const apps = await db.application.findMany({ select: { allowedOrigins: true, redirectUris: true } });
      const dynamicOrigins = apps.flatMap((a) => [
        ...(a.allowedOrigins || '').split(','),
        ...(a.redirectUris || '').split(','),
      ])
        .map((s) => s.trim())
        .filter(Boolean)
        .map((u) => {
          try {
            return new URL(u).origin;
          } catch {
            return '';
          }
        })
        .filter(Boolean);

      const allowedOrigins = [
        baseUrl,
        ...Object.values(urls),
        ...dynamicOrigins,
      ].filter(Boolean) as string[];

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
      // ignore
    }
  }

  const nonce = crypto.randomBytes(32).toString('hex');
  const state = Buffer.from(
    JSON.stringify({
      callback_url: callbackUrl || undefined,
      nonce,
      auth_perform_from: authPerformFrom || undefined,
    })
  ).toString('base64url');

  const authUrlParams = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'user:email',
    state,
  });

  const response = NextResponse.redirect(
    `https://github.com/login/oauth/authorize?${authUrlParams.toString()}`
  );

  const isProd = process.env.NODE_ENV === 'production';
  const maxAge = 60 * 15;

  response.cookies.set('oauth_state', nonce, {
    httpOnly: true,
    secure: isProd,
    path: '/',
    maxAge,
    sameSite: 'lax',
  });

  if (authPerformFrom) {
    response.cookies.set('auth_perform_from', authPerformFrom, {
      httpOnly: true,
      secure: isProd,
      path: '/',
      maxAge,
      sameSite: 'lax',
    });
  }

  return response;
}
