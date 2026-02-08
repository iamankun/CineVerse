import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Especially important if using Fluid compute: Don't put this client in a
 * global variable. Always create a new client within each function when using
 * it.
 */
export async function createClient() {
  const cookieStore = await cookies();

  // Check environment variables - support both local and production naming
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("🔍 [SERVER-NEW] Missing Supabase environment variables:", {
      url: !!supabaseUrl,
      key: !!supabaseAnonKey,
      nextPublicUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      nextUrl: !!process.env.NEXT_SUPABASE_URL,
      nextPublicKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      nextKey: !!process.env.NEXT_SUPABASE_ANON_KEY
    });
    throw new Error("Missing Supabase environment variables");
  }

  // Environment validation
  if (!supabaseUrl?.startsWith('https://')) {
    console.error("🔍 [SERVER-NEW] Invalid Supabase URL:", supabaseUrl);
    throw new Error("Invalid Supabase URL: must start with https://");
  }

  if (supabaseAnonKey.length < 100) {
    console.error("🔍 [SERVER-NEW] Invalid Supabase Anon Key length");
    throw new Error("Invalid Supabase Anon Key: too short");
  }

  return createServerClient(
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
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
}
