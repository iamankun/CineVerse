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
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
        {/* Chỉ giữ preconnect cho origins thực sự cần ngay lập tức */}
        {/* TMDB images - dns-prefetch thay vì preconnect vì không dùng ngay */}
        <link rel="dns-prefetch" href="https://image.tmdb.org" />
        <link rel="dns-prefetch" href="https://api.themoviedb.org" />
        {/* Fonts được self-host bởi Next.js nên không cần preconnect */}
        {/* Google Analytics - dns-prefetch là đủ vì load lazy */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://va.vercel-scripts.com" />
      </head>
      <body className={cn("bg-background min-h-dvh antialiased select-none flex flex-col overflow-x-hidden", Mulish.className)}>
        {/* Google Analytics - Lazy load với low priority */}
        <Script
          strategy="lazyOnload"
          src={`https://www.googletagmanager.com/gtag/js?id=G-PWNGH2BG33`}
          nonce={nonce}
          fetchPriority="low"
        />
        <Script
          id="gtag-init"
          strategy="lazyOnload"
          nonce={nonce}
          fetchPriority="low"
          dangerouslySetInnerHTML={{
            __html: `
              // Trì hoãn khởi tạo GTM để ưu tiên nội dung chính
              if ('requestIdleCallback' in window) {
                requestIdleCallback(function() {
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', 'G-PWNGH2BG33', {
                    page_path: window.location.pathname,
                    send_page_view: false
                  });
                }, { timeout: 2000 });
              } else {
                setTimeout(function() {
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', 'G-PWNGH2BG33', {
                    page_path: window.location.pathname,
                    send_page_view: false
                  });
                }, 2000);
              }
              // Gửi page_view sau khi trang ổn định
              window.addEventListener('load', function() {
                if ('requestIdleCallback' in window) {
                  requestIdleCallback(function() {
                    gtag('event', 'page_view');
                  }, { timeout: 1000 });
                } else {
                  setTimeout(function() {
                    gtag('event', 'page_view');
                  }, 1000);
                }
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