"use client";

import { ReactNode, useEffect, useState } from "react";
import Loading from "@/app/loading";

interface LoadingWrapperProps {
  children: ReactNode;
  delay?: number;
}

export default function LoadingWrapper({ children, delay = 3000 }: LoadingWrapperProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (isLoading) {
    return <Loading />;
  }

  return <>{children}</>;
}
