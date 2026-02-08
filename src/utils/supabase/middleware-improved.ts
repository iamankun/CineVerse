import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Next.js Middleware với Supabase SSR
 * Cập nhật session và refresh tokens khi cần
 */
export async function updateSession(request: NextRequest) {
  // Skip Supabase middleware nếu không có auth cookies
  const accessToken = request.cookies.get('sb-access-token')?.value;
  const refreshToken = request.cookies.get('sb-refresh-token')?.value;
  
  if (!accessToken && !refreshToken) {
    return NextResponse.next();
  }

  // Validate environment variables trước khi dùng
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("🔍 [MIDDLEWARE] Missing environment variables:", {
      url: !!supabaseUrl,
      key: !!supabaseAnonKey,
      nodeEnv: process.env.NODE_ENV
    });
    return NextResponse.next();
  }

  // Validate URL format
  if (!supabaseUrl.startsWith('https://')) {
    console.error("🔍 [MIDDLEWARE] Invalid Supabase URL:", supabaseUrl);
    return NextResponse.next();
  }

  // Tạo Supabase client với cookies
  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) => {
          const cookieOptions: CookieOptions = {
            ...options,
            // Ensure cookies work trong production
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            // Không set domain để cho phép subdomain access
          };
          
          console.log("🔍 [MIDDLEWARE] Setting cookie:", name, {
            secure: cookieOptions.secure,
            httpOnly: cookieOptions.httpOnly,
            sameSite: cookieOptions.sameSite,
            path: cookieOptions.path
          });
          
          request.cookies.set({
            name,
            value,
            ...cookieOptions
          });
        },
        remove(name: string, options: CookieOptions) => {
          const cookieOptions: CookieOptions = {
            ...options,
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            sameSite: 'lax',
            path: '/'
          };
          
          request.cookies.set({
            name,
            value: '',
            ...cookieOptions
          });
        },
      },
    }
  );

  try {
    // Dùng getSession() thay vì getUser() để tránh lỗi
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("🔍 [MIDDLEWARE] Session error:", sessionError);
    }
    
    if (session) {
      // session.user chứa user info - không cần gọi getUser()
      const user = session.user;
      
      console.log("🔍 [MIDDLEWARE] Session valid for user:", user.id);
      
      // Refresh session nếu cần
      if (user && supabase.auth && typeof supabase.auth.getUser === 'function') {
        // Optional: Refresh user data nếu có thay đổi
        await supabase.auth.getUser();
      }
    } else {
      console.log("🔍 [MIDDLEWARE] No session found");
    }
  } catch (error) {
    console.error("🔍 [MIDDLEWARE] Session refresh error:", error);
  }

  // Trả về response với session đã được cập nhật
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  return response;
}
