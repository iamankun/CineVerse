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
  playerContainerRef?: React.RefObject<HTMLDivElement | null>;
}

const ControlMenu: React.FC<ControlMenuProps> = ({
  onOpenSource,
  onToggleFullscreen,
  onReload,
  isFullscreen = false,
  playerContainerRef,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showUI, setShowUI] = useState(true);
  const { mobile } = useBreakpoints();
  const { enabled: gestureEnabled, toggle: toggleGesture } = useGestureContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Ref để tránh useEffect re-run khi isExpanded thay đổi
  const isExpandedRef = useRef(isExpanded);
  
  // Sync ref với state
  useEffect(() => {
    isExpandedRef.current = isExpanded;
  }, [isExpanded]);

  // Debug log
  useEffect(() => {
    console.log('🎛️ ControlMenu props:', { 
      hasFullscreenHandler: !!onToggleFullscreen, 
      isFullscreen 
    });
  }, [onToggleFullscreen, isFullscreen]);

  // Auto-hide controls timer - FIX TRIỆT ĐỂ NHẤP NHÁY
  const resetHideTimer = useCallback((forceShow = false) => {
    console.log('🎛️ resetHideTimer:', { forceShow, isExpanded: isExpandedRef.current });
    
    // Nếu đang mở rộng menu, tuyệt đối không ẩn
    if (isExpandedRef.current) {
      setShowUI(true);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      return;
    }

    setShowUI(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    
    // Chỉ set timer ẩn nếu không phải đang ép hiển thị (ví dụ đang hover trực tiếp vào menu)
    if (!forceShow) {
      hideTimerRef.current = setTimeout(() => {
        if (!isExpandedRef.current) {
          console.log('🎛️ Auto-hiding controls');
          setShowUI(false);
        }
      }, 3000);
    }
  }, []);

  // Toggle menu function với logic cải thiện
  const toggleMenu = useCallback(() => {
    const nextState = !isExpanded;
    console.log('🎛️ Toggle menu:', { current: isExpanded, next: nextState });
    setIsExpanded(nextState);
    if (nextState) {
      setShowUI(true); // Luôn hiện khi mở
    } else {
      // Khi đóng menu, bắt đầu timer ẩn
      resetHideTimer(false);
    }
  }, [isExpanded, resetHideTimer]);

  // Desktop mouse events - Improved logic with ref for performance
  useEffect(() => {
    if (mobile) return; // Skip for mobile
    
    const handleMouseEnter = () => {
      setShowUI(true);
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
      // Start auto-hide timer when mouse enters
      hideTimerRef.current = setTimeout(() => {
        if (!isExpandedRef.current) {
          setShowUI(false);
        }
      }, 3000);
    };

    const handleMouseMove = (e: Event) => {
      // Kiểm tra nếu mouse đang ở trong ControlMenu
      const controlMenuElement = containerRef.current;
      if (controlMenuElement && controlMenuElement.contains(e.target as Node)) {
        // Mouse trong ControlMenu -> không xử lý, để ControlMenu tự xử lý
        return;
      }
      
      // Mouse ngoài ControlMenu -> xử lý bình thường
      setShowUI(true);
      resetHideTimer();
    };

    const handleMouseLeave = (e: Event) => {
      // Kiểm tra nếu mouse đang rời khỏi ControlMenu
      const controlMenuElement = containerRef.current;
      if (controlMenuElement && controlMenuElement.contains((e as MouseEvent).relatedTarget as Node)) {
        // Mouse từ ControlMenu ra ControlMenu -> không xử lý
        return;
      }
      
      // Mouse rời khỏi player area -> xử lý bình thường
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
      hideTimerRef.current = setTimeout(() => {
        if (!isExpandedRef.current) {
          setShowUI(false);
        }
      }, 3000);
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
  }, [mobile, resetHideTimer, playerContainerRef]); // Remove isExpanded dependency

  // Mobile touch events - DISABLED để test
  useEffect(() => {
    if (!mobile) return; // Skip for desktop
    
    // DISABLE HOÀN TOÀN để test
    console.log('📱 Mobile touch events COMPLETELY DISABLED for testing');
    return () => {};
    
    /*
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
    */
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

  // Khởi động auto-hide timer khi component mount
  useEffect(() => {
    console.log('🎛️ ControlMenu mounted - showUI:', showUI);
    // Bắt đầu timer ẩn sau 3 giây khi mount
    resetHideTimer(false);
  }, []); // Chỉ chạy một lần khi mount

  // Keyboard shortcut for ControlMenu (B key) - DISABLED để test
  useEffect(() => {
    // DISABLE HOÀN TOÀN để test
    console.log('⌨️ B key handler DISABLED for testing');
    return () => {};
    
    /*
    const handleKeyDown = (e: KeyboardEvent) => {
      // B key - Toggle ControlMenu
      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        e.stopPropagation();
        
        // Toggle showUI state
        setShowUI(prev => !prev);
        
        // Clear existing timer
        if (hideTimerRef.current) {
          clearTimeout(hideTimerRef.current);
        }
        
        // If showing, start auto-hide timer
        if (!showUI) {
          hideTimerRef.current = setTimeout(() => {
            setShowUI(false);
          }, 3000);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    */
  }, []); // Remove showUI dependency

  const handleReload = useCallback(() => {
    // Ưu tiên onReload để tránh reload toàn trang
    if (onReload) {
      console.log('🔄 Reloading player via callback');
      onReload();
    } else {
      console.warn('⚠️ No onReload callback provided - avoiding full page reload for better UX');
      // Không reload toàn trang để tránh giật lag và thoát fullscreen
      // Thay vào đó, chỉ reset state hoặc thông báo cho người dùng
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

    // Chỉ thêm nút reload nếu có onReload callback
    if (onReload) {
      baseControls.push({
        icon: <IoReload size={20} />,
        label: "Làm mới",
        onClick: handleReload,
      });
    }

    // Chỉ thêm gesture control nếu có gesture context
    if (gestureEnabled) {
      baseControls.push({
        icon: <IoHandRight size={20} />,
        label: toggleGesture ? "Tắt điều khiển cử chỉ" : "Bật điều khiển cử chỉ",
        onClick: toggleGesture,
        active: gestureEnabled, // Sửa: dùng gestureEnabled thay vì toggleGesture
      });
    }

    return baseControls;
  }, [onOpenSource, handleToggleFullscreen, isFullscreen, handleReload, onReload, toggleGesture, gestureEnabled]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute right-4 top-1/2 z-40 -translate-y-1/2 transition-opacity duration-300",
        // Thêm transition-property rõ ràng để tránh nháy khi re-render
        { "opacity-0 pointer-events-none": !showUI, "opacity-100": showUI }
      )}
      onMouseEnter={(e) => {
        e.stopPropagation();
        // Truyền true để "đóng băng" không cho ẩn khi chuột đang nằm trong menu
        resetHideTimer(true);
      }}
      onMouseMove={(e) => {
        e.stopPropagation();
        resetHideTimer(true);
      }}
      onMouseLeave={(e) => {
        e.stopPropagation();
        console.log('🎛️ Mouse leaving menu');
        // Khi rời menu, bắt đầu tính timer ẩn như bình thường
        resetHideTimer(false);
      }}
      onTouchStart={(e) => {
        e.stopPropagation();
        setShowUI(true);
        if (hideTimerRef.current) {
          clearTimeout(hideTimerRef.current);
        }
        if (touchTimeoutRef.current) {
          clearTimeout(touchTimeoutRef.current);
        }
        touchTimeoutRef.current = setTimeout(() => {
          if (!isExpandedRef.current) {
            setShowUI(false);
          }
        }, 4000);
      }}
      onTouchEnd={(e) => {
        e.stopPropagation();
        setShowUI(true);
        if (touchTimeoutRef.current) {
          clearTimeout(touchTimeoutRef.current);
        }
        touchTimeoutRef.current = setTimeout(() => {
          if (!isExpandedRef.current) {
            setShowUI(false);
          }
        }, 3000);
      }}
    >
      <div className="relative flex items-center gap-2">
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
                  aria-label={control.label}
                  title={control.label}
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

        <button
          onClick={toggleMenu}
          aria-label={isExpanded ? "Đóng menu điều khiển" : "Mở menu điều khiển"}
          title={isExpanded ? "Đóng menu" : "Mở menu"}
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-full backdrop-blur-md",
            "bg-primary/20 shadow-xl border border-primary/30",
            "ring-4 ring-white/40",
            "hover:scale-110 hover:bg-primary/30 hover:ring-white/60 hover:shadow-2xl",
            "active:scale-95"
          )}
        >
          <div>
            {isExpanded ? (
              <HiChevronLeft className="text-white" size={24} />
            ) : (
              <HiChevronRight className="text-white" size={24} />
            )}
          </div>
        </button>
      </div>
    </div>
  );
};

export default ControlMenu;
