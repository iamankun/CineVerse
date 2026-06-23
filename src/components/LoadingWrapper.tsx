"use client";

import { ReactNode, useEffect, useState } from "react";
import Loading from "@/app/loading";

interface LoadingWrapperProps {
  children: ReactNode;
  delay?: number;
}

export default function LoadingWrapper({ children, delay = 3000 }: LoadingWrapperProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedBefore, setHasLoadedBefore] = useState(false);

  useEffect(() => {
    const visited = sessionStorage.getItem('homepage-visited') === 'true';
    setHasLoadedBefore(visited);
    if (visited) {
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
      setHasLoadedBefore(true);
      sessionStorage.setItem('homepage-visited', 'true');
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (isLoading && !hasLoadedBefore) {
    return <Loading />;
  }

  return <>{children}</>;
}
