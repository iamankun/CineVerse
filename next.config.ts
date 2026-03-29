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
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
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
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days cache
  },
  // https://github.com/payloadcms/payload/issues/12550#issuecomment-2939070941
  // turbopack: {},
  experimental: {
    optimizePackageImports: ["@heroui/react"],
    optimizeCss: true, // Tối ưu CSS - inline critical CSS
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
};

const pwa = withPWA(nextConfig);

export default pwa;
