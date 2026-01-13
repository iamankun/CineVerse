import { ADS_WARNING_STORAGE_KEY, SpacingClasses } from "@/utils/constants";
import { siteConfig } from "@/config/site";
import BrandLogo from "@/components/ui/other/BrandLogo";
import useBreakpoints from "@/hooks/useBreakpoints";
import { cn } from "@/utils/helpers";
import { mutateMovieTitle } from "@/utils/movies";
import { getMoviePlayers } from "@/utils/players";
import { Card, Skeleton, addToast } from "@heroui/react";
import { useDisclosure, useDocumentTitle, useIdle, useLocalStorage } from "@mantine/hooks";
import dynamic from "next/dynamic";
import { parseAsInteger, useQueryState } from "nuqs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MovieDetails } from "tmdb-ts/dist/types/movies";
import { useVidlinkPlayer } from "@/hooks/useVidlinkPlayer";
import { useMovieLogo } from "@/hooks/useMovieLogo";
import { PlayersProps } from "@/types";
import { playerAdBlocker } from "@/utils/player-ad-blocker";
import { usePinchToZoom } from "@/hooks/usePinchToZoom";
import { getMovieReleaseDates } from "@/api/tmdb";
import { getVietnamRatingFromReleaseDates } from "@/utils/rating-converter";
import { useGestureContext } from "@/contexts/GestureContext";
import YouTubePlayer from "@/components/ui/YouTubePlayer";
import "@/styles/youtube-player.css";
const AdsWarning = dynamic(() => import("@/components/ui/overlay/AdsWarning"));
const AgeRating = dynamic(() => import("@/components/ui/overlay/AgeRating"));
const WatchingWithBrand = dynamic(() => import("@/components/ui/overlay/WatchingWithBrand"));
const MoviePlayerHeader = dynamic(() => import("./Header"));
const ControlMenu = dynamic(() => import("./ControlMenu"));
const MoviePlayerSourceSelection = dynamic(() => import("./SourceSelection"));
const GestureDetector = dynamic(() => import("@/components/ui/gesture/GestureDetector"), { ssr: false });

/**
 * Extract YouTube video ID from various URL formats
 */
function extractYouTubeVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    
    // youtube.com/embed/VIDEO_ID
    if (urlObj.pathname.startsWith('/embed/')) {
      const videoId = urlObj.pathname.split('/embed/')[1]?.split('?')[0];
      if (videoId) return videoId;
    }
    
    // youtube.com/watch?v=VIDEO_ID
    if (urlObj.pathname === '/watch') {
      const videoId = urlObj.searchParams.get('v');
      if (videoId) return videoId;
    }
    
    // youtu.be/VIDEO_ID
    if (urlObj.hostname === 'youtu.be') {
      const videoId = urlObj.pathname.slice(1);
      if (videoId) return videoId;
    }
    
    return null;
  } catch {
    return null;
  }
}

interface MoviePlayerProps {
  movie: MovieDetails;
  startAt?: number;
}

