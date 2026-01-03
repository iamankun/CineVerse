import { getMovieDetails } from "@/api/tmdb";
import BookmarkButton from "@/components/ui/button/BookmarkButton";
import Genres from "@/components/ui/other/Genres";
import Rating from "@/components/ui/other/Rating";
import { SavedMovieDetails } from "@/types/movie";
import { cn, isEmpty, getPreferredLogo } from "@/utils/helpers";
import { Calendar, Clock } from "@/utils/icons";
import { getImageUrl, movieDurationString, mutateMovieTitle } from "@/utils/movies";
import { Button, Chip, Image, Link, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useQuery } from "@tanstack/react-query";
import { Genre } from "tmdb-ts";

const HoverPosterCard: React.FC<{ id: number; fullWidth?: boolean }> = ({ id, fullWidth }) => {
  const { data: movie, isPending } = useQuery({
    queryFn: () => getMovieDetails(id, ["images"], true),
    queryKey: ["get-movie-detail-on-hover-poster", id],
  });

  if (isPending) {
    return (
      <div className="h-96 w-80">
        <Spinner size="lg" variant="simple" className="absolute-center" />
      </div>
    );
  }

  if (!movie) return null;

  const title = mutateMovieTitle(movie);
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : undefined;
  const fullTitle = title;
  const backdropImage = getImageUrl(movie.backdrop_path, "backdrop");
  const preferredLogo = getPreferredLogo(movie.images.logos);
  const titleImage = getImageUrl(preferredLogo?.file_path, "title");
  const bookmarkData: SavedMovieDetails = {
    type: "movie",
    adult: movie.adult,
    backdrop_path: movie.backdrop_path,
    id: movie.id,
    poster_path: movie.poster_path,
    release_date: movie.release_date,
    title: fullTitle,
    vote_average: movie.vote_average,
    saved_date: new Date().toISOString(),
  };

  return (
    <>
      <div
        className={cn("w-80 relative", {
          "w-full": fullWidth,
        })}
      >
        {/* Gradient overlay kéo dài toàn bộ card */}
        <div className="absolute inset-0 z-1 bg-linear-to-b from-black/100 from-40% via-black/100 via-20% via-black/100 via-50% to-transparent to-80% rounded-lg pointer-events-none"></div>
        <div className="relative">
          <div className="absolute aspect-video h-fit w-full">
            {/* Gradient tối ở cuối backdrop */}
            <div className="absolute z-2 h-full w-full bg-linear-to-b from-transparent from-0% to-black/100 to-100%"></div>
            {!isEmpty(titleImage) && (
              <Image
                isBlurred
                radius="none"
                alt={fullTitle}
                classNames={{ wrapper: "absolute-center z-1 bg-transparent" }}
                className="h-full max-h-32 w-full drop-shadow-xl"
                src={titleImage}
              />
            )}
            <Image
              radius="none"
              alt={fullTitle}
              className="z-0 aspect-video rounded-t-lg object-cover object-center opacity-70"
              src={backdropImage}
            />
          </div>
          <div className="flex flex-col gap-2 p-4 pt-[40%] *:z-10">
            <div className="flex gap-3">
              <Chip
                size="sm"
                color="primary"
                variant="faded"
                className="md:text-md text-xs"
                classNames={{ content: "font-bold" }}
              >
                Movie
              </Chip>
              {movie.adult && (
                <Chip size="sm" color="danger" variant="faded">
                  18+
                </Chip>
              )}
            </div>
            <h4 className="text-xl font-bold">{fullTitle}</h4>
            <div className="md:text-md flex flex-wrap gap-1 text-xs *:z-10">
              <div className="flex items-center gap-1">
                <Clock />
                <span>{movieDurationString(movie.runtime)}</span>
              </div>
              <p>&#8226;</p>
              <div className="flex items-center gap-1">
                <Calendar />
                <span>{releaseYear}</span>
              </div>
              <p>&#8226;</p>
              <Rating rate={movie.vote_average || 0} />
            </div>
            <Genres genres={movie.genres as Genre[]} />
            <div className="flex w-full justify-between gap-2 py-1">
              <Button
                as={Link}
                href={`/movie/${movie.id}/player`}
                fullWidth
                color="primary"
                variant="flat"
                startContent={<Icon icon="solar:play-circle-bold" fontSize={24} />}
                className="bg-primary/20 backdrop-blur-md border border-primary/30 hover:bg-primary/30"
              >
                Xem ngay
              </Button>
              <BookmarkButton data={bookmarkData} isTooltipDisabled />
            </div>
            <p className="text-sm">{movie.overview}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default HoverPosterCard;
