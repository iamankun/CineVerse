import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware - Edge Runtime Compatible
 * Chỉ parse cookie thủ công, không dùng Supabase client
 */
export async function middleware(request: NextRequest) {
  // 🔥 DEBUG: Ensure middleware runs
  console.log("🔥 [MIDDLEWARE-START] Middleware triggered:", {
    url: request.url,
    pathname: request.nextUrl.pathname,
    method: request.method,
    userAgent: request.headers.get('user-agent')?.substring(0, 30)
  });
  
  // 🔥 FORCE ERROR TO TEST
  if (request.nextUrl.pathname.includes('test-middleware')) {
    throw new Error("🔥 MIDDLEWARE TEST ERROR - This should appear in logs");
  }
  
  // Skip middleware for static files and some API routes
  if (request.nextUrl.pathname.startsWith('/_next/') ||
      request.nextUrl.pathname.includes('.')) {
    console.log("🔥 [MIDDLEWARE-START] Skipping static file");
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

  // 🔥 EDGE RUNTIME FIX: Simple cookie-presence check (no server-side helpers)
  const cookieHeader = request.headers.get('cookie') || '';
  
  console.log("🔍 [MIDDLEWARE-EDGE] Full cookie analysis:", {
    fullHeader: cookieHeader,
    headerLength: cookieHeader.length,
    hasAnyCookie: cookieHeader.length > 0,
    pathname: request.nextUrl.pathname,
    userAgent: request.headers.get('user-agent')?.substring(0, 50)
  });
  
  // Check for Supabase auth cookies - use regex for more reliable matching
  const hasAuthCookie = /sb-exsoflgvdreikabvhvkg-auth-token\.[01]=/.test(cookieHeader) ||
                       /sb-access-token=/.test(cookieHeader) ||
                       /sb:access-token=/.test(cookieHeader) ||
                       /supabase\.auth\.token=/.test(cookieHeader);
  
  console.log("🔍 [MIDDLEWARE-EDGE] Cookie check results:", {
    hasAuthCookie,
    cookieStartsWith: cookieHeader.startsWith('sb-exsoflgvdreikabvhvkg'),
    containsToken0: cookieHeader.includes('sb-exsoflgvdreikabvhvkg-auth-token.0='),
    containsToken1: cookieHeader.includes('sb-exsoflgvdreikabvhvkg-auth-token.1='),
    headerPreview: cookieHeader.substring(0, 200)
  });
  
  console.log("🔍 [MIDDLEWARE-EDGE] Auth cookie check:", {
    hasAuthCookie,
    pathname: request.nextUrl.pathname,
    cookiePreview: cookieHeader.substring(0, 100) + '...'
  });

  // Nếu không có auth cookies và truy cập protected route, redirect về login
  const protectedRoutes = ['/profile', '/profiles', '/protected', '/admin'];
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  if (!hasAuthCookie && isProtectedRoute) {
    console.log("🔍 Không có cookie xác minh, chuyển hướng đến đăng nhập", {
      pathname: request.nextUrl.pathname,
      cookieHeader: cookieHeader.substring(0, 100)
    });
    
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
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
