'use client';

import React, { useState } from 'react';
import { useYouTubePlayer, PlayerState } from '@/hooks/useYouTubePlayer';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Maximize,
  Minimize,
} from 'lucide-react';

interface YouTubePlayerProps {
  videoId: string;
  autoplay?: boolean;
  showControls?: boolean;
  className?: string;
  onReady?: () => void;
  onStateChange?: (state: number) => void;
  onError?: (error: number) => void;
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
}) => {
  const playerId = `youtube-player-${videoId}`;
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const {
    isReady,
    playerState,
    currentTime,
    duration,
    volume,
    isMuted,
    play,
    pause,
    seekTo,
    setVolume,
    toggleMute,
    togglePlayPause,
  } = useYouTubePlayer(playerId, {
    videoId,
    autoplay,
    controls: false,
    onReady,
    onStateChange,
    onError,
  });

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    seekTo(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
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

  const isPlaying = playerState === PlayerState.PLAYING;
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={`relative w-full bg-black rounded-lg overflow-hidden ${className}`}
    >
      {/* YouTube Player Container */}
      <div className="relative aspect-video w-full">
        <div id={playerId} className="absolute inset-0" />

        {/* Loading Overlay */}
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Custom Controls Overlay */}
        {showControls && isReady && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4">
            {/* Progress Bar */}
            <div className="mb-3">
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleProgressChange}
                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider-thumb"
                style={{
                  background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${progressPercentage}%, #4b5563 ${progressPercentage}%, #4b5563 100%)`,
                }}
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
                  className="p-2 rounded-full bg-primary hover:bg-primary/80 transition-colors"
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
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  aria-label="Skip backward 10 seconds"
                >
                  <SkipBack className="w-5 h-5 text-white" />
                </button>

                {/* Skip Forward */}
                <button
                  onClick={handleSkipForward}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  aria-label="Skip forward 10 seconds"
                >
                  <SkipForward className="w-5 h-5 text-white" />
                </button>

                {/* Volume Controls */}
                <div className="flex items-center gap-2 group">
                  <button
                    onClick={toggleMute}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
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
                    className="w-0 group-hover:w-20 transition-all duration-300 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${volume}%, #4b5563 ${volume}%, #4b5563 100%)`,
                    }}
                  />
                </div>
              </div>

              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? (
                  <Minimize className="w-5 h-5 text-white" />
                ) : (
                  <Maximize className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Player State Indicator (for debugging) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
          State: {PlayerState[playerState] || playerState}
        </div>
      )}
    </div>
  );
};

export default YouTubePlayer;
