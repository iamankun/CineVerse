import { cn } from "@/utils/helpers";
import { useEffect, useState } from "react";

interface AgeRatingProps {
  rating: string;
  ratingDescription: string;
}

const AgeRating: React.FC<AgeRatingProps> = ({ rating, ratingDescription }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Show expanded rating notification every 5 minutes
    const showRating = () => {
      setIsExpanded(true);

      // After 5 seconds, collapse to icon only (but stay visible)
      setTimeout(() => {
        setIsExpanded(false);
      }, 5000);
    };

    // Show immediately on mount
    showRating();

    // Then repeat every 5 minutes (300000ms)
    const interval = setInterval(showRating, 300000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-1.5">
      {/* Green "I" icon - Always visible */}
      <div
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center text-xl font-black text-green-500"
        style={{
          textShadow: "0 0 15px rgba(34, 197, 94, 0.8), 0 2px 6px rgba(0, 0, 0, 0.9)",
        }}
      >
        I
      </div>

      {/* Rating (K/T13/T16/T18) */}
      <div
        className="flex-shrink-0 text-xl font-black text-white"
        style={{
          textShadow: "0 0 12px rgba(255, 255, 255, 0.5), 0 2px 6px rgba(0, 0, 0, 0.9)",
        }}
      >
        {rating}
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
        style={{
          textShadow: "0 2px 10px rgba(0, 0, 0, 0.9)",
        }}
      >
        <span className="inline-block pl-2">{ratingDescription}</span>
      </div>
    </div>
  );
};

export default AgeRating;
