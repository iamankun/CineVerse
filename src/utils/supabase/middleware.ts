import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  // Skip Supabase middleware if no auth cookies
  const accessToken = request.cookies.get('sb-access-token')?.value;
  const refreshToken = request.cookies.get('sb-refresh-token')?.value;
  
  if (!accessToken && !refreshToken) {
    return NextResponse.next();
  }

  // Check if environment variables are available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("🔍 [MIDDLEWARE] Missing Supabase environment variables:", {
      url: !!supabaseUrl,
      key: !!supabaseAnonKey
    });
    return NextResponse.next();
  }

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({ name, value: '', ...options });
          },
        },
      }
    );

    if (!supabase?.auth) {
      console.error("🔍 [MIDDLEWARE] Supabase auth client unavailable");
      return response;
    }

    // Only refresh session if we have tokens - use getSession instead of getUser
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("🔍 [MIDDLEWARE] Session error:", sessionError);
    }
    
    if (session) {
      // session.user contains the user info - no need to call getUser()
      const user = session.user;
      
      // If you still need to call getUser(), guard the method exists
      if (!user && supabase.auth && typeof supabase.auth.getUser === 'function') {
        await supabase.auth.getUser();
      }
    }
  } catch (error) {
    console.error("🔍 [MIDDLEWARE] Session refresh error:", error);
  }

  return response;
}
