import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { env } from "@/utils/env";

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { email, password, action } = body;

    if (!email || !password) {
      if (body?.auth_event || body?.event_message || body?.hook) {
        return NextResponse.json({ ok: true }, { status: 200 });
      }
      return NextResponse.json(
        { error: "Email và mật khẩu là bắt buộc" },
        { status: 400 }
      );
    }

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

    if (action === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ user: data.user }, { status: 200 });
    } else {
      // Default: login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }

      const response = NextResponse.json({ user: data.user }, { status: 200 });
      
      // Copy cookies
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        response.cookies.set(cookie.name, cookie.value, cookie);
      });

      return response;
    }
  } catch (error) {
    console.error("Lỗi API xác minh:", error);
    return NextResponse.json(
      { error: "Lỗi máy chủ nội bộ" },
      { status: 500 }
    );
  }
};
