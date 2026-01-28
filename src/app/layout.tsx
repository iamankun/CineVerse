import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/config/site";
import { Mulish } from "@/utils/fonts";
import "../styles/globals.css";
import "../styles/lightbox.css";
import Providers from "./providers";
import RootLayoutContent from "@/components/RootLayoutContent";
import PWAUpdatePrompt from "@/components/PWAUpdatePrompt";
import BackToTop from "@/components/ui/BackToTop";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { cn } from "@/utils/helpers";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: siteConfig.name,
  applicationName: siteConfig.name,
  description: siteConfig.description,
  manifest: "/api/manifest",
  icons: {
    icon: siteConfig.favicon,
  },
  twitter: {
    card: "summary",
    title: {
      default: siteConfig.name,
      template: siteConfig.name,
    },
    description: siteConfig.description,
  },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: {
      default: siteConfig.name,
      template: siteConfig.name,
    },
    description: siteConfig.description,
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#0D0C0F" },
  ],
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html suppressHydrationWarning lang="vi">
      <body className={cn("bg-background min-h-dvh antialiased select-none flex flex-col overflow-x-hidden", Mulish.className)}>
        <Suspense>
          <NuqsAdapter>
            <Providers>
              <RootLayoutContent>{children}</RootLayoutContent>
            </Providers>
          </NuqsAdapter>
        </Suspense>
        <PWAUpdatePrompt />
        <BackToTop />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
