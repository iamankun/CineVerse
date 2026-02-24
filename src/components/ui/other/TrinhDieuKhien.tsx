import { cn } from "@/utils/helpers";
import { Server, Prev, Next, List } from "@/utils/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { HiChevronDown, HiChevronUp, HiDotsVertical } from "react-icons/hi";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";
import { IoReload } from "react-icons/io5";
import { IoSettingsSharp } from "react-icons/io5";
import { IoHandRight } from "react-icons/io5";
import { PiSpeakerHighFill, PiSpeakerSimpleXFill } from "react-icons/pi";
import { useGestureContext } from "@/contexts/GestureContext";
import useBreakpoints from "@/hooks/useBreakpoints";

interface TrinhDieuKhienProps {
  onOpenSource?: () => void;
  onToggleFullscreen?: () => void;
  onReload?: () => void;
  onToggleSound?: () => void;
  onSettings?: () => void;
  onPrevEpisode?: () => void;
  onNextEpisode?: () => void;
  onOpenEpisode?: () => void;
  prevEpisodeDisabled?: boolean;
  nextEpisodeDisabled?: boolean;
  prevEpisodeHref?: string;
  nextEpisodeHref?: string;
  isFullscreen?: boolean;
  isMuted?: boolean;
  playerContainerRef?: React.RefObject<HTMLDivElement | null>;
}

