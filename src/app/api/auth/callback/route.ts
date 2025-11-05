import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { IS_DEVELOPMENT } from "@/utils/constants";
import { env } from "@/utils/env";

export const GET = async (request: NextRequest) => {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  let next = searchParams.get("next") ?? "/";
  if (!next.startsWith("/")) {
    next = "/";
  }

  if (code) {
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
      },
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Insert username
      if (user) {
        console.info({ user });

        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single();

        if (!profile) {
          // Get base username dari Google
          const baseUsername =
            user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0];

          // Function buat generate unique username
          const generateUniqueUsername = async (base: string) => {
            let username = base;
            let attempts = 0;
            const maxAttempts = 5; // Prevent infinite loop

            while (attempts < maxAttempts) {
              // Check if username exists
              const { data: existing } = await supabase
                .from("profiles")
                .select("username")
                .eq("username", username)
                .single();

              if (!existing) {
                // Username available!
                return username;
              }

              // Username taken, add random 4 digits
              const randomNum = Math.floor(1000 + Math.random() * 9000); // 1000-9999
              username = `${base}#${randomNum}`;
              attempts++;
            }

            // Fallback: use timestamp if still can't find unique
            return `${base}${Date.now()}`;
          };

          // Generate unique username
          const uniqueUsername = await generateUniqueUsername(baseUsername);

          // Insert profile with unique username
          const { error: profileError } = await supabase.from("profiles").insert({
            id: user.id,
            username: uniqueUsername,
          });

          if (profileError) {
            console.error("Profile creation error:", profileError);
          } else {
            console.log("Profile created with username:", uniqueUsername);
          }
        }
      }

      const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
      
      const redirectUrl = IS_DEVELOPMENT
        ? `${origin}${next}`
        : forwardedHost
          ? `https://${forwardedHost}${next}`
          : `${origin}${next}`;

      const redirectResponse = NextResponse.redirect(redirectUrl);
      
      // Copy all cookies from supabaseResponse to redirectResponse
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
      });

      return redirectResponse;
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=true`);
};
