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
  if (path === '/login' || path === '/register') {
    if (centralToken) {
      return NextResponse.redirect(new URL('/profile', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/register', '/auth', '/admin/:path*'],
};
