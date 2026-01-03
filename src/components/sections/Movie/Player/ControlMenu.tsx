import { cn } from "@/utils/helpers";
import { Server } from "@/utils/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";

interface ControlMenuProps {
  onOpenSource: () => void;
  hidden?: boolean;
}

const ControlMenu: React.FC<ControlMenuProps> = ({
  onOpenSource,
  hidden,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const controls = useMemo(() => [
    {
      icon: <Server size={20} />,
      label: "Nguồn phát",
      onClick: onOpenSource,
    },
  ], [onOpenSource]);

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
                    "bg-white/10 shadow-lg ring-1 ring-white/20 transition-all duration-200",
                    "hover:bg-white/25 hover:scale-110 hover:ring-white/40"
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
            "ring-2 ring-primary/30 transition-all duration-300",
            "hover:scale-110 hover:bg-primary/30 hover:ring-primary/50 hover:shadow-2xl",
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
      </div>
    </div>
  );
};

export default ControlMenu;
