import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  // This `response` object is mutable and passed by reference to the cookie handlers.
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // The `set` method is called whenever the Supabase client needs to save a cookie.
          // This happens when signing in, signing out, and when refreshing the session.
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          // The `remove` method is called whenever the Supabase client needs to delete a cookie.
          // This happens when signing out.
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // This will refresh the session cookie if it's expired.
  await supabase.auth.getUser();

  return response;
}
