import { cn } from "@/utils/helpers";
import { ArrowLeft } from "@/utils/icons";
import ActionButton from "./ActionButton";

interface MoviePlayerHeaderProps {
  id: number;
  movieName: string;
  hidden?: boolean;
  onOpenSource: () => void;
}

const MoviePlayerHeader: React.FC<MoviePlayerHeaderProps> = ({
  id,
  movieName,
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
        <ActionButton label="Back" href={`/movie/${id}`}>
          <ArrowLeft size={42} />
        </ActionButton>
      </div>
      <div className="absolute left-1/2 -translate-x-1/2 flex-col justify-center text-center flex pointer-events-none">
        <p className="text-sm text-white text-shadow-lg sm:text-lg lg:text-xl">{movieName}</p>
      </div>
    </div>
  );
};

export default MoviePlayerHeader;