const MoviePlayer: React.FC<MoviePlayerProps> = ({ movie, startAt }) => {
  const [seen] = useLocalStorage<boolean>({
    key: ADS_WARNING_STORAGE_KEY,
    getInitialValueInEffect: false,
  });

  const [players, setPlayers] = useState<PlayersProps[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [movieRating, setMovieRating] = useState<{ rating: string; description: string } | null>(null);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [showLoading, setShowLoading] = useState(true);
  const { enabled: gestureEnabled, toggle: toggleGesture } = useGestureContext();
  const logoPath = useMovieLogo(movie.id, "movie", movie.original_language);
  
  // Ẩn loading sau 5 giây
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Sửa lỗi đăng nhập
  useEffect(() => {
    console.log(`🎭 Sửa lỗi trình đa phương tiện:`, {
      id: movie.id,
      movieRating,
      logoPath,
      movieOriginalLanguage: movie.original_language,
      seen,
    });
  }, [movie.id, movieRating, logoPath, movie.original_language, seen]);
  
  const cardRef = useRef<HTMLDivElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const title = mutateMovieTitle(movie);
  const idle = useIdle(3000);
  const { mobile } = useBreakpoints();
  const zoom = usePinchToZoom(iframeRef, { enabled: mobile, minZoom: 1, maxZoom: 2 });
  const zoomRef = useRef<any>(null);
    // Reset zoom về 1 khi orientation hoặc fullscreen thay đổi (nếu hook hỗ trợ setZoom)
    useEffect(() => {
      if (!zoomRef.current) return;
      const handleResetZoom = () => {
        if (typeof zoomRef.current === 'function') zoomRef.current(1);
      };
      window.addEventListener('orientationchange', handleResetZoom);
      document.addEventListener('fullscreenchange', handleResetZoom);
      return () => {
        window.removeEventListener('orientationchange', handleResetZoom);
        document.removeEventListener('fullscreenchange', handleResetZoom);
      };
    }, []);
  const [opened, handlers] = useDisclosure(false);
  const [selectedSource, setSelectedSource] = useQueryState<number>(
    "src",
    parseAsInteger.withDefault(0),
  );
  const [reloadKey, setReloadKey] = useState<number>(0);

  // Gesture control callbacks
  const gestureCallbacks = useMemo(() => ({
    onTogglePlay: () => {
      // Try to send message to iframe to toggle play
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({ action: 'togglePlay' }, '*');
      }
      addToast({ title: '⏯️ Play/Pause', description: 'Chuyển đổi phát/dừng', color: 'primary' });
    },
    onPlay: () => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({ action: 'play' }, '*');
      }
      addToast({ title: '▶️ Play', description: 'Phát video', color: 'success' });
    },
    onPause: () => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({ action: 'pause' }, '*');
      }
      addToast({ title: '⏸️ Pause', description: 'Tạm dừng video', color: 'warning' });
    },
    onVolumeUp: () => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({ action: 'volumeUp' }, '*');
      }
      addToast({ title: '🔊 Volume Up', description: 'Tăng âm lượng', color: 'primary' });
    },
    onVolumeDown: () => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({ action: 'volumeDown' }, '*');
      }
      addToast({ title: '🔉 Volume Down', description: 'Giảm âm lượng', color: 'primary' });
    },
    onForward: () => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({ action: 'forward', seconds: 10 }, '*');
      }
      addToast({ title: '⏩ Forward', description: 'Tua tiến 10 giây', color: 'primary' });
    },
    onRewind: () => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({ action: 'rewind', seconds: 10 }, '*');
      }
      addToast({ title: '⏪ Rewind', description: 'Tua lùi 10 giây', color: 'primary' });
    },
    onToggleFullscreen: () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        document.documentElement.requestFullscreen();
      }
      addToast({ 
        title: 'Toàn màn hình', 
        description: 'Chuyển đổi toàn màn hình', 
        color: 'secondary',
        icon: document.fullscreenElement ? 'MdFullscreenExit' : 'MdFullscreen'
      });
    },
    onReload: () => {
      // Force reload iframe bằng cách tăng reloadKey
      setReloadKey(prev => prev + 1);
      addToast({ 
        title: 'Tải lại trình phát', 
        description: 'Đã làm mới trình phát', 
        color: 'primary' 
      });
    },
    onFavorite: () => {
      addToast({ title: '❤️ Yêu thích', description: `Đã thêm ${title} vào danh sách yêu thích`, color: 'danger' });
    },
  }), [isFullscreen, title]);

  useVidlinkPlayer({ saveHistory: true });
  useDocumentTitle(`Bạn đang xem ${title} | ${siteConfig.name}`);

  // Initialize ad blocker with iframe reference
  useEffect(() => {
    // Initialize immediately
    playerAdBlocker.init();

    // Attach to iframe when ready
    const iframe = iframeRef.current;
    if (iframe) {
      playerAdBlocker.init(iframe);
    }

    return () => {
      playerAdBlocker.destroy();
    };
  }, []);

  // Suppress react-remove-scroll errors (library bug with modal cleanup)
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args: any[]) => {
      if (
        typeof args[0] === 'string' &&
        (args[0].includes("Failed to execute 'contains' on 'Node'") ||
         args[0].includes("[@mantine/hooks] use-fullscreen"))
      ) {
        // Suppress these specific errors from libraries
        return;
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  useEffect(() => {
    console.log(`🎬 Fetching players for movie ID: ${movie.id}`);
    let isMounted = true;

    getMoviePlayers(movie.id, startAt).then((fetchedPlayers) => {
      if (isMounted) {
        console.log(`✅ Players fetched:`, fetchedPlayers.length, fetchedPlayers);
        // Nếu có nguồn với provider vidsrc và url rỗng, tự động thay thế bằng VidSrc external
        const processedPlayers = fetchedPlayers.map(player => {
          if (player.provider?.toLowerCase() === 'vidsrc' && !player.source) {
            console.log(`🔄 Chuyển đổi provider vidsrc sang VidSrc external`);
            return {
              title: "VidSrc",
              source: `https://vidsrc-embed.ru/embed/movie?tmdb=${movie.id}&ds_lang=vi&autoplay=1` as `https://${string}`,
              recommended: player.recommended,
              fast: true,
              ads: false,
              provider: 'vidsrc-external',
            };
          }
          return player;
        });
        
        setPlayers(processedPlayers);
        if (processedPlayers.length === 1) {
          setSelectedSource(0);
        } else if (!selectedSource || selectedSource < 0 || selectedSource >= processedPlayers.length) {
          setSelectedSource(0);
        }
      }
    }).catch((err) => {
      if (isMounted) {
        console.error(`❌ Error fetching players:`, err);
      }
    });

    // Hàm lấy rating từ TMDB và convert sang Việt Nam
    const fetchTMDBRating = async () => {
      try {
        console.log(`🌐 Đang lấy rating từ TMDB cho movie ID: ${movie.id}`);
        const releaseDates = await getMovieReleaseDates(movie.id);
        const vietnamRating = getVietnamRatingFromReleaseDates(releaseDates);
        
        if (vietnamRating && isMounted) {
          console.log(`✅ TMDB Rating converted:`, vietnamRating);
          setMovieRating(vietnamRating);
        } else {
          console.log(`⚠️ Không tìm thấy rating phù hợp từ TMDB`);
        }
      } catch (err) {
        console.error(`❌ Lỗi khi lấy rating từ TMDB:`, err);
      }
    };

    console.log(`🎬 Đang lấy đánh giá phim cho ID: ${movie.id}`);
    fetch(`/sources/Movie/${movie.id}.json`)
      .then(res => {
        console.log(`📡 Điện ảnh đang lấy tình trạng:`, res.ok, res.status);
        return res.ok ? res.json() : null;
      })
      .then(data => {
        console.log(`📊 Dữ liệu JSON phim:`, data?.metadata?.["movie-rating"]);
        if (data?.metadata?.["movie-rating"]) {
          const rating = data.metadata["movie-rating"];
          // Fetch rating descriptions
          fetch("/sources/movie-rating.json")
            .then(res => res.json())
            .then(ratingData => {
              const description = ratingData["Movie-Rating"][rating];
              console.log(`✅ Đang tải đánh giá phim (local):`, rating, description);
              if (description && isMounted) {
                setMovieRating({ rating, description });
              }
            })
            .catch((err) => {
              console.error(`❌ Không tải được mô tả đánh giá phim:`, err);
              // Fallback sang TMDB nếu local không có description
              fetchTMDBRating();
            });
        } else {
          // Không có local rating → lấy từ TMDB
          console.log(`📡 Không có local rating, fallback sang TMDB...`);
          fetchTMDBRating();
        }
      })
      .catch((err) => {
        console.error(`❌ Không tải được phim từ local:`, err);
        // Fallback sang TMDB nếu local file không tồn tại
        fetchTMDBRating();
      });

    return () => {
      isMounted = false;
    };
  }, [movie.id, startAt]);

  // Listen for video time updates from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Accept messages from player domains
      if (event.data && typeof event.data === 'object') {
        // Custom videoTime format
        if (event.data.type === 'videoTime' && typeof event.data.time === 'number') {
          setVideoCurrentTime(event.data.time);
          return;
        }
        
        // Standard video player postMessage formats
        if (event.data.currentTime !== undefined) {
          setVideoCurrentTime(event.data.currentTime);
          return;
        }

        // YouTube iframe API format
        if (event.data.event === 'infoDelivery' && event.data.info?.currentTime !== undefined) {
          setVideoCurrentTime(Math.floor(event.data.info.currentTime));
          return;
        }

        // Dailymotion iframe API format
        if (event.data.event === 'timeupdate' && event.data.time !== undefined) {
          setVideoCurrentTime(Math.floor(event.data.time));
          return;
        }

        // VidLink player format
        if (event.data.type === 'PLAYER_EVENT' && event.data.data?.currentTime !== undefined) {
          setVideoCurrentTime(Math.floor(event.data.data.currentTime));
          return;
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Fallback: estimate video time if no postMessage (tracks real playback time)
  useEffect(() => {
    let startTime = Date.now();
    let accumulatedTime = 0;
    let wasIdle = false;

    const interval = setInterval(() => {
      // Only accumulate time when video is likely playing (not idle)
      if (!idle) {
        if (wasIdle) {
          // Just became active again
          startTime = Date.now();
          wasIdle = false;
        }
        const elapsed = (Date.now() - startTime) / 1000;
        accumulatedTime += elapsed;
        setVideoCurrentTime(Math.floor(accumulatedTime));
        startTime = Date.now();
      } else {
        wasIdle = true;
      }
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [idle]);

  // Detect fullscreen changes and sync Card or iframe fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenElement = document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement;

      // Helper: check if node is or is descendant of target
      const isOrContains = (target: Element | null, node: Element | null) => {
        if (!target || !node) return false;
        return target === node || target.contains(node);
      };

      if (!fullscreenElement) {
        setIsFullscreen(false);
        return;
      }
      // Card or any child
      if (isOrContains(cardRef.current, fullscreenElement)) {
        setIsFullscreen(true);
        return;
      }
      // iframe or any child
      if (isOrContains(iframeRef.current, fullscreenElement)) {
        setIsFullscreen(true);
        return;
      }
      // fallback: still in fullscreen, but not our elements
      setIsFullscreen(false);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Khôi phục fullscreen sau khi reload
  useEffect(() => {
    const shouldRestore = sessionStorage.getItem('restoreFullscreen');
    if (shouldRestore === 'true') {
      sessionStorage.removeItem('restoreFullscreen');
      // Đợi một chút để DOM render xong
      setTimeout(() => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(console.warn);
        }
      }, 500);
    }
  }, []);

  // Handle orientation change on mobile - auto enter fullscreen on landscape
  useEffect(() => {
    if (!mobile) return;

    const handleOrientationChange = () => {
      // Check if landscape mode
      const isLandscape = window.matchMedia('(orientation: landscape)').matches;
      
      if (isLandscape && cardRef.current && !isFullscreen) {
        // Enter fullscreen when rotating to landscape
        const requestFullscreen = cardRef.current.requestFullscreen ||
          (cardRef.current as any).webkitRequestFullscreen ||
          (cardRef.current as any).mozRequestFullScreen ||
          (cardRef.current as any).msRequestFullscreen;

        if (requestFullscreen) {
          requestFullscreen.call(cardRef.current).catch((err: Error) => {
            console.warn('Failed to enter fullscreen on orientation change:', err);
          });
        }
      }
    };

    // Listen for orientation changes
    window.addEventListener('orientationchange', handleOrientationChange);
    window.matchMedia('(orientation: landscape)').addEventListener('change', handleOrientationChange);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.matchMedia('(orientation: landscape)').removeEventListener('change', handleOrientationChange);
    };
  }, [mobile, isFullscreen]);

  // Make card fullscreen with keyboard shortcut
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        if (cardRef.current) {
          if (!isFullscreen) {
            const requestFullscreen = cardRef.current.requestFullscreen ||
              (cardRef.current as any).webkitRequestFullscreen ||
              (cardRef.current as any).mozRequestFullScreen ||
              (cardRef.current as any).msRequestFullscreen;

            if (requestFullscreen) {
              requestFullscreen.call(cardRef.current).catch((err: Error) => {
                console.warn('Failed to enter fullscreen:', err);
              });
            }
          } else {
            const exitFullscreen = document.exitFullscreen ||
              (document as any).webkitExitFullscreen ||
              (document as any).mozCancelFullScreen ||
              (document as any).msExitFullscreen;

            if (exitFullscreen) {
              exitFullscreen.call(document).catch((err: Error) => {
                console.warn('Failed to exit fullscreen:', err);
              });
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFullscreen]);

  const PLAYER = useMemo(() => players[selectedSource] || players[0], [players, selectedSource]);

  // Detect if current player is YouTube
  const youtubeVideoId = useMemo(() => {
    if (!PLAYER?.source) return null;
    
    // Check if provider explicitly set to youtube
    if (PLAYER.provider?.toLowerCase() === 'youtube') {
      return extractYouTubeVideoId(PLAYER.source);
    }
    
    // Also check if URL contains youtube.com or youtu.be
    if (PLAYER.source.includes('youtube.com') || PLAYER.source.includes('youtu.be')) {
      return extractYouTubeVideoId(PLAYER.source);
    }
    
    return null;
  }, [PLAYER]);

  // Debug log
  useEffect(() => {
    console.log(`🎯 Current PLAYER:`, PLAYER, `| Players count: ${players.length} | Selected: ${selectedSource}`);
    console.log(`📺 YouTube Video ID:`, youtubeVideoId);
  }, [PLAYER, players, selectedSource, youtubeVideoId]);

  // Show loading while fetching players or for 5 seconds
  if (!PLAYER || showLoading) {
    console.log(`⏳ No PLAYER found or showing loading...`);
    return (
      <div className="relative w-full h-screen bg-black overflow-hidden">
        <div className="absolute-center">
          <div className="text-center flex flex-col items-center gap-4">
            {movieRating && (
              <AgeRating 
                rating={movieRating.rating} 
                ratingDescription={movieRating.description} 
                isLoading={true}
              />
            )}
            <div className="text-sm text-foreground/60" style={{ textShadow: '0 1px 4px rgba(0, 0, 0, 0.6)' }}>CineVerse - Vũ Trụ Điện Ảnh</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <AdsWarning />

      <div className="relative overflow-hidden">
        <MoviePlayerHeader
          id={movie.id}
          movieName={title}
          onOpenSource={handlers.open}
          hidden={idle && !mobile && !isFullscreen}
        />
        
        <ControlMenu
          onOpenSource={handlers.open}
          onToggleFullscreen={gestureCallbacks.onToggleFullscreen}
          onReload={gestureCallbacks.onReload}
          isFullscreen={isFullscreen}
          hidden={idle && !mobile && !isFullscreen}
        />
        
        <div className="relative h-screen overflow-hidden" ref={cardRef}>
          <Card shadow="none" radius="none" className="absolute inset-0 bg-black flex items-center justify-center">
            <Skeleton className="absolute h-full w-full" />
            {seen && PLAYER?.source && (
              <div
                ref={playerContainerRef}
                className={cn({
                  'cineverse-player-fullscreen': isFullscreen,
                })}
                style={{
                  width: '100%',
                  height: '100%',
                  /* aspectRatio: '16/9', */
                  overflow: 'hidden',
                }}
              >
                {youtubeVideoId ? (
                  // Custom YouTube Player với controls đẹp
                  <YouTubePlayer
                    videoId={youtubeVideoId}
                    autoplay={true}
                    showControls={true}
                    className="h-full w-full"
                    intro={PLAYER.intro}
                    outro={PLAYER.outro}
                    onNextEpisode={() => {
                      // Next episode handler for movies (next part if multi-part)
                      const nextSourceIndex = selectedSource + 1;
                      if (nextSourceIndex < players.length) {
                        const nextPlayer = players[nextSourceIndex];
                        if (nextPlayer?.isCineVerseSource) {
                          console.log(`🎬 User clicked next part: ${nextPlayer.title}`);
                          setSelectedSource(nextSourceIndex);
                        }
                      }
                    }}
                    onReady={() => console.log('YouTube Player ready!')}
                    onStateChange={(state) => {
                      // State 0 = ENDED
                      if (state === 0) {
                        console.log('🎬 YouTube video ended');
                        // Nếu có phần tiếp theo (multi-part movie), chuyển sang phần đó
                        const nextSourceIndex = selectedSource + 1;
                        if (nextSourceIndex < players.length) {
                          const nextPlayer = players[nextSourceIndex];
                          // Chỉ auto-next nếu là CineVerse source (cùng bộ phim)
                          if (nextPlayer?.isCineVerseSource) {
                            console.log(`🎬 Auto-playing next part: ${nextPlayer.title}`);
                            setSelectedSource(nextSourceIndex);
                          }
                        }
                      }
                    }}
                    onError={(error) => {
                      console.error('YouTube Player Error:', error);
                      addToast({
                        title: 'Lỗi phát video',
                        description: 'Không thể phát video YouTube này. Thử nguồn khác.',
                        color: 'danger',
                      });
                    }}
                  />
                ) : (
                  // Standard iframe cho các nguồn khác (VidSrc, Dailymotion, etc.)
                  <iframe
                    ref={iframeRef}
                    allowFullScreen
                    allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                    key={`${PLAYER.title}-${reloadKey}`}
                    src={PLAYER.source}
                    className={cn("z-10 h-full w-full", {
                      'pointer-events-none': idle && !mobile,
                    })}
                    style={{
                      border: 'none',
                      objectFit: 'cover',
                      transform: `scale(${zoom})`,
                      transformOrigin: 'center',
                      transition: 'transform 0.2s ease-out',
                    }}
                  />
                )}
              </div>
            )}
          </Card>
          
          {/* Lớp trên bên trái và phải: Cảnh báo độ tuổi + Logo */}
          <div 
            className="flex items-start justify-between gap-4"
            style={{ 
              position: 'fixed',
              top: '4rem',
              left: '1.5rem',
              right: '4rem',
              zIndex: 50,
              pointerEvents: 'none'
            }}
          >
            {/* Age Rating on the left */}
            {movieRating && (
              <AgeRating rating={movieRating.rating} ratingDescription={movieRating.description} />
            )}

            {/* CineVerse Logo on the right */}
            <div className="flex-shrink-0 scale-[1.5]">
              <BrandLogo animate={true} />
            </div>
          </div>

          {/* Bottom overlay: Watching With Brand */}
          {seen && (
            <div 
              className="absolute bottom-18 left-4 md:bottom-20 md:left-8 transition-opacity duration-300 pointer-events-none"
              style={{ zIndex: 50 }}
            >
              <WatchingWithBrand 
                movieTitle={title} 
                logoPath={logoPath}
                posterPath={movie.poster_path}
                isVisible={!idle || mobile || isFullscreen}
                videoCurrentTime={videoCurrentTime}
              />
            </div>
          )}

          {/* Gesture Detector (hidden camera feed) */}
          {gestureEnabled && (
            <GestureDetector
              enabled={gestureEnabled}
              showDebugPanel={false}
              showMiniView={true}
              className="absolute bottom-4 right-16 md:bottom-8 md:right-20"
              callbacks={gestureCallbacks}
              onEnabledChange={() => toggleGesture()}
            />
          )}
        </div>
      </div>

      <MoviePlayerSourceSelection
        opened={opened}
        onClose={handlers.close}
        players={players}
        selectedSource={selectedSource}
        setSelectedSource={setSelectedSource}
      />
    </>
  );
};

MoviePlayer.displayName = "MoviePlayer";

export default MoviePlayer;
