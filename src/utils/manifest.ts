"use client";

import { useEffect } from "react";
import { APP_VERSION } from "./version";

/**
 * Hook to ensure PWA manifest and icons are always up-to-date
 * This helps refresh app icons when version changes
 */
export function useManifestRefresh() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const currentVersion = APP_VERSION;
    const storedVersion = localStorage.getItem("app-version");

    // If version changed, clear relevant caches
    if (storedVersion && storedVersion !== currentVersion) {
      console.log(`Version updated: ${storedVersion} → ${currentVersion}`);
      
      // Clear manifest and icon caches
      if ("caches" in window) {
        caches.keys().then((cacheNames) => {
          cacheNames.forEach((cacheName) => {
            if (
              cacheName.includes("manifest") ||
              cacheName.includes("icons") ||
              cacheName.includes("images")
            ) {
              caches.delete(cacheName);
            }
          });
        });
      }

      // Force reload manifest link
      const manifestLink = document.querySelector('link[rel="manifest"]');
      if (manifestLink) {
        const href = manifestLink.getAttribute("href");
        if (href) {
          manifestLink.setAttribute("href", `${href.split("?")[0]}?v=${currentVersion}`);
        }
      }
    }

    // Store current version
    localStorage.setItem("app-version", currentVersion);
  }, []);
}

/**
 * Get icon URL with cache busting version parameter
 * @param iconPath - Path to the icon file
 * @returns Icon URL with version query parameter
 */
export function getIconUrl(iconPath: string): string {
  const version = APP_VERSION;
  const separator = iconPath.includes("?") ? "&" : "?";
  return `${iconPath}${separator}v=${version}`;
}
