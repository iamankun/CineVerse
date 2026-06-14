import { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 7,
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
  experimental: {
    optimizePackageImports: ["@heroui/react"],
    optimizeCss: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;