import { useEffect, useRef, useState } from 'react';

interface UsePinchToZoomOptions {
  enabled?: boolean;
  minZoom?: number;
  maxZoom?: number;
}

/**
 * Hook để xử lý pinch-to-zoom trên mobile
 * Chỉ phóng to phần tử được chỉ định, không ảnh hưởng đến các phần tử khác
 */
export const usePinchToZoom = (
  containerRef: React.RefObject<HTMLElement | HTMLDivElement | null>,
  options: UsePinchToZoomOptions = {}
) => {
  const { enabled = true, minZoom = 1, maxZoom = 2 } = options;
  const [zoom, setZoom] = useState(1);
  const lastDistanceRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;

    const handleTouchStart = (e: Event) => {
      const touch = e as TouchEvent;
      if (touch.touches.length === 2) {
        const dx = touch.touches[0].clientX - touch.touches[1].clientX;
        const dy = touch.touches[0].clientY - touch.touches[1].clientY;
        lastDistanceRef.current = Math.sqrt(dx * dx + dy * dy);
      }
    };

    const handleTouchMove = (e: Event) => {
      const touch = e as TouchEvent;
      if (touch.touches.length === 2 && lastDistanceRef.current) {
        const dx = touch.touches[0].clientX - touch.touches[1].clientX;
        const dy = touch.touches[0].clientY - touch.touches[1].clientY;
        const newDistance = Math.sqrt(dx * dx + dy * dy);
        
        const ratio = newDistance / lastDistanceRef.current;
        setZoom((prevZoom) => {
          let newZoom = prevZoom * ratio;
          // Giới hạn zoom
          newZoom = Math.max(minZoom, Math.min(newZoom, maxZoom));
          return newZoom;
        });
        
        lastDistanceRef.current = newDistance;
      }
    };

    const handleTouchEnd = (e: Event) => {
      const touch = e as TouchEvent;
      if (touch.touches.length < 2) {
        lastDistanceRef.current = null;
      }
    };

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove);
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, minZoom, maxZoom]);

  return zoom;
};
