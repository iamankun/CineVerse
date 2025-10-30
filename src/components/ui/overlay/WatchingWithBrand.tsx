import { useEffect, useState } from "react";

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
  const [lastVideoTimeShown, setLastVideoTimeShown] = useState(0);

  useEffect(() => {
    // Show immediately on mount after 1 second
    const initialTimer = setTimeout(() => {
      setShowMessage(true);
      setLastVideoTimeShown(0);

      // Hide after 15 seconds
      setTimeout(() => {
        setShowMessage(false);
      }, 15000);
    }, 1000);

    return () => clearTimeout(initialTimer);
  }, []);

  useEffect(() => {
    if (!videoCurrentTime) return;

    // Calculate elapsed video minutes since last show
    const videoMinutesElapsed = Math.floor((videoCurrentTime - lastVideoTimeShown) / 60);

    // Show every 6 minutes of VIDEO time (not real time)
    // This tracks actual playback time, so seeking/pausing doesn't affect it
    if (videoMinutesElapsed >= 6 && !showMessage) {
      setShowMessage(true);
      setLastVideoTimeShown(videoCurrentTime);

      setTimeout(() => {
        setShowMessage(false);
      }, 15000); // Show for 15 seconds
    }
  }, [videoCurrentTime, showMessage, lastVideoTimeShown]);

  // Don't show if parent says not visible or if not time to show message
  if (!isVisible || !showMessage) return null;

  // Debug: Log to see what we're getting
  console.log('WatchingWithBrand:', { logoPath, posterPath, movieTitle });

  // Only show if we have a logo
  if (!logoPath) {
    return (
      <div
        className="text-base font-semibold text-white"
        style={{
          textShadow: "0 2px 12px rgba(0, 0, 0, 0.9), 0 0 20px rgba(0, 0, 0, 0.8)",
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
    <div className="flex items-center gap-4">
      {/* Text */}
      <div
        className="text-base font-semibold text-white"
        style={{
          textShadow: "0 2px 12px rgba(0, 0, 0, 0.9), 0 0 20px rgba(0, 0, 0, 0.8)",
        }}
      >
        Bạn đang xem
      </div>

      {/* Movie Logo - Wide format for title logo */}
      <div 
        className="relative flex items-center justify-center overflow-hidden rounded-lg shadow-2xl" 
        style={{ 
          width: "150px", 
          height: "80px",
          background: "transparent"
        }}
      >
        <img
          src={imageUrl}
          alt={movieTitle}
          className="h-full w-full"
          style={{
            filter: "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.8))",
            objectFit: "contain",
          }}
        />
      </div>
    </div>
  );
};

export default WatchingWithBrand;
