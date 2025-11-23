import { cn } from "@/utils/helpers";
import { useEffect, useState } from "react";
import { ageRatingConfig } from "@/utils/overlay-config";

interface AgeRatingProps {
  rating: string;
  ratingDescription: string;
}

const AgeRating: React.FC<AgeRatingProps> = ({ rating, ratingDescription }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Special case: repeatInterval = 0 means always show expanded
    if (ageRatingConfig.repeatInterval === 0) {
      console.log('ℹ️ AgeRating: Always visible mode (repeatInterval = 0)');
      setIsExpanded(true);
      return; // Don't set any timers
    }

    // Normal mode: Show expanded rating notification based on config
    const showRating = () => {
      setIsExpanded(true);

      // After configured duration, collapse to icon only (but stay visible)
      setTimeout(() => {
        setIsExpanded(false);
      }, ageRatingConfig.expandDuration);
    };

    // Show after initial delay
    const initialTimer = setTimeout(showRating, ageRatingConfig.initialDelay);

    // Then repeat at configured interval
    const interval = setInterval(showRating, ageRatingConfig.repeatInterval);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex items-center gap-1.5">
      {/* Green "I" icon - Always visible */}
      <div
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center text-xl font-black text-green-500"
        style={{
          textShadow: "0 2px 4px rgba(0, 0, 0, 0.8)",
        }}
      >
        I
      </div>

      {/* Rating (K/T13/T16/T18) */}
      <div className="flex-shrink-0 text-xl font-black text-white">
        {rating.split('').map((char, idx) => (
          <span
            key={idx}
            style={{
              textShadow: "0 2px 4px rgba(0, 0, 0, 0.8)",
              display: 'inline-block',
            }}
          >
            {char}
          </span>
        ))}
      </div>

      {/* Rating Description - Slides in/out */}
      <div
        className={cn(
          "overflow-hidden whitespace-nowrap text-sm font-semibold text-white transition-all duration-700 ease-in-out",
          {
            "max-w-0 opacity-0": !isExpanded,
            "max-w-[400px] opacity-100": isExpanded,
          }
        )}
      >
        <span className="inline-block pl-2">
          {ratingDescription.split('').map((char, idx) => (
            <span
              key={idx}
              style={{
                textShadow: "0 2px 4px rgba(0, 0, 0, 0.8)",
              }}
            >
              {char}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
};

export default AgeRating;
