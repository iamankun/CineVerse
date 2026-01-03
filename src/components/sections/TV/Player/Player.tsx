import { siteConfig } from "@/config/site";
import BrandLogo from "@/components/ui/other/BrandLogo";
import { cn } from "@/utils/helpers";
import { getTvShowPlayers } from "@/utils/players";
import { Card, Skeleton, Tooltip, Button, addToast } from "@heroui/react";
import { useDisclosure, useDocumentTitle, useIdle, useLocalStorage } from "@mantine/hooks";
import dynamic from "next/dynamic";
import { parseAsInteger, useQueryState } from "nuqs";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Episode, TvShowDetails } from "tmdb-ts";
import useBreakpoints from "@/hooks/useBreakpoints";
import { ADS_WARNING_STORAGE_KEY, SpacingClasses } from "@/utils/constants";
import { useVidlinkPlayer } from "@/hooks/useVidlinkPlayer";
import { useMovieLogo } from "@/hooks/useMovieLogo";
import { PlayersProps } from "@/types";
import { playerAdBlocker } from "@/utils/player-ad-blocker";
import { usePinchToZoom } from "@/hooks/usePinchToZoom";
import { getTvContentRatings } from "@/api/tmdb";
import { getVietnamRatingFromContentRatings } from "@/utils/rating-converter";
import { IoHandRight } from "react-icons/io5";
const AdsWarning = dynamic(() => import("@/components/ui/overlay/AdsWarning"));
const AgeRating = dynamic(() => import("@/components/ui/overlay/AgeRating"));
const WatchingWithBrand = dynamic(() => import("@/components/ui/overlay/WatchingWithBrand"));
const TvShowPlayerHeader = dynamic(() => import("./Header"));
const TvShowPlayerSourceSelection = dynamic(() => import("./SourceSelection"));
const TvShowPlayerEpisodeSelection = dynamic(() => import("./EpisodeSelection"));
const GestureDetector = dynamic(() => import("@/components/ui/gesture/GestureDetector"), { ssr: false });

export interface TvShowPlayerProps {
  tv: TvShowDetails;
  id: number;
  seriesName: string;
  seasonName: string;
  episode: Episode;
  episodes: Episode[];
  nextEpisodeNumber: number | null;
  prevEpisodeNumber: number | null;
  startAt?: number;
}

