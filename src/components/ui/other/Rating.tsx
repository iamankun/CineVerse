import { formatNumber } from "@/utils/helpers";
import { Star } from "@/utils/icons";

export interface RatingProps {
  rate: number;
  count?: number;
}

const Rating: React.FC<RatingProps> = ({ rate = 0, count = 0 }) => {
  return (
    <div className="flex items-center gap-1 font-semibold">
      <span className="text-cyan-500">TMDB</span>
      <Star className="text-cyan-500" />
      <span className="text-warning-500">
        {rate.toFixed(1)}
      </span>
      {count > 0 && (
        <span className="text-default-500 font-normal">
          ({formatNumber(count)})
        </span>
      )}
    </div>
  );
};

export default Rating;
