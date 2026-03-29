import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { headers } from "next/headers";
import { siteConfig } from "@/config/site";
import { Mulish } from "@/utils/fonts";
import "../styles/globals.css";
import "../styles/lightbox.css";
import Providers from "./providers";
import RootLayoutContent from "@/components/RootLayoutContent";
import PWAUpdatePrompt from "@/components/PWAUpdatePrompt";
import BackToTop from "@/components/ui/BackToTop";
import CookieConsent from "@/components/ui/CookieConsent";
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

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Get CSP nonce from middleware
  const headersList = await headers();
  const nonce = headersList.get('x-csp-nonce') || '';
  return (
    <html suppressHydrationWarning lang="vi">
      <head>
        {/* Resource hints - Tối ưu PageSpeed Insights */}
        <link rel="preconnect" href="https://image.tmdb.org" />
        <link rel="preconnect" href="https://api.themoviedb.org" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://va.vercel-scripts.com" />
      </head>
      <body className={cn("bg-background min-h-dvh antialiased select-none flex flex-col overflow-x-hidden", Mulish.className)}>
        {/* Google Analytics - Lazy load để không chặn render */}
        <Script
          strategy="lazyOnload"
          src={`https://www.googletagmanager.com/gtag/js?id=G-PWNGH2BG33`}
          nonce={nonce}
        />
        <Script
          id="gtag-init"
          strategy="lazyOnload"
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-PWNGH2BG33', {
                page_path: window.location.pathname,
                send_page_view: false
              });
              window.addEventListener('load', function() {
                gtag('event', 'page_view');
              });
            `,
          }}
        />

        <Suspense>
          <NuqsAdapter>
            <Providers>
              <RootLayoutContent>{children}</RootLayoutContent>
            </Providers>
          </NuqsAdapter>
        </Suspense>
        <PWAUpdatePrompt />
        <BackToTop />
        <CookieConsent />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}