import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { env } from "@/utils/env";
import { signIn, signUp } from "@/actions/auth";

export const POST = async (request: NextRequest) => {
  try {
    console.log(" Auth API called");
    
    const body = await request.json();
    const { email, password, action, captchaToken } = body;

    console.log(" Request data:", { 
      hasEmail: !!email, 
      hasPassword: !!password, 
      action,
      hasCaptchaToken: !!captchaToken 
    });

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email và mật khẩu là bắt buộc" },
        { status: 400 }
      );
    }

    // Create Supabase client for cookie handling
    let response = NextResponse.next({ request });
    const supabase = createServerClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value);
              response.cookies.set(name, value, options);
            });
          },
        },
      },
    );

    // Call Supabase auth directly to get cookies
    let authResult;
    if (action === "signup") {
      authResult = await supabase.auth.signUp({
        email,
        password,
        options: captchaToken ? { captchaToken } : undefined,
      });
    } else {
      // Default: login
      authResult = await supabase.auth.signInWithPassword({
        email,
        password,
        options: captchaToken ? { captchaToken } : undefined,
      });
    }

    if (authResult.error) {
      return NextResponse.json({ error: authResult.error.message }, { status: 401 });
    }

    console.log(" Auth successful:", { userId: authResult.data.user?.id, email: authResult.data.user?.email });

    // Return success with cookies set
    return NextResponse.json({ 
      success: true, 
      message: action === "signup" ? "Đăng ký thành công!" : "Đăng nhập thành công!",
      user: authResult.data.user 
    });

  } catch (error) {
    console.error(" Auth API error:", error);
    return NextResponse.json(
      { error: "Lỗi máy chủ nội bộ" },
      { status: 500 }
    );
  }
};
