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
    </div>
  );
};

export default TvShowPlayerHeader;
