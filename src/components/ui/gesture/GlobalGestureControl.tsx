'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useGestureControl } from '@/hooks/useGestureControl';
import { GestureCallbacks, GestureResult } from '@/types/gesture';
import { useGestureContext } from '@/contexts/GestureContext';
import { Button } from '@heroui/react';
import { Hand } from 'lucide-react';

/**
 * Global Gesture Control
 * Provides gesture control functionality across the entire site
 */
export function GlobalGestureControl() {
  const { enabled } = useGestureContext();
  const [miniView, setMiniView] = useState(false);

  // Gesture callbacks for global navigation
  const gestureCallbacks: GestureCallbacks = useMemo(() => ({
    // Scroll gestures
    onScrollLeft: () => {
      window.scrollBy({ left: -400, behavior: 'smooth' });
    },
    onScrollRight: () => {
      window.scrollBy({ left: 400, behavior: 'smooth' });
    },

    // Navigation gestures (can be extended)
    onForward: () => {
      window.scrollBy({ top: 300, behavior: 'smooth' });
    },
    onRewind: () => {
      window.scrollBy({ top: -300, behavior: 'smooth' });
    },

    onGestureDetected: (result: GestureResult) => {
      console.log('Gesture detected:', result.gesture, result.confidence);
    },
  }), []);

  const {
    isInitialized,
    isLoading,
    error,
    currentGesture,
    confidence,
    handDetected,
    cameraActive,
    startDetection,
    stopDetection,
  } = useGestureControl({
    enabled,
    callbacks: gestureCallbacks,
  });

  // Sync miniView with enabled state
  useEffect(() => {
    console.log('🎯 Enabled state changed:', enabled);
    if (enabled) {
      setMiniView(true);
    } else {
      setMiniView(false);
      stopDetection();
    }
  }, [enabled, stopDetection]);

  // Auto start detection when enabled
  useEffect(() => {
    console.log('🔍 Check start detection:', { enabled, isInitialized, isLoading, miniView });
    if (enabled && !isInitialized && !isLoading && miniView) {
      // Wait for DOM to render
      const timer = setTimeout(() => {
        const video = document.getElementById('global-gesture-video') as HTMLVideoElement;
        const canvas = document.getElementById('global-gesture-canvas') as HTMLCanvasElement;
        
        console.log('📹 Video/Canvas elements:', { video: !!video, canvas: !!canvas });
        
        if (video && canvas) {
          console.log('▶️ Starting detection...');
          startDetection(video, canvas);
        } else {
          console.warn('⚠️ Video or canvas not found');
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
                <Hand className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold">Điều khiển cử chỉ</span>
              </div>
              <button
                onClick={() => setMiniView(false)}
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
              <p>• Vuốt trái/phải: Lướt trang</p>
              <p>• Ngón trỏ lên: Cuộn xuống</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default GlobalGestureControl;
