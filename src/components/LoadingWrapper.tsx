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
    // Kiểm tra xem đã load trang chủ trước đó chưa (trong session)
    const hasVisited = sessionStorage.getItem('homepage-visited');
    
    if (hasVisited === 'true') {
      // Đã visit rồi, không loading nữa
      setIsLoading(false);
      setHasLoadedBefore(true);
      return;
    }

    // Lần đầu visit, hiển thị loading
    const timer = setTimeout(() => {
      setIsLoading(false);
      setHasLoadedBefore(true);
      // Đánh dấu đã visit trong session này
      sessionStorage.setItem('homepage-visited', 'true');
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (isLoading && !hasLoadedBefore) {
    return <Loading />;
  }

  return <>{children}</>;
}
