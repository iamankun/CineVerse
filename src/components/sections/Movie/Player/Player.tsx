import { ADS_WARNING_STORAGE_KEY } from "@/utils/constants";
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
import { useEffect, useMemo, useRef, useState } from "react";
import { MovieDetails } from "tmdb-ts/dist/types/movies";
import { useVidlinkPlayer } from "@/hooks/useVidlinkPlayer";
import { useMovieLogo } from "@/hooks/useMovieLogo";
import { PlayersProps } from "@/types";
import { playerAdBlocker } from "@/utils/player-ad-blocker";
import { usePinchToZoom } from "@/hooks/usePinchToZoom";
import { getMovieReleaseDates } from "@/api/tmdb";
import { getVietnamRatingFromReleaseDates, vietnamRatingDienAnh } from "@/utils/rating-converter";
import { useGestureContext } from "@/contexts/GestureContext";
import YouTubePlayer from "@/components/ui/YouTubePlayer";
import "@/styles/youtube-player.css";

interface FullscreenElement extends HTMLElement {
  webkitRequestFullscreen?(): Promise<void>;
  mozRequestFullScreen?(): Promise<void>;
  msRequestFullscreen?(): Promise<void>;
}

interface FullscreenDocument extends Document {
  webkitFullscreenElement?: Element;
  mozFullScreenElement?: Element;
  msFullscreenElement?: Element;
  webkitExitFullscreen?(): Promise<void>;
  mozCancelFullScreen?(): Promise<void>;
  msExitFullscreen?(): Promise<void>;
}
const AdsWarning = dynamic(() => import("@/components/ui/overlay/AdsWarning"));
const AgeRating = dynamic(() => import("@/components/ui/overlay/AgeRating"));
const WatchingWithBrand = dynamic(() => import("@/components/ui/overlay/WatchingWithBrand"));
const MoviePlayerHeader = dynamic(() => import("./Header"));
const TrinhDieuKhien = dynamic(() => import("@/components/ui/other/TrinhDieuKhien"));
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
  const [isMuted, setIsMuted] = useState(false);
  const [movieRating, setMovieRating] = useState<{ rating: string; description: string } | null>(null);
  const [showLoading, setShowLoading] = useState(true);
  const { enabled: gestureEnabled, toggle: toggleGesture } = useGestureContext();
  const logoPath = useMovieLogo(movie.id, "movie", movie.original_language);
  
  const cardRef = useRef<HTMLDivElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const title = mutateMovieTitle(movie);
  const idle = useIdle(3000);
  const { mobile } = useBreakpoints();
  const zoom = usePinchToZoom(iframeRef, { enabled: mobile, minZoom: 1, maxZoom: 2 });
  const [opened, handlers] = useDisclosure(false);
  const [selectedSource, setSelectedSource] = useQueryState<number>(
    "src",
    parseAsInteger.withDefault(0),
  );
  const [reloadKey, setReloadKey] = useState<number>(0);
  
  // Define PLAYER after selectedSource is declared
  const PLAYER = useMemo(() => players[selectedSource] || players[0], [players, selectedSource]);
  
  // Ẩn loading sau 5 giây để age rating audio kịp chơi
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  // Detect if current player is YouTube
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

  useVidlinkPlayer({ 
    saveHistory: true,
    metadata: {
      tmdbId: movie.id,
      mediaType: "movie"
    }
  });
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
    console.error = (...args: unknown[]) => {
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
    let isMounted = true;

    getMoviePlayers(movie.id).then((fetchedPlayers) => {
      if (isMounted) {
        const processedPlayers = fetchedPlayers.map(player => {
          if ((player.provider?.toLowerCase() === 'vidsrc' || player.provider?.toLowerCase() === 'kkphim') && !player.source) {
            const externalSource = player.provider?.toLowerCase() === 'vidsrc'
              ? `https://vidsrc-embed.ru/embed/movie?tmdb=${movie.id}&ds_lang=vi&autoplay=1` as `https://${string}`
              : `https://player.phimapi.com/player/?url=https://s5.phim1280.tv/${movie.id}/index.m3u8` as `https://${string}`;
            return {
              title: player.provider?.toLowerCase() === 'vidsrc' ? "VidSrc" : "KKPhim",
              source: externalSource,
              recommended: player.recommended,
              fast: true,
              ads: false,
              provider: `${player.provider?.toLowerCase()}-external`,
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
      if (isMounted) console.error('Error fetching players:', err);
    });

    // Fetch movie rating from database
    const fetchMovieRating = async () => {
      try {
        console.log(`🎬 Đang tải movie rating từ database cho ID: ${movie.id}`);
        console.log(`🎬 ID type:`, typeof movie.id, `ID value:`, movie.id);
        const response = await fetch(`/api/admin/dienanh`, { next: { revalidate: 3600 } } as RequestInit);
        console.log(`📡 Database response status:`, response.status, response.ok);
        const result = response.ok ? await response.json() : null;
        console.log(`📊 Database response data:`, result);
        const movies = result?.movies || [];
        console.log(`🎬 Movies count:`, movies.length);
        
        // Log tất cả IDs để debug
        console.log(`🔍 All Movie IDs in database:`, movies.map((item: any) => ({
          tmdb_id: item.tmdb_id,
          title: item.title,
          id_type: typeof item.tmdb_id
        })));
        
        const movieData = movies.find((item: any) => {
          // Try both string and number comparison
          const itemId = String(item.tmdb_id);
          const searchId = String(movie.id);
          const movieIdNum = Number(movie.id);
          return itemId === searchId || item.tmdb_id === movieIdNum;
        });
        
        console.log(`🎯 Found movie:`, !!movieData, movieData?.title);
        console.log(`🎯 ID comparison:`, {
          search_id: movie.id,
          search_type: typeof movie.id,
          found_id: movieData?.tmdb_id,
          found_type: typeof movieData?.tmdb_id,
          strict_equal: movieData?.tmdb_id === movie.id,
          loose_equal: movieData?.tmdb_id == movie.id
        });
        
        if (movieData?.metadata?.["movie-rating"]) {
          const rating = movieData.metadata["movie-rating"];
          console.log(`✅ Movie Rating loaded (database):`, rating);
          if (isMounted) setMovieRating({ 
            rating, 
            description: vietnamRatingDienAnh[rating as keyof typeof vietnamRatingDienAnh] || "Phim phân loại độ tuổi" 
          });
        } else {
          console.log(`⚠️ Movie found but no rating metadata`);
        }
      } catch (err) {
        console.error('Error fetching movie rating:', err);
        // Fallback to TMDB if database fails
        const fetchTMDBRating = async () => {
          try {
            console.log(`🌐 Đang lấy rating từ TMDB cho movie ID: ${movie.id}`);
            const releaseDates = await getMovieReleaseDates(movie.id);
            const vietnamRating = getVietnamRatingFromReleaseDates(releaseDates);
            if (vietnamRating && isMounted) setMovieRating(vietnamRating);
          } catch {}
        };
        fetchTMDBRating();
      }
    };

    fetchMovieRating();

    return () => {
      isMounted = false;
    };
  }, [movie.id, startAt]);



  // Detect fullscreen changes and sync Card or iframe fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenElement = (document as FullscreenDocument).fullscreenElement ||
        (document as FullscreenDocument).webkitFullscreenElement ||
        (document as FullscreenDocument).mozFullScreenElement ||
        (document as FullscreenDocument).msFullscreenElement;

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
        const requestFullscreen = (cardRef.current as FullscreenElement).requestFullscreen ||
          (cardRef.current as FullscreenElement).webkitRequestFullscreen ||
          (cardRef.current as FullscreenElement).mozRequestFullScreen ||
          (cardRef.current as FullscreenElement).msRequestFullscreen;

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
            const requestFullscreen = (cardRef.current as FullscreenElement).requestFullscreen ||
              (cardRef.current as FullscreenElement).webkitRequestFullscreen ||
              (cardRef.current as FullscreenElement).mozRequestFullScreen ||
              (cardRef.current as FullscreenElement).msRequestFullscreen;

            if (requestFullscreen) {
              requestFullscreen.call(cardRef.current).catch((err: Error) => {
                console.warn('Failed to enter fullscreen:', err);
              });
            }
          } else {
            const exitFullscreen = (document as FullscreenDocument).exitFullscreen ||
              (document as FullscreenDocument).webkitExitFullscreen ||
              (document as FullscreenDocument).mozCancelFullScreen ||
              (document as FullscreenDocument).msExitFullscreen;

            if (exitFullscreen) {
              exitFullscreen.call(document).catch((err: Error) => {
                console.warn('Thất bại khi thoát toàn màn hình:', err);
              });
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFullscreen]);

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

  if (!PLAYER || showLoading) {
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
          onOpenSource={handlers.open}
        />
        
        <div className={cn(
          "relative overflow-hidden",
          mobile ? "cineverse-mobile-player h-screen w-screen" : "h-screen"
        )} ref={cardRef}>
          <Card shadow="none" radius="none" className={cn(
            "absolute inset-0 bg-black flex items-center justify-center",
            mobile && "cineverse-mobile-container landscape:w-full landscape:h-full"
          )}>
            <Skeleton className="absolute h-full w-full" />
            
            {/* TrinhDieuKhien - Control mới ở góc trên bên phải */}
            <TrinhDieuKhien
              onOpenSource={handlers.open}
              onToggleFullscreen={gestureCallbacks.onToggleFullscreen}
              onReload={gestureCallbacks.onReload}
              isFullscreen={isFullscreen}
              isMuted={isMuted}
              playerContainerRef={cardRef}
            />
            
            {seen && PLAYER?.source && (
              <div
                ref={playerContainerRef}
                className={cn({
                  'cineverse-player-fullscreen': isFullscreen,
                })}
                style={{
                  width: '100%',
                  height: '100%',
                  aspectRatio: mobile ? undefined : '16/9',
                  overflow: 'hidden',
                  ...(mobile && {
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    maxWidth: '100vw',
                    maxHeight: '100vh'
                  })
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
                    isMobile={mobile}
                    onNextEpisode={() => {
                      const nextSourceIndex = selectedSource + 1;
                      if (nextSourceIndex < players.length && players[nextSourceIndex]?.isCineVerseSource) {
                        setSelectedSource(nextSourceIndex);
                      }
                    }}
                    onReady={() => {}}
                    onStateChange={(state) => {
                      if (state === 0) {
                        const nextSourceIndex = selectedSource + 1;
                        if (nextSourceIndex < players.length && players[nextSourceIndex]?.isCineVerseSource) {
                          setSelectedSource(nextSourceIndex);
                        }
                      }
                    }}
                    onError={(_error) => {
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
                    className="z-10 h-full w-full"
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
            <div className="flex-shrink:0 scale-[1.5]">
              <BrandLogo />
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