const TvShowPlayer: React.FC<TvShowPlayerProps> = ({
  tv,
  id,
  episode,
  episodes,
  startAt,
  ...props
}) => {
  const [seen] = useLocalStorage<boolean>({
    key: ADS_WARNING_STORAGE_KEY,
    getInitialValueInEffect: false,
  });

  const { mobile } = useBreakpoints();
  const [players, setPlayers] = useState<PlayersProps[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [movieRating, setMovieRating] = useState<{ rating: string; description: string } | null>(null);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [gestureEnabled, setGestureEnabled] = useState(false);
  const logoPath = useMovieLogo(id, "tv", tv.original_language);
  
  // Ghi nhật ký gỡ lỗi
  useEffect(() => {
    console.log(`🎭 TV Player Debug:`, {
      id,
      movieRating,
      logoPath,
      tvOriginalLanguage: tv.original_language,
      seen,
      hasMovieRating: !!movieRating,
    });
  }, [id, movieRating, logoPath, tv.original_language, seen]);
  
  const cardRef = useRef<HTMLDivElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const idle = useIdle(3000);
  const zoom = usePinchToZoom(playerContainerRef, { enabled: mobile, minZoom: 1, maxZoom: 2 });
  const [sourceOpened, sourceHandlers] = useDisclosure(false);
  const [episodeOpened, episodeHandlers] = useDisclosure(false);
  const [selectedSource, setSelectedSource] = useQueryState<number>(
    "src",
    parseAsInteger.withDefault(0),
  );

  // Gesture control callbacks
  const gestureCallbacks = useMemo(() => ({
    onTogglePlay: () => {
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
      if (cardRef.current) {
        if (!isFullscreen) {
          const requestFullscreen = cardRef.current.requestFullscreen ||
            (cardRef.current as any).webkitRequestFullscreen ||
            (cardRef.current as any).mozRequestFullScreen ||
            (cardRef.current as any).msRequestFullscreen;
          if (requestFullscreen) {
            requestFullscreen.call(cardRef.current).catch(console.warn);
          }
        } else {
          const exitFullscreen = document.exitFullscreen ||
            (document as any).webkitExitFullscreen ||
            (document as any).mozCancelFullScreen ||
            (document as any).msExitFullscreen;
          if (exitFullscreen) {
            exitFullscreen.call(document).catch(console.warn);
          }
        }
      }
      addToast({ title: '🖥️ Fullscreen', description: 'Chuyển đổi toàn màn hình', color: 'secondary' });
    },
    onFavorite: () => {
      addToast({ title: '❤️ Yêu thích', description: `Đã thêm ${props.seriesName} vào danh sách yêu thích`, color: 'danger' });
    },
  }), [isFullscreen, props.seriesName]);

  useVidlinkPlayer({
    saveHistory: true,
    metadata: { season: episode.season_number, episode: episode.episode_number },
  });
  useDocumentTitle(
    `Play ${props.seriesName} - ${props.seasonName} - ${episode.name} | ${siteConfig.name}`,
  );

  // Khởi tạo trình chặn quảng cáo với tham chiếu iframe
  useEffect(() => {
    // Khởi tạo ngay lập tức
    playerAdBlocker.init();

    // Đính kèm vào khung hình khi sẵn sàng
    const iframe = iframeRef.current;
    if (iframe) {
      playerAdBlocker.init(iframe);
    }

    return () => {
      playerAdBlocker.destroy();
    };
  }, []);

  // Ngăn chặn lỗi react-remove-scroll khi modal/drawer đóng
  useEffect(() => {
    const originalError = console.error.bind(console);
    console.error = (...args: any[]) => {
      // Ngăn chặn lỗi cụ thể từ thư viện
      if (
        typeof args[0] === 'string' &&
        (args[0].includes("Failed to execute 'contains' on 'Node'") ||
         args[0].includes("[@mantine/hooks] use-fullscreen"))
      ) {
        return; // Chấp nhận những lỗi cụ thể này từ các thư viện
      }
      originalError(...args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  // Tải người chơi (bao gồm nguồn CineVerse)
  useEffect(() => {
    let isMounted = true;

    getTvShowPlayers(id, episode.season_number, episode.episode_number, startAt).then((fetchedPlayers) => {
      if (isMounted) {
        setPlayers(fetchedPlayers);
      }
    });

    // Hàm lấy rating từ TMDB và convert sang Việt Nam
    const fetchTMDBRating = async () => {
      try {
        console.log(`🌐 Đang lấy rating từ TMDB cho TV ID: ${id}`);
        const contentRatings = await getTvContentRatings(id);
        const vietnamRating = getVietnamRatingFromContentRatings(contentRatings);
        
        if (vietnamRating && isMounted) {
          console.log(`✅ TMDB TV Rating converted:`, vietnamRating);
          setMovieRating(vietnamRating);
        } else {
          console.log(`⚠️ Không tìm thấy rating phù hợp từ TMDB`);
        }
      } catch (err) {
        console.error(`❌ Lỗi khi lấy rating từ TMDB:`, err);
      }
    };

    // Tải điểm TV từ CineVerse
    console.log(`🎬 Đang tải TV điểm của ID: ${id}`);
    fetch(`/sources/ChuongTrinhTV/${id}.json`)
      .then(res => {
        console.log(`📡 TV JSON fetch status:`, res.ok, res.status);
        return res.ok ? res.json() : null;
      })
      .then(data => {
        console.log(`📊 TV JSON data:`, data?.metadata?.["movie-rating"]);
        if (data?.metadata?.["movie-rating"]) {
          const rating = data.metadata["movie-rating"];
          // Tải mô tả đánh giá
          fetch("/sources/movie-rating.json")
            .then(res => res.json())
            .then(ratingData => {
              const description = ratingData["Movie-Rating"][rating];
              console.log(`✅ TV Rating loaded (local):`, rating, description);
              if (description && isMounted) {
                setMovieRating({ rating, description });
              }
            })
            .catch((err) => {
              console.error(`❌ Không tải được mô tả đánh giá:`, err);
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
        console.error(`❌ Không tải được TV JSON:`, err);
        // Fallback sang TMDB nếu local file không tồn tại
        fetchTMDBRating();
      });

    return () => {
      isMounted = false;
    };
  }, [id, episode.season_number, episode.episode_number, startAt]);

  // Nghe các cập nhật thời gian video và sự kiện kết thúc video từ khung hình
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Chấp nhận tin nhắn từ các miền trình phát
      if (event.data && typeof event.data === 'object') {
        // Định dạng thời gian tùy chỉnh
        if (event.data.type === 'videoTime' && typeof event.data.time === 'number') {
          setVideoCurrentTime(event.data.time);
          return;
        }
        
        // Tải tin nhắn thời gian chung
        if (event.data.currentTime !== undefined) {
          setVideoCurrentTime(event.data.currentTime);
          return;
        }

        // YouTube khung hình định dạng không API
        if (event.data.event === 'infoDelivery' && event.data.info?.currentTime !== undefined) {
          setVideoCurrentTime(Math.floor(event.data.info.currentTime));
          return;
        }

        // Dailymotion khung hình định dạng không API
        if (event.data.event === 'timeupdate' && event.data.time !== undefined) {
          setVideoCurrentTime(Math.floor(event.data.time));
          return;
        }

        // VidLink định dạng đa phương tiện
        if (event.data.type === 'PLAYER_EVENT' && event.data.data?.currentTime !== undefined) {
          setVideoCurrentTime(Math.floor(event.data.data.currentTime));
          return;
        }

        // Kết thúc sự kiện video - Tự động phát tập tiếp theo nếu có
        if (props.nextEpisodeNumber) {
          // YouTube ended event
          if (event.data.event === 'infoDelivery' && event.data.info?.playerState === 0) {
            console.log('🎬 Video ended (YouTube), auto-playing next episode...');
            window.location.href = `/tv/${id}/${episode.season_number}/${props.nextEpisodeNumber}/player?src=${selectedSource}`;
            return;
          }

          // Dailymotion kết thúc sự kiện
          if (event.data.event === 'ended' || event.data.event === 'video_end') {
            console.log('🎬 Video ended (Dailymotion), auto-playing next episode...');
            window.location.href = `/tv/${id}/${episode.season_number}/${props.nextEpisodeNumber}/player?src=${selectedSource}`;
            return;
          }

          // Sự kiện kết thúc chung
          if (event.data.type === 'ended' || event.data.event === 'ended') {
            console.log('🎬 Video ended, auto-playing next episode...');
            window.location.href = `/tv/${id}/${episode.season_number}/${props.nextEpisodeNumber}/player?src=${selectedSource}`;
            return;
          }

          // VidLink kết thúc sự kiện đa phương tiện
          if (event.data.type === 'PLAYER_EVENT' && event.data.data?.event === 'ended') {
            console.log('🎬 Video ended (VidLink), auto-playing next episode...');
            window.location.href = `/tv/${id}/${episode.season_number}/${props.nextEpisodeNumber}/player?src=${selectedSource}`;
            return;
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [id, episode.season_number, props.nextEpisodeNumber, selectedSource]);

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

  // Detect fullscreen changes and sync Card fullscreen when iframe goes fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenElement = document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement;

      setIsFullscreen(!!fullscreenElement);
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

  // Show loading while fetching players
  if (!PLAYER) {
    return (
      <div className="relative w-full h-screen bg-black overflow-hidden">
        <div className="absolute-center">
          <div className="text-center">
            <div className="mb-4 text-lg" style={{ textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)' }}>Đang tải nguồn phim...</div>
            <div className="text-sm text-foreground/60" style={{ textShadow: '0 1px 4px rgba(0, 0, 0, 0.6)' }}>Vui lòng đợi</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <AdsWarning />

      <div className="relative overflow-hidden">
        <TvShowPlayerHeader
          id={id}
          episode={episode}
          hidden={idle && !mobile}
          selectedSource={selectedSource}
          onOpenSource={sourceHandlers.open}
          onOpenEpisode={episodeHandlers.open}
          {...props}
        />

        <div className="relative h-screen overflow-hidden" ref={cardRef}>
          <Card shadow="none" radius="none" className="absolute inset-0 bg-black flex items-center justify-center">
            <Skeleton className="absolute h-full w-full" />
            {seen && (
              <div
                ref={playerContainerRef}
                style={{
                  width: '100%',
                  height: '100%',
                  aspectRatio: '16/9',
                  transform: `scale(${zoom})`,
                  transformOrigin: 'center',
                  transition: 'transform 0.2s ease-out',
                  overflow: 'hidden',
                }}
              >
                <iframe
                  ref={iframeRef}
                  allowFullScreen
                  allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                  key={PLAYER.title}
                  src={PLAYER.source}
                  className={cn("z-10 h-full w-full", { "pointer-events-none": idle && !mobile })}
                  style={{
                    border: 'none',
                  }}
                />
              </div>
            )}
          </Card>
          
          {/* Top overlay: Age Rating + Logo */}
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
            <div style={{ 
              flexShrink: 0,
              transform: 'scale(1.5)'
            }}>
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
                movieTitle={props.seriesName} 
                logoPath={logoPath}
                posterPath={tv.poster_path}
                isVisible={!idle || mobile || isFullscreen}
                videoCurrentTime={videoCurrentTime}
              />
            </div>
          )}

          {/* Gesture Control Toggle Button */}
          <div 
            className="absolute bottom-4 right-4 md:bottom-8 md:right-8 transition-opacity duration-300"
            style={{ zIndex: 51, pointerEvents: 'auto' }}
          >
            <Tooltip content={gestureEnabled ? "Tắt điều khiển cử chỉ" : "Bật điều khiển cử chỉ"}>
              <Button
                isIconOnly
                size="sm"
                variant={gestureEnabled ? "solid" : "flat"}
                color={gestureEnabled ? "success" : "default"}
                className="backdrop-blur-sm bg-black/50"
                onPress={() => setGestureEnabled(!gestureEnabled)}
              >
                <IoHandRight className="text-lg" />
              </Button>
            </Tooltip>
          </div>

          {/* Gesture Detector (hidden camera feed) */}
          {gestureEnabled && (
            <GestureDetector
              enabled={gestureEnabled}
              showDebugPanel={false}
              showMiniView={true}
              className="absolute bottom-4 right-16 md:bottom-8 md:right-20"
              callbacks={gestureCallbacks}
              onEnabledChange={setGestureEnabled}
            />
          )}
        </div>
      </div>

      <TvShowPlayerSourceSelection
        opened={sourceOpened}
        onClose={sourceHandlers.close}
        players={players}
        selectedSource={selectedSource}
        setSelectedSource={setSelectedSource}
      />
      <TvShowPlayerEpisodeSelection
        id={id}
        opened={episodeOpened}
        onClose={episodeHandlers.close}
        episodes={episodes}
      />
    </>
  );
};

export default memo(TvShowPlayer);
