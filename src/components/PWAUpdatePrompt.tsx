"use client";

import { useEffect, useState } from "react";
import { Button, Card, CardBody } from "@heroui/react";

export default function PWAUpdatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    // Check for updates every 60 seconds
    const interval = setInterval(async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        registration.update();
      }
    }, 60000);

    // Listen for new service worker waiting
    const handleControllerChange = () => {
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);

    // Check for waiting service worker
    navigator.serviceWorker.ready.then((reg) => {
      if (reg.waiting) {
        setRegistration(reg);
        setShowPrompt(true);
      }

      // Listen for updates
      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              setRegistration(reg);
              setShowPrompt(true);
            }
          });
        }
      });
    });

    return () => {
      clearInterval(interval);
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
    };
  }, []);

  const handleUpdate = async () => {
    if (registration?.waiting) {
      // Clear all caches to ensure fresh icons and assets
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      }

      // Tell the waiting service worker to activate
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[9999] md:left-auto md:right-4 md:w-96">
      <Card>
        <CardBody className="gap-4">
          <div>
            <h3 className="text-lg font-bold">🎉 Cập nhật mới</h3>
            <p className="text-sm text-foreground/60">
              Có phiên bản mới của CineVerse. Cập nhật ngay để trải nghiệm tính năng mới nhất!
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              color="primary"
              size="sm"
              onClick={handleUpdate}
              className="flex-1"
            >
              Cập nhật ngay
            </Button>
            <Button
              color="default"
              variant="flat"
              size="sm"
              onClick={handleDismiss}
            >
              Để sau
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
