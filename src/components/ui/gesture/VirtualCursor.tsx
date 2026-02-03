'use client';

import { useEffect, useState, useRef } from 'react';
import { MousePointer2, Hand } from 'lucide-react';

interface VirtualCursorProps {
  x: number;
  y: number;
  isClicking: boolean;
  visible: boolean;
}

/**
 * Virtual Cursor Component
 * Displays a custom cursor controlled by hand gestures
 */
export function VirtualCursor({ x, y, isClicking, visible }: VirtualCursorProps) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const [smoothPos, setSmoothPos] = useState({ x, y });
  const rippleIdRef = useRef(0);
  const animationRef = useRef<number | undefined>(undefined);

  // Smooth cursor movement with interpolation
  useEffect(() => {
    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor;
    };

    const animate = () => {
      setSmoothPos(prev => {
        const dx = x - prev.x;
        const dy = y - prev.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Dynamic lerp factor based on distance for faster response
        const baseFactor = distance > 50 ? 0.3 : 0.25;
        const factor = baseFactor;
        
        return {
          x: lerp(prev.x, x, factor),
          y: lerp(prev.y, y, factor),
        };
      });
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [x, y]);

  // Create ripple effect on click
  useEffect(() => {
    if (isClicking) {
      const id = rippleIdRef.current++;
      setRipples(prev => [...(prev || []), { id, x: smoothPos.x, y: smoothPos.y }]);
      
      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev?.filter(r => r.id !== id));
      }, 600);
    }
  }, [isClicking, smoothPos.x, smoothPos.y]);

  if (!visible) return null;

  return (
    <>
      {/* Virtual Cursor */}
      <div
        className="fixed pointer-events-none z-[10000] will-change-transform"
        style={{
          left: 0,
          top: 0,
          transform: `translate3d(${smoothPos.x}px, ${smoothPos.y}px, 0) ${isClicking ? 'scale(0.8)' : 'scale(1)'}`,
          transition: 'transform 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div className="relative">
          {/* Trailing effect */}
          <div className="absolute inset-0 -z-10 opacity-30 blur-sm" 
               style={{
                 transform: `translate(${(x - smoothPos.x) * 0.3}px, ${(y - smoothPos.y) * 0.3}px)`,
                 transition: 'transform 0.15s ease-out'
               }}>
            <div className="w-8 h-8 rounded-full bg-primary/50" />
          </div>
          
          {/* Cursor icon */}
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center
            transition-all duration-200
            ${isClicking 
              ? 'bg-primary/90 scale-90 shadow-lg shadow-primary/50' 
              : 'bg-primary/70 shadow-md'
            }
          `}>
            {isClicking ? (
              <Hand className="w-4 h-4 text-white" />
            ) : (
              <MousePointer2 className="w-4 h-4 text-white" />
            )}
          </div>
          
          {/* Glow effect */}
          <div className={`
            absolute inset-0 rounded-full
            transition-all duration-200
            ${isClicking ? 'bg-primary/30 scale-150' : 'bg-primary/20 scale-125'}
            blur-md
          `} />
        </div>
      </div>

      {/* Click ripple effects */}
      {ripples?.map(ripple => (
        <div
          key={ripple.id}
          className="fixed pointer-events-none z-[9999]"
          style={{
            left: `${ripple.x}px`,
            top: `${ripple.y}px`,
          }}
        >
          <div className="absolute -translate-x-1/2 -translate-y-1/2 animate-ping">
            <div className="w-12 h-12 rounded-full bg-primary/40 border-2 border-primary" />
          </div>
        </div>
      ))}
    </>
  );
}

export default VirtualCursor;
