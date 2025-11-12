import { siteConfig } from "@/config/site";
import BrandLogo from "@/components/ui/other/BrandLogo";
import { cn } from "@/utils/helpers";
import { getTvShowPlayers } from "@/utils/players";
import { Card, Skeleton } from "@heroui/react";
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
const AdsWarning = dynamic(() => import("@/components/ui/overlay/AdsWarning"));
const AgeRating = dynamic(() => import("@/components/ui/overlay/AgeRating"));
const WatchingWithBrand = dynamic(() => import("@/components/ui/overlay/WatchingWithBrand"));
const TvShowPlayerHeader = dynamic(() => import("./Header"));
const TvShowPlayerSourceSelection = dynamic(() => import("./SourceSelection"));
const TvShowPlayerEpisodeSelection = dynamic(() => import("./EpisodeSelection"));

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
  const logoPath = useMovieLogo(id, "tv", tv.original_language);
  
  // Debug logging
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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const idle = useIdle(3000);
  const [sourceOpened, sourceHandlers] = useDisclosure(false);
  const [episodeOpened, episodeHandlers] = useDisclosure(false);
  const [selectedSource, setSelectedSource] = useQueryState<number>(
    "src",
    parseAsInteger.withDefault(0),
  );

  useVidlinkPlayer({
    saveHistory: true,
    metadata: { season: episode.season_number, episode: episode.episode_number },
  });
  useDocumentTitle(
    `Play ${props.seriesName} - ${props.seasonName} - ${episode.name} | ${siteConfig.name}`,
  );

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

  // Suppress react-remove-scroll error when modal/drawer closes
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args: any[]) => {
      // Suppress specific library errors
      if (
        typeof args[0] === 'string' &&
        (args[0].includes("Failed to execute 'contains' on 'Node'") ||
         args[0].includes("[@mantine/hooks] use-fullscreen"))
      ) {
        return; // Ignore these specific errors from libraries
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  // Fetch players (including CineVerse sources)
  useEffect(() => {
    getTvShowPlayers(id, episode.season_number, episode.episode_number, startAt).then(setPlayers);

    // Fetch movie rating from CineVerse JSON
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
          // Fetch rating descriptions
          fetch("/sources/movie-rating.json")
            .then(res => res.json())
            .then(ratingData => {
              const description = ratingData["Movie-Rating"][rating];
              console.log(`✅ TV Rating loaded:`, rating, description);
              if (description) {
                setMovieRating({ rating, description });
              }
            })
            .catch((err) => {
              console.error(`❌ Failed to load rating descriptions:`, err);
            });
        }
      })
      .catch((err) => {
        console.error(`❌ Failed to load TV JSON:`, err);
      });
  }, [id, episode.season_number, episode.episode_number, startAt]);

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
      <div className={cn("relative", SpacingClasses.reset)}>
        <Card shadow="md" radius="none" className="relative h-screen">
          <Skeleton className="absolute h-full w-full" />
          <div className="absolute-center">
            <div className="text-center">
              <div className="mb-4 text-lg">Đang tải nguồn phim...</div>
              <div className="text-sm text-foreground/60">Vui lòng đợi</div>
            </div>
          </div>
        </Card>
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
          <Card shadow="md" radius="none" className="absolute inset-0 bg-black">
            <Skeleton className="absolute h-full w-full" />
            {seen && (
              <iframe
                ref={iframeRef}
                allowFullScreen
                key={PLAYER.title}
                src={PLAYER.source}
                className={cn("z-10 h-full w-full", { "pointer-events-none": idle && !mobile })}
              />
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
