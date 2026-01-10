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
    ],
  },
  // https://github.com/payloadcms/payload/issues/12550#issuecomment-2939070941
  turbopack: {
    resolveExtensions: [".mdx", ".tsx", ".ts", ".jsx", ".js", ".mjs", ".json"],
  },
  experimental: {
    optimizePackageImports: ["@heroui/react"],
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
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: process.env.NODE_ENV === 'development'
              ? "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.youtube.com https://vidsrc-embed.ru https://vidsrc.xyz https://vidsrc.to https://vidsrc.icu https://vidsrc.cc https://www.dailymotion.com; frame-src https://www.youtube.com https://vidsrc-embed.ru https://vidsrc.xyz https://vidsrc.to https://vidsrc.icu https://vidsrc.cc https://www.dailymotion.com;"
              : "script-src 'self' 'unsafe-inline' https://www.youtube.com https://vidsrc-embed.ru https://vidsrc.xyz https://vidsrc.to https://vidsrc.icu https://vidsrc.cc https://www.dailymotion.com; frame-src https://www.youtube.com https://vidsrc-embed.ru https://vidsrc.xyz https://vidsrc.to https://vidsrc.icu https://vidsrc.cc https://www.dailymotion.com;",
          },
        ],
      },
    ];
  },
};

const pwa = withPWA(nextConfig);

export default pwa;
