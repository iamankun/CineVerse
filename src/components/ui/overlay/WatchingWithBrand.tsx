import { useEffect, useState } from "react";
import { cn } from "@/utils/helpers";
import { watchingWithBrandConfig } from "@/utils/overlay-config";

interface WatchingWithBrandProps {
  movieTitle: string;
  logoPath?: string | null;
  posterPath?: string | null;
  isVisible: boolean; // Controlled by parent (idle state)
  videoCurrentTime?: number; // Video time in seconds from player
}

const WatchingWithBrand: React.FC<WatchingWithBrandProps> = ({ 
  movieTitle, 
  logoPath,
  posterPath,
  isVisible,
  videoCurrentTime = 0
}) => {
  const [showMessage, setShowMessage] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Special case: repeatInterval = 0 means always show (no animation, no hide)
    if (watchingWithBrandConfig.repeatInterval === 0) {
      console.log('🎬 WatchingWithBrand: Always visible mode (repeatInterval = 0)');
      setShowMessage(true);
      setIsExpanded(true);
      return; // Don't set any timers
    }

    // Normal mode: Show with animation based on config
    const showWithAnimation = () => {
      console.log('🎬 WatchingWithBrand: Showing with animation');
      setShowMessage(true);
      
      // Expand animation after a brief delay
      setTimeout(() => {
        setIsExpanded(true);
      }, 100);

      // After configured show duration, collapse and hide
      setTimeout(() => {
        setIsExpanded(false);
        setTimeout(() => {
          setShowMessage(false);
        }, watchingWithBrandConfig.animationDuration);
      }, watchingWithBrandConfig.showDuration);
    };

    // Show after initial delay
    const initialTimer = setTimeout(showWithAnimation, watchingWithBrandConfig.initialDelay);

    // Show at configured interval
    const recurringTimer = setInterval(showWithAnimation, watchingWithBrandConfig.repeatInterval);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(recurringTimer);
    };
  }, []);

  // Don't render if not showing
  if (!showMessage) return null;

  // Debug: Log to see what we're getting
  console.log('WatchingWithBrand:', { logoPath, posterPath, movieTitle });

  // Only show if we have a logo
  if (!logoPath) {
    return (
      <div
        className="text-base font-semibold text-white"
        style={{
          textShadow: "0 0 12px rgba(255, 255, 255, 0.5), 0 2px 6px rgba(0, 0, 0, 0.9)",
        }}
      >
        Bạn đang xem <span className="font-bold">{movieTitle}</span>
      </div>
    );
  }

  // Remove leading slash if exists to avoid double slashes
  const cleanLogoPath = logoPath.startsWith('/') ? logoPath.substring(1) : logoPath;
  const imageUrl = `https://image.tmdb.org/t/p/w500/${cleanLogoPath}`;

  return (
    <div className="flex flex-col items-start gap-1">
      {/* Text - Always visible */}
      <div
        className="text-xs md:text-sm font-semibold text-white"
        style={{
          textShadow: "0 0 12px rgba(255, 255, 255, 0.5), 0 2px 6px rgba(0, 0, 0, 0.9)",
        }}
      >
        Bạn đang xem
      </div>

      {/* Movie Logo - Slides in/out with animation */}
      <div 
        className={cn(
          "overflow-visible transition-all ease-in-out",
          {
            "max-h-0 opacity-0": !isExpanded,
            "max-h-[60px] md:max-h-[70px] opacity-100": isExpanded,
          }
        )}
        style={{
          transitionDuration: `${watchingWithBrandConfig.animationDuration}ms`,
        }}
      >
        <div 
          className="relative flex items-center justify-start" 
          style={{ 
            minWidth: "80px",
            maxWidth: "160px",
            minHeight: "40px",
            maxHeight: "60px",
            background: "transparent",
          }}
        >
          <img
            src={imageUrl}
            alt={movieTitle}
            className="md:hidden"
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              width: "auto",
              height: "auto",
              objectFit: "contain",
            }}
          />
          <img
            src={imageUrl}
            alt={movieTitle}
            className="hidden md:block"
            style={{
              maxWidth: "180px",
              maxHeight: "70px",
              width: "auto",
              height: "auto",
              objectFit: "contain",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default WatchingWithBrand;
