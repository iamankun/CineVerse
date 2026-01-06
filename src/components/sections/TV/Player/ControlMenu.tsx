import { cn } from "@/utils/helpers";
import { List, Next, Prev, Server } from "@/utils/icons";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useMemo, useCallback } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import { IoHandRight } from "react-icons/io5";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";
import { IoReload } from "react-icons/io5";
import { useGestureContext } from "@/contexts/GestureContext";

interface ControlMenuProps {
  id: number;
  seasonNumber: number;
  episodeNumber: number;
  selectedSource: number;
  nextEpisodeNumber: number | null;
  prevEpisodeNumber: number | null;
  onOpenSource: () => void;
  onOpenEpisode: () => void;
  onToggleFullscreen?: () => void;
  onReload?: () => void;
  isFullscreen?: boolean;
  hidden?: boolean;
}

const ControlMenu: React.FC<ControlMenuProps> = ({
  id,
  seasonNumber,
  episodeNumber,
  selectedSource,
  nextEpisodeNumber,
  prevEpisodeNumber,
  onOpenSource,
  onOpenEpisode,
  onToggleFullscreen,
  onReload,
  isFullscreen = false,
  hidden,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { enabled: gestureEnabled, toggle: toggleGesture } = useGestureContext();

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
    if (onToggleFullscreen) {
      onToggleFullscreen();
    }
  }, [onToggleFullscreen]);

  const controls = useMemo(() => {
    const baseControls = [
      {
        icon: <Prev size={20} />,
        label: "Tập trước",
        disabled: !prevEpisodeNumber,
        href: prevEpisodeNumber
          ? `/tv/${id}/${seasonNumber}/${prevEpisodeNumber}/player?src=${selectedSource}`
          : undefined,
      },
      {
        icon: <Next size={20} />,
        label: "Tập tiếp",
        disabled: !nextEpisodeNumber,
        href: nextEpisodeNumber
          ? `/tv/${id}/${seasonNumber}/${nextEpisodeNumber}/player?src=${selectedSource}`
          : undefined,
      },
      {
        icon: <Server size={20} />,
        label: "Nguồn phát",
        onClick: onOpenSource,
      },
      {
        icon: <List size={20} />,
        label: "Danh sách tập",
        onClick: onOpenEpisode,
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
  }, [id, seasonNumber, episodeNumber, selectedSource, nextEpisodeNumber, prevEpisodeNumber, onOpenSource, onOpenEpisode, handleToggleFullscreen, isFullscreen, handleReload, toggleGesture, gestureEnabled]);

  return (
    <div
      className={cn(
        "absolute right-4 top-1/2 z-40 -translate-y-1/2 transition-opacity duration-300",
        { "opacity-0 pointer-events-none": hidden }
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
              {controls.map((control, index) => {
                const buttonContent = (
                  <motion.button
                    key={`btn-${index}`}
                    layoutId={`control-btn-${index}`}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                    onClick={control.onClick}
                    disabled={control.disabled}
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-full backdrop-blur-md",
                      "bg-white/10 shadow-lg ring-1 ring-white/20 transition-all duration-200",
                      {
                        "hover:bg-white/25 hover:scale-110 hover:ring-white/40":
                          !control.disabled,
                        "opacity-40 cursor-not-allowed": control.disabled,

                      }
                    )}
                  >
                    <span className="text-white">{control.icon}</span>
                  </motion.button>
                );

                return control.href ? (
                  <Link key={index} href={control.href} className="inline-block">
                    {buttonContent}
                  </Link>
                ) : (
                  <div key={index} className="inline-block">{buttonContent}</div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Button */}
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-full backdrop-blur-md",
            "bg-warning/20 shadow-xl border border-warning/30",
            "ring-4 ring-white/40 transition-all duration-300",
            "hover:scale-110 hover:bg-warning/30 hover:ring-white/60 hover:shadow-2xl",
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
