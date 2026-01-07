import { useState, useEffect, useRef, useCallback } from 'react';

// Định nghĩa types cho YouTube IFrame API
interface YTPlayerConstructor {
  new (elementId: string, config: YTPlayerConfig): YTPlayer;
}

interface YTNamespace {
  Player: YTPlayerConstructor;
  PlayerState: {
    UNSTARTED: number;
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
    BUFFERING: number;
    CUED: number;
  };
}

declare global {
  interface Window {
    YT: YTNamespace;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YTPlayerConfig {
  height?: string | number;
  width?: string | number;
  videoId: string;
  playerVars?: {
    controls?: 0 | 1;
    disablekb?: 0 | 1;
    rel?: 0 | 1;
    modestbranding?: 0 | 1;
    autoplay?: 0 | 1;
    fs?: 0 | 1;
    playsinline?: 0 | 1;
    start?: number;
    end?: number;
  };
  events?: {
    onReady?: (event: YTPlayerEvent) => void;
    onStateChange?: (event: YTStateChangeEvent) => void;
    onError?: (event: YTErrorEvent) => void;
  };
}

interface YTPlayerEvent {
  target: YTPlayer;
}

interface YTStateChangeEvent {
  data: number;
}

interface YTErrorEvent {
  data: number;
}

interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  setVolume: (volume: number) => void;
  getVolume: () => number;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  getPlayerState: () => number;
  getCurrentTime: () => number;
  getDuration: () => number;
  getVideoUrl: () => string;
  destroy: () => void;
}

export enum PlayerState {
  UNSTARTED = -1,
  ENDED = 0,
  PLAYING = 1,
  PAUSED = 2,
  BUFFERING = 3,
  CUED = 5,
}

interface UseYouTubePlayerOptions {
  videoId: string;
  autoplay?: boolean;
  controls?: boolean;
  onReady?: () => void;
  onStateChange?: (state: number) => void;
  onError?: (error: number) => void;
}

interface UseYouTubePlayerReturn {
  playerRef: React.RefObject<YTPlayer | null>;
  isReady: boolean;
  playerState: number;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  play: () => void;
  pause: () => void;
  stop: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  togglePlayPause: () => void;
}

export const useYouTubePlayer = (
  elementId: string,
  options: UseYouTubePlayerOptions
): UseYouTubePlayerReturn => {
  const playerRef = useRef<YTPlayer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [playerState, setPlayerState] = useState<number>(PlayerState.UNSTARTED);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load YouTube IFrame API
  useEffect(() => {
    let isMounted = true;

    // Kiểm tra xem script đã được load chưa
    const loadYouTubeAPI = () => {
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }
    };

    // Khởi tạo player khi API sẵn sàng
    const initPlayer = () => {
      // Kiểm tra element tồn tại
      const element = document.getElementById(elementId);
      if (!element) {
        console.error(`Element with id "${elementId}" not found`);
        return;
      }

      if (!isMounted) return;

      if (window.YT && window.YT.Player) {
        try {
          playerRef.current = new window.YT.Player(elementId, {
            height: '100%',
            width: '100%',
            videoId: options.videoId,
            playerVars: {
              controls: options.controls ? 1 : 0,
              disablekb: 1,
              rel: 0,
              modestbranding: 1,
              autoplay: options.autoplay ? 1 : 0,
              fs: 1,
              playsinline: 1,
            },
            events: {
              onReady: (event: YTPlayerEvent) => {
                if (!isMounted) return;
                setIsReady(true);
                setDuration(event.target.getDuration());
                setVolumeState(event.target.getVolume());
                setIsMuted(event.target.isMuted());
                options.onReady?.();
              },
              onStateChange: (event: YTStateChangeEvent) => {
                if (!isMounted) return;
                setPlayerState(event.data);
                options.onStateChange?.(event.data);

                // Update duration khi video thay đổi state
                if (playerRef.current) {
                  setDuration(playerRef.current.getDuration());
                }
              },
              onError: (event: YTErrorEvent) => {
                if (!isMounted) return;
                console.error('YouTube Player Error:', event.data);
                setIsReady(true); // Set ready để ẩn loading
                options.onError?.(event.data);
              },
            },
          });
        } catch (error) {
          console.error('Error initializing YouTube Player:', error);
          setIsReady(true); // Set ready để ẩn loading ngay cả khi lỗi
        }
      }
    };

    loadYouTubeAPI();

    // Đợi API load xong
    if (window.YT && window.YT.Player) {
      // API đã có sẵn
      const timer = setTimeout(() => {
        initPlayer();
      }, 100); // Đợi một chút để đảm bảo DOM đã ready
      return () => {
        isMounted = false;
        clearTimeout(timer);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        if (playerRef.current) {
          playerRef.current.destroy();
        }
      };
    } else {
      // Chờ API load
      window.onYouTubeIframeAPIReady = () => {
        if (isMounted) {
          setTimeout(initPlayer, 100);
        }
      };
    }

    return () => {
      isMounted = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (error) {
          console.error('Error destroying player:', error);
        }
      }
    };
  }, [elementId, options.videoId, options.autoplay, options.controls]);

  // Update current time khi video đang phát
  useEffect(() => {
    if (playerState === PlayerState.PLAYING) {
      intervalRef.current = setInterval(() => {
        if (playerRef.current) {
          setCurrentTime(playerRef.current.getCurrentTime());
        }
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [playerState]);

  // Control methods
  const play = useCallback(() => {
    if (playerRef.current && isReady) {
      playerRef.current.playVideo();
    }
  }, [isReady]);

  const pause = useCallback(() => {
    if (playerRef.current && isReady) {
      playerRef.current.pauseVideo();
    }
  }, [isReady]);

  const stop = useCallback(() => {
    if (playerRef.current && isReady) {
      playerRef.current.stopVideo();
    }
  }, [isReady]);

  const seekTo = useCallback(
    (seconds: number) => {
      if (playerRef.current && isReady) {
        playerRef.current.seekTo(seconds, true);
        setCurrentTime(seconds);
      }
    },
    [isReady]
  );

  const setVolume = useCallback(
    (vol: number) => {
      if (playerRef.current && isReady) {
        const clampedVolume = Math.max(0, Math.min(100, vol));
        playerRef.current.setVolume(clampedVolume);
        setVolumeState(clampedVolume);
      }
    },
    [isReady]
  );

  const toggleMute = useCallback(() => {
    if (playerRef.current && isReady) {
      if (playerRef.current.isMuted()) {
        playerRef.current.unMute();
        setIsMuted(false);
      } else {
        playerRef.current.mute();
        setIsMuted(true);
      }
    }
  }, [isReady]);

  const togglePlayPause = useCallback(() => {
    if (playerState === PlayerState.PLAYING) {
      pause();
    } else {
      play();
    }
  }, [playerState, play, pause]);

  return {
    playerRef,
    isReady,
    playerState,
    currentTime,
    duration,
    volume,
    isMuted,
    play,
    pause,
    stop,
    seekTo,
    setVolume,
    toggleMute,
    togglePlayPause,
  };
};
