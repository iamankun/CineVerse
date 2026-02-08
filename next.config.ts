import withPWAInit from "@ducanh2912/next-pwa";
import { NextConfig } from "next/dist/server/config";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  disable: process.env.NODE_ENV === "development",
  reloadOnOnline: true,
  cacheOnFrontEndNav: true, // Bật cache frontend nav để tăng performance
  aggressiveFrontEndNavCaching: true, // Bật aggressive caching để load nhanh hơn
  workboxOptions: {
    disableDevLogs: true,
    skipWaiting: true,
    clientsClaim: true,
    // Thêm runtime caching cho API calls
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/api\.themoviedb\.org\/.*/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'tmdb-api-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24, // 24 hours
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      {
        urlPattern: /^https:\/\/image\.tmdb\.org\/.*/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'tmdb-image-cache',
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "image.tmdb.org",
      },
      {
        protocol: "https",
        hostname: "image.tmdb.org",
      },
      {
        protocol: "https",
        hostname: "wallpapercave.com",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
    ],
    localPatterns: [
      {
        pathname: "/api/proxy/tmdb-image/**",
      },
      {
        pathname: "/longtieng.png",
      },
      {
        pathname: "/CineVerse.png",
      },
      {
        pathname: "/Circle-Silver-Partner.png",
      },
      {
        pathname: "/ava.gif",
      },
      {
        pathname: "/mockup.gif",
      },
      {
        pathname: "/icons/**",
      },
    ],
  },
  // https://github.com/payloadcms/payload/issues/12550#issuecomment-2939070941
  // turbopack: {},
  experimental: {
    optimizePackageImports: ["@heroui/react"],
  },
  typescript: {
    ignoreBuildErrors: true, // Temporarily ignore type errors for build
  },
  webpack: (config, { isServer }) => {
    // Fix for @mediapipe/hands import issue
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
  // Allow unsafe-eval for development (required by some libraries like Vaul)
  async headers() {
    const ContentSecurityPolicy = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://vidsrc-embed.ru https://vidsrc.xyz https://vidsrc.to https://vidsrc.icu https://vidsrc.cc https://www.dailymotion.com https://www.dailymotion.net https://www.dailymotion.fr https://va.vercel-scripts.com https://geo.dailymotion.com https://vercel.live vercel.live *.vercel.live *.vercel.app https://www.google.com https://www.gstatic.com https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ https://vercel.analytics.io https://www.themoviedb.org;
      style-src 'self' 'unsafe-inline' fonts.googleapis.com;
      img-src 'self' data: https: blob: https://image.tmdb.org https://api.themoviedb.org https://www.themoviedb.org;
      font-src 'self' fonts.gstatic.com;
      connect-src 'self' https://live.fptplay53.net https://ott1.nethubtv.vn *.vercel.live *.vercel.app blob: https://api.themoviedb.org https://www.themoviedb.org https://api.iconify.design https://api.simplesvg.com https://api.unisvg.com https://www.google.com https://www.gstatic.com https://csp.withgoogle.com https://vercel.analytics.io https://exsoflgvdreikabvhvkg.supabase.co;
      media-src 'self' blob: https://live.fptplay53.net https://ott1.nethubtv.vn;
      frame-src 'self' https://www.youtube.com https://vidsrc-embed.ru https://vidsrc.xyz https://vidsrc.to https://vidsrc.icu https://vidsrc.cc https://www.dailymotion.com https://www.dailymotion.net https://www.dailymotion.fr https://va.vercel-scripts.com https://geo.dailymotion.com https://vercel.live https://www.google.com;
      frame-ancestors 'self' https://www.google.com;
      child-src 'self';
      worker-src 'self' blob:;
      form-action 'self';
      object-src 'none';
      base-uri 'self';
      manifest-src 'self';
      upgrade-insecure-requests;
    `.trim().replace(/\s+/g, ' ').replace(/;\s*;/g, ';');
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: ContentSecurityPolicy,
          },
          {
            key: 'Permissions-Policy',
            value: 'interest-cohort=()',
          },
        ],
      },
    ];
  },
};

const pwa = withPWA(nextConfig);

export default pwa;
