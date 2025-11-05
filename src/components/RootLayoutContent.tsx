"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import TopNavbar from "@/components/ui/layout/TopNavbar";
import Footer from "@/components/ui/layout/Footer";
import { FloatingNavBar } from "@/components/ui/layout/FloatingNavBar";
import { cn } from "@/utils/helpers";
import { IS_PRODUCTION, SpacingClasses } from "@/utils/constants";
import dynamic from "next/dynamic";
const Disclaimer = dynamic(() => import("@/components/ui/overlay/Disclaimer"));

export default function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isNotFound, setIsNotFound] = useState(false);
  const isAdminRoute = pathname?.startsWith("/admin");
  const isAuthRoute = pathname?.startsWith("/auth");

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

  // For admin, auth routes, and 404 page, render without navbar/footer
  if (isAdminRoute || isAuthRoute || isNotFound) {
    return <>{children}</>;
  }

  // Normal layout with navbar/footer
  return (
    <>
      {IS_PRODUCTION && <Disclaimer />}
      <TopNavbar />
      <main className={cn("container mx-auto max-w-full flex-1 pb-safe-footer overflow-x-hidden pt-20", SpacingClasses.main)}>
        {children}
      </main>
      <Footer />
      <FloatingNavBar />
    </>
  );
}
