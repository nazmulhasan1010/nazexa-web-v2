import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const host = request.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;

  const { ConfigService } = await import('@/lib/config/service');
  const clientId = await ConfigService.getConfig<string>('oauth.github.clientId', process.env.GITHUB_CLIENT_ID);
  const redirectUri = await ConfigService.getConfig<string>('oauth.github.redirectUri') || `${baseUrl}/api/auth/callback/github`;

  if (!clientId) {
    return NextResponse.json(
      { error: 'GitHub OAuth not configured' },
      { status: 500 }
    );
  }

  const scope = 'user:email';
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;

  return NextResponse.redirect(authUrl);
}
