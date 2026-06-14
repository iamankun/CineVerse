import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
      "'strict-dynamic'",
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
    'font-src': ["'self'", 'fonts.gstatic.com'],
    'connect-src': [
      "'self'",
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
      'https://vercel.analytics.io',
      'https://exsoflgvdreikabvhvkg.supabase.co',
      'https://tmstr4.wanderlynest.com',
      'https://tmstr4.orchidpixelgardens.com',
      'https://tmstr4.cloudnestra.com',
      'https://cloudnestra.com',
      'https://kkphim.com',
      'https://phimapi.com',
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
    ],
    'frame-ancestors': ["'self'", 'https://www.google.com'],
    'child-src': ["'self'"],
    'worker-src': ["'self'", 'blob:'],
    'form-action': ["'self'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'manifest-src': ["'self'"],
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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const protectedRoutes = ['/profile', '/profiles', '/protected', '/admin'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  const nonce = generateNonce();
  let response: NextResponse;

  if (!isProtectedRoute) {
    response = NextResponse.next();
  } else {
    const cookieHeader = request.headers.get('cookie') || '';
    const hasAuthCookie = /sb-exsoflgvdreikabvhvkg-auth-token\.[01]=/.test(cookieHeader) ||
                         /sb-access-token=/.test(cookieHeader) ||
                         /sb:access-token=/.test(cookieHeader) ||
                         /supabase\.auth\.token=/.test(cookieHeader);

    if (!hasAuthCookie) {
      const redirectUrl = new URL('/auth/login', request.url);
      redirectUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    response = NextResponse.next();
  }

  const cspPolicy = getCSPPolicy(nonce);
  response.headers.set('Content-Security-Policy', cspPolicy);
  response.headers.set('X-CSP-Nonce', nonce);
  
  response.headers.set(
    'Strict-Transport-Security', 
    'max-age=63072000; includeSubDomains; preload'
  );

  response.headers.set('Cross-Origin-Opener-Policy', 'unsafe-none');

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|sitemap.xml|robots.txt).*)',
  ],
};
