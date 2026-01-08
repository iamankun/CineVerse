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
    showinfo?: 0 | 1;
    iv_load_policy?: 1 | 3;
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
  getAvailableQualityLevels: () => string[];
  getPlaybackQuality: () => string;
  setPlaybackQuality: (quality: string) => void;
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
  availableQualities: string[];
  currentQuality: string;
  play: () => void;
  pause: () => void;
  stop: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  togglePlayPause: () => void;
  setPlaybackQuality: (quality: string) => void;
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
  const [availableQualities, setAvailableQualities] = useState<string[]>([]);
  const [currentQuality, setCurrentQuality] = useState<string>('auto');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load YouTube IFrame API
  useEffect(() => {
    let isMounted = true;
    let initTimer: NodeJS.Timeout;
    let retryCount = 0;
    const MAX_RETRIES = 50; // Max 5 giây (50 * 100ms)

    // Khởi tạo player khi API sẵn sàng
    const initPlayer = () => {
      if (!isMounted) return;

      // Kiểm tra element tồn tại
      const element = document.getElementById(elementId);
      if (!element) {
        retryCount++;
        if (retryCount < MAX_RETRIES) {
          console.warn(`Element with id "${elementId}" not found, retry ${retryCount}/${MAX_RETRIES}...`);
          initTimer = setTimeout(initPlayer, 100);
        } else {
          console.error(`Element with id "${elementId}" not found after ${MAX_RETRIES} retries`);
        }
        return;
      }

      if (window.YT && window.YT.Player) {
        try {
          console.log(`Initializing YouTube Player with video: ${options.videoId}`);
          playerRef.current = new window.YT.Player(elementId, {
            height: '100%',
            width: '100%',
            videoId: options.videoId,
            playerVars: {
              controls: 0, // Luôn ẩn YouTube controls, chỉ dùng custom controls
              disablekb: 1,
              rel: 0, // Không hiển thị video liên quan
              modestbranding: 1, // Ẩn logo YouTube
              autoplay: options.autoplay ? 1 : 0,
              fs: 1, // Cho phép fullscreen
              playsinline: 1,
              showinfo: 0, // Ẩn title (deprecated nhưng vẫn hoạt động)
              iv_load_policy: 3, // Ẩn annotations
            },
            events: {
              onReady: (event: YTPlayerEvent) => {
                if (!isMounted) return;
                console.log('YouTube Player ready!');
                setIsReady(true);
                setDuration(event.target.getDuration());
                setVolumeState(event.target.getVolume());
                setIsMuted(event.target.isMuted());

                // Get available qualities
                const qualities = event.target.getAvailableQualityLevels();
                console.log('Available quality levels:', qualities);
                setAvailableQualities(qualities);

                // Ưu tiên chọn chất lượng cao nhất nếu có
                if (qualities && qualities.length > 0) {
                  // Bỏ qua 'auto' và 'default', chọn chất lượng cao nhất thực tế
                  const filtered = qualities.filter(q => q !== 'auto' && q !== 'default');
                  if (filtered.length > 0) {
                    event.target.setPlaybackQuality(filtered[0]);
                    setCurrentQuality(filtered[0]);
                  } else {
                    setCurrentQuality(event.target.getPlaybackQuality());
                  }
                } else {
                  setCurrentQuality(event.target.getPlaybackQuality());
                }

                options.onReady?.();
              },
              onStateChange: (event: YTStateChangeEvent) => {
                if (!isMounted) return;
                setPlayerState(event.data);
                options.onStateChange?.(event.data);

                // Update duration khi video thay đổi state
                if (playerRef.current) {
                  setDuration(playerRef.current.getDuration());

                  // Update quality levels khi video state changes (có thể có thêm quality sau khi load)
                  const qualities = playerRef.current.getAvailableQualityLevels();
                  if (qualities.length > 0) {
                    setAvailableQualities(qualities);
                    // Ưu tiên chọn chất lượng cao nhất nếu có
                    const filtered = qualities.filter(q => q !== 'auto' && q !== 'default');
                    if (filtered.length > 0) {
                      playerRef.current.setPlaybackQuality(filtered[0]);
                      setCurrentQuality(filtered[0]);
                    } else {
                      setCurrentQuality(playerRef.current.getPlaybackQuality());
                    }
                  }
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

    // Load API nếu chưa có
    const loadAPI = () => {
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        console.log('Loading YouTube IFrame API...');
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      } else {
        console.log('YouTube IFrame API script already exists');
      }
    };

    // Kiểm tra và khởi tạo
    if (window.YT && window.YT.Player) {
      // API đã sẵn sàng, init ngay
      console.log('YouTube API already loaded, initializing player...');
      initTimer = setTimeout(initPlayer, 100);
    } else {
      // Load API và đợi callback
      console.log('YouTube API not loaded yet, loading...');
      loadAPI();
      window.onYouTubeIframeAPIReady = () => {
        console.log('YouTube API ready callback triggered');
        if (isMounted) {
          initTimer = setTimeout(initPlayer, 100);
        }
      };
    }

    return () => {
      isMounted = false;
      if (initTimer) {
        clearTimeout(initTimer);
      }
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

  const setPlaybackQuality = useCallback(
    (quality: string) => {
      if (playerRef.current && isReady) {
        playerRef.current.setPlaybackQuality(quality);
        setCurrentQuality(quality);
      }
    },
    [isReady]
  );

  return {
    playerRef,
    isReady,
    playerState,
    currentTime,
    duration,
    volume,
    isMuted,
    availableQualities,
    currentQuality,
    play,
    pause,
    stop,
    seekTo,
    setVolume,
    toggleMute,
    togglePlayPause,
    setPlaybackQuality,
  };
};
