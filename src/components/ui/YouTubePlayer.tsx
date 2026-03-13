'use client';

import React, { useState, useId } from 'react';
import Link from "next/link";
import { motion, AnimatePresence } from 'framer-motion';
import { useYouTubePlayer, PlayerState } from '@/hooks/useYouTubePlayer';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Settings,
  Maximize,
  Minimize,
  FastForward,
  ChevronsRight,
} from 'lucide-react';

interface YouTubePlayerProps {
  videoId: string;
  autoplay?: boolean;
  showControls?: boolean;
  className?: string;
  onReady?: () => void;
  onStateChange?: (state: number) => void;
  onError?: (error: number) => void;
  // Intro/Outro config
  intro?: {
    start: number;
    end: number;
  };
  outro?: {
    start: number;
    end: number;
  };
  onNextEpisode?: () => void; // Callback khi bấm next episode (deprecated)
  // New props for direct navigation like ControlMenu
  id?: number;
  seasonNumber?: number;
  nextEpisodeNumber?: number | null;
  selectedSource?: number;
  // Add external idle control
  externalIdle?: boolean;
  // Add mobile detection
  isMobile?: boolean;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  autoplay = false,
  showControls = true,
  className = '',
  onReady,
  onStateChange,
  onError,
  intro,
  outro,
  onNextEpisode,
  // New props for direct navigation
  id,
  seasonNumber,
  nextEpisodeNumber,
  selectedSource,
  // Add external idle control
  externalIdle = false,
  // Add mobile detection
  isMobile = false,
}) => {
  // Sử dụng useId() để tạo ID ổn định cho SSR
  const uniqueId = useId();
  const playerId = `youtube-player-${uniqueId}`;
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showUI, setShowUI] = useState(true);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [showNextEpisode, setShowNextEpisode] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const hideTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const progressEventRef = React.useRef<{
    mouseMoveHandler?: (e: MouseEvent) => void;
    mouseUpHandler?: () => void;
    touchMoveHandler?: (e: TouchEvent) => void;
    touchEndHandler?: () => void;
  }>({});

  const {
    isReady,
    playerState,
    currentTime,
    duration,
    volume,
    isMuted,
    availableQualities,
    currentQuality,
    seekTo,
    setVolume,
    toggleMute,
    togglePlayPause,
    setPlaybackQuality,
  } = useYouTubePlayer(playerId, {
    videoId,
    autoplay,
    controls: false,
    onReady: () => {
      setHasError(false);
      onReady?.();
    },
    onStateChange,
    onError: (error) => {
      setHasError(true);
      onError?.(error);
    },
  });

  // Sync with external idle state
  React.useEffect(() => {
    if (externalIdle) {
      setShowUI(false);
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    } else {
      setShowUI(true);
      resetHideTimer();
    }
  }, [externalIdle]);

  // Auto-hide controls và cursor sau 3s
  const resetHideTimer = React.useCallback(() => {
    setShowUI(true);
    
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
    
    // Không auto-hide khi quality menu đang mở
    if (showQualityMenu) {
      return;
    }
    
    // Chỉ auto-hide khi đang playing và không có external idle
    if (isReady && playerState === 1 && !externalIdle) { // YT.PlayerState.PLAYING = 1
      hideTimerRef.current = setTimeout(() => {
        setShowUI(false);
      }, 3000);
    }
  }, [isReady, playerState, showQualityMenu, externalIdle]); // Dùng playerState thay vì currentTime/duration

  const isPlaying = playerState === PlayerState.PLAYING;
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Mobile touch events
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let touchTimeout: NodeJS.Timeout | null = null;

    const handleTouchStart = (e: TouchEvent) => {
      setShowUI(true);
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
      if (touchTimeout) {
        clearTimeout(touchTimeout);
      }

      // Auto-hide after 4 seconds on touch
      if (isReady && playerState === 1 && !externalIdle) { // YT.PlayerState.PLAYING = 1
        touchTimeout = setTimeout(() => {
          setShowUI(false);
        }, 4000);
      }
    };

    const handleTouchEnd = () => {
      // Keep controls visible briefly after touch ends
      setShowUI(true);
      if (touchTimeout) {
        clearTimeout(touchTimeout);
      }
      
      // Auto-hide after 3 seconds
      if (isReady && playerState === 1 && !externalIdle) { // YT.PlayerState.PLAYING = 1
        touchTimeout = setTimeout(() => {
          setShowUI(false);
        }, 3000);
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
      if (touchTimeout) {
        clearTimeout(touchTimeout);
      }
    };
  }, [isReady, playerState, externalIdle]); // Loại bỏ currentTime, duration

  // Desktop mouse events
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseEnter = () => {
      setShowUI(true);
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
      // Start auto-hide timer when mouse enters
      if (isReady && playerState === 1 && !externalIdle) { // YT.PlayerState.PLAYING = 1
        hideTimerRef.current = setTimeout(() => {
          setShowUI(false);
        }, 3000);
      }
    };

    const handleMouseLeave = (e: MouseEvent) => {
      // Chỉ ẩn controls khi chuột thực sự rời khỏi video container
      // nhưng không ẩn ngay lập tức - đợi 3s như bình thường
      if (isPlaying && !externalIdle) {
        // Reset timer và bắt đầu đếm ẩn
        if (hideTimerRef.current) {
          clearTimeout(hideTimerRef.current);
        }
        hideTimerRef.current = setTimeout(() => {
          setShowUI(false);
        }, 3000); // Đợi 3s như bình thường
      }
    };

    const handleMouseMove = () => {
      setShowUI(true);
      resetHideTimer();
    };

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('mousemove', handleMouseMove);

    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('mousemove', handleMouseMove);
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, [isPlaying, isReady, playerState, externalIdle, resetHideTimer]); // Loại bỏ currentTime, duration

  // Khi pause, luôn hiện controls
  React.useEffect(() => {
    if (isReady && playerState === 2) { // YT.PlayerState.PAUSED = 2
      setShowUI(true);
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    }
  }, [isReady, playerState]); // Dùng playerState thay vì currentTime/duration

  // Khởi động auto-hide timer khi video bắt đầu playing
  React.useEffect(() => {
    if (isReady && playerState === 1 && !externalIdle) { // YT.PlayerState.PLAYING = 1
      // Bắt đầu auto-hide timer 3s
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
      hideTimerRef.current = setTimeout(() => {
        setShowUI(false);
      }, 3000);
    }
  }, [isReady, playerState, externalIdle]); // Chỉ chạy khi state thay đổi

  // Check intro/outro timing - chỉ khi video đang playing
  React.useEffect(() => {
    if (!isReady || playerState !== 1) return; // Chỉ khi playing

    // Check if in intro range
    if (intro && currentTime >= intro.start && currentTime <= intro.end) {
      setShowSkipIntro(true);
    } else {
      setShowSkipIntro(false);
    }

    // Check if in outro range
    if (outro && currentTime >= outro.start && currentTime <= outro.end) {
      setShowNextEpisode(true);
    } else {
      setShowNextEpisode(false);
    }
  }, [currentTime, intro, outro, isReady, playerState]); // Giữ currentTime vì cần check range

  // Skip intro handler
  const handleSkipIntro = () => {
    if (intro) {
      seekTo(intro.end);
      setShowSkipIntro(false);
    }
  };

  // Cleanup event listeners on unmount
  React.useEffect(() => {
    return () => {
      // Cleanup any remaining event listeners
      if (progressEventRef.current.mouseMoveHandler) {
        document.removeEventListener('mousemove', progressEventRef.current.mouseMoveHandler);
      }
      if (progressEventRef.current.mouseUpHandler) {
        document.removeEventListener('mouseup', progressEventRef.current.mouseUpHandler);
      }
      if (progressEventRef.current.touchMoveHandler) {
        document.removeEventListener('touchmove', progressEventRef.current.touchMoveHandler);
      }
      if (progressEventRef.current.touchEndHandler) {
        document.removeEventListener('touchend', progressEventRef.current.touchEndHandler);
      }
    };
  }, []);

  // Timeout cho loading state
  React.useEffect(() => {
    if (isReady || hasError) return;
    
    let warningTimer: NodeJS.Timeout;
    let errorTimer: NodeJS.Timeout;
    
    // Warning sau 15s
    warningTimer = setTimeout(() => {
      if (!isReady && !hasError) {
        console.warn('YouTube Player: Taking longer than expected to load...');
      }
    }, 15000);
    
    // Error sau 20s
    errorTimer = setTimeout(() => {
      if (!isReady && !hasError) {
        console.error('YouTube Player timeout - Failed to load after 20s');
        setHasError(true);
      }
    }, 20000);

    return () => {
      clearTimeout(warningTimer);
      clearTimeout(errorTimer);
    };
  }, [isReady, hasError]);

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    seekTo(newTime);
  };

  const handleProgressMouseDown = (e: React.MouseEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    // Cleanup previous listeners
    if (progressEventRef.current.mouseMoveHandler) {
      document.removeEventListener('mousemove', progressEventRef.current.mouseMoveHandler);
    }
    if (progressEventRef.current.mouseUpHandler) {
      document.removeEventListener('mouseup', progressEventRef.current.mouseUpHandler);
    }
    
    const input = e.target as HTMLInputElement;
    const rect = input.getBoundingClientRect();
    
    // Calculate initial position for immediate response
    const initialPercent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const initialTime = initialPercent * duration;
    seekTo(initialTime);
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const percent = Math.max(0, Math.min(1, (moveEvent.clientX - rect.left) / rect.width));
      const newTime = percent * duration;
      seekTo(newTime);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      // Clear refs
      progressEventRef.current.mouseMoveHandler = undefined;
      progressEventRef.current.mouseUpHandler = undefined;
    };

    // Store refs for cleanup
    progressEventRef.current.mouseMoveHandler = handleMouseMove;
    progressEventRef.current.mouseUpHandler = handleMouseUp;
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleProgressTouchStart = (e: React.TouchEvent<HTMLInputElement>) => {
    e.preventDefault();
    const input = e.target as HTMLInputElement;
    const rect = input.getBoundingClientRect();
    
    // Cleanup previous listeners
    if (progressEventRef.current.touchMoveHandler) {
      document.removeEventListener('touchmove', progressEventRef.current.touchMoveHandler);
    }
    if (progressEventRef.current.touchEndHandler) {
      document.removeEventListener('touchend', progressEventRef.current.touchEndHandler);
    }
    
    // Calculate initial touch position for immediate response
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const initialPercent = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
      const initialTime = initialPercent * duration;
      seekTo(initialTime);
    }
    
    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches.length > 0) {
        const touch = moveEvent.touches[0];
        const percent = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
        const newTime = percent * duration;
        seekTo(newTime);
      }
    };

    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      // Clear refs
      progressEventRef.current.touchMoveHandler = undefined;
      progressEventRef.current.touchEndHandler = undefined;
    };

    // Store refs for cleanup
    progressEventRef.current.touchMoveHandler = handleTouchMove;
    progressEventRef.current.touchEndHandler = handleTouchEnd;
    
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    // Ensure volume is properly clamped and update immediately
    const clampedVolume = Math.max(0, Math.min(100, newVolume));
    setVolume(clampedVolume);
  };

  // Enhanced volume handlers for better mobile support
  const handleVolumeMouseDown = (e: React.MouseEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Cleanup previous listeners
    if (progressEventRef.current.mouseMoveHandler) {
      document.removeEventListener('mousemove', progressEventRef.current.mouseMoveHandler);
    }
    if (progressEventRef.current.mouseUpHandler) {
      document.removeEventListener('mouseup', progressEventRef.current.mouseUpHandler);
    }
    
    const input = e.target as HTMLInputElement;
    const rect = input.getBoundingClientRect();
    
    // Calculate initial position
    const initialPercent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const initialVolume = initialPercent * 100;
    setVolume(initialVolume);
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const percent = Math.max(0, Math.min(1, (moveEvent.clientX - rect.left) / rect.width));
      const newVolume = percent * 100;
      setVolume(newVolume);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      // Clear refs
      progressEventRef.current.mouseMoveHandler = undefined;
      progressEventRef.current.mouseUpHandler = undefined;
    };

    // Store refs for cleanup
    progressEventRef.current.mouseMoveHandler = handleMouseMove;
    progressEventRef.current.mouseUpHandler = handleMouseUp;
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleVolumeTouchStart = (e: React.TouchEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const input = e.target as HTMLInputElement;
    const rect = input.getBoundingClientRect();
    
    // Cleanup previous listeners
    if (progressEventRef.current.touchMoveHandler) {
      document.removeEventListener('touchmove', progressEventRef.current.touchMoveHandler);
    }
    if (progressEventRef.current.touchEndHandler) {
      document.removeEventListener('touchend', progressEventRef.current.touchEndHandler);
    }
    
    // Calculate initial touch position
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const initialPercent = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
      const initialVolume = initialPercent * 100;
      setVolume(initialVolume);
    }
    
    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches.length > 0) {
        const touch = moveEvent.touches[0];
        const percent = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
        const newVolume = percent * 100;
        setVolume(newVolume);
      }
    };

    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      // Clear refs
      progressEventRef.current.touchMoveHandler = undefined;
      progressEventRef.current.touchEndHandler = undefined;
    };

    // Store refs for cleanup
    progressEventRef.current.touchMoveHandler = handleTouchMove;
    progressEventRef.current.touchEndHandler = handleTouchEnd;
    
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  };

  const handleSkipBackward = () => {
    seekTo(Math.max(0, currentTime - 10));
  };

  const handleSkipForward = () => {
    seekTo(Math.min(duration, currentTime + 10));
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Không xử lý nếu đang focus vào input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case ' ': // Space - Play/Pause
          e.preventDefault();
          togglePlayPause();
          resetHideTimer();
          break;
        
        case 'ArrowLeft': // Left - Tua lùi 10s
          e.preventDefault();
          seekTo(Math.max(0, currentTime - 10));
          resetHideTimer();
          break;
        
        case 'ArrowRight': // Right - Tua tới 10s
          e.preventDefault();
          seekTo(Math.min(duration, currentTime + 10));
          resetHideTimer();
          break;
        
        case 'ArrowUp': // Up - Tăng volume
          e.preventDefault();
          setVolume(Math.min(100, volume + 10));
          resetHideTimer();
          break;
        
        case 'ArrowDown': // Down - Giảm volume
          e.preventDefault();
          setVolume(Math.max(0, volume - 10));
          resetHideTimer();
          break;
        
        case 'f':
        case 'F': // F - Toggle fullscreen
          e.preventDefault();
          toggleFullscreen();
          resetHideTimer();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause, seekTo, setVolume, volume, resetHideTimer, toggleFullscreen]); // Loại bỏ currentTime, duration

  // Listen for fullscreen changes and reset hide timer
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      resetHideTimer();
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [resetHideTimer]);

  // Quality label mapping
  const qualityLabels: Record<string, string> = {
    'highres': '4K+',
    'hd1080': '1080p',
    'hd720': '720p',
    'large': '480p',
    'medium': '360p',
    'small': '240p',
    'tiny': '144p',
    'auto': 'Tự động',
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full bg-black overflow-hidden ${className}`}
      style={{ cursor: showUI ? 'default' : 'none' }}
      onClick={(e) => {
        // Đóng quality menu khi click outside
        if (showQualityMenu && !(e.target as HTMLElement).closest('.quality-menu-container')) {
          setShowQualityMenu(false);
        }
      }}
    >
      {/* YouTube Player Container */}
      <div className="relative w-full h-full">
        <div id={playerId} className="absolute inset-0" />

        {/* Invisible overlay để capture mouse events khi controls ẩn */}
        {!showUI && (
          <div 
            className="absolute inset-0 z-50" 
            style={{ cursor: 'none' }}
          />
        )}

        {/* Error Overlay */}
        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 text-white p-4">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold mb-2">Không thể tải video</h3>
            <p className="text-gray-400 text-center mb-4">
              Video có thể không tồn tại hoặc bị hạn chế
            </p>
            <p className="text-sm text-gray-500">Video ID: {videoId}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg transition-colors"
            >
              Tải lại trang
            </button>
          </div>
        )}

        {/* Loading Overlay */}
        {!isReady && !hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
            <div className="relative h-12 w-12 mb-4">
              <div className="absolute inset-0 rounded-full border-2 border-white/10" />
              <div className="absolute inset-0 rounded-full border-t-2 border-red-500 animate-spin" />
            </div>
            <p className="text-white/60 text-xs tracking-widest uppercase">Đang tải video...</p>
          </div>
        )}

        {/* Skip Intro Button */}
        {showSkipIntro && !externalIdle && (
          <button
            onClick={handleSkipIntro}
            className="absolute bottom-32 right-4 px-4 py-2 border-2 border-white/90 hover:border-white hover:scale-105 text-white font-semibold rounded-full transition-all duration-300 flex items-center gap-2 z-50 animate-[slideInRight_0.3s_ease-out,pulse_2s_ease-in-out_infinite]"
          >
            <FastForward className="w-4 h-4" />
            Bỏ qua giới thiệu
          </button>
        )}

        {/* Next Episode Button */}
        {nextEpisodeNumber && showNextEpisode && !externalIdle && (
          <>
            <Link
              href={`/tv/${id}/${seasonNumber}/${nextEpisodeNumber}/player?src=${selectedSource}`}
              className="absolute bottom-32 right-4 px-4 py-2 border-2 border-primary/90 hover:border-primary hover:scale-105 text-white font-semibold rounded-full transition-all duration-300 flex items-center gap-2 z-50 animate-[slideInRight_0.3s_ease-out,pulse_2s_ease-in-out_infinite]"
            >
              Xem tập tiếp theo
              <ChevronsRight className="w-4 h-4" />
            </Link>
            {onNextEpisode && (
              <button
                onClick={onNextEpisode}
                className="absolute bottom-32 right-4 px-4 py-2 border-2 border-primary/90 hover:border-primary hover:scale-105 text-white font-semibold rounded-full transition-all duration-300 flex items-center gap-2 z-50 animate-[slideInRight_0.3s_ease-out,pulse_2s_ease-in-out_infinite]"
              >
                Xem tập tiếp theo
                <ChevronsRight className="w-4 h-4" />
              </button>
            )}
          </>
        )}

        {/* Custom Controls Overlay */}
        {showControls && isReady && !externalIdle && (
          <AnimatePresence>
            {showUI && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4"
              >
                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="relative h-1 bg-white/30 rounded-full overflow-hidden group/progress">
                    <motion.div
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full pointer-events-none"
                      style={{ width: `${progressPercentage}%` }}
                    />
                    <input
                      type="range"
                      min="0"
                      max={duration || 100}
                      value={currentTime}
                      onChange={handleProgressChange}
                      onMouseDown={handleProgressMouseDown}
                      onTouchStart={handleProgressTouchStart}
                      className="absolute inset-0 w-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-white/80 mt-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Play/Pause */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={togglePlayPause}
                      className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? <Pause className="w-5 h-5" fill="white" /> : <Play className="w-5 h-5" fill="white" />}
                    </motion.button>

                    {/* Skip Backward */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleSkipBackward}
                      className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                      aria-label="Skip backward 10 seconds"
                    >
                      <SkipBack className="w-4 h-4" />
                    </motion.button>

                    {/* Skip Forward */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleSkipForward}
                      className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                      aria-label="Skip forward 10 seconds"
                    >
                      <SkipForward className="w-4 h-4" />
                    </motion.button>

                    {/* Volume */}
                    <div className="flex items-center gap-2 group">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleMute}
                        className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                        aria-label={isMuted ? 'Unmute' : 'Mute'}
                      >
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </motion.button>
                      <div className="w-0 group-hover:w-20 transition-all duration-300 h-1 bg-white/30 rounded-full overflow-hidden relative">
                        <div
                          className="h-full bg-white rounded-full pointer-events-none"
                          style={{ width: `${isMuted ? 0 : volume}%` }}
                        />
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          onMouseDown={handleVolumeMouseDown}
                          onTouchStart={handleVolumeTouchStart}
                          className="absolute inset-0 w-full opacity-0 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Side Controls */}
                  <div className="flex items-center gap-2">
                    {/* Quality Selector */}
                    <div className="relative z-50 quality-menu-container">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowQualityMenu(!showQualityMenu);
                        }}
                        className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                        aria-label="Chất lượng video"
                      >
                        <Settings className="w-4 h-4" />
                      </motion.button>

                      {showQualityMenu && (
                        <div
                          className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-md rounded-lg shadow-2xl overflow-hidden min-w-[140px] z-[100] border border-white/20"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="px-3 py-2 border-b border-white/10 text-xs text-white/60 font-semibold">
                            Chất lượng
                          </div>
                          <div className="py-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPlaybackQuality('default');
                                setShowQualityMenu(false);
                              }}
                              className={`w-full px-3 py-2 text-left text-sm hover:bg-white/10 transition-colors flex items-center justify-between ${
                                currentQuality === 'auto' || currentQuality === 'default' || !currentQuality ? 'text-primary font-semibold' : 'text-white'
                              }`}
                            >
                              <span>Tự động</span>
                              {(currentQuality === 'auto' || currentQuality === 'default' || !currentQuality) && (
                                <span className="text-primary">✓</span>
                              )}
                            </button>

                            {availableQualities.length === 0 && (
                              <div className="px-3 py-2 text-xs text-white/40 italic">
                                Đang tải chất lượng...
                              </div>
                            )}

                            {availableQualities.length > 0 && availableQualities
                              .filter(q => q !== 'auto' && q !== 'default')
                              .map((q) => (
                                <button
                                  key={q}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPlaybackQuality(q);
                                    setShowQualityMenu(false);
                                  }}
                                  className={`w-full px-3 py-2 text-left text-sm hover:bg-white/10 transition-colors flex items-center justify-between ${
                                    currentQuality === q ? 'text-primary font-semibold' : 'text-white'
                                  }`}
                                >
                                  <span>{qualityLabels[q] || q}</span>
                                  {currentQuality === q && <span className="text-primary">✓</span>}
                                </button>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Fullscreen */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={toggleFullscreen}
                      className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                      aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                    >
                      {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

    </div>
  );
};

export default YouTubePlayer;
