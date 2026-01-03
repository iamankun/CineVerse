import VaulDrawer from "@/components/ui/overlay/VaulDrawer";
import { HandlerType } from "@/types/component";
import { Episode } from "tmdb-ts/dist/types/tv-episode";
import { EpisodeListCard } from "../Details/Episodes";
import { motion, AnimatePresence } from "framer-motion";

interface TvShowPlayerEpisodeSelectionProps extends HandlerType {
  id: number;
  episodes: Episode[];
  currentEpisodeNumber: number;
}

const TvShowPlayerEpisodeSelection: React.FC<TvShowPlayerEpisodeSelectionProps> = ({
  opened,
  onClose,
  id,
  episodes,
  currentEpisodeNumber,
}) => {
  // Debug logging
  console.log('📺 Episode Selection Debug:', {
    opened,
    id,
    episodesCount: episodes?.length,
    hasEpisodes: Array.isArray(episodes),
  });

  // Validate episodes data
  if (!Array.isArray(episodes) || episodes.length === 0) {
    console.warn('⚠️ Episodes data is invalid or empty:', episodes);
  }

  return (
    <VaulDrawer
      open={opened}
      onClose={onClose}
      backdrop="blur"
      title="Chọn Tập"
      direction="right"
      hiddenHandler
      withCloseButton
    >
      <div className="grid grid-cols-1 gap-2 p-2 sm:gap-4 sm:p-4 rounded-xl">
        {Array.isArray(episodes) && episodes.length > 0 ? (
          episodes.map((episode, index) => (
            <motion.div
              key={episode.id}
              initial={{ opacity: 0, scale: 0.8, y: 20, rotateX: -15 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
              transition={{ 
                delay: index * 0.08,
                type: "spring",
                stiffness: 260,
                damping: 20
              }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.98 }}
            >
              <EpisodeListCard
                id={id}
                episode={episode}
                order={index + 1}
                withAnimation={false}
                isCurrentEpisode={episode.episode_number === currentEpisodeNumber}
              />
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8 text-foreground/60">
            Không có tập nào
          </div>
        )}
      </div>
    </VaulDrawer>
  );
};

export default TvShowPlayerEpisodeSelection;
