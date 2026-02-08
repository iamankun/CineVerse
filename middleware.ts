import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware - Edge Runtime Compatible
 * Chỉ parse cookie thủ công, không dùng Supabase client
 */
export async function middleware(request: NextRequest) {
  // Skip middleware for static files and some API routes
  if (request.nextUrl.pathname.startsWith('/_next/') ||
      request.nextUrl.pathname.includes('.')) {
    return NextResponse.next();
  }

  // Skip only specific API routes that don't need auth
  const skipApiRoutes = [
    '/api/debug-profile',
    '/api/test-auth',
    '/api/debug-histories',
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

  // 🔥 EDGE RUNTIME FIX: Parse cookie thủ công
  const cookieHeader = request.headers.get('cookie') || '';
  
  // Check for Supabase auth cookies
  const hasAccessToken = cookieHeader.includes('sb-access-token=');
  const hasRefreshToken = cookieHeader.includes('sb-refresh-token=');
  
  console.log("🔍 [MIDDLEWARE-EDGE] Cookie check:", {
    hasAccessToken,
    hasRefreshToken,
    path: request.nextUrl.pathname
  });

  // Nếu không có auth cookies và truy cập protected route, redirect về login
  const protectedRoutes = ['/profile', '/profiles', '/protected', '/admin'];
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  if (!hasAccessToken && !hasRefreshToken && isProtectedRoute) {
    console.log("🔍 [MIDDLEWARE-EDGE] No auth cookies, redirecting to login");
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // ✅ Cho phép tiếp tục với cookies hiện tại
  // Server components sẽ xử lý authentication với getServerSession()
  return NextResponse.next();
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
