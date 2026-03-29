import { useEffect, useRef, useState } from 'react';

export const useLazyLoad = (options: { threshold?: number; rootMargin?: string } = {}) => {
  const { threshold = 0.1, rootMargin = '200px' } = options;
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<Element>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, rootMargin]);

  return { elementRef, isVisible };
};
