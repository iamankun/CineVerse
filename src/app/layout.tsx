import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/config/site";
import { Mulish } from "@/utils/fonts";
import "../styles/globals.css";
import "../styles/lightbox.css";
import Providers from "./providers";
import TopNavbar from "@/components/ui/layout/TopNavbar";
import BottomNavbar from "@/components/ui/layout/BottomNavbar";
import Footer from "@/components/ui/layout/Footer";
import Sidebar from "@/components/ui/layout/Sidebar";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { cn } from "@/utils/helpers";
import { IS_PRODUCTION, SpacingClasses } from "@/utils/constants";
import dynamic from "next/dynamic";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense } from "react";
const Disclaimer = dynamic(() => import("@/components/ui/overlay/Disclaimer"));

export const metadata: Metadata = {
  title: siteConfig.name,
  applicationName: siteConfig.name,
  description: siteConfig.description,
  manifest: "/manifest.json",
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
      <body className={cn("bg-background min-h-dvh antialiased select-none flex flex-col", Mulish.className)}>
        <Suspense>
          <NuqsAdapter>
            <Providers>
              {IS_PRODUCTION && <Disclaimer />}
              <TopNavbar />
              <Sidebar>
                <main className={cn("container mx-auto max-w-full flex-1 pb-safe-footer", SpacingClasses.main)}>
                  {children}
                </main>
              </Sidebar>
              <Footer />
              <BottomNavbar />
            </Providers>
          </NuqsAdapter>
        </Suspense>
        <SpeedInsights debug={true} />
        <Analytics debug={true} />
      </body>
    </html>
  );
}
