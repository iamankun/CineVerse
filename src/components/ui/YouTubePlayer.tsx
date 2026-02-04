'use client';

import React, { useState, useId } from 'react';
import Link from "next/link";
import { useYouTubePlayer, PlayerState } from '@/hooks/useYouTubePlayer';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Settings,
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
    
    // Chỉ auto-hide khi đang playing
    if (isReady && currentTime > 0 && currentTime < duration) {
      hideTimerRef.current = setTimeout(() => {
        setShowUI(false);
      }, 3000);
    }
  }, [isReady, currentTime, duration, showQualityMenu]);

  // Mouse movement và click hiện controls
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleInteraction = () => {
      resetHideTimer();
    };

    container.addEventListener('mousemove', handleInteraction);
    container.addEventListener('click', handleInteraction);
    
    // Initial timer
    resetHideTimer();

    return () => {
      container.removeEventListener('mousemove', handleInteraction);
      container.removeEventListener('click', handleInteraction);
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, [resetHideTimer]);

  // Khi pause, luôn hiện controls
  React.useEffect(() => {
    if (isReady && currentTime > 0 && currentTime < duration) {
      setShowUI(true);
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    }
  }, [isReady, currentTime, duration]);

  // Check intro/outro timing
  React.useEffect(() => {
    if (!isReady) return;

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
  }, [currentTime, intro, outro, isReady]);

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
  }, [togglePlayPause, seekTo, setVolume, currentTime, duration, volume, resetHideTimer, toggleFullscreen]);

  // Listen for fullscreen changes and reset hide timer
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      resetHideTimer();
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [resetHideTimer]);

  const isPlaying = playerState === PlayerState.PLAYING;
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

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
      onMouseEnter={() => setShowUI(true)}
      onMouseMove={() => resetHideTimer()}
      onClick={(e) => {
        // Đóng quality menu khi click outside
        if (showQualityMenu && !(e.target as HTMLElement).closest('.quality-menu-container')) {
          setShowQualityMenu(false);
        }
        resetHideTimer();
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
            onMouseMove={() => resetHideTimer()}
            onClick={() => resetHideTimer()}
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
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
            <p className="text-white text-sm">Đang tải video...</p>
          </div>
        )}

        {/* Skip Intro Button */}
        {showSkipIntro && (
          <button
            onClick={handleSkipIntro}
            className="absolute bottom-32 right-4 px-4 py-2 border-2 border-white/90 hover:border-white hover:scale-105 text-white font-semibold rounded-full transition-all duration-300 flex items-center gap-2 z-50 animate-[slideInRight_0.3s_ease-out,pulse_2s_ease-in-out_infinite]"
          >
            <FastForward className="w-4 h-4" />
            Bỏ qua giới thiệu
          </button>
        )}

        {/* Next Episode Button */}
        {nextEpisodeNumber && showNextEpisode && (
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

        {/* Custom Controls Overlay with Glass Effect */}
        {showControls && isReady && showUI && (
          <div className="absolute bottom-0 left-0 right-0 glass-morphism p-4 transition-all duration-300">
            {/* Progress Bar */}
            <div className="mb-3">
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleProgressChange}
                onMouseDown={handleProgressMouseDown}
                onTouchStart={handleProgressTouchStart}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer slider-thumb progress-bar glass-slider"
                style={{
                  '--progress': `${progressPercentage}%`
                } as React.CSSProperties}
              />
              <div className="flex justify-between text-xs text-white/80 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Play/Pause Button */}
                <button
                  onClick={togglePlayPause}
                  className="p-3 glass-button control-button"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 text-white" fill="white" />
                  ) : (
                    <Play className="w-6 h-6 text-white" fill="white" />
                  )}
                </button>

                {/* Skip Backward */}
                <button
                  onClick={handleSkipBackward}
                  className="p-2 glass-button control-button"
                  aria-label="Skip backward 10 seconds"
                >
                  <SkipBack className="w-5 h-5 text-white" />
                </button>

                {/* Skip Forward */}
                <button
                  onClick={handleSkipForward}
                  className="p-2 glass-button control-button"
                  aria-label="Skip forward 10 seconds"
                >
                  <SkipForward className="w-5 h-5 text-white" />
                </button>

                {/* Volume Controls */}
                <div className="flex items-center gap-2 group">
                  <button
                    onClick={toggleMute}
                    className="p-2 glass-button control-button"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5 text-white" />
                    ) : (
                      <Volume2 className="w-5 h-5 text-white" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    onMouseDown={handleVolumeMouseDown}
                    onTouchStart={handleVolumeTouchStart}
                    className="w-0 group-hover:w-28 transition-all duration-300 h-2 rounded-lg appearance-none cursor-pointer slider-thumb volume-slider glass-slider"
                    style={{
                      '--progress': `${volume}%`
                    } as React.CSSProperties}
                  />
                </div>
              </div>

              {/* Right Side Controls */}
              <div className="flex items-center gap-2">
                {/* Quality Selector */}
                <div className="relative z-50 quality-menu-container">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowQualityMenu(!showQualityMenu);
                    }}
                    className="p-2 glass-button control-button"
                    aria-label="Chất lượng video"
                  >
                    <Settings className="w-5 h-5 text-white/80 hover:text-white transition-colors" />
                  </button>

                  {/* Quality Menu Dropdown */}
                  {showQualityMenu && (
                    <div 
                      className="absolute bottom-full right-0 mb-2 glass-morphism rounded-lg shadow-2xl overflow-hidden min-w-[140px] z-[100]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="px-3 py-2 border-b border-white/10 text-xs text-white/60 font-semibold">
                        Chất lượng
                      </div>
                      <div className="py-1">
                        {/* Auto quality option */}
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
                        
                        {/* Debug: Show available qualities count */}
                        {availableQualities.length === 0 && (
                          <div className="px-3 py-2 text-xs text-white/40 italic">
                            Đang tải chất lượng...
                          </div>
                        )}
                        
                        {/* Available qualities - Filter out 'auto' and 'default' */}
                        {availableQualities.length > 0 && availableQualities
                          .filter(quality => quality !== 'auto' && quality !== 'default')
                          .map((quality) => (
                          <button
                            key={quality}
                            onClick={(e) => {
                              e.stopPropagation();
                              setPlaybackQuality(quality);
                              setShowQualityMenu(false);
                            }}
                            className={`w-full px-3 py-2 text-left text-sm hover:bg-white/10 transition-colors flex items-center justify-between ${
                              currentQuality === quality ? 'text-primary font-semibold' : 'text-white'
                            }`}
                          >
                            <span>{qualityLabels[quality] || quality}</span>
                            {currentQuality === quality && (
                              <span className="text-primary">✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Fullscreen Button - Temporarily Hidden */}
                {/* <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                >
                  {isFullscreen ? (
                    <Minimize className="w-5 h-5 text-white" />
                  ) : (
                    <Maximize className="w-5 h-5 text-white" />
                  )}
                </button> */}
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default YouTubePlayer;
