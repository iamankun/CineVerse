"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import TopNavbar from "@/components/ui/layout/TopNavbar";
import Footer from "@/components/ui/layout/Footer";
import { FloatingNavBar } from "@/components/ui/layout/FloatingNavBar";
import { cn } from "@/utils/helpers";
import { IS_PRODUCTION, SpacingClasses } from "@/utils/constants";
import { useManifestRefresh } from "@/utils/manifest";
import dynamic from "next/dynamic";
const Disclaimer = dynamic(() => import("@/components/ui/overlay/Disclaimer"));

export default function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isNotFound, setIsNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isAdminRoute = pathname?.startsWith("/admin");
  const isAuthRoute = pathname?.startsWith("/auth");
  const isPlayerRoute = pathname?.includes("/movie/") || pathname?.includes("/tv/");
  const isPlayerPage = pathname?.includes("/player");

  // Ensure manifest and icons are refreshed on version change
  useManifestRefresh();

  useEffect(() => {
    // Check if body has not-found marker
    const checkNotFound = () => {
      const hasMarker = document.body.getAttribute('data-not-found') === 'true';
      setIsNotFound(hasMarker);
    };
    
    checkNotFound();
    
    // Observe for changes
    const observer = new MutationObserver(checkNotFound);
    observer.observe(document.body, { attributes: true });
    
    return () => observer.disconnect();
  }, [pathname]);

  // Set loading to false after 3 seconds delay
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [pathname]);

  // For admin, auth routes, and 404 page, render without navbar/footer
  if (isAdminRoute || isAuthRoute || isNotFound) {
    return <>{children}</>;
  }

  // Normal layout with navbar/footer (hide footer during loading or on player pages)
  return (
    <>
      {IS_PRODUCTION && <Disclaimer />}
      <TopNavbar />
      <main className={cn(
        "container mx-auto max-w-full flex-1 overflow-x-hidden",
        isPlayerRoute ? "" : "pb-safe-footer pt-20",
        !isPlayerRoute && SpacingClasses.main
      )}>
        {children}
      </main>
      {!isLoading && !isPlayerRoute && <Footer />}
      {!isPlayerPage && <FloatingNavBar />}
    </>
  );
}
