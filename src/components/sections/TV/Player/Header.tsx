import { cn } from "@/utils/helpers";
import { ArrowLeft } from "@/utils/icons";
import ActionButton from "./ActionButton";
import { TvShowPlayerProps } from "./Player";

interface TvShowPlayerHeaderProps extends Omit<TvShowPlayerProps, "episodes" | "tv" | "startAt"> {
  hidden?: boolean;
  selectedSource: number;
  onOpenSource: () => void;
  onOpenEpisode: () => void;
}

const TvShowPlayerHeader: React.FC<TvShowPlayerHeaderProps> = ({
  id,
  seriesName,
  episode,
  hidden,
}) => {
  return (
    <div
      aria-hidden={hidden ? true : undefined}
      className={cn(
        "absolute top-0 z-40 flex h-28 w-full items-start justify-between gap-4",
        "p-2 text-white transition-opacity md:p-4 pointer-events-none",
        { "opacity-0": hidden },
      )}
    >
      <div className="pointer-events-auto">
        <ActionButton label="Back" href={`/tv/${id}`}>
          <ArrowLeft size={42} />
        </ActionButton>
      </div>
      <div className="absolute left-1/2 -translate-x-1/2 flex-col justify-center text-center flex pointer-events-none">
        <p className="text-sm text-white text-shadow-lg sm:text-lg lg:text-xl">{seriesName}</p>
        <p className="text-xs text-gray-200 text-shadow-lg sm:text-sm lg:text-base">
          Mùa {episode.season_number} - Tập {episode.episode_number} - {episode.name}
        </p>
      </div>
    </div>
  );
};

export default TvShowPlayerHeader;
