import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Next.js Middleware với Supabase SSR - Simplified
 */
export async function updateSession(request: NextRequest) {
  const accessToken = request.cookies.get('sb-access-token')?.value;
  const refreshToken = request.cookies.get('sb-refresh-token')?.value;
  
  if (!accessToken && !refreshToken) {
    return NextResponse.next();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("🔍 [MIDDLEWARE] Missing environment variables");
    return NextResponse.next();
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string) {
        request.cookies.set(name, value, {
          secure: process.env.NODE_ENV === 'production',
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
        });
      },
    },
  });

  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      const user = session.user;
      console.log("🔍 [MIDDLEWARE] Session valid for user:", user.id);
    } else {
      console.log("🔍 [MIDDLEWARE] No session found");
    }
  } catch (error) {
    console.error("🔍 [MIDDLEWARE] Session error:", error);
  }

  return NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
}
