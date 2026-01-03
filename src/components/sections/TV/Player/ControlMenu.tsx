import { cn } from "@/utils/helpers";
import { List, Next, Prev, Server } from "@/utils/icons";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import { Tooltip } from "@heroui/react";

interface ControlMenuProps {
  id: number;
  seasonNumber: number;
  episodeNumber: number;
  selectedSource: number;
  nextEpisodeNumber: number | null;
  prevEpisodeNumber: number | null;
  onOpenSource: () => void;
  onOpenEpisode: () => void;
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
  hidden,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const controls = [
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

  return (
    <div
      className={cn(
        "absolute right-4 top-1/2 z-40 -translate-y-1/2 transition-opacity duration-300",
        { "opacity-0 pointer-events-none": hidden }
      )}
    >
      <div className="relative flex items-center gap-2">
        {/* Expanded Menu */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex items-center gap-2"
            >
              {controls.map((control, index) => {
                const buttonContent = (
                  <motion.button
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
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

                const wrappedButton = control.href ? (
                  <Link key={index} href={control.href} className="inline-block">
                    {buttonContent}
                  </Link>
                ) : (
                  <div key={index} className="inline-block">{buttonContent}</div>
                );

                return (
                  <Tooltip
                    key={`tooltip-${index}`}
                    content={control.label}
                    placement="left"
                    showArrow
                    isDisabled={control.disabled}
                  >
                    {wrappedButton}
                  </Tooltip>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Button */}
        <Tooltip content={isExpanded ? "Thu gọn" : "Mở rộng"} placement="left" showArrow>
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-full backdrop-blur-md",
              "bg-gradient-to-br from-warning/80 to-amber-500/80 shadow-xl",
              "ring-2 ring-white/30 transition-all duration-300",
              "hover:scale-110 hover:ring-white/50 hover:shadow-2xl",
              "active:scale-95"
            )}
            whileTap={{ scale: 0.9 }}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isExpanded ? (
                <HiChevronRight className="text-white" size={24} />
              ) : (
                <HiChevronLeft className="text-white" size={24} />
              )}
            </motion.div>
          </motion.button>
        </Tooltip>
      </div>
    </div>
  );
};

export default ControlMenu;
