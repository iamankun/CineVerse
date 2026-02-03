import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware-new';

export async function middleware(request: NextRequest) {
  // Skip middleware for static files and some API routes
  if (request.nextUrl.pathname.startsWith('/_next/') ||
      request.nextUrl.pathname.includes('.')) {
    return NextResponse.next();
  }

  // Skip only specific API routes that don't need auth
  const skipApiRoutes = [
    '/api/debug-profile',
    '/api/debug-tmdb', 
    '/api/test-profiles',
    '/api/manifest',
    '/api/cache/clear',
    '/api/sources/list',
    '/api/sources/movie',
    '/api/sources/tv',
    '/api/proxy/stream',
    '/api/test',
    '/api/test-proxy',
    '/api/test-simple',
    '/api/supabase',
    '/api/notifications'
  ];

  if (request.nextUrl.pathname.startsWith('/api/') && 
      skipApiRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Use Supabase middleware to handle session
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
