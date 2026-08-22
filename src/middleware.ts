import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('nazexa_session')?.value;
  const path = request.nextUrl.pathname;

  // Redirect authenticated users away from auth pages
  if (token && (path === '/login' || path === '/register' || path === '/auth')) {
    return NextResponse.redirect(new URL('/profile', request.url));
  }

  // Optional: protect /profile or /admin routes here if they don't already have checks
  // (Assuming they have their own server-side session checks, but adding this is safe)

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/register', '/auth'],
};
