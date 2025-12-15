import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Public paths that don't require authentication
  const isPublicPath = path === '/login' || path === '/';

  // Check if user is logged in by checking if user_session exists in cookies
  const userSession = request.cookies.get('user_session')?.value;

  // Redirect to login if trying to access protected route without session
  if (!isPublicPath && !userSession && path.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect to dashboard if logged in and trying to access login
  if (isPublicPath && userSession && path === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/'],
};
