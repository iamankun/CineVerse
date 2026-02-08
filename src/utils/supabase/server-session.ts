import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { cache } from 'react';

/**
 * Lấy session user từ server-side
 * Dùng trong Server Components thay vì getUser() có thể gây lỗi
 */
export async function getServerSession() {
  try {
    const cookieStore = await cookies();
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("🔍 [SERVER-SESSION] Missing Supabase environment variables:", {
        url: !!supabaseUrl,
        key: !!supabaseAnonKey,
        nodeEnv: process.env.NODE_ENV
      });
      return { user: null, session: null, error: "Missing environment variables" };
    }

    // Validate environment variables format
    if (!supabaseUrl.startsWith('https://')) {
      console.error("🔍 [SERVER-SESSION] Invalid Supabase URL format:", supabaseUrl);
      return { user: null, session: null, error: "Invalid Supabase URL format" };
    }

    if (supabaseAnonKey.length < 100) {
      console.error("🔍 [SERVER-SESSION] Invalid Supabase Anon Key length:", supabaseAnonKey.length);
      return { user: null, session: null, error: "Invalid Supabase Anon Key" };
    }

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              );
            } catch {
                // The `setAll` method was called from a Server Component.
              }
          },
        },
      }
    );

    // Dùng getSession() thay vì getUser() để tránh lỗi
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("🔍 [SERVER-SESSION] Session error:", error);
      return { user: null, session: null, error: error.message };
    }
    
    if (!session) {
      console.log("🔍 [SERVER-SESSION] No session found");
      return { user: null, session: null, error: null };
    }
    
    console.log("🔍 [SERVER-SESSION] Session found for user:", session.user.id);
    return { user: session.user, session, error: null };
    
  } catch (error) {
    console.error("🔍 [SERVER-SESSION] Error:", error);
    return { user: null, session: null, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Cached version để tránh multiple calls trong cùng request
 */
export const getCachedServerSession = cache(getServerSession);
