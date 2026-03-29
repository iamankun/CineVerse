import { useEffect, useState } from "react";
import { cn } from "@/utils/helpers";
import { watchingWithBrandConfig } from "@/utils/overlay-config";
import { getTmdbImageUrl } from "@/api/tmdb";
import Image from "next/image";
interface WatchingWithBrandProps {
  movieTitle: string;
  logoPath?: string | null;
  posterPath?: string | null;
  videoCurrentTime?: number; // Video time in seconds from player
}

// Astronaut Component matching the 404 page design
const AstronautIcon: React.FC<{ className?: string; isWaving?: boolean }> = ({ className, isWaving = true }) => (
  <div className={`astronaut-mini ${className || ''}`}>
    {/* Layer order from back to front */}
    <div className="astronaut-mini__backpack"></div>
    <div className="astronaut-mini__body"></div>
    <div className="astronaut-mini__body__chest"></div>
    <div className="astronaut-mini__arm-left1"></div>
    <div className="astronaut-mini__arm-left2"></div>
    <div className="astronaut-mini__arm-thumb-left"></div>
    <div className="astronaut-mini__wrist-left"></div>
    {/* Right arm group - wrapped for animation */}
    <div className={`astronaut-mini__arm-right-group ${isWaving ? 'waving' : ''}`}>
      <div className="astronaut-mini__arm-right1"></div>
      <div className="astronaut-mini__arm-right2"></div>
      <div className="astronaut-mini__arm-thumb-right"></div>
      <div className="astronaut-mini__wrist-right"></div>
    </div>
    <div className="astronaut-mini__leg-left"></div>
    <div className="astronaut-mini__leg-right"></div>
    <div className="astronaut-mini__foot-left"></div>
    <div className="astronaut-mini__foot-right"></div>
    {/* Head is on top */}
    <div className="astronaut-mini__head">
      {/* Visor (dark face shield) */}
      <svg className="astronaut-mini__head-visor-svg" viewBox="0 0 60 60" width="30" height="30">
        <path
          d="M5 45 Q15 58 30 58 Q45 58 55 45 L55 20 Q55 10 45 10 L15 10 Q5 10 5 20 Z"
          fill="#2f3640"
          stroke="#f5f6fa"
          strokeWidth="1"
        />
        {/* Flare 1 */}
        <ellipse cx="42" cy="20" rx="5" ry="5" fill="#7f8fa6" opacity="0.5" />
        {/* Flare 2 */}
        <ellipse cx="38" cy="30" rx="3" ry="3" fill="#718093" opacity="0.3" />
      </svg>
    </div>
  </div>
);

