import { useEffect, useState, useRef } from "react";
import { ageRatingConfig } from "@/utils/overlay-config";

interface AgeRatingProps {
  rating: string;
  ratingDescription: string;
  isLoading?: boolean; // Thêm prop để kiểm tra loading state
}

const AgeRating: React.FC<AgeRatingProps> = ({ rating, ratingDescription, isLoading = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasPlayedAudio, setHasPlayedAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Play audio only once when in loading state
  useEffect(() => {
    // Only play audio when isLoading is true and hasn't played yet
    if (!isLoading || hasPlayedAudio) return;
    
    // Small delay to ensure component is fully mounted
    const timer = setTimeout(() => {
      // Extract rating code from rating string (P, K, 13, 16, 18)
      let ratingCode = rating.trim();
      if (ratingCode.startsWith('T')) {
        ratingCode = ratingCode.substring(1); // Remove 'T' from T13, T16, T18
      }

      // Map rating codes to audio files
      const audioFiles: { [key: string]: string } = {
        'P': '/agerating/P.m4a',
        'K': '/agerating/K.m4a',
        '13': '/agerating/13.m4a',
        '16': '/agerating/16.m4a',
        '18': '/agerating/18.m4a'
      };

      const audioFile = audioFiles[ratingCode];
      if (audioFile) {
        const audio = new Audio(audioFile);
        audio.volume = 0.8;
        audioRef.current = audio;

        audio.play()
          .then(() => {
            setHasPlayedAudio(true);
            audioRef.current = null;
          })
          .catch(() => {
            audioRef.current = null;
          });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isLoading, hasPlayedAudio, rating]);

  useEffect(() => {
    // Special case: repeatInterval = 0 means always show expanded
    if (ageRatingConfig.repeatInterval === 0) {
      setIsExpanded(true);
      return;
    }

    // Normal mode: Show expanded rating notification based on config
    const showRating = () => {
      setIsExpanded(true);
      // Don't play audio here - only play once on initial load

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
      // Cleanup any playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []); // Remove playRatingAudio dependency since we don't call it here

  return (
    <div className="flex items-center gap-1.5">
      {/* Green "I" icon - Always visible */}
      <div
        className="flex h-8 w-8 flex-shrink:0 items-center justify-center text-xl font-black text-green-500"
        style={{
          textShadow: "0 2px 4px rgba(0, 0, 0, 0.8)",
        }}
      >
        I
      </div>

      {/* Rating (K/T13/T16/T18) */}
      <div className="flex-shrink:0 text-xl font-black text-white">
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

      {/* Rating Description - Blur to sharp + elastic slide */}
      <div
        className="overflow-visible transition-all duration-700"
        style={{
          maxWidth: isExpanded ? '400px' : '0px',
          transitionTimingFunction: "cubic-bezier(0.68, -0.55, 0.265, 1.55)", // Elastic
        }}
      >
        <div
          className="whitespace-nowrap text-sm font-semibold text-white pl-2"
          style={{
            filter: isExpanded ? 'blur(0px)' : 'blur(8px)',
            opacity: isExpanded ? 1 : 0,
            transform: isExpanded ? 'translateX(0px) rotateX(0deg)' : 'translateX(-30px) rotateX(-15deg)',
            transition: 'all 800ms cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            textShadow: "0 2px 4px rgba(0, 0, 0, 0.8)",
            transformStyle: 'preserve-3d',
            perspective: '1000px',
          }}
        >
          {ratingDescription}
        </div>
      </div>
    </div>
  );
};

export default AgeRating;
