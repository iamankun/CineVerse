import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "../env";

const PROTECTED_PATHS = env.PROTECTED_PATHS?.split(",").filter(p => p) ?? [];

export async function updateSession(request: NextRequest) {
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

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  // if user is not logged in and the current pathname is protected, redirect to login page
  if (!user && PROTECTED_PATHS.some((path) => pathname.startsWith(path))) {
    const url = new URL("/auth", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // if user is logged in and the current pathname is auth, redirect to home page
  if (user && pathname === "/auth") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}
