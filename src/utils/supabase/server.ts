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
    console.error("🔍 [MÁY CHỦ CINEVERSE THÔNG BÁO] Missing Supabase environment variables:", {
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
    console.error("🔍 [MÁY CHỦ CINEVERSE THÔNG BÁO] URL Supabase không hợp lệ:", supabaseUrl);
    throw new Error("URL Supabase không hợp lệ: phải bắt đầu bằng https://");
  }

  if (supabaseAnonKey.length < 100) {
    console.error("🔍 [MÁY CHỦ CINEVERSE THÔNG BÁO] Độ dài khóa ẩn danh Supabase không hợp lệ");
    throw new Error("Khóa ẩn danh Supabase không hợp lệ: quá ngắn");
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
