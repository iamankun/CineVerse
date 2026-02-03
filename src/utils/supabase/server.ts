import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "../env";
import { Database } from "./types";

export async function createClient(admin?: boolean) {
  const cookieStore = await cookies();

  // Check environment variables
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl) {
    console.error("🔍 [SERVER] Missing NEXT_PUBLIC_SUPABASE_URL");
    throw new Error("Missing Supabase URL");
  }
  
  const key = admin ? serviceRoleKey : anonKey;
  
  if (!key) {
    console.error("🔍 [SERVER] Missing Supabase key:", { admin, hasServiceRole: !!serviceRoleKey, hasAnonKey: !!anonKey });
    throw new Error("Missing Supabase key");
  }

  // Create a server's supabase client with newly configured cookie,
  // which could be used to maintain user's session
  return createServerClient<Database>(supabaseUrl, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch (error) {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
          console.error("Lỗi lưu trữ Cookie:", error);
        }
      },
    },
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  });
}
