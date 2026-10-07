import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const centralToken = request.cookies.get('nazexa_session')?.value;
  const adminToken = request.cookies.get('nazexa_admin_session')?.value;
  const path = request.nextUrl.pathname;

  // Protect Admin Routes
  if (path.startsWith('/admin')) {
    if (!adminToken) {
      const url = new URL('/auth', request.url);
      url.searchParams.set('next', path);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Admin Auth Page
  if (path === '/auth') {
    if (adminToken) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  // Central Auth Pages
  if (path === '/login') {
    const rawRedirect = request.nextUrl.searchParams.get('redirect') || request.nextUrl.searchParams.get('next');
    // If the user clicked "Continue with Nazexa SSO" from an external satellite app AND already has an active central session:
    // complete the SSO handoff immediately by forwarding the handoff token.
    if (centralToken && rawRedirect && rawRedirect.startsWith('http')) {
      try {
        const target = new URL(rawRedirect);
        if (target.protocol === 'http:' || target.protocol === 'https:') {
          target.searchParams.set('handoff', centralToken);
          return NextResponse.redirect(target);
        }
      } catch {}
    }
    // Direct visits to /login do not auto-redirect away: user sees the login page
    return NextResponse.next();
  }

  if (path === '/register') {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/register', '/auth', '/admin/:path*'],
};
