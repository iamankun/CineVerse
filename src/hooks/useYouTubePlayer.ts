import { useState, useEffect, useRef, useCallback } from 'react';

// Định nghĩa types cho YouTube IFrame API
declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YT {
  Player: new (elementId: string, config: YTPlayerConfig) => YTPlayer;
  PlayerState: {
    UNSTARTED: number;
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
    BUFFERING: number;
    CUED: number;
  };
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
    onReady?: (event: { target: YTPlayer }) => void;
    onStateChange?: (event: { data: number }) => void;
    onError?: (event: { data: number }) => void;
  };
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
    // Kiểm tra xem script đã được load chưa
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    // Khởi tạo player khi API sẵn sàng
    const initPlayer = () => {
      if (window.YT && window.YT.Player) {
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
            onReady: (event) => {
              setIsReady(true);
              setDuration(event.target.getDuration());
              setVolumeState(event.target.getVolume());
              setIsMuted(event.target.isMuted());
              options.onReady?.();
            },
            onStateChange: (event) => {
              setPlayerState(event.data);
              options.onStateChange?.(event.data);

              // Update duration khi video thay đổi state
              if (playerRef.current) {
                setDuration(playerRef.current.getDuration());
              }
            },
            onError: (event) => {
              options.onError?.(event.data);
            },
          },
        });
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [elementId, options.videoId]);

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
