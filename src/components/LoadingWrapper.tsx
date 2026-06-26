"use client";

import { ReactNode, useEffect, useState } from "react";
import Loading from "@/app/loading";

interface LoadingWrapperProps {
  children: ReactNode;
  delay?: number;
}

export default function LoadingWrapper({ children, delay = 3000 }: LoadingWrapperProps) {
  const [hasLoadedBefore] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem('homepage-visited') === 'true';
    }
    return false;
  });
  const [timerDone, setTimerDone] = useState(false);
  const isLoading = !hasLoadedBefore && !timerDone;

  useEffect(() => {
    if (hasLoadedBefore) return;

    const timer = setTimeout(() => {
      setTimerDone(true);
      sessionStorage.setItem('homepage-visited', 'true');
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, hasLoadedBefore]);

  if (isLoading) {
    return <Loading />;
  }

  return <>{children}</>;
}
