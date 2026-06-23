'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useGestureControl } from '@/hooks/useGestureControl';
import { GestureCallbacks, GestureResult } from '@/types/gesture';
import { useGestureContext } from '@/contexts/GestureContext';
import VirtualCursor from './VirtualCursor';

/**
 * Global Gesture Control
 * Provides gesture control functionality across the entire site
 */
export function GlobalGestureControl() {
  const { enabled } = useGestureContext();
  const [isClicking, setIsClicking] = useState(false);
  const lastClickTimeRef = useRef(0);
  const CLICK_COOLDOWN = 300; // ms between clicks

  // Handle click at cursor position
  const handleClickAtCursor = useCallback((x: number, y: number) => {
    const now = Date.now();
    if (now - lastClickTimeRef.current < CLICK_COOLDOWN) return;
    
    lastClickTimeRef.current = now;
    setIsClicking(true);
    
    // Find element at cursor position and click it
    const element = document.elementFromPoint(x, y);
    if (element && element instanceof HTMLElement) {
      console.log('🖱️ Clicking element:', element.tagName);
      element.click();
    }
    
    setTimeout(() => setIsClicking(false), 200);
  }, []);

  // Ref for cursor position (accessed in gesture event handlers only — safe)
  const cursorPosRef = useRef({ x: 0, y: 0 });

  // Gesture callbacks for global navigation
  const gestureCallbacks: GestureCallbacks = useMemo(() => ({
    // Scroll gestures
    onScrollLeft: () => {
      window.scrollBy({ left: -400, behavior: 'smooth' });
    },
    onScrollRight: () => {
      window.scrollBy({ left: 400, behavior: 'smooth' });
    },

    // Navigation gestures
    onForward: () => {
      window.scrollBy({ top: 300, behavior: 'smooth' });
    },
    onRewind: () => {
      window.scrollBy({ top: -300, behavior: 'smooth' });
    },

    onGestureDetected: (result: GestureResult) => {
      console.log('Gesture detected:', result.gesture, result.confidence);
      
      // Handle click gesture (Closed_Fist) using latest cursor position
      if (result.gesture === 'Closed_Fist') {
        handleClickAtCursor(cursorPosRef.current.x, cursorPosRef.current.y);
      }
    },
  }), [handleClickAtCursor]);

  const {
    isInitialized,
    error,
    currentGesture,
    handDetected,
    isLoading,
    handPosition,
    initialize,
    startDetection,
    stopDetection,
  } = useGestureControl({ enabled }, gestureCallbacks);

  // Keep ref in sync when handPosition changes
  useEffect(() => {
    if (handPosition) {
      cursorPosRef.current = handPosition;
    }
  }, [handPosition]);

  // Track user dismissal of mini view
  const [miniViewDismissed, setMiniViewDismissed] = useState(false);
  // Compute miniView directly from enabled and user dismissal
  const miniView = enabled && !miniViewDismissed;

  // Side effect: stop detection when disabled
  useEffect(() => {
    if (!enabled) {
      stopDetection();
    }
  }, [enabled, stopDetection]);

  // Auto start detection when enabled
  useEffect(() => {
    if (enabled && !isInitialized && !isLoading && miniView) {
      const timer = setTimeout(async () => {
        const video = document.getElementById('global-gesture-video') as HTMLVideoElement;
        const canvas = document.getElementById('global-gesture-canvas') as HTMLCanvasElement;
        
        if (video && canvas) {
          console.log('🎬 Starting gesture detection with video and canvas');
          try {
            await initialize(video, canvas);
            await startDetection();
            console.log('✅ Gesture detection started successfully');
          } catch (error) {
            console.error('❌ Failed to start detection:', error);
          }
        } else {
          console.warn('⚠️ Video or canvas element not found');
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [enabled, isInitialized, isLoading, miniView, startDetection]);

  if (!enabled) return null;

  return (
    <>
      {/* Mini gesture viewer */}
      {miniView && (
        <div className="fixed bottom-4 right-4 z-[9999] bg-black/80 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
          <div className="p-3 space-y-2">
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold">Điều khiển cử chỉ</span>
              </div>
              <button
                onClick={() => setMiniViewDismissed(true)}
                className="text-xs text-white/60 hover:text-white"
              >
                ×
              </button>
            </div>

            {/* Video preview */}
            <div className="relative w-40 h-30 bg-black rounded-lg overflow-hidden">
              <video
                id="global-gesture-video"
                className="w-full h-full object-cover scale-x-[-1]"
                autoPlay
                playsInline
                muted
              />
              <canvas
                id="global-gesture-canvas"
                className="absolute inset-0 w-full h-full scale-x-[-1]"
                width={640}
                height={480}
              />
              
              {/* Status overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <div className="flex items-center justify-between text-xs">
                  <span className={handDetected ? 'text-green-400' : 'text-white/40'}>
                    {handDetected ? '✋ Phát hiện tay' : '🔍 Tìm kiếm...'}
                  </span>
                  {currentGesture !== 'None' && (
                    <span className="text-primary font-semibold">
                      {currentGesture}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="text-xs text-red-400 bg-red-500/10 rounded px-2 py-1">
                {error}
              </div>
            )}

            {/* Instructions */}
            <div className="text-[10px] text-white/40 space-y-0.5">
              <p>• Di chuyển tay: Điều khiển con trỏ</p>
              <p>• Nắm tay: Click chuột</p>
              <p>• Vuốt trái/phải: Lướt trang</p>
            </div>
          </div>
        </div>
      )}

      {/* Virtual Cursor */}
      <VirtualCursor
        x={handPosition?.x ?? 0}
        y={handPosition?.y ?? 0}
        isClicking={isClicking}
        visible={enabled && handDetected}
      />
    </>
  );
}

export default GlobalGestureControl;