// Keyframes styles injected via style tag
const astronautStyles = `
  /* Mini Astronaut - scaled from 404 page (185x300 -> 92x150, scale 0.5) */
  .astronaut-mini {
    position: relative;
    width: 92px;
    height: 150px;
  }

  @media (min-width: 768px) {
    .astronaut-mini {
      width: 92px;
      height: 150px;
    }
  }

  /* Original: top: 60px, left: 60px, 60x60 -> scaled 0.5 */
  .astronaut-mini__head {
    background-color: white;
    position: absolute;
    top: 30px;
    left: 30px;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    z-index: 10;
    overflow: visible;
  }

  .astronaut-mini__head-visor-svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  /* Original: top: 90px, left: 47px, 86x90 -> scaled 0.5 */
  .astronaut-mini__backpack {
    background-color: #bfbfbf;
    position: absolute;
    top: 45px;
    left: 23px;
    width: 43px;
    height: 45px;
    border-radius: 4px;
    z-index: 1;
  }

  /* Original: top: 115px, left: 55px, 70x80 -> scaled 0.5 */
  .astronaut-mini__body {
    background-color: #e6e6e6;
    position: absolute;
    top: 57px;
    left: 27px;
    width: 35px;
    height: 40px;
    border-radius: 4px;
    z-index: 2;
  }

  /* Original: top: 140px, left: 68px, 45x25 -> scaled 0.5 */
  .astronaut-mini__body__chest {
    background-color: #d9d9d9;
    position: absolute;
    top: 70px;
    left: 34px;
    width: 22px;
    height: 12px;
    border-radius: 3px;
    z-index: 3;
  }

  /* Original: top: 127px, left: 9px, 65x20 -> scaled 0.5 */
  .astronaut-mini__arm-left1 {
    background-color: #e6e6e6;
    position: absolute;
    top: 63px;
    left: 4px;
    width: 32px;
    height: 10px;
    border-radius: 4px;
    transform: rotate(-30deg);
    z-index: 4;
  }

  /* Original: top: 102px, left: 7px, 20x45 -> scaled 0.5 */
  .astronaut-mini__arm-left2 {
    background-color: #e6e6e6;
    position: absolute;
    top: 51px;
    left: 3px;
    width: 10px;
    height: 22px;
    border-radius: 4px;
    transform: rotate(-12deg);
    border-top-left-radius: 8em;
    border-top-right-radius: 8em;
    z-index: 5;
  }

  /* Right arm group wrapper */
  .astronaut-mini__arm-right-group {
    position: absolute;
    top: 50px;
    left: 50px;
    width: 40px;
    height: 35px;
    transform-origin: left center;
    z-index: 4;
  }

  .astronaut-mini__arm-right-group.waving {
    animation: waveArmGroup 0.8s ease-in-out infinite;
  }

  /* Original: top: 113px, left: 100px, 65x20 -> scaled 0.5 */
  .astronaut-mini__arm-right1 {
    background-color: #e6e6e6;
    position: absolute;
    top: 6px;
    left: 0px;
    width: 32px;
    height: 10px;
    border-radius: 4px;
    transform: rotate(-10deg);
    z-index: 4;
  }

  /* Original: top: 78px, left: 141px, 20x45 -> scaled 0.5 */
  .astronaut-mini__arm-right2 {
    background-color: #e6e6e6;
    position: absolute;
    top: -11px;
    left: 20px;
    width: 10px;
    height: 22px;
    border-radius: 4px;
    transform: rotate(-10deg);
    border-top-left-radius: 8em;
    border-top-right-radius: 8em;
    z-index: 5;
  }



  /* Original: top: 110px, left: 21px, 10x6 -> scaled 0.5 */
  .astronaut-mini__arm-thumb-left {
    background-color: #e6e6e6;
    position: absolute;
    top: 55px;
    left: 10px;
    width: 5px;
    height: 3px;
    border-radius: 8em;
    transform: rotate(-35deg);
    z-index: 6;
  }

  /* Original: top: 90px, left: 133px, 10x6 -> scaled 0.5 */
  .astronaut-mini__arm-thumb-right {
    background-color: #e6e6e6;
    position: absolute;
    top: -5px;
    left: 17px;
    width: 5px;
    height: 3px;
    border-radius: 8em;
    transform: rotate(20deg);
    z-index: 6;
  }



  /* Original: top: 122px, left: 6.5px, 21x4 -> scaled 0.5 */
  .astronaut-mini__wrist-left {
    background-color: #e67e22;
    position: absolute;
    top: 61px;
    left: 3px;
    width: 10px;
    height: 2px;
    border-radius: 8em;
    transform: rotate(-15deg);
    z-index: 7;
  }

  /* Original: top: 98px, left: 141px, 21x4 -> scaled 0.5 */
  .astronaut-mini__wrist-right {
    background-color: #e67e22;
    position: absolute;
    top: -1px;
    left: 20px;
    width: 10px;
    height: 2px;
    border-radius: 8em;
    transform: rotate(-10deg);
    z-index: 7;
  }



  /* Original: top: 188px, left: 50px, 23x75 -> scaled 0.5 */
  .astronaut-mini__leg-left {
    background-color: #e6e6e6;
    position: absolute;
    top: 94px;
    left: 25px;
    width: 11px;
    height: 37px;
    border-radius: 4px;
    transform: rotate(10deg);
    z-index: 2;
  }

  /* Original: top: 188px, left: 108px, 23x75 -> scaled 0.5 */
  .astronaut-mini__leg-right {
    background-color: #e6e6e6;
    position: absolute;
    top: 94px;
    left: 54px;
    width: 11px;
    height: 37px;
    border-radius: 4px;
    transform: rotate(-10deg);
    z-index: 2;
  }

  /* Original: top: 240px, left: 43px, 32x20 -> scaled 0.5 */
  .astronaut-mini__foot-left {
    background-color: white;
    position: absolute;
    top: 120px;
    left: 21px;
    width: 16px;
    height: 10px;
    transform: rotate(10deg);
    border-radius: 2px;
    border-top-left-radius: 8em;
    border-top-right-radius: 8em;
    border-bottom: 2px solid #e67e22;
    z-index: 3;
  }

  /* Original: top: 240px, left: 111px, 32x20 -> scaled 0.5 */
  .astronaut-mini__foot-right {
    background-color: white;
    position: absolute;
    top: 120px;
    left: 55px;
    width: 16px;
    height: 10px;
    transform: rotate(-10deg);
    border-radius: 2px;
    border-top-left-radius: 8em;
    border-top-right-radius: 8em;
    border-bottom: 2px solid #e67e22;
    z-index: 3;
  }

  /* Waving animation - gentle wave for entire arm group */
  @keyframes waveArmGroup {
    0% { transform: rotate(0deg); }
    50% { transform: rotate(-15deg); }
    100% { transform: rotate(0deg); }
  }

  /* Astronaut container animations */
  @keyframes astronautFlyIn {
    0% {
      transform: translateX(-100px) translateY(20px) rotate(-15deg);
      opacity: 0;
    }
    50% {
      transform: translateX(0) translateY(-5px) rotate(5deg);
      opacity: 1;
    }
    100% {
      transform: translateX(0) translateY(0) rotate(0deg);
      opacity: 1;
    }
  }

  @keyframes astronautFloat {
    0%, 100% {
      transform: translateY(0) rotate(0deg);
    }
    50% {
      transform: translateY(-8px) rotate(3deg);
    }
  }

  @keyframes astronautFlyOut {
    0% {
      transform: translateX(0) translateY(0) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translateX(-100px) translateY(-30px) rotate(-20deg);
      opacity: 0;
    }
  }

  @keyframes textSlideIn {
    0% {
      transform: translateX(-30px);
      opacity: 0;
    }
    100% {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes logoSlideIn {
    0% {
      transform: translateX(-40px) scale(0.8);
      opacity: 0;
    }
    100% {
      transform: translateX(0) scale(1);
      opacity: 1;
    }
  }

  @keyframes contentFadeOut {
    0% {
      opacity: 1;
      transform: translateX(0);
    }
    100% {
      opacity: 0;
      transform: translateX(-20px);
    }
  }

  .astronaut-flying-in {
    animation: astronautFlyIn 1s ease-out forwards;
  }

  .astronaut-floating {
    animation: astronautFloat 3s ease-in-out infinite;
  }

  .astronaut-flying-out {
    animation: astronautFlyOut 0.6s ease-in forwards;
  }

  .text-slide-in {
    animation: textSlideIn 0.5s ease-out forwards;
  }

  .logo-slide-in {
    animation: logoSlideIn 0.6s ease-out forwards;
  }

  .content-fade-out {
    animation: contentFadeOut 0.5s ease-in forwards;
  }
`;

