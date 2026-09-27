import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Buffer.from(array).toString('base64');
}

function getCSPPolicy(nonce: string): string {
  const policies = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      `'nonce-${nonce}'`,
      'https://www.youtube.com',
      'https://www.youtube-nocookie.com',
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
      'https://va.vercel-scripts.com',
      'https://vercel.live',
      '*.vercel.live',
      '*.vercel.app',
      'https://www.google.com',
      'https://www.gstatic.com',
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'",
      'fonts.googleapis.com',
      'https://cdn.mathpix.com',
    ],
    'img-src': [
      "'self'",
      'data:',
      'https:',
      'blob:',
      'https://image.tmdb.org',
      'https://api.themoviedb.org',
      'https://www.themoviedb.org',
      'https://kkphim.com',
      'https://phimapi.com',
      'https://phimimg.com',
    ],
    'font-src': ["'self'", 'data:', 'fonts.gstatic.com', 'https://cdn.mathpix.com'],
    'connect-src': [
      "'self'",
      '*.ngrok-free.app',
      'https://live.fptplay53.net',
      'https://ott1.nethubtv.vn',
      '*.vercel.live',
      '*.vercel.app',
      'blob:',
      'https://api.themoviedb.org',
      'https://www.themoviedb.org',
      'https://api.iconify.design',
      'https://api.simplesvg.com',
      'https://api.unisvg.com',
      'https://www.google.com',
      'https://www.gstatic.com',
      'https://csp.withgoogle.com',
      'https://analytics.google.com',
      'https://www.google-analytics.com',
      '*.google-analytics.com',
      'https://region1.google-analytics.com',
      'https://vercel.analytics.io',
      'https://exsoflgvdreikabvhvkg.supabase.co',
      'https://tmstr4.wanderlynest.com',
      'https://tmstr4.orchidpixelgardens.com',
      'https://tmstr4.cloudnestra.com',
      'https://cloudnestra.com',
      'https://kkphim.com',
      'https://phimapi.com',
      'https://player.wpstream.net',
    ],
    'media-src': [
      "'self'",
      'blob:',
      'data:',
      'https://live.fptplay53.net',
      'https://ott1.nethubtv.vn',
      'https://tmstr4.wanderlynest.com',
      'https://tmstr4.orchidpixelgardens.com',
      'https://tmstr4.cloudnestra.com',
      'https://player.wpstream.net',
    ],
    'frame-src': [
      "'self'",
      'https://www.youtube.com',
      'https://www.youtube-nocookie.com',
      'https://vidsrc-embed.ru',
      'https://vidsrc.xyz',
      'https://vidsrc.to',
      'https://vidsrc.icu',
      'https://vidsrc.cc',
      'https://vsembed.ru',
      'https://tmstr4.wanderlynest.com',
      'https://tmstr4.orchidpixelgardens.com',
      'https://tmstr4.cloudnestra.com',
      'https://www.dailymotion.com',
      'https://www.dailymotion.net',
      'https://www.dailymotion.fr',
      'https://va.vercel-scripts.com',
      'https://geo.dailymotion.com',
      'https://vercel.live',
      'https://www.google.com',
      'https://kkphim.com',
      'https://player.phimapi.com',
      'https://s6.kkphimplayer6.com',
      'https://player.wpstream.net',
    ],
    'frame-ancestors': ["'self'", 'https://www.google.com'],
    'child-src': ["'self'"],
    'worker-src': ["'self'", 'blob:'],
    'form-action': ["'self'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'manifest-src': ["'self'", 'https://vercel.com', '*.vercel.com'],
    'upgrade-insecure-requests': [],
    // 'require-trusted-types-for': ["'script'"],
    // 'trusted-types': ["'allow-duplicates'", 'nextjs', 'workbox', "'allow-all'"],
  };

  return Object.entries(policies)
    .map(([key, values]) => {
      if (values.length === 0) return key;
      return `${key} ${values.join(' ')}`;
    })
    .join('; ');
}

const PROTECTED_ROUTES = ['/profile', '/profiles', '/protected', '/admin'];

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function loginRedirect(request: NextRequest, pathname: string): NextResponse {
  const redirectUrl = new URL('/auth/login', request.url);
  redirectUrl.searchParams.set('redirectTo', pathname);
  return NextResponse.redirect(redirectUrl);
}

function applySecurityHeaders(response: NextResponse, nonce: string): NextResponse {
  response.headers.set('Content-Security-Policy', getCSPPolicy(nonce));
  response.headers.set('X-CSP-Nonce', nonce);
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload',
  );
  response.headers.set('Cross-Origin-Opener-Policy', 'unsafe-none');
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const nonce = generateNonce();

  if (!isProtectedRoute(pathname)) {
    return applySecurityHeaders(NextResponse.next(), nonce);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return applySecurityHeaders(loginRedirect(request, pathname), nonce);
  }

  let response = NextResponse.next({ request });

  // @supabase/ssr suy ra tên cookie từ NEXT_PUBLIC_SUPABASE_URL nên không phụ thuộc
  // domain hay project ref, đồng thời tự làm mới token hết hạn.
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return applySecurityHeaders(loginRedirect(request, pathname), nonce);
  }

  return applySecurityHeaders(response, nonce);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|sitemap.xml|robots.txt).*)',
  ],
};
