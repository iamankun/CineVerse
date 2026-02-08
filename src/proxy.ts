import { type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect profile page - Edge Runtime compatible
  if (pathname.startsWith("/profile")) {
    // 🔥 EDGE RUNTIME: Parse cookie thủ công
    const cookieHeader = request.headers.get('cookie') || '';
    const hasAccessToken = cookieHeader.includes('sb-access-token=');
    const hasRefreshToken = cookieHeader.includes('sb-refresh-token=');
    
    console.log("🔍 [PROXY] Profile access check:", {
      hasAccessToken,
      hasRefreshToken,
      pathname
    });
    
    if (!hasAccessToken && !hasRefreshToken) {
      // Redirect to login if not authenticated
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // ✅ Cho phép tiếp tục - server components sẽ xử lý auth
    console.log("🔍 [PROXY] Auth cookies found, allowing access");
  }

  // ✅ Cho phép tất cả requests khác
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
