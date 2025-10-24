import { ADS_WARNING_STORAGE_KEY, SpacingClasses } from "@/utils/constants";
import { siteConfig } from "@/config/site";
import useBreakpoints from "@/hooks/useBreakpoints";
import { cn } from "@/utils/helpers";
import { mutateMovieTitle } from "@/utils/movies";
import { getMoviePlayers } from "@/utils/players";
import { Card, Skeleton } from "@heroui/react";
import { useDisclosure, useDocumentTitle, useIdle, useLocalStorage } from "@mantine/hooks";
import dynamic from "next/dynamic";
import { parseAsInteger, useQueryState } from "nuqs";
import { useEffect, useMemo, useRef, useState } from "react";
import { MovieDetails } from "tmdb-ts/dist/types/movies";
import { useVidlinkPlayer } from "@/hooks/useVidlinkPlayer";
import { useMovieLogo } from "@/hooks/useMovieLogo";
import { PlayersProps } from "@/types";
const AdsWarning = dynamic(() => import("@/components/ui/overlay/AdsWarning"));
const AgeRating = dynamic(() => import("@/components/ui/overlay/AgeRating"));
const WatchingWithBrand = dynamic(() => import("@/components/ui/overlay/WatchingWithBrand"));
const MoviePlayerHeader = dynamic(() => import("./Header"));
const MoviePlayerSourceSelection = dynamic(() => import("./SourceSelection"));

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
  const logoPath = useMovieLogo(movie.id, "movie");
  const cardRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const title = mutateMovieTitle(movie);
  const idle = useIdle(3000);
  const { mobile } = useBreakpoints();
  const [opened, handlers] = useDisclosure(false);
  const [selectedSource, setSelectedSource] = useQueryState<number>(
    "src",
    parseAsInteger.withDefault(0),
  );

  useVidlinkPlayer({ saveHistory: true });
  useDocumentTitle(`Play ${title} | ${siteConfig.name}`);

  // Fetch players (including CineVerse sources)
  useEffect(() => {
    getMoviePlayers(movie.id, startAt).then(setPlayers);

    // Fetch movie rating from CineVerse JSON
    fetch(`/sources/Movie/${movie.id}.json`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.metadata?.["movie-rating"]) {
          const rating = data.metadata["movie-rating"];
          // Fetch rating descriptions
          fetch("/sources/movie-rating.json")
            .then(res => res.json())
            .then(ratingData => {
              const description = ratingData["Movie-Rating"][rating];
              if (description) {
                setMovieRating({ rating, description });
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, [movie.id, startAt]);

  // Listen for video time updates from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Accept messages from player domains
      if (event.data && typeof event.data === 'object') {
        if (event.data.type === 'videoTime' && typeof event.data.time === 'number') {
          setVideoCurrentTime(event.data.time);
        }
        // Also handle standard video player postMessage formats
        if (event.data.currentTime !== undefined) {
          setVideoCurrentTime(event.data.currentTime);
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

      <div className={cn("relative", SpacingClasses.reset)}>
        <MoviePlayerHeader
          id={movie.id}
          movieName={title}
          onOpenSource={handlers.open}
          hidden={idle && !mobile}
        />
        <Card ref={cardRef} shadow="md" radius="none" className="relative h-screen bg-black">
          <Skeleton className="absolute h-full w-full" />
          {seen && (
            <>
              <iframe
                ref={iframeRef}
                allowFullScreen
                key={PLAYER.title}
                src={PLAYER.source}
                className={cn("z-10 h-full w-full", { "pointer-events-none": idle && !mobile })}
              />
              {/* Top overlay: Age Rating + Logo */}
              <div 
                className={cn(
                  "absolute top-4 left-4 right-4 flex items-start justify-between gap-4 transition-opacity duration-300 pointer-events-none",
                  { "opacity-0": idle && !mobile && !isFullscreen, "opacity-100": !idle || mobile || isFullscreen }
                )}
                style={{ zIndex: 2147483647 }}
              >
                {/* Age Rating on the left - No background, just shadow */}
                {movieRating && (
                  <AgeRating rating={movieRating.rating} ratingDescription={movieRating.description} />
                )}

                {/* CineVerse Logo on the right */}
                <div className="flex-shrink-0">
                  <img 
                    src="/logo.gif" 
                    alt="CineVerse" 
                    className="h-14 w-auto"
                    style={{ 
                      maxHeight: '56px',
                      width: 'auto',
                      filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.8))'
                    }}
                  />
                </div>
              </div>

              {/* Bottom overlay: Watching With Brand */}
              <div 
                className={cn(
                  "absolute bottom-8 left-8 transition-opacity duration-300 pointer-events-none",
                  { "opacity-0": idle && !mobile && !isFullscreen, "opacity-100": !idle || mobile || isFullscreen }
                )}
                style={{ zIndex: 2147483647 }}
              >
                <WatchingWithBrand 
                  movieTitle={title} 
                  logoPath={logoPath}
                  posterPath={movie.poster_path}
                  isVisible={!idle || mobile || isFullscreen}
                  videoCurrentTime={videoCurrentTime}
                />
              </div>
            </>
          )}
        </Card>
        
        {/* Fullscreen hint */}
        {!isFullscreen && !mobile && (
          <div className="fixed bottom-4 right-4 z-50 text-xs text-foreground/40 pointer-events-none">
            Nhấn F để fullscreen hoặc dùng nút fullscreen trên video
          </div>
        )}
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
