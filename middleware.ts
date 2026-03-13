import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only run auth check on protected routes
  const protectedRoutes = ['/profile', '/profiles', '/protected', '/admin'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Check for Supabase auth cookies
  const cookieHeader = request.headers.get('cookie') || '';
  const hasAuthCookie = /sb-exsoflgvdreikabvhvkg-auth-token\.[01]=/.test(cookieHeader) ||
                       /sb-access-token=/.test(cookieHeader) ||
                       /sb:access-token=/.test(cookieHeader) ||
                       /supabase\.auth\.token=/.test(cookieHeader);

  if (!hasAuthCookie) {
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*', '/profiles/:path*', '/protected/:path*', '/admin/:path*'],
};
