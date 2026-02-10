import { cn } from "@/utils/helpers";
import { Server } from "@/utils/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import { IoHandRight } from "react-icons/io5";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";
import { IoReload } from "react-icons/io5";
import { useGestureContext } from "@/contexts/GestureContext";
import useBreakpoints from "@/hooks/useBreakpoints";

interface ControlMenuProps {
  onOpenSource: () => void;
  onToggleFullscreen?: () => void;
  onReload?: () => void;
  isFullscreen?: boolean;
  hidden?: boolean;
  playerContainerRef?: React.RefObject<HTMLDivElement | null>;
}

const ControlMenu: React.FC<ControlMenuProps> = ({
  onOpenSource,
  onToggleFullscreen,
  onReload,
  isFullscreen = false,
  hidden,
  playerContainerRef,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showUI, setShowUI] = useState(true);
  const { mobile } = useBreakpoints();
  const { enabled: gestureEnabled, toggle: toggleGesture } = useGestureContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debug log
  useEffect(() => {
    console.log('🎛️ ControlMenu props:', { 
      hasFullscreenHandler: !!onToggleFullscreen, 
      isFullscreen 
    });
  }, [onToggleFullscreen, isFullscreen]);

  // Auto-hide controls timer
  const resetHideTimer = useCallback(() => {
    setShowUI(true);
    
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
    
    // Auto-hide after 3 seconds
    hideTimerRef.current = setTimeout(() => {
      setShowUI(false);
    }, 3000);
  }, []);

  // Desktop mouse events - listen on player container for better coverage
  useEffect(() => {
    if (mobile) return; // Skip for mobile
    
    const handleMouseEnter = () => {
      setShowUI(true);
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
      // Start auto-hide timer when mouse enters
      hideTimerRef.current = setTimeout(() => {
        setShowUI(false);
      }, 3000);
    };

    const handleMouseMove = () => {
      setShowUI(true);
      resetHideTimer();
    };

    const handleMouseLeave = () => {
      // Hide controls immediately when mouse leaves player area
      setShowUI(false);
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };

    // Listen on player container or document as fallback
    const targetElement = playerContainerRef?.current || document;
    
    if (targetElement) {
      targetElement.addEventListener('mousemove', handleMouseMove);
      targetElement.addEventListener('mouseenter', handleMouseEnter);
      targetElement.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        targetElement.removeEventListener('mousemove', handleMouseMove);
        targetElement.removeEventListener('mouseenter', handleMouseEnter);
        targetElement.removeEventListener('mouseleave', handleMouseLeave);
        if (hideTimerRef.current) {
          clearTimeout(hideTimerRef.current);
        }
      };
    }
  }, [mobile, resetHideTimer, playerContainerRef]);

  // Mobile touch events
  useEffect(() => {
    if (!mobile) return; // Skip for desktop
    
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      setShowUI(true);
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }

      // Auto-hide after 4 seconds on touch
      touchTimeoutRef.current = setTimeout(() => {
        setShowUI(false);
      }, 4000);
    };

    const handleTouchEnd = () => {
      // Keep controls visible briefly after touch ends
      setShowUI(true);
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
      
      // Auto-hide after 3 seconds
      touchTimeoutRef.current = setTimeout(() => {
        setShowUI(false);
      }, 3000);
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
    };
  }, [mobile]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
    };
  }, []);

  const handleReload = useCallback(() => {
    if (onReload) {
      // Dùng callback để reload iframe thay vì reload toàn trang
      onReload();
    } else {
      // Fallback: reload toàn trang
      if (document.fullscreenElement) {
        sessionStorage.setItem('restoreFullscreen', 'true');
      }
      window.location.reload();
    }
  }, [onReload]);

  const handleToggleFullscreen = useCallback(() => {
    console.log('🖥️ Fullscreen button clicked');
    if (onToggleFullscreen) {
      onToggleFullscreen();
    }
  }, [onToggleFullscreen]);

  const controls = useMemo(() => {
    const baseControls = [
      {
        icon: <Server size={20} />,
        label: "Nguồn phát",
        onClick: onOpenSource,
      },
    ];

    if (onToggleFullscreen) {
      baseControls.push({
        icon: isFullscreen ? <MdFullscreenExit size={20} /> : <MdFullscreen size={20} />,
        label: isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình",
        onClick: handleToggleFullscreen,
      });
    }

    baseControls.push(
      {
        icon: <IoReload size={20} />,
        label: "Làm mới",
        onClick: handleReload,
      },
      {
        icon: <IoHandRight size={20} />,
        label: gestureEnabled ? "Tắt điều khiển cử chỉ" : "Bật điều khiển cử chỉ",
        onClick: toggleGesture,
      }
    );

    return baseControls;
  }, [onOpenSource, handleToggleFullscreen, isFullscreen, handleReload, toggleGesture, gestureEnabled]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute right-4 top-1/2 z-40 -translate-y-1/2 transition-opacity duration-300",
        { "opacity-0 pointer-events-none": hidden || !showUI }
      )}
    >
      <div className="relative flex items-center gap-2">
        {/* Expanded Menu */}
        <AnimatePresence mode="wait">
          {isExpanded && (
            <motion.div
              key="expanded-menu"
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex items-center gap-2"
            >
              {controls.map((control, index) => (
                <motion.button
                  key={index}
                  layoutId={`control-btn-${index}`}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                  onClick={control.onClick}
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full backdrop-blur-md",
                    "shadow-lg ring-1 transition-all duration-200",
                    "hover:scale-110",
                    (control as any).active ? (
                      "bg-success/30 ring-success/40 hover:bg-success/40 hover:ring-success/60"
                    ) : (
                      "bg-white/10 ring-white/20 hover:bg-white/25 hover:ring-white/40"
                    )
                  )}
                >
                  <span className="text-white">{control.icon}</span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Button */}
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-full backdrop-blur-md",
            "bg-primary/20 shadow-xl border border-primary/30",
            "ring-4 ring-white/40 transition-all duration-300",
            "hover:scale-110 hover:bg-primary/30 hover:ring-white/60 hover:shadow-2xl",
            "active:scale-95"
            )}
            whileTap={{ scale: 0.9 }}
          >
            <motion.div
              transition={{ duration: 0.3 }}
            >
              {isExpanded ? (
                <HiChevronLeft className="text-white" size={24} />
              ) : (
                <HiChevronRight className="text-white" size={24} />
              )}
            </motion.div>
        </motion.button>
      </div>
    </div>
  );
};

export default ControlMenu;
