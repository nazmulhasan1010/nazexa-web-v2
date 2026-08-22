import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const host = request.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${baseUrl}/api/auth/callback/google`;

  if (!clientId) {
    return NextResponse.json(
      { error: 'Google OAuth not configured in environment' },
      { status: 500 }
    );
  }

  const scope = 'openid email profile';
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;

  return NextResponse.redirect(authUrl);
}