const WatchingWithBrand: React.FC<WatchingWithBrandProps> = ({ 
  movieTitle, 
  logoPath,
  posterPath,
  videoCurrentTime = 0
}) => {
  const [showMessage, setShowMessage] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'hidden' | 'astronaut-entry' | 'content-show' | 'floating' | 'exit'>('hidden');

  useEffect(() => {
    // Inject astronaut animation styles
    const styleId = 'astronaut-animation-styles';
    if (!document.getElementById(styleId)) {
      const styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.textContent = astronautStyles;
      document.head.appendChild(styleEl);
    }
  }, []);

  useEffect(() => {
    // Special case: repeatInterval = 0 means always show (no animation, no hide)
    if (watchingWithBrandConfig.repeatInterval === 0) {
      console.log('🎬 WatchingWithBrand: Always visible mode (repeatInterval = 0)');
      setShowMessage(true);
      setIsExpanded(true);
      setAnimationPhase('floating');
      return; // Don't set any timers
    }

    // Normal mode: Show with animation based on config
    const showWithAnimation = () => {
      console.log('🎬 WatchingWithBrand: Showing with astronaut animation');
      setShowMessage(true);
      setAnimationPhase('astronaut-entry');
      
      // After astronaut flies in, show content
      setTimeout(() => {
        setAnimationPhase('content-show');
        setIsExpanded(true);
      }, 1000); // Wait for astronaut fly-in animation

      // Start floating animation
      setTimeout(() => {
        setAnimationPhase('floating');
      }, 1600);

      // After configured show duration, start exit animation
      setTimeout(() => {
        setAnimationPhase('exit');
        setIsExpanded(false);
        
        setTimeout(() => {
          setShowMessage(false);
          setAnimationPhase('hidden');
        }, 600); // Exit animation duration
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
  console.log('WatchingWithBrand:', { logoPath, posterPath, movieTitle, animationPhase });

  // Use proxy for TMDB images to avoid CSP issues
  const cleanLogoPath = logoPath?.startsWith('/') ? logoPath.substring(1) : logoPath || '';
  const imageUrl = logoPath ? `/api/proxy/tmdb-image?path=w500/${encodeURIComponent(cleanLogoPath)}` : null;
  
  console.log('🎬 WatchingWithBrand Debug:', { 
    logoPath, 
    cleanLogoPath, 
    imageUrl,
    hasLogo: !!logoPath
  });

  const getAstronautClass = () => {
    switch (animationPhase) {
      case 'astronaut-entry':
        return 'astronaut-flying-in';
      case 'content-show':
      case 'floating':
        return 'astronaut-floating';
      case 'exit':
        return 'astronaut-flying-out';
      default:
        return '';
    }
  };

  const showContent = animationPhase === 'content-show' || animationPhase === 'floating' || animationPhase === 'exit';

  return (
    <div className="flex items-end gap-2 md:gap-3">
      {/* Astronaut */}
      <div 
        className={cn(
          "shrink-0",
          getAstronautClass()
        )}
      >
        <AstronautIcon 
          className="drop-shadow-lg" 
          isWaving={animationPhase === 'content-show' || animationPhase === 'floating'}
        />
      </div>

      {/* Content container */}
      <div 
        className={cn(
          "flex flex-col items-start gap-1",
          animationPhase === 'exit' ? 'content-fade-out' : ''
        )}
      >
        {/* Text */}
        {showContent && (
          <div
            className={cn(
              "text-xs md:text-sm font-semibold text-white",
              animationPhase !== 'exit' ? 'text-slide-in' : ''
            )}
            style={{
              textShadow: "0 0 12px rgba(255, 255, 255, 0.5), 0 2px 6px rgba(0, 0, 0, 0.9)",
            }}
          >
            {logoPath ? 'Bạn đang xem' : (
              <>Bạn đang xem <span className="font-bold">{movieTitle}</span></>
            )}
          </div>
        )}

        {/* Movie Logo - Slides in/out with animation */}
        {showContent && imageUrl && (
          <div 
            className={cn(
              "overflow-visible transition-all ease-in-out",
              animationPhase !== 'exit' ? 'logo-slide-in' : '',
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
        )}
      </div>
    </div>
  );
};

export default WatchingWithBrand;
