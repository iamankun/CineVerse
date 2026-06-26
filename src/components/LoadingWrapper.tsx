"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import Loading from "@/app/loading";

interface LoadingWrapperProps {
  children: ReactNode;
  delay?: number;
}

export default function LoadingWrapper({ children, delay = 3000 }: LoadingWrapperProps) {
  const [showContent, setShowContent] = useState(false);
  const visitedRef = useRef(false);

  useEffect(() => {
    visitedRef.current = sessionStorage.getItem('homepage-visited') === 'true';

    const timer = setTimeout(() => {
      setShowContent(true);
      sessionStorage.setItem('homepage-visited', 'true');
    }, visitedRef.current ? 0 : delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (!showContent) {
    return <Loading />;
  }

  return <>{children}</>;
}
