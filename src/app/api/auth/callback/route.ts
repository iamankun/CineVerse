import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { IS_DEVELOPMENT } from "@/utils/constants";
import { env } from "@/utils/env";

export const GET = async (request: NextRequest) => {
  console.log("🔄 OAuth callback received");
  
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  console.log("🔍 Callback params:", { code: !!code, error, errorDescription });

  let next = searchParams.get("next") ?? "/";
  if (!next.startsWith("/")) {
    next = "/";
  }

  // Handle OAuth errors
  if (error) {
    console.error("❌ OAuth error:", { error, errorDescription });
    return NextResponse.redirect(`${origin}/auth?error=true&message=${encodeURIComponent(`Lỗi OAuth: ${errorDescription || error}`)}`);
  }

  if (code) {
    console.log("🔄 Processing OAuth code with implicit flow");
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options),
            );
          },
        },
        auth: {
          autoRefreshToken: true,
          persistSession: true,
        },
      },
    );

    // Supabase handles the exchange automatically with auto flow detection
    // Just check if we have a user after the redirect
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    console.log("🔄 Session check result:", { user: !!user, error: !!userError });

    if (userError) {
      console.error("❌ User error:", userError);
      return NextResponse.redirect(`${origin}/auth?error=true&message=${encodeURIComponent(userError.message)}`);
    }

    if (!user) {
      console.error("❌ No user found after OAuth redirect");
      return NextResponse.redirect(`${origin}/auth?error=true&message=${encodeURIComponent("Không tìm thấy user")}`);
    }

    // Auto-create profile if doesn't exist
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({ 
        id: user.id, 
        username: user.email?.split('@')[0] || 'user' 
      }, {
        onConflict: 'id',
        ignoreDuplicates: false
      });

    if (profileError) {
      console.error("❌ Profile creation error:", profileError);
    } else {
      console.log("✅ Profile created/updated successfully");
    }

    console.log("✅ OAuth login successful, redirecting to:", next);
    const redirectResponse = NextResponse.redirect(`${origin}${next}?success=true`);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  }

  // No code or error
  console.error("❌ No code or error in callback");
  return NextResponse.redirect(`${origin}/auth?error=true&message=${encodeURIComponent("Invalid callback")}`);
};
