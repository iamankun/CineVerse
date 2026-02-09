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
    
    // Check environment variables - support both local and production naming
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("🔍 [THÔNG BÁO TỪ CINEVERSE] Thiếu các biến môi trường Supabase:", {
        url: !!supabaseUrl,
        key: !!supabaseAnonKey,
        nextPublicUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        nextUrl: !!process.env.NEXT_SUPABASE_URL,
        nextPublicKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        nextKey: !!process.env.NEXT_SUPABASE_ANON_KEY,
        nodeEnv: process.env.NODE_ENV
      });
      return { user: null, session: null, error: "Thiếu các biến môi trường" };
    }

    // Validate environment variables format
    if (!supabaseUrl.startsWith('https://')) {
      console.error("🔍 [THÔNG BÁO TỪ CINEVERSE] Định dạng URL chưa hợp lệ:", supabaseUrl);
      return { user: null, session: null, error: "Định dạng URL chưa hợp lệ" };
    }

    if (supabaseAnonKey.length < 100) {
      console.error("🔍 [THÔNG BÁO TỪ CINEVERSE] Độ dài khóa ẩn danh Supabase không hợp lệ:", supabaseAnonKey.length);
      return { user: null, session: null, error: "Độ dài khóa ẩn danh Supabase không hợp lệ" };
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

    // 🔥 FIX: Use getSession() instead of getUser() for better compatibility
    // getSession() works better with cookies and doesn't throw AuthSessionMissingError
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("🔍 [THÔNG BÁO TỪ CINEVERSE] Phiên làm việc lỗi:", error);
      return { user: null, session: null, error: error.message };
    }
    
    if (!session) {
      console.log("🔍 [THÔNG BÁO TỪ CINEVERSE] Không tìm thấy phiên làm việc");
      return { user: null, session: null, error: null };
    }
    
    console.log("🔍 [THÔNG BÁO TỪ CINEVERSE] Phiên làm việc đã được xác thực:", session.user.id);
    return { user: session.user, session, error: null };
    
  } catch (error) {
    console.error("🔍 [THÔNG BÁO TỪ CINEVERSE] Lỗi:", error);
    return { user: null, session: null, error: error instanceof Error ? error.message : "Không rõ lỗi đang diễn ra" };
  }
}

/**
 * Cached version để tránh multiple calls trong cùng request
 * 🔥 FIX: Uses getSession() for better compatibility
 */
export const getCachedServerSession = cache(async () => {
  return await getServerSession();
});
