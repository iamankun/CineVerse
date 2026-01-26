import withPWAInit from "@ducanh2912/next-pwa";
import { NextConfig } from "next/dist/server/config";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  disable: process.env.NODE_ENV === "development",
  reloadOnOnline: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  workboxOptions: {
    disableDevLogs: true,
    skipWaiting: true,
    clientsClaim: true,
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
  },
  // https://github.com/payloadcms/payload/issues/12550#issuecomment-2939070941
  turbopack: {
    resolveExtensions: [".mdx", ".tsx", ".ts", ".jsx", ".js", ".mjs", ".json"],
  },
  experimental: {
    optimizePackageImports: ["@heroui/react"],
  },
  typescript: {
    ignoreBuildErrors: false, // Temporarily ignore type errors for build
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
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://vidsrc-embed.ru https://vidsrc.xyz https://vidsrc.to https://vidsrc.icu https://vidsrc.cc https://www.dailymotion.com https://www.dailymotion.net https://www.dailymotion.fr https://va.vercel-scripts.com https://geo.dailymotion.com https://vercel.live vercel.live *.vercel.live *.vercel.app https://challenges.cloudflare.com;
      style-src 'self' 'unsafe-inline' fonts.googleapis.com;
      img-src 'self' data: https: blob: https://image.tmdb.org https://api.themoviedb.org;
      font-src 'self' fonts.gstatic.com;
      connect-src 'self' https://live.fptplay53.net https://ott1.nethubtv.vn *.vercel.live *.vercel.app blob: https://api.themoviedb.org https://api.iconify.design https://api.simplesvg.com https://api.unisvg.com https://challenges.cloudflare.com;
      media-src 'self' blob: https://live.fptplay53.net https://ott1.nethubtv.vn;
      frame-src 'self' https://www.youtube.com https://vidsrc-embed.ru https://vidsrc.xyz https://vidsrc.to https://vidsrc.icu https://vidsrc.cc https://www.dailymotion.com https://www.dailymotion.net https://www.dailymotion.fr https://va.vercel-scripts.com https://geo.dailymotion.com https://vercel.live https://challenges.cloudflare.com;
      child-src 'self' https://challenges.cloudflare.com;
      worker-src 'self' blob:;
      form-action 'self' https://challenges.cloudflare.com;
      object-src 'none';
      base-uri 'self';
      manifest-src 'self';
      upgrade-insecure-requests;
    `;
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: ContentSecurityPolicy.replace(/\n/g, ''),
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