const TrinhDieuKhien: React.FC<TrinhDieuKhienProps> = ({
  onOpenSource,
  onToggleFullscreen,
  onReload,
  onToggleSound,
  onSettings,
  onPrevEpisode,
  onNextEpisode,
  onOpenEpisode,
  prevEpisodeDisabled,
  nextEpisodeDisabled,
  prevEpisodeHref,
  nextEpisodeHref,
  isFullscreen = false,
  isMuted = false,
  playerContainerRef,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showUI, setShowUI] = useState(true);
  const { mobile } = useBreakpoints();
  const { enabled: gestureEnabled, toggle: toggleGesture } = useGestureContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isExpandedRef = useRef(isExpanded);
  
  // Sync ref với state
  useEffect(() => {
    isExpandedRef.current = isExpanded;
  }, [isExpanded]);

  // Auto-hide controls timer
  const resetHideTimer = useCallback((forceShow = false) => {
    if (isExpandedRef.current) {
      setShowUI(true);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      return;
    }

    setShowUI(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    
    if (!forceShow) {
      hideTimerRef.current = setTimeout(() => {
        if (!isExpandedRef.current) {
          setShowUI(false);
        }
      }, 4000);
    }
  }, []);

  // Toggle menu function
  const toggleMenu = useCallback(() => {
    const nextState = !isExpanded;
    setIsExpanded(nextState);
    if (nextState) {
      setShowUI(true);
    } else {
      resetHideTimer(false);
    }
  }, [isExpanded, resetHideTimer]);

  // Desktop mouse events
  useEffect(() => {
    if (mobile) return;
    
    const handleMouseMove = (e: Event) => {
      const controlElement = containerRef.current;
      if (controlElement && controlElement.contains(e.target as Node)) {
        return;
      }
      
      setShowUI(true);
      resetHideTimer();
    };

    const targetElement = playerContainerRef?.current || document;
    
    if (targetElement) {
      targetElement.addEventListener('mousemove', handleMouseMove);

      return () => {
        targetElement.removeEventListener('mousemove', handleMouseMove);
        if (hideTimerRef.current) {
          clearTimeout(hideTimerRef.current);
        }
      };
    }
  }, [mobile, resetHideTimer, playerContainerRef]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  // Khởi động auto-hide timer khi component mount
  useEffect(() => {
    resetHideTimer(false);
  }, []);

  const handleReload = useCallback(() => {
    if (onReload) {
      onReload();
    }
  }, [onReload]);

  const handleToggleFullscreen = useCallback(() => {
    if (onToggleFullscreen) {
      onToggleFullscreen();
    }
  }, [onToggleFullscreen]);

  const controls = useMemo(() => {
    const baseControls = [];

    // TV Player specific controls
    if (onPrevEpisode) {
      baseControls.push({
        icon: <Prev size={18} />,
        label: "Tập trước",
        onClick: onPrevEpisode,
        disabled: prevEpisodeDisabled,
        href: prevEpisodeHref,
        color: prevEpisodeDisabled 
          ? "from-gray-500/20 to-gray-600/20 border-gray-400/30" 
          : "from-cyan-500/20 to-cyan-600/20 border-cyan-400/30 hover:from-cyan-500/30 hover:to-cyan-600/30 hover:border-cyan-400/50"
      });
    }

    if (onNextEpisode) {
      baseControls.push({
        icon: <Next size={18} />,
        label: "Tập tiếp",
        onClick: onNextEpisode,
        disabled: nextEpisodeDisabled,
        href: nextEpisodeHref,
        color: nextEpisodeDisabled 
          ? "from-gray-500/20 to-gray-600/20 border-gray-400/30" 
          : "from-teal-500/20 to-teal-600/20 border-teal-400/30 hover:from-teal-500/30 hover:to-teal-600/30 hover:border-teal-400/50"
      });
    }

    if (onOpenEpisode) {
      baseControls.push({
        icon: <List size={18} />,
        label: "Danh sách tập",
        onClick: onOpenEpisode,
        color: "from-indigo-500/20 to-indigo-600/20 border-indigo-400/30 hover:from-indigo-500/30 hover:to-indigo-600/30 hover:border-indigo-400/50"
      });
    }

    // Common controls

    if (onOpenSource) {
      baseControls.push({
        icon: <Server size={18} />,
        label: "Nguồn phát",
        onClick: onOpenSource,
        color: "from-blue-500/20 to-blue-600/20 border-blue-400/30 hover:from-blue-500/30 hover:to-blue-600/30 hover:border-blue-400/50"
      });
    }

    if (onToggleSound) {
      baseControls.push({
        icon: isMuted ? <PiSpeakerSimpleXFill size={18} /> : <PiSpeakerHighFill size={18} />,
        label: isMuted ? "Bật âm thanh" : "Tắt âm thanh",
        onClick: onToggleSound,
        color: isMuted ? "from-red-500/20 to-red-600/20 border-red-400/30 hover:from-red-500/30 hover:to-red-600/30 hover:border-red-400/50" : "from-green-500/20 to-green-600/20 border-green-400/30 hover:from-green-500/30 hover:to-green-600/30 hover:border-green-400/50"
      });
    }

    if (onSettings) {
      baseControls.push({
        icon: <IoSettingsSharp size={18} />,
        label: "Cài đặt",
        onClick: onSettings,
        color: "from-purple-500/20 to-purple-600/20 border-purple-400/30 hover:from-purple-500/30 hover:to-purple-600/30 hover:border-purple-400/50"
      });
    }

    if (onToggleFullscreen) {
      baseControls.push({
        icon: isFullscreen ? <MdFullscreenExit size={18} /> : <MdFullscreen size={18} />,
        label: isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình",
        onClick: handleToggleFullscreen,
        color: "from-amber-500/20 to-amber-600/20 border-amber-400/30 hover:from-amber-500/30 hover:to-amber-600/30 hover:border-amber-400/50"
      });
    }

    if (onReload) {
      baseControls.push({
        icon: <IoReload size={18} />,
        label: "Làm mới",
        onClick: handleReload,
        color: "from-orange-500/20 to-orange-600/20 border-orange-400/30 hover:from-orange-500/30 hover:to-orange-600/30 hover:border-orange-400/50"
      });
    }

    // Gesture control (Movie Player specific)
    if (gestureEnabled) {
      baseControls.push({
        icon: <IoHandRight size={18} />,
        label: gestureEnabled ? "Tắt điều khiển cử chỉ" : "Bật điều khiển cử chỉ",
        onClick: toggleGesture,
        color: "from-pink-500/20 to-pink-600/20 border-pink-400/30 hover:from-pink-500/30 hover:to-pink-600/30 hover:border-pink-400/50"
      });
    }

    return baseControls;
  }, [onOpenSource, onToggleSound, isMuted, onSettings, handleToggleFullscreen, isFullscreen, handleReload, onReload, onPrevEpisode, onNextEpisode, onOpenEpisode, prevEpisodeDisabled, nextEpisodeDisabled, prevEpisodeHref, nextEpisodeHref, gestureEnabled, toggleGesture]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "fixed right-4 top-4 z-50 transition-all duration-500 ease-out",
        { 
          "opacity-0 scale-95 pointer-events-none": !showUI, 
          "opacity-100 scale-100": showUI 
        }
      )}
      onMouseEnter={(e) => {
        e.stopPropagation();
        resetHideTimer(true);
      }}
      onMouseMove={(e) => {
        e.stopPropagation();
        resetHideTimer(true);
      }}
      onMouseLeave={(e) => {
        e.stopPropagation();
        resetHideTimer(false);
      }}
    >
      <div className="relative">
        <AnimatePresence mode="wait">
          {isExpanded && (
            <motion.div
              key="expanded-trinhdieukhien"
              initial={{ 
                opacity: 0, 
                y: -20, 
                scale: 0.8,
                rotateX: -10
              }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1,
                rotateX: 0
              }}
              exit={{ 
                opacity: 0, 
                y: -20, 
                scale: 0.8,
                rotateX: -10
              }}
              transition={{ 
                duration: 0.3, 
                ease: "easeOut",
                staggerChildren: 0.05
              }}
              className="absolute right-0 top-16 flex flex-col gap-2"
            >
              {controls.map((control, index) => {
                const buttonContent = (
                  <motion.button
                    key={index}
                    layoutId={`trinhdieukhien-btn-${index}`}
                    initial={{ 
                      opacity: 0, 
                      x: 20,
                      scale: 0.5
                    }}
                    animate={{ 
                      opacity: 1, 
                      x: 0,
                      scale: 1
                    }}
                    exit={{ 
                      opacity: 0, 
                      x: 20,
                      scale: 0.5
                    }}
                    transition={{ 
                      delay: index * 0.08, 
                      duration: 0.25,
                      ease: "backOut"
                    }}
                    onClick={control.onClick}
                    disabled={control.disabled}
                    aria-label={control.label}
                    title={control.label}
                    className={cn(
                      "group relative flex h-11 w-11 items-center justify-center rounded-2xl",
                      "backdrop-blur-xl shadow-2xl border transition-all duration-300",
                      `bg-gradient-to-br ${control.color}`,
                      {
                        "hover:scale-110 hover:shadow-3xl hover:rotate-3": !control.disabled,
                        "opacity-40 cursor-not-allowed": control.disabled,
                        "active:scale-95 active:rotate-0": !control.disabled
                      }
                    )}
                    whileHover={!control.disabled ? {
                      y: -2,
                      transition: { duration: 0.2 }
                    } : undefined}
                    whileTap={!control.disabled ? {
                      scale: 0.9,
                      transition: { duration: 0.1 }
                    } : undefined}
                  >
                    <span className="relative z-10 text-white drop-shadow-lg">
                      {control.icon}
                    </span>
                    
                    {/* Tooltip */}
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      whileHover={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-full mr-2 px-2 py-1 text-xs text-white bg-black/80 backdrop-blur-sm rounded-lg whitespace-nowrap opacity-0"
                    >
                      {control.label}
                    </motion.div>
                    
                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md" />
                  </motion.button>
                );

                return control.href ? (
                  <Link key={index} href={control.href} className="inline-block">
                    {buttonContent}
                  </Link>
                ) : (
                  <div key={index} className="inline-block">
                    {buttonContent}
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Toggle Button */}
        <motion.button
          onClick={toggleMenu}
          aria-label={isExpanded ? "Đóng trình điều khiển" : "Mở trình điều khiển"}
          title={isExpanded ? "Đóng điều khiển" : "Mở điều khiển"}
          className={cn(
            "relative flex h-12 w-12 items-center justify-center rounded-2xl",
            "backdrop-blur-xl shadow-2xl border transition-all duration-300",
            "bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20",
            "border-indigo-400/30 hover:from-indigo-500/40 hover:via-purple-500/40 hover:to-pink-500/40",
            "hover:border-indigo-400/60 hover:scale-110 hover:shadow-3xl hover:rotate-6",
            "active:scale-95 active:rotate-0"
          )}
          whileHover={{
            y: -2,
            transition: { duration: 0.2 }
          }}
          whileTap={{
            scale: 0.9,
            transition: { duration: 0.1 }
          }}
        >
          {/* Animated background gradient */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
          
          {/* Pulsing ring effect */}
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-white/30"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <motion.div
            animate={{ 
              rotate: isExpanded ? 180 : 0,
              scale: isExpanded ? 0.8 : 1
            }}
            transition={{ 
              duration: 0.3, 
              ease: "easeInOut"
            }}
            className="relative z-10"
          >
            {isExpanded ? (
              <HiChevronUp className="text-white drop-shadow-lg" size={20} />
            ) : (
              <HiDotsVertical className="text-white drop-shadow-lg" size={20} />
            )}
          </motion.div>
        </motion.button>
      </div>
    </div>
  );
};

export default TrinhDieuKhien;
