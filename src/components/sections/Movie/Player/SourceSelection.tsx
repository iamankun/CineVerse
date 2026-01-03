import { PlayersProps } from "@/types";
import VaulDrawer from "@/components/ui/overlay/VaulDrawer";
import { HandlerType } from "@/types/component";
import SelectButton from "@/components/ui/input/SelectButton";
import { Ads, Clock, Rocket, Star } from "@/utils/icons";
import { motion } from "framer-motion";

interface MoviePlayerSourceSelectionProps extends HandlerType {
  players: PlayersProps[];
  selectedSource: number;
  setSelectedSource: (source: number) => void;
}

const MoviePlayerSourceSelection: React.FC<MoviePlayerSourceSelectionProps> = ({
  opened,
  onClose,
  players,
  selectedSource,
  setSelectedSource,
}) => {
  return (
    <VaulDrawer
      open={opened}
      onClose={onClose}
      backdrop="blur"
      title="Chọn nguồn phát"
      direction="right"
      hiddenHandler
      withCloseButton
      classNames={{ content: "space-y-0" }}
    >
      <div className="flex flex-col gap-5 p-6">
        <motion.div 
          className="space-y-3 px-5 py-4 rounded-2xl bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-xl shadow-black/20"
          initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 25,
            delay: 0.1
          }}
        >
          <div className="flex items-center gap-3 group">
            <div className="p-1.5 rounded-lg bg-warning-500/20 group-hover:bg-warning-500/30 transition-colors">
              <Star className="text-warning-500 w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Được đề xuất</span>
          </div>
          <div className="flex items-center gap-3 group">
            <div className="p-1.5 rounded-lg bg-danger-500/20 group-hover:bg-danger-500/30 transition-colors">
              <Rocket className="text-danger-500 w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Tốc độ nhanh</span>
          </div>
          <div className="flex items-center gap-3 group">
            <div className="p-1.5 rounded-lg bg-success-500/20 group-hover:bg-success-500/30 transition-colors">
              <Clock className="text-success-500 w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Hỗ trợ tiếp tục xem</span>
          </div>
          <div className="flex items-center gap-3 group">
            <div className="p-1.5 rounded-lg bg-primary-500/20 group-hover:bg-primary-500/30 transition-colors">
              <Ads className="text-primary-500 w-4 h-4" />
            </div>
            <span className="text-xs leading-relaxed opacity-90">Cài Ad Block hoặc Ad Guard để chặn quảng cáo (Nếu có, chúng tôi luôn nỗ lực loại bỏ quảng cáo bài bạc và cá cược...)</span>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.25
          }}
        >
          <SelectButton
          color="primary"
          groupType="list"
          value={selectedSource.toString()}
          onChange={(value) => {
            setSelectedSource(Number(value || 0));
            onClose();
          }}
          data={players.map(({ title, recommended, fast, ads, resumable }, index) => {
            return {
              label: title,
              value: index.toString(),
              endContent: (
                <div key={`info-${title}`} className="flex flex-wrap items-center gap-2">
                  {recommended && <Star className="text-warning" />}
                  {fast && <Rocket className="text-danger" />}
                  {resumable && <Clock className="text-success" />}
                  {ads && <Ads className="text-primary" />}
                </div>
              ),
            };
          })}
        />
        </motion.div>
      </div>
    </VaulDrawer>
  );
};

export default MoviePlayerSourceSelection;
