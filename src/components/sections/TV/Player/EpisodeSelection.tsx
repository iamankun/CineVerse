import VaulDrawer from "@/components/ui/overlay/VaulDrawer";
import { HandlerType } from "@/types/component";
import { Episode, Season } from "tmdb-ts";
import { EpisodeListCard } from "../Details/Episodes";
import { motion, AnimatePresence } from "framer-motion";
import { Select, SelectItem } from "@heroui/react";
import { useState, useEffect } from "react";

interface TvShowPlayerEpisodeSelectionProps extends HandlerType {
  id: number;
  episodes: Episode[];
  seasons?: Season[];
  currentEpisodeNumber: number;
}

const TvShowPlayerEpisodeSelection: React.FC<TvShowPlayerEpisodeSelectionProps> = ({
  opened,
  onClose,
  id,
  episodes,
  seasons,
  currentEpisodeNumber,
}) => {
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [seasonEpisodes, setSeasonEpisodes] = useState<Episode[]>(episodes);
  const [isLoadingSeason, setIsLoadingSeason] = useState(false);

  // Filter seasons to exclude season 0 (specials)
  const filteredSeasons = seasons?.filter(s => s.season_number > 0) || [];

  // Set initial season based on current episode
  useEffect(() => {
    if (episodes.length > 0 && !selectedSeason) {
      const currentEpisode = episodes.find(e => e.episode_number === currentEpisodeNumber);
      if (currentEpisode) {
        setSelectedSeason(currentEpisode.season_number);
      }
    }
  }, [episodes, currentEpisodeNumber, selectedSeason]);

  // Fetch episodes when season changes
  useEffect(() => {
    if (selectedSeason && selectedSeason !== episodes[0]?.season_number) {
      const fetchSeasonEpisodes = async () => {
        setIsLoadingSeason(true);
        try {
          const response = await fetch(`/api/sources/tv/${id}?season=${selectedSeason}`);
          if (response.ok) {
            const data = await response.json();
            if (data.episodes) {
              setSeasonEpisodes(data.episodes);
            }
          }
        } catch (error) {
          console.error('Error fetching season episodes:', error);
        } finally {
          setIsLoadingSeason(false);
        }
      };
      
      fetchSeasonEpisodes();
    } else {
      setSeasonEpisodes(episodes);
    }
  }, [selectedSeason, id, episodes]);

  // Filter episodes by selected season
  const filteredEpisodes = selectedSeason 
    ? seasonEpisodes.filter(episode => episode.season_number === selectedSeason)
    : seasonEpisodes;

  // Debug logging
  console.log('📺 Episode Selection Debug:', {
    opened,
    id,
    episodesCount: episodes?.length,
    hasEpisodes: Array.isArray(episodes),
    selectedSeason,
    seasonsCount: seasons?.length,
    filteredEpisodesCount: filteredEpisodes?.length,
    firstEpisode: episodes?.[0],
    firstFilteredEpisode: filteredEpisodes?.[0],
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
      title="Mùa và Tập"
      direction="right"
      hiddenHandler
      withCloseButton
    >
      {/* Season Selector */}
      {filteredSeasons.length > 1 && (
        <div className="p-4 pb-2">
          <Select
            aria-label="Mùa"
            label="Chọn mùa"
            placeholder="Chọn mùa"
            selectedKeys={selectedSeason ? [selectedSeason.toString()] : []}
            disallowEmptySelection={true}
            classNames={{ 
              trigger: "border-2 border-white/20 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300",
              value: "text-white",
              label: "text-white/70 text-sm",
              selectorIcon: "text-white/70"
            }}
            renderValue={(items) => {
              if (items.length === 0) return "Chọn mùa";
              const item = items[0];
              const seasonNumber = Number(item.key);
              return `Mùa ${seasonNumber}`;
            }}
            onSelectionChange={(keys) => {
              const selectedKey = Array.from(keys)[0] as string;
              if (selectedKey) {
                setSelectedSeason(Number(selectedKey));
              }
            }}
          >
            {filteredSeasons.map(({ season_number, name }) => (
              <SelectItem 
                key={season_number.toString()}
                className="text-white hover:bg-white/10"
              >
                Mùa {season_number}
              </SelectItem>
            ))}
          </Select>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-2 p-2 sm:gap-4 sm:p-4 rounded-xl">
        {isLoadingSeason ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
            <span className="ml-3 text-white">Đang tải tập...</span>
          </div>
        ) : Array.isArray(filteredEpisodes) && filteredEpisodes.length > 0 ? (
          filteredEpisodes.map((episode: Episode, index: number) => (
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
