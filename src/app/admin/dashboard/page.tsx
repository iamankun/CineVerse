"use client";

function normalizeYouTubeUrl(url: string): { id: string, url: string } | null {
  try {
    if (!url) return null;
    let id = "";
    let newUrl = "";
    // https://www.youtube.com/watch?v=ID&...
    const match = url.match(/[?&]v=([\w-]{11})/);
    if (match) {
      id = match[1];
      newUrl = `https://www.youtube.com/watch?v=${id}`;
      return { id, url: newUrl };
    }
    // https://youtu.be/ID
    const match2 = url.match(/youtu\.be\/([\w-]{11})/);
    if (match2) {
      id = match2[1];
      newUrl = `https://www.youtube.com/watch?v=${id}`;
      return { id, url: newUrl };
    }
    // https://www.youtube.com/embed/ID
    const match3 = url.match(/embed\/([\w-]{11})/);
    if (match3) {
      id = match3[1];
      newUrl = `https://www.youtube.com/watch?v=${id}`;
      return { id, url: newUrl };
    }
    // Nếu chỉ là ID
    if (/^[\w-]{11}$/.test(url)) {
      id = url;
      newUrl = `https://www.youtube.com/watch?v=${id}`;
      return { id, url: newUrl };
    }
    return null;
  } catch {
    return null;
  }
}

import { useState, useEffect, useRef } from "react";
import {
  Button,
  Input,
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Select,
  SelectItem,
  Textarea,
  Divider,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  addToast,
} from "@heroui/react";
import { IoSearch, IoSave, IoRefresh, IoAdd, IoTrash, IoList, IoCreate, IoLogOut, IoClipboard, IoArrowBack, IoChevronDown, IoChevronForward } from "react-icons/io5";
import { searchMovies, searchTV, getMovieDetails, getTvShowDetails, getTmdbImageUrl } from "@/api/tmdb";
import Image from "next/image";
import AdminGuard from "@/components/AdminGuard";
import { useRouter } from "next/navigation";

// Video Preview Component
function VideoPreview({ videoId, iframeId, onPlayerReady }: { videoId: string; iframeId: string; onPlayerReady?: (player: any) => void }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [player, setPlayer] = useState<any>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load YouTube API if not loaded
    if (!(window as any).YT) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      document.body.appendChild(script);
      
      (window as any).onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
    } else {
      initPlayer();
    }

    function initPlayer() {
      if (playerRef.current && videoId) {
        const newPlayer = new (window as any).YT.Player(playerRef.current, {
          height: '100%',
          width: '100%',
          videoId: videoId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            rel: 0,
            showinfo: 0,
            modestbranding: 1,
          },
          events: {
            onReady: (event: any) => {
              setPlayer(event.target);
              // Lưu instance player vào window để các component khác truy cập
              (window as any)["ytPlayerInstance_" + iframeId] = event.target;
              onPlayerReady?.(event.target);
            },
            onStateChange: (event: any) => {
              // Handle state changes if needed
            },
          },
        });
      }
    }

    return () => {
      if (player) {
        player.destroy();
        setPlayer(null);
      }
    };
  }, [videoId]);

  useEffect(() => {
    if (player && !isExpanded) {
      player.pauseVideo();
    }
  }, [isExpanded, player]);

  return (
    <Card className="bg-gray-900/50">
      <CardBody className="p-2">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-white/60">Xem trước</p>
          <Button
            size="sm"
            variant="light"
            className="text-white min-w-0 px-2 h-6"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? 'Thu gọn' : 'Mở rộng'}
          >
            {isExpanded ? <IoChevronDown size={18} /> : <IoChevronForward size={18} />}
          </Button>
        </div>
        {isExpanded && (
          <div className="aspect-video w-full overflow-hidden rounded-lg">
            <div
              ref={playerRef}
              id={iframeId}
              className="h-full w-full"
            />
          </div>
        )}
      </CardBody>
    </Card>
  );
}

// Timestamp Inputs Component
function TimestampInputs({ 
  source, 
  iframeId, 
  onUpdate 
}: { 
  source: any; 
  iframeId: string; 
  onUpdate: (field: 'intro' | 'outro', value: any) => void;
}) {
  // Lấy player từ window theo iframeId
  const getPlayerInstance = () => {
    // Tìm player instance đã được khởi tạo bởi VideoPreview
    const ytPlayers = (window as any).YT?.players;
    if (ytPlayers && ytPlayers[iframeId]) {
      return ytPlayers[iframeId];
    }
    // Nếu không có, thử lấy từ global
    return (window as any)["ytPlayerInstance_" + iframeId];
  };

  const setCurrentTimeToField = (field: 'intro' | 'outro', position: 'start' | 'end') => {
    let currentTime = 0;
    try {
      const player = getPlayerInstance();
      if (player && typeof player.getCurrentTime === "function") {
        currentTime = Math.floor(player.getCurrentTime());
      }
    } catch {}
    const currentValue = source[field] || { start: 0, end: 0 };
    onUpdate(field, {
      ...currentValue,
      [position]: currentTime
    });
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-white">Mốc thời gian (giây)</p>
      
      {/* Intro */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            label="Intro - Bắt đầu"
            type="number"
            size="sm"
            placeholder="0"
            value={source.intro?.start?.toString() || ""}
            onChange={(e) => {
              const start = parseFloat(e.target.value) || 0;
              onUpdate("intro", {
                ...source.intro,
                start,
                end: source.intro?.end || start + 90
              });
            }}
            classNames={{
              input: "text-white",
              inputWrapper: "bg-gray-600",
            }}
          />
          <Button
            size="sm"
            className="mt-5 min-w-0 px-3 bg-primary text-white"
            onClick={() => {
              setCurrentTimeToField('intro', 'start');
            }}
          >
            +
          </Button>
        </div>
        <div className="flex gap-2">
          <Input
            label="Intro - Kết thúc"
            type="number"
            size="sm"
            placeholder="90"
            value={source.intro?.end?.toString() || ""}
            onChange={(e) => {
              const end = parseFloat(e.target.value) || 90;
              onUpdate("intro", {
                ...source.intro,
                start: source.intro?.start || 0,
                end
              });
            }}
            classNames={{
              input: "text-white",
              inputWrapper: "bg-gray-600",
            }}
          />
          <Button
            size="sm"
            className="mt-5 min-w-0 px-3 bg-primary text-white"
            onClick={() => {
              setCurrentTimeToField('intro', 'end');
            }}
          >
            +
          </Button>
        </div>
      </div>

      {/* Outro */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            label="Outro - Bắt đầu"
            type="number"
            size="sm"
            placeholder="1200"
            value={source.outro?.start?.toString() || ""}
            onChange={(e) => {
              const start = parseFloat(e.target.value) || 0;
              onUpdate("outro", {
                ...source.outro,
                start,
                end: source.outro?.end || start + 90
              });
            }}
            classNames={{
              input: "text-white",
              inputWrapper: "bg-gray-600",
            }}
          />
          <Button
            size="sm"
            className="mt-5 min-w-0 px-3 bg-primary text-white"
            onClick={() => {
              setCurrentTimeToField('outro', 'start');
            }}
          >
            +
          </Button>
        </div>
        <div className="flex gap-2">
          <Input
            label="Outro - Kết thúc"
            type="number"
            size="sm"
            placeholder="1290"
            value={source.outro?.end?.toString() || ""}
            onChange={(e) => {
              const end = parseFloat(e.target.value) || 0;
              onUpdate("outro", {
                ...source.outro,
                start: source.outro?.start || 0,
                end
              });
            }}
            classNames={{
              input: "text-white",
              inputWrapper: "bg-gray-600",
            }}
          />
          <Button
            size="sm"
            className="mt-5 min-w-0 px-3 bg-primary text-white"
            onClick={() => {
              // Nếu đã có outro bắt đầu, tự động lấy duration video
              let endTime = 0;
              try {
                const player = (window as any)["ytPlayerInstance_" + iframeId];
                if (player && typeof player.getDuration === "function") {
                  endTime = Math.floor(player.getDuration());
                }
              } catch {}
              const currentValue = source["outro"] || { start: 0, end: 0 };
              onUpdate("outro", {
                ...currentValue,
                end: endTime
              });
            }}
            aria-label="Tự động điền thời lượng còn lại"
          >
            +
          </Button>
        </div>
      </div>
    </div>
  );
}

// Timestamp Inputs Component for TV Shows (smaller size)
function TimestampInputsTV({ 
  source, 
  iframeId, 
  onUpdate 
}: { 
  source: any; 
  iframeId: string; 
  onUpdate: (field: 'intro' | 'outro', value: any) => void;
}) {
  // Lấy player từ window theo iframeId
  const getPlayerInstance = () => {
    const ytPlayers = (window as any).YT?.players;
    if (ytPlayers && ytPlayers[iframeId]) {
      return ytPlayers[iframeId];
    }
    return (window as any)["ytPlayerInstance_" + iframeId];
  };

  const setCurrentTimeToField = (field: 'intro' | 'outro', position: 'start' | 'end') => {
    let currentTime = 0;
    try {
      const player = getPlayerInstance();
      if (player && typeof player.getCurrentTime === "function") {
        currentTime = Math.floor(player.getCurrentTime());
      }
    } catch {}
    const currentValue = source[field] || { start: 0, end: 0 };
    onUpdate(field, {
      ...currentValue,
      [position]: currentTime
    });
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-white">Mốc thời gian (giây)</p>
      
      {/* Intro */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            label="Intro - Bắt đầu"
            type="number"
            size="sm"
            placeholder="0"
            value={source.intro?.start?.toString() || ""}
            onChange={(e) => {
              const start = parseFloat(e.target.value) || 0;
              onUpdate("intro", {
                ...source.intro,
                start,
                end: source.intro?.end || start + 90
              });
            }}
            classNames={{
              input: "text-white text-xs",
              inputWrapper: "bg-gray-500",
            }}
          />
          <Button
            size="sm"
            className="mt-4 min-w-0 px-3 bg-primary text-white"
            onClick={() => {
              setCurrentTimeToField('intro', 'start');
            }}
          >
            +
          </Button>
        </div>
        <div className="flex gap-2">
          <Input
            label="Intro - Kết thúc"
            type="number"
            size="sm"
            placeholder="90"
            value={source.intro?.end?.toString() || ""}
            onChange={(e) => {
              const end = parseFloat(e.target.value) || 90;
              onUpdate("intro", {
                ...source.intro,
                start: source.intro?.start || 0,
                end
              });
            }}
            classNames={{
              input: "text-white text-xs",
              inputWrapper: "bg-gray-500",
            }}
          />
          <Button
            size="sm"
            className="mt-4 min-w-0 px-3 bg-primary text-white"
            onClick={() => {
              setCurrentTimeToField('intro', 'end');
            }}
          >
            +
          </Button>
        </div>
      </div>

      {/* Outro */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            label="Outro - Bắt đầu"
            type="number"
            size="sm"
            placeholder="1200"
            value={source.outro?.start?.toString() || ""}
            onChange={(e) => {
              const start = parseFloat(e.target.value) || 0;
              onUpdate("outro", {
                ...source.outro,
                start,
                end: source.outro?.end || start + 90
              });
            }}
            classNames={{
              input: "text-white text-xs",
              inputWrapper: "bg-gray-500",
            }}
          />
          <Button
            size="sm"
            className="mt-4 min-w-0 px-3 bg-primary text-white"
            onClick={() => {
              setCurrentTimeToField('outro', 'start');
            }}
          >
            +
          </Button>
        </div>
        <div className="flex gap-2">
          <Input
            label="Outro - Kết thúc"
            type="number"
            size="sm"
            placeholder="1290"
            value={source.outro?.end?.toString() || ""}
            onChange={(e) => {
              const end = parseFloat(e.target.value) || 0;
              onUpdate("outro", {
                ...source.outro,
                start: source.outro?.start || 0,
                end
              });
            }}
            classNames={{
              input: "text-white text-xs",
              inputWrapper: "bg-gray-500",
            }}
          />
          <Button
            size="sm"
            className="mt-4 min-w-0 px-3 bg-primary text-white"
            onClick={() => {
              // Nếu đã có outro bắt đầu, tự động lấy duration video
              let endTime = 0;
              try {
                const player = (window as any)["ytPlayerInstance_" + iframeId];
                if (player && typeof player.getDuration === "function") {
                  endTime = Math.floor(player.getDuration());
                }
              } catch {}
              const currentValue = source["outro"] || { start: 0, end: 0 };
              onUpdate("outro", {
                ...currentValue,
                end: endTime
              });
            }}
            aria-label="Tự động điền thời lượng còn lại"
          >
            +
          </Button>
        </div>
      </div>
    </div>
  );
}

// Episode Item Component
function EpisodeItem({
  episodeNum,
  episodeData,
  selectedSeason,
  updateEpisodeTitle,
  removeEpisode,
  addEpisodeSource,
  removeEpisodeSource,
  updateEpisodeSource,
}: {
  episodeNum: string;
  episodeData: any;
  selectedSeason: string;
  updateEpisodeTitle: (season: string, episode: string, title: string) => void;
  removeEpisode: (season: string, episode: string) => void;
  addEpisodeSource: (season: string, episode: string) => void;
  removeEpisodeSource: (season: string, episode: string, index: number) => void;
  updateEpisodeSource: (season: string, episode: string, index: number, field: keyof SourceItem, value: any) => void;
}) {
  const [isEpisodeExpanded, setIsEpisodeExpanded] = useState(false);

  return (
    <Card key={episodeNum} className="bg-gray-700/30">
      <CardBody className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="light"
              className="text-white min-w-0 px-2"
              onClick={() => setIsEpisodeExpanded(!isEpisodeExpanded)}
              aria-label={isEpisodeExpanded ? 'Thu gọn' : 'Mở rộng'}
            >
              {isEpisodeExpanded ? <IoChevronDown size={18} /> : <IoChevronForward size={18} />}
            </Button>
            <Chip color="warning" size="sm">
              Episode {episodeNum}
            </Chip>
          </div>
          <Button
            size="sm"
            color="danger"
            variant="light"
            isIconOnly
            onPress={() => removeEpisode(selectedSeason, episodeNum)}
          >
            <IoTrash />
          </Button>
        </div>

        {isEpisodeExpanded && (
          <>
            <Input
              label="Tiêu đề Episode"
              value={episodeData.title || ""}
              onChange={(e) => 
                updateEpisodeTitle(selectedSeason, episodeNum, e.target.value)
              }
              classNames={{
                input: "text-white",
                inputWrapper: "bg-gray-600",
              }}
            />

            {/* Episode Sources */}
            <div className="pl-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-gray-400">
                  Nguồn phát ({episodeData.sources?.length || 0})
                </span>
                <Button
                  size="sm"
                  color="success"
                  variant="flat"
                  startContent={<IoAdd />}
                  onPress={() => addEpisodeSource(selectedSeason, episodeNum)}
                >
                  Thêm nguồn
                </Button>
              </div>

              <div className="space-y-3">
                {episodeData.sources?.map((source: any, srcIdx: number) => (
                  <Card key={srcIdx} className="bg-gray-600/50">
                    <CardBody className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-300">Nguồn #{srcIdx + 1}</span>
                        <Button
                          size="sm"
                          color="danger"
                          variant="light"
                          isIconOnly
                          onPress={() => 
                            removeEpisodeSource(selectedSeason, episodeNum, srcIdx)
                          }
                        >
                          <IoTrash />
                        </Button>
                      </div>

                      <Select
                        label="Provider"
                        size="sm"
                        selectedKeys={[source.provider]}
                        onChange={(e) => 
                          updateEpisodeSource(
                            selectedSeason, 
                            episodeNum, 
                            srcIdx, 
                            "provider", 
                            e.target.value
                          )
                        }
                      >
                        <SelectItem key="youtube">YouTube</SelectItem>
                        <SelectItem key="dailymotion">DailyMotion</SelectItem>
                        <SelectItem key="vidsrc">VidSrc</SelectItem>
                        <SelectItem key="kkphim">KKPhim</SelectItem>
                      </Select>

                      <Input
                        label="URL"
                        size="sm"
                        placeholder="https://..."
                        value={source.url}
                        onChange={(e) => 
                          updateEpisodeSource(
                            selectedSeason, 
                            episodeNum, 
                            srcIdx, 
                            "url", 
                            e.target.value
                          )
                        }
                        onPaste={(e) => {
                          const pastedText = e.clipboardData.getData('text');
                          if (pastedText && (pastedText.includes('youtube.com') || pastedText.includes('youtu.be'))) {
                            e.preventDefault();
                            const norm = normalizeYouTubeUrl(pastedText);
                            if (norm) {
                              updateEpisodeSource(
                                selectedSeason, 
                                episodeNum, 
                                srcIdx, 
                                "url", 
                                norm.url
                              );
                            } else {
                              updateEpisodeSource(
                                selectedSeason, 
                                episodeNum, 
                                srcIdx, 
                                "url", 
                                pastedText
                              );
                            }
                          }
                        }}
                        classNames={{
                          input: "text-white text-xs",
                          inputWrapper: "bg-gray-500",
                        }}
                      />

                      {/* Video Preview for YouTube */}
                      {source.provider === "youtube" && source.url && (
                        <VideoPreview 
                          videoId={normalizeYouTubeUrl(source.url)?.id || ''} 
                          iframeId={`tv-preview-${selectedSeason}-${episodeNum}-${srcIdx}`}
                        />
                      )}

                      {/* Intro/Outro Timestamps */}
                      {source.provider === "youtube" && source.url && (
                        <TimestampInputsTV
                          source={source}
                          iframeId={`tv-preview-${selectedSeason}-${episodeNum}-${srcIdx}`}
                          onUpdate={(field, value) => 
                            updateEpisodeSource(selectedSeason, episodeNum, srcIdx, field, value)
                          }
                        />
                      )}

                      <Input
                        label="Title"
                        size="sm"
                        value={source.title || ""}
                        onChange={(e) => 
                          updateEpisodeSource(
                            selectedSeason, 
                            episodeNum, 
                            srcIdx, 
                            "title", 
                            e.target.value
                          )
                        }
                        classNames={{
                          input: "text-white text-xs",
                          inputWrapper: "bg-gray-500",
                        }}
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          label="Ngôn ngữ"
                          size="sm"
                          value={source.language || "vi"}
                          onChange={(e) => 
                            updateEpisodeSource(
                              selectedSeason, 
                              episodeNum, 
                              srcIdx, 
                              "language", 
                              e.target.value
                            )
                          }
                          classNames={{
                            input: "text-white text-xs",
                            inputWrapper: "bg-gray-500",
                          }}
                        />
                        <Input
                          label="Chất lượng"
                          size="sm"
                          placeholder="1080p"
                          value={source.quality || ""}
                          onChange={(e) => 
                            updateEpisodeSource(
                              selectedSeason, 
                              episodeNum, 
                              srcIdx, 
                              "quality", 
                              e.target.value
                            )
                          }
                          classNames={{
                            input: "text-white text-xs",
                            inputWrapper: "bg-gray-500",
                          }}
                        />
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}

interface TMDBResult {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path?: string;
  overview?: string;
  original_language?: string;
}

interface SourceItem {
  provider: "youtube" | "dailymotion" | "vidsrc" | "kkphim";
  title: string;
  url: string;
  quality?: string;
  language?: string;
  subtitles?: string[];
  intro?: {
    start: number; // seconds
    end: number;   // seconds
  };
  outro?: {
    start: number; // seconds
    end: number;   // seconds
  };
}

interface EpisodeData {
  title: string;
  sources: SourceItem[];
}

interface SeasonData {
  [episodeNumber: string]: EpisodeData;
}

interface ExistingSource {
  tmdbId: number;
  tmdb_id?: number;
  title: string;
  year: number;
  type: "movie" | "tv";
  mtime: Date;
  sources?: any[];
  seasons?: any;
  // Metadata
  metadata?: {
    "movie-rating"?: string;
    audioVersion?: string;
    lastUpdate?: string;
  };
  // TV-specific
  totalSeasons?: number;
  totalEpisodes?: number;
  // Movie-specific
  sourcesCount?: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [contentType, setContentType] = useState<"movie" | "tv">("movie");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TMDBResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TMDBResult | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  
  // View mode: "form" hoặc "table"
  const [viewMode, setViewMode] = useState<"form" | "table">("table");
  
  // Form data - Dynamic structure based on content type
  const [formData, setFormData] = useState<any>({
    tmdbId: 0,
    title: "",
    year: 0,
    sources: [] as SourceItem[], // For movies
    seasons: {} as { [seasonNumber: string]: SeasonData }, // For TV shows
    metadata: {
      "movie-rating": "K",
      audioVersion: "PhuDe", // "PhuDe", "LongTieng", or "Goc"
      lastUpdate: new Date().toISOString(),
      genre: [] as string[],
      duration: 0,
      status: "Released",
      note: "",
      // TV-specific metadata
      studio: "",
      totalEpisodes: 0,
      totalSeasons: 0,
    },
  });

  // TV Show specific states
  const [selectedSeason, setSelectedSeason] = useState<string>("1");
  const [selectedEpisode, setSelectedEpisode] = useState<string>("1");

  // Existing sources
  const [existingSources, setExistingSources] = useState<ExistingSource[]>([]);
  const [allSources, setAllSources] = useState<ExistingSource[]>([]); // Tất cả sources cho bảng
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);
  const [currentJsonData, setCurrentJsonData] = useState<string>("");
  
  // JSON paste feature
  const [jsonInput, setJsonInput] = useState<string>("");
  const [showJsonInput, setShowJsonInput] = useState(false);

  // Load existing sources
  useEffect(() => {
    loadExistingSources();
    loadAllSources(); // Load tất cả sources cho bảng
  }, [contentType]);

  const loadExistingSources = async () => {
    setIsLoadingExisting(true);
    try {
      const response = await fetch(`/api/admin/${contentType === "movie" ? "dienanh" : "chuongtrinhtv"}`);
      if (response.ok) {
        const result = await response.json();
        const data = contentType === "movie" ? (result.movies || []) : (result.tvSeries || []);
        console.log("📊 Existing sources data:", data);
        console.log("📊 First item:", data[0]);
        setExistingSources(data);
      }
    } catch (error) {
      console.error("Error loading existing sources from Supabase:", error);
    } finally {
      setIsLoadingExisting(false);
    }
  };

  // Load tất cả sources từ Supabase
  const loadAllSources = async () => {
    try {
      // Fetch movies from DienAnh table
      const moviesResponse = await fetch(`/api/admin/dienanh`);
      const moviesResult = moviesResponse.ok ? await moviesResponse.json() : {};
      const moviesData = moviesResult.movies || [];
      
      // Fetch TV shows from ChuongTrinhTV table  
      const tvResponse = await fetch(`/api/admin/chuongtrinhtv`);
      const tvResult = tvResponse.ok ? await tvResponse.json() : {};
      const tvData = tvResult.tvSeries || [];
      
      // Merge and format data
      console.log("📊 Movies data:", moviesData);
      console.log("📊 TV data:", tvData);
      const allData = [
        ...(moviesData || []).map((item: any) => ({ ...item, type: "movie" })),
        ...(tvData || []).map((item: any) => ({ ...item, type: "tv" }))
      ];
      console.log("📊 All data:", allData);
      
      setAllSources(allData);
    } catch (error) {
      console.error("Error loading all sources from Supabase:", error);
    }
  };

  // Search TMDB
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = contentType === "movie" 
        ? await searchMovies(searchQuery) 
        : await searchTV(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Select item and load details
  const handleSelectItem = async (item: TMDBResult) => {
    setSelectedItem(item);
    setIsLoadingDetails(true);
    setCurrentJsonData(""); // Clear JSON data khi chọn phim mới

    try {
      const details = contentType === "movie"
        ? await getMovieDetails(item.id, ["videos", "credits"])
        : await getTvShowDetails(item.id);

      const title = item.title || item.name || "";
      const year = item.release_date 
        ? new Date(item.release_date).getFullYear()
        : item.first_air_date 
        ? new Date(item.first_air_date).getFullYear()
        : new Date().getFullYear();

      // Auto-fill form based on content type
      if (contentType === "movie") {
        setFormData({
          tmdbId: item.id,
          title: title,
          year: year,
          sources: [],
          metadata: {
            "movie-rating": "K",
            audioVersion: "PhuDe",
            lastUpdate: new Date().toISOString(),
            genre: details.genres?.map((g: any) => g.name) || [],
            duration: details.runtime || 0,
            status: details.status || "Released",
            note: "",
          },
        });
      } else {
        // TV Show
        setFormData({
          tmdbId: item.id,
          title: title,
          year: year,
          seasons: {},
          metadata: {
            "movie-rating": "K",
            audioVersion: "PhuDe",
            lastUpdate: new Date().toISOString(),
            genre: details.genres?.map((g: any) => g.name) || [],
            duration: details.episode_run_time?.[0] || 0,
            status: details.status || "Returning Series",
            note: "",
            studio: details.production_companies?.[0]?.name || "",
            totalEpisodes: 0,
            totalSeasons: details.number_of_seasons || 1,
          },
        });
        setSelectedSeason("1");
        setSelectedEpisode("1");
      }
    } catch (error) {
      console.error("Error loading details:", error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Load existing source data from Supabase
  const handleLoadExisting = async (tmdbId: number, sourceType?: "movie" | "tv") => {
    try {
      const typeToLoad = sourceType || contentType;
      const response = await fetch(`/api/admin/${typeToLoad === "movie" ? "dienanh" : "chuongtrinhtv"}`);
      if (response.ok) {
        const result = await response.json();
        const allData = typeToLoad === "movie" ? (result.movies || []) : (result.tvSeries || []);
        // Find the specific item by tmdb_id
        const item = allData.find((data: any) => data.tmdb_id === tmdbId);
        
        if (item) {
          // Convert tmdb_id back to tmdbId for form
          const formData = {
            ...item,
            tmdbId: item.tmdb_id || item.id || tmdbId,
          };
          
          // Set content type nếu khác với hiện tại
          if (sourceType && sourceType !== contentType) {
            setContentType(sourceType);
          }
          
          // For TV shows, recalculate totalSeasons and totalEpisodes
          if (typeToLoad === "tv" && formData.seasons) {
            const totalSeasons = Object.keys(formData.seasons).length;
            let totalEpisodes = 0;
            Object.values(formData.seasons).forEach((season: any) => {
              totalEpisodes += Object.keys(season).length;
            });
          
          // Update metadata with calculated values
          formData.metadata = {
            ...formData.metadata,
            totalSeasons,
            totalEpisodes,
          };
        }
        
        setFormData(formData);
        setSelectedItem({ id: tmdbId } as TMDBResult);
        // Hiển thị JSON data
        setCurrentJsonData(JSON.stringify(formData, null, 2));
        
        // Chuyển sang chế độ form
        setViewMode("form");
        
        // For TV shows, set initial season and episode
        if (typeToLoad === "tv" && formData.seasons) {
          const firstSeason = Object.keys(formData.seasons)[0];
          if (firstSeason) {
            setSelectedSeason(firstSeason);
            const firstEpisode = Object.keys(formData.seasons[firstSeason])[0];
            if (firstEpisode) {
              setSelectedEpisode(firstEpisode);
            }
          }
        }
      }
      } else {
        const error = await response.text();
        console.error("Failed to load source:", error);
        alert(`Không thể tải nguồn: ${error}`);
      }
    } catch (error) {
      console.error("Error loading existing source:", error);
      alert("Lỗi khi tải nguồn đã có");
    }
  };

  // Add source (for Movie)
  const addSource = () => {
    setFormData((prev: any) => ({
      ...prev,
      sources: [
        ...prev.sources,
        {
          provider: "youtube",
          title: prev.title,
          url: "",
          language: "vi",
          subtitles: ["vi"],
        },
      ],
    }));
  };

  // Remove source (for Movie)
  const removeSource = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      sources: prev.sources.filter((_: any, i: number) => i !== index),
    }));
  };

  // Update source (for Movie)
  const updateSource = (index: number, field: keyof SourceItem, value: any) => {
    setFormData((prev: any) => {
      let newSources = prev.sources.map((src: any, i: number) => {
        if (i !== index) return src;
        // Nếu chọn vidsrc, url luôn là ""
        if (field === "provider" && value === "vidsrc") {
          return { ...src, provider: value, url: "" };
        }
        // Nếu chọn kkphim, giữ nguyên URL hiện tại (không set rỗng)
        if (field === "provider" && value === "kkphim") {
          return { ...src, provider: value };
        }
        // Nếu đang là vidsrc, không cho sửa url
        if (src.provider === "vidsrc" && field === "url") {
          return src;
        }
        // Nếu là youtube và sửa url, tự động chuẩn hóa
        if (src.provider === "youtube" && field === "url") {
          const norm = normalizeYouTubeUrl(value);
          if (norm) {
            value = norm.url;
          }
        }
        // KKPhim cho phép dán link (không như VidSrc)
        if (src.provider === "kkphim" && field === "url") {
          return { ...src, [field]: value };
        }
        return { ...src, [field]: value };
      });

      // Kiểm tra trùng link YouTube
      if (field === "url" && value && prev.sources[index]?.provider === "youtube") {
        const norm = normalizeYouTubeUrl(value);
        if (norm) {
          const duplicate = prev.sources.find((src: any, i: number) =>
            i !== index && src.provider === "youtube" && normalizeYouTubeUrl(src.url)?.id === norm.id
          );
          if (duplicate) {
            alert(`⚠️ Link YouTube đã tồn tại ở vị trí #${prev.sources.indexOf(duplicate) + 1}!`);
          }
        }
      }
      return { ...prev, sources: newSources };
    });
  };

  // === TV Show Functions ===
  
  // Add season
  const addSeason = () => {
    const newSeasonNumber = (Object.keys(formData.seasons).length + 1).toString();
    setFormData((prev: any) => ({
      ...prev,
      seasons: {
        ...prev.seasons,
        [newSeasonNumber]: {},
      },
      metadata: {
        ...prev.metadata,
        totalSeasons: Object.keys(prev.seasons).length + 1,
      },
    }));
    setSelectedSeason(newSeasonNumber);
  };

  // Add episode to current season
  const addEpisode = () => {
    const currentSeason = formData.seasons[selectedSeason] || {};
    const newEpisodeNumber = (Object.keys(currentSeason).length + 1).toString();
    
    setFormData((prev: any) => ({
      ...prev,
      seasons: {
        ...prev.seasons,
        [selectedSeason]: {
          ...prev.seasons[selectedSeason],
          [newEpisodeNumber]: {
            title: `Tập ${newEpisodeNumber}`,
            sources: [],
          },
        },
      },
      metadata: {
        ...prev.metadata,
        totalEpisodes: Object.values(prev.seasons).reduce(
          (total: number, season: any) => total + Object.keys(season).length, 
          0
        ) + 1,
      },
    }));
    setSelectedEpisode(newEpisodeNumber);
  };

  // Update episode title
  const updateEpisodeTitle = (seasonNum: string, episodeNum: string, title: string) => {
    setFormData((prev: any) => ({
      ...prev,
      seasons: {
        ...prev.seasons,
        [seasonNum]: {
          ...prev.seasons[seasonNum],
          [episodeNum]: {
            ...prev.seasons[seasonNum][episodeNum],
            title,
          },
        },
      },
    }));
  };

  // Add source to episode
  const addEpisodeSource = (seasonNum: string, episodeNum: string) => {
    setFormData((prev: any) => ({
      ...prev,
      seasons: {
        ...prev.seasons,
        [seasonNum]: {
          ...prev.seasons[seasonNum],
          [episodeNum]: {
            ...prev.seasons[seasonNum][episodeNum],
            sources: [
              ...(prev.seasons[seasonNum][episodeNum]?.sources || []),
              {
                provider: "youtube",
                title: prev.title,
                url: "",
                language: "vi",
                subtitles: ["vi"],
              },
            ],
          },
        },
      },
    }));
  };

  // Update episode source
  const updateEpisodeSource = (
    seasonNum: string, 
    episodeNum: string, 
    sourceIndex: number, 
    field: keyof SourceItem, 
    value: any
  ) => {
    setFormData((prev: any) => ({
      ...prev,
      seasons: {
        ...prev.seasons,
        [seasonNum]: {
          ...prev.seasons[seasonNum],
          [episodeNum]: {
            ...prev.seasons[seasonNum][episodeNum],
            sources: prev.seasons[seasonNum][episodeNum].sources.map((src: any, i: number) => {
              if (i !== sourceIndex) return src;
              if (field === "provider" && value === "vidsrc") {
                return { ...src, provider: value, url: "" };
              }
              // Nếu chọn kkphim, giữ nguyên URL hiện tại (không set rỗng)
              if (field === "provider" && value === "kkphim") {
                return { ...src, provider: value };
              }
              if (src.provider === "vidsrc" && field === "url") {
                return src;
              }
              // KKPhim cho phép dán link (không như VidSrc)
              if (src.provider === "kkphim" && field === "url") {
                return { ...src, [field]: value };
              }
              return { ...src, [field]: value };
            }),
          },
        },
      },
    }));
  };

  // Remove episode source
  const removeEpisodeSource = (seasonNum: string, episodeNum: string, sourceIndex: number) => {
    setFormData((prev: any) => ({
      ...prev,
      seasons: {
        ...prev.seasons,
        [seasonNum]: {
          ...prev.seasons[seasonNum],
          [episodeNum]: {
            ...prev.seasons[seasonNum][episodeNum],
            sources: prev.seasons[seasonNum][episodeNum].sources.filter(
              (_: any, i: number) => i !== sourceIndex
            ),
          },
        },
      },
    }));
  };

  // Remove episode
  const removeEpisode = (seasonNum: string, episodeNum: string) => {
    const newSeasonData = { ...formData.seasons[seasonNum] };
    delete newSeasonData[episodeNum];
    
    setFormData((prev: any) => {
      const updatedSeasons = {
        ...prev.seasons,
        [seasonNum]: newSeasonData,
      };
      
      // Recalculate totalEpisodes
      const totalEpisodes = Object.values(updatedSeasons).reduce(
        (total: number, season: any) => total + Object.keys(season).length,
        0
      );
      
      return {
        ...prev,
        seasons: updatedSeasons,
        metadata: {
          ...prev.metadata,
          totalEpisodes,
        },
      };
    });
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/admin/auth/logout", { method: "POST" });
      const result = await response.json();
      
      if (result.success) {
        addToast({
          title: "Đăng xuất admin thành công",
          color: "success",
        });
        router.push("/admin/login");
        router.refresh();
      } else {
        addToast({
          title: result.message || "Lỗi đăng xuất",
          color: "danger",
        });
      }
    } catch (error) {
      console.error("Admin logout error:", error);
      addToast({
        title: "Lỗi kết nối. Vui lòng thử lại.",
        color: "danger",
      });
    }
  };

  // Auto-fix and clean JSON string
  const cleanJsonString = (jsonStr: string): string => {
    let cleaned = jsonStr;
    
    // 1. Remove BOM (Byte Order Mark)
    cleaned = cleaned.replace(/^\uFEFF/, '');
    
    // 2. Remove weird characters like _20., _123.
    cleaned = cleaned.replace(/\s*_\d+\.\s*/g, ' ');
    
    // 3. Remove comments (// and /* */)
    cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
    cleaned = cleaned.replace(/\/\/.*/g, '');
    
    // 4. Fix trailing commas before closing brackets
    cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
    
    // 5. Remove multiple spaces
    cleaned = cleaned.replace(/\s+/g, ' ');
    
    // 6. Remove control characters except newlines, tabs, and spaces
    cleaned = cleaned.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
    
    return cleaned;
  };

  // Handle JSON paste or multiple links with auto-fix
  const handleJsonPaste = () => {
    try {
      const input = jsonInput.trim();
      
      // Check if input looks like JSON (starts with {)
      if (input.startsWith('{')) {
        // Process as JSON
        processJsonInput(input);
      } else {
        // Process as multiple links
        processMultipleLinks(input);
      }
    } catch (error: any) {
      console.error("Lỗi xử lý:", error);
      alert("⚠️ Không thể xử lý dữ liệu này. Vui lòng kiểm tra lại định dạng.");
    }
  };

  // Process JSON input
  const processJsonInput = (input: string) => {
    let cleanedInput = cleanJsonString(input);
    
    // Try to parse cleaned JSON
    let parsedData;
    try {
      parsedData = JSON.parse(cleanedInput);
    } catch (firstError) {
      // If still fails, try more aggressive cleaning
      console.log("First parse failed, trying aggressive cleaning...");
      
      // Remove all control characters except newlines and tabs
      cleanedInput = cleanedInput.replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F]/g, '');
      
      // Try parse again
      parsedData = JSON.parse(cleanedInput);
    }
    
    // Validate required fields
    if (!parsedData.tmdbId && !parsedData.tmdb_id) {
      alert("JSON phải chứa ít nhất TMDB ID");
      return;
    }
    
    // Use tmdb_id if tmdbId doesn't exist
    const tmdbId = parsedData.tmdbId || parsedData.tmdb_id;
    
    // Determine content type from data structure
    const isMovie = parsedData.sources && Array.isArray(parsedData.sources);
    const isTv = parsedData.seasons && typeof parsedData.seasons === "object";
    
    if (!isMovie && !isTv) {
      alert("JSON phải chứa nguồn (Phim) hoặc mùa (Chương Trình TV)");
      return;
    }
    
    // Set content type
    const detectedType = isMovie ? "movie" : "tv";
    if (detectedType !== contentType) {
      setContentType(detectedType);
    }
    
    // Handle lastUpdate/lastUpdated field (support both naming conventions)
    const lastUpdateValue = parsedData.metadata?.lastUpdate || 
                           parsedData.metadata?.lastUpdated || 
                           parsedData.lastUpdated || 
                           parsedData.lastUpdate || 
                           new Date().toISOString();
    
    // Detect audio version from note or metadata
    let audioVersion = parsedData.metadata?.audioVersion || "PhuDe";
    if (!parsedData.metadata?.audioVersion) {
      const note = parsedData.metadata?.note || "";
      if (note.toLowerCase().includes("Lồng Tiếng")) {
        audioVersion = "LongTieng";
      } else if (note.toLowerCase().includes("Nguyên Bản") || note.toLowerCase().includes("original")) {
        audioVersion = "Goc";
      }
    }
    
    // Calculate totalSeasons and totalEpisodes for TV shows
    let totalSeasons = 0;
    let totalEpisodes = 0;
    if (isTv && parsedData.seasons) {
      totalSeasons = Object.keys(parsedData.seasons).length;
      Object.values(parsedData.seasons).forEach((season: any) => {
        totalEpisodes += Object.keys(season).length;
      });
    }
    
    // Ensure metadata exists with defaults
    const metadata = {
      "movie-rating": parsedData.metadata?.["movie-rating"] || "K",
      audioVersion: audioVersion,
      lastUpdate: lastUpdateValue,
      genre: parsedData.metadata?.genre || [],
      duration: parsedData.metadata?.duration || 0,
      status: parsedData.metadata?.status || (isMovie ? "Released" : "Returning Series"),
      note: parsedData.metadata?.note || "",
      ...(isTv && {
        studio: parsedData.metadata?.studio || "",
        totalEpisodes,
        totalSeasons,
      }),
    };
    
    // Set form data
    setFormData({
      tmdbId: tmdbId,
      title: parsedData.title,
      year: parsedData.year || new Date().getFullYear(),
      ...(isMovie ? { sources: parsedData.sources } : { seasons: parsedData.seasons }),
      metadata,
    });
    
    // Set selected item for UI
    setSelectedItem({ 
      id: tmdbId,
      title: parsedData.title,
      name: parsedData.title,
    } as TMDBResult);
    
    // For TV shows, set initial season and episode
    if (isTv && parsedData.seasons) {
      const firstSeason = Object.keys(parsedData.seasons)[0];
      if (firstSeason) {
        setSelectedSeason(firstSeason);
        const firstEpisode = Object.keys(parsedData.seasons[firstSeason])[0];
        if (firstEpisode) {
          setSelectedEpisode(firstEpisode);
        }
      }
    }
    
    // Show current JSON data (cleaned version)
    const cleanedData = {
      tmdbId: tmdbId,
      title: parsedData.title,
      year: parsedData.year || new Date().getFullYear(),
      ...(isMovie ? { sources: parsedData.sources } : { seasons: parsedData.seasons }),
      metadata,
    };
    setCurrentJsonData(JSON.stringify(cleanedData, null, 2));
    
    // Clear input and close modal
    setJsonInput("");
    setShowJsonInput(false);
    
    alert("✅ Đã tải JSON thành công!\n- Loại: " + (isMovie ? "Phim" : "TV Show") + "\n- Rating: " + metadata["movie-rating"] + "\n- Âm thanh: " + audioVersion);
  };

  // Process multiple links
  const processMultipleLinks = (input: string) => {
    // Split input by lines and filter out empty lines
    const lines = input.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      alert("Vui lòng dán ít nhất một link");
      return;
    }
    
    // Extract URLs from lines
    const urls = lines.map(line => {
      // Remove any extra whitespace and common prefixes
      let url = line.trim();
      
      // Remove any episode number prefixes like "Tập 1:", "Episode 1:", etc.
      url = url.replace(/^(Tập\s*\d+[:\s]*|Episode\s*\d+[:\s]*|E\d+[:\s]*)/i, '');
      
      return url;
    }).filter(url => url && (url.startsWith('http') || url.startsWith('//')));
    
    if (urls.length === 0) {
      alert("Không tìm thấy link hợp lệ. Vui lòng dán các link bắt đầu bằng http");
      return;
    }
    
    // Determine if this is a movie or TV show based on current content type
    const isMovie = contentType === "movie";
    
    // Default metadata
    const metadata = {
      "movie-rating": "K",
      audioVersion: "LongTieng", // Default to dubbed for multiple links
      lastUpdate: new Date().toISOString(),
      genre: [],
      duration: 0,
      status: isMovie ? "Released" : "Returning Series",
      note: `Thêm từ ${urls.length} link`,
      ...(isMovie ? {} : {
        studio: "",
        totalEpisodes: urls.length,
        totalSeasons: 1,
      }),
    };
    
    if (isMovie) {
      // For movies: create multiple sources
      const sources = urls.map((url, index) => ({
        provider: "kkphim",
        title: `Nguồn ${index + 1}`,
        url: url,
        quality: "",
        language: "vi",
        subtitles: [],
      }));
      
      setFormData({
        tmdbId: 0, // User needs to fill this
        title: "", // User needs to fill this
        year: new Date().getFullYear(),
        sources,
        metadata,
      });
    } else {
      // For TV shows: create episodes in season 1
      const episodes: any = {};
      urls.forEach((url, index) => {
        const episodeNum = (index + 1).toString();
        episodes[episodeNum] = {
          title: `Tập ${episodeNum}`,
          sources: [{
            provider: "kkphim",
            title: "KKPhim Player",
            url: url,
            quality: "",
            language: "vi",
            subtitles: [],
          }],
        };
      });
      
      const seasons = {
        "1": episodes
      };
      
      setFormData({
        tmdbId: 0, // User needs to fill this
        title: "", // User needs to fill this
        year: new Date().getFullYear(),
        seasons,
        metadata,
      });
      
      // Set first episode as selected
      setSelectedSeason("1");
      setSelectedEpisode("1");
    }
    
    // Clear input and close modal
    setJsonInput("");
    setShowJsonInput(false);
    
    // Set a dummy selected item to show the form
    setSelectedItem({
      id: 0,
      title: "Phim mới",
      name: "Phim mới",
    } as TMDBResult);
    
    alert(`✅ Đã thêm ${urls.length} link${isMovie ? " nguồn" : " tập"} thành công!\n\n⚠️ Vui lòng điền:\n- TMDB ID\n- Tiêu đề phim\n- Các thông tin khác`);
  };

  // Save data
  const handleSave = async () => {
    // Validation based on content type
    if (!formData.tmdbId) {
      alert("Vui lòng nhập TMDB ID");
      return;
    }

    // Update lastUpdate timestamp before saving
    const dataToSave: any = {
      tmdb_id: formData.tmdbId,
      title: formData.title,
      year: formData.year,
      metadata: {
        ...formData.metadata,
        lastUpdate: new Date().toISOString(),
      },
    };

    if (contentType === "movie") {
      dataToSave.sources = formData.sources;
    } else {
      dataToSave.seasons = formData.seasons;
      // Add TV-specific metadata
      dataToSave.metadata.studio = formData.metadata.studio || "";
      dataToSave.metadata.totalEpisodes = formData.metadata.totalEpisodes || 0;
      dataToSave.metadata.totalSeasons = formData.metadata.totalSeasons || 0;
    }

    if (contentType === "movie") {
      if (!dataToSave.sources || dataToSave.sources.length === 0) {
        alert("Vui lòng thêm ít nhất một nguồn cho phim");
        return;
      }
    } else {
      // TV show validation
      if (!dataToSave.seasons || Object.keys(dataToSave.seasons).length === 0) {
        alert("Vui lòng thêm ít nhất một season");
        return;
      }
      
      // Check if at least one episode exists
      const hasEpisodes = Object.values(dataToSave.seasons).some(
        (season: any) => Object.keys(season).length > 0
      );
      
      if (!hasEpisodes) {
        alert("Vui lòng thêm ít nhất một episode");
        return;
      }

      // Auto-calculate totalSeasons and totalEpisodes for TV shows
      const totalSeasons = Object.keys(dataToSave.seasons).length;
      let totalEpisodes = 0;
      Object.values(dataToSave.seasons).forEach((season: any) => {
        totalEpisodes += Object.keys(season).length;
      });

      // Update metadata with calculated values
      dataToSave.metadata = {
        ...dataToSave.metadata,
        totalSeasons,
        totalEpisodes,
      };
    }

    try {
      console.log("🚀 Bắt đầu lưu dữ liệu vào Supabase...", {
        contentType,
        tmdb_id: dataToSave.tmdb_id,
        title: dataToSave.title,
        hasMetadata: !!dataToSave.metadata,
        audioVersion: dataToSave.metadata?.audioVersion,
      });

      const response = await fetch(`/api/admin/${contentType === "movie" ? "dienanh" : "chuongtrinhtv"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      });

      console.log("📡 Trạng thái phản hồi:", response.status, response.statusText);

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Phim hoặc chương trình đã lưu vào cơ sở dữ liệu của CineVerse", result);
        alert("Phim hoặc chương trình đã lưu thành công vào CineVerse - Vũ Trụ Điện Ảnh");
        loadExistingSources();
        setCurrentJsonData(JSON.stringify(dataToSave, null, 2));
        // Update formData with new timestamp
        setFormData(formData);
      } else {
        const error = await response.text();
        console.error("❌ Lỗi từ Supabase:", error);
        alert(`Lỗi khi lưu dữ liệu vào Supabase: ${error}`);
      }
    } catch (error: any) {
      console.error("💥 Lỗi lưu trữ Supabase:", error);
      console.error("Chi tiết lỗi:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      alert(`Lỗi khi lưu dữ liệu vào Supabase: ${error.message || "Không thể kết nối đến Supabase"}`);
    }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-black p-4">
        <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                isIconOnly
                variant="light"
                onPress={() => router.push("/admin")}
                className="text-white"
              >
                <IoArrowBack size={24} />
              </Button>
              <div>
                <h1 className="mb-2 text-4xl font-bold text-white">
                  Hệ thống quản lý CineVerse
                </h1>
                <p className="text-gray-400">Quản lý nguồn Điện Ảnh và Chương Trình TV</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                color={viewMode === "table" ? "primary" : "default"}
                variant={viewMode === "table" ? "solid" : "flat"}
                startContent={<IoList />}
                onPress={() => setViewMode("table")}
              >
                Xem
              </Button>
              <Button
                color={viewMode === "form" ? "primary" : "default"}
                variant={viewMode === "form" ? "solid" : "flat"}
                startContent={<IoCreate />}
                onPress={() => setViewMode("form")}
              >
                Thêm/Sửa
              </Button>
              <Button
                color="secondary"
                variant="flat"
                startContent={<IoClipboard />}
                onPress={() => {
                  setShowJsonInput(!showJsonInput);
                  setViewMode("form");
                }}
              >
                Dán Phim
              </Button>
              <Button
                color="danger"
                variant="flat"
                startContent={<IoLogOut />}
                onPress={handleLogout}
              >
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>

        {/* JSON Paste Input */}
        {showJsonInput && (
          <Card className="mb-6 bg-linear-to-br from-purple-900/50 to-blue-900/50 backdrop-blur-sm">
            <CardHeader>
              <h3 className="text-xl font-semibold text-white">
                Dán liên kết phim
              </h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <Textarea
                placeholder='Vui lòng dán các liên kết phim vào đây'
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                minRows={10}
                classNames={{
                  input: "text-white font-mono text-sm",
                  inputWrapper: "bg-gray-900/50",
                }}
              />
              <div className="flex gap-3">
                <Button
                  color="success"
                  startContent={<IoClipboard />}
                  onPress={handleJsonPaste}
                  isDisabled={!jsonInput.trim()}
                >
                  Xử lý link
                </Button>
                <Button
                  color="default"
                  variant="flat"
                  onPress={() => {
                    setShowJsonInput(false);
                    setJsonInput("");
                  }}
                >
                  Đóng
                </Button>
              </div>
              <div className="text-sm text-gray-400">
                <p className="mb-2">💡 <strong>Hướng dẫn:</strong></p>
                <ul className="list-disc space-y-1 pl-5">
                  <li><strong>Cho phim lẻ:</strong> Dán nhiều link, mỗi link trên một dòng</li>
                  <li><strong>Cho phim bộ:</strong> Dán nhiều link, sẽ tự động tạo tập 1, 2, 3...</li>
                  <li><strong>Có thể:</strong> Dán JSON có cấu trúc đầy đủ</li>
                  <li>Link sẽ được tự động gán số tập theo thứ tự</li>
                  <li>Các trường khác sẽ được điền tự động (TMDB ID, tiêu đề, năm, rating, âm thanh)</li>
                </ul>
              </div>
            </CardBody>
          </Card>
        )}

        {viewMode === "table" ? (
          /* TABLE VIEW: Hiển thị tất cả sources */
          <Card className="bg-gray-800/50 backdrop-blur-sm">
            <CardHeader className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold text-white">
                Tất cả nguồn phim ({allSources.length})
              </h3>
              <Button
                size="sm"
                isIconOnly
                variant="flat"
                onPress={loadAllSources}
              >
                <IoRefresh />
              </Button>
            </CardHeader>
            <CardBody>
              <Table
                aria-label="Nguồn phim"
                classNames={{
                  base: "max-h-[600px] overflow-auto",
                  table: "min-h-[400px]",
                }}
              >
                <TableHeader>
                  <TableColumn>Loại</TableColumn>
                  <TableColumn>TMDB ID</TableColumn>
                  <TableColumn>Tiêu đề</TableColumn>
                  <TableColumn>Năm</TableColumn>
                  <TableColumn>Rating</TableColumn>
                  <TableColumn>Âm thanh</TableColumn>
                  <TableColumn>Chi tiết</TableColumn>
                  <TableColumn>Ngày cập nhật</TableColumn>
                  <TableColumn>Hành động</TableColumn>
                </TableHeader>
                <TableBody>
                  {allSources.map((source, index) => (
                    <TableRow key={`${source.type}-${index}`}>
                      <TableCell>
                        <Chip
                          color={source.type === "movie" ? "primary" : "warning"}
                          variant="flat"
                          size="sm"
                        >
                          {source.type === "movie" ? "Phim" : "TV"}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm text-gray-300">
                          {source.tmdb_id || source.tmdbId}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-white">
                          {source.title}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-400">{source.year}</span>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          size="sm" 
                          variant="flat" 
                          color={
                            source.metadata?.["movie-rating"] === "T18" ? "danger" :
                            source.metadata?.["movie-rating"] === "T16" ? "warning" :
                            source.metadata?.["movie-rating"] === "T13" ? "primary" :
                            "success"
                          }
                        >
                          {source.metadata?.["movie-rating"] || "K"}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          size="sm" 
                          variant="flat" 
                          color={
                            // Check Goc first (original audio)
                            source.metadata?.audioVersion === "Goc" || 
                            source.metadata?.audioVersion === "gốc" ||
                            source.metadata?.audioVersion === "Gốc" ||
                            source.metadata?.audioVersion === "nguyên bản" ||
                            source.metadata?.audioVersion === "original" ? "primary" :
                            // Then check LongTieng (dubbed)
                            source.metadata?.audioVersion === "LongTieng" || 
                            source.metadata?.audioVersion === "lồng tiếng" ||
                            source.metadata?.audioVersion === "Lồng tiếng" ||
                            source.metadata?.audioVersion === "Lồng Tiếng" ||
                            source.metadata?.audioVersion === "dubbed" ? "secondary" : 
                            // Default: PhuDe (subtitle)
                            "default"
                          }
                        >
                          {source.metadata?.audioVersion === "Goc" || 
                           source.metadata?.audioVersion === "gốc" ||
                           source.metadata?.audioVersion === "Gốc" ||
                           source.metadata?.audioVersion === "nguyên bản" ||
                           source.metadata?.audioVersion === "original" ? "Gốc" :
                           source.metadata?.audioVersion === "LongTieng" || 
                           source.metadata?.audioVersion === "lồng tiếng" ||
                           source.metadata?.audioVersion === "Lồng tiếng" ||
                           source.metadata?.audioVersion === "Lồng Tiếng" ||
                           source.metadata?.audioVersion === "dubbed" ? "Lồng tiếng" : 
                           "Phụ đề"}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        {source.type === "movie" ? (
                          <Chip size="sm" variant="flat" color="success">
                            {source.sources?.length || 0} nguồn
                          </Chip>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <div className="flex gap-2">
                              <Chip size="sm" variant="flat" color="secondary">
                                {Object.keys(source.seasons || {}).length || 0} seasons
                              </Chip>
                              <Chip size="sm" variant="flat" color="secondary">
                                {Object.values(source.seasons || {}).reduce((total: number, season: any) => 
                                  total + Object.keys(season || {}).length, 0) || 0} tập
                              </Chip>
                            </div>
                            <Chip size="sm" variant="flat" color="success">
                              {Object.values(source.seasons || {}).reduce((total: number, season: any) => 
                                total + Object.values(season || {}).reduce((seasonTotal: number, episode: any) => 
                                  seasonTotal + (episode.sources?.length || 0), 0), 0) || 0} nguồn
                            </Chip>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-gray-500">
                            File: {new Date(source.mtime).toLocaleDateString("vi-VN")}
                          </span>
                          {source.metadata?.lastUpdate && (
                            <span className="text-xs text-blue-400">
                              Update: {new Date(source.metadata.lastUpdate).toLocaleDateString("vi-VN")}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          color="primary"
                          variant="flat"
                          onPress={() => handleLoadExisting(source.tmdb_id || source.tmdbId, source.type)}
                        >
                          Chỉnh sửa
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        ) : (
          /* FORM VIEW: Original layout */
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column: Search & Existing */}
          <div className="lg:col-span-1">
            {/* Content Type Selection */}
            <Card className="mb-6 bg-gray-800/50 backdrop-blur-sm">
              <CardBody>
                <Select
                  label="Loại nội dung"
                  selectedKeys={[contentType]}
                  onChange={(e) => {
                    setContentType(e.target.value as "movie" | "tv");
                    setSearchResults([]);
                    setSelectedItem(null);
                  }}
                  classNames={{
                    base: "text-white",
                  }}
                >
                  <SelectItem key="movie">Phim</SelectItem>
                  <SelectItem key="tv">Chương trình TV</SelectItem>
                </Select>
              </CardBody>
            </Card>

            {/* TMDB Search */}
            <Card className="mb-6 bg-gray-800/50 backdrop-blur-sm">
              <CardHeader>
                <h3 className="text-xl font-semibold text-white">
                  Tìm kiếm Điện Ảnh hoặc Chương Trình TV
                </h3>
              </CardHeader>
              <CardBody>
                <div className="flex gap-2">
                  <Input
                    placeholder="Nhập tên phim/TV show..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    classNames={{
                      input: "text-white",
                      inputWrapper: "bg-gray-700",
                    }}
                  />
                  <Button
                    color="primary"
                    isIconOnly
                    onPress={handleSearch}
                    isLoading={isSearching}
                  >
                    <IoSearch />
                  </Button>
                </div>

                {/* Search Results */}
                <div className="mt-4 max-h-96 space-y-2 overflow-y-auto">
                  {searchResults.map((item) => (
                    <Card
                      key={item.id}
                      isPressable
                      onPress={() => handleSelectItem(item)}
                      className={`bg-gray-700/50 hover:bg-gray-700 ${
                        selectedItem?.id === item.id ? "ring-2 ring-blue-500" : ""
                      }`}
                    >
                      <CardBody className="flex-row gap-3 p-3">
                        {item.poster_path && (
                          <Image
                            src={getTmdbImageUrl(item.poster_path, 'w92') || ''}
                            alt={item.title || item.name || ""}
                            width={46}
                            height={69}
                            className="rounded"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-white">
                            {item.title || item.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {item.release_date || item.first_air_date || "N/A"}
                          </p>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Existing Sources */}
            <Card className="bg-gray-800/50 backdrop-blur-sm">
              <CardHeader className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">
                  Nguồn đã có ({existingSources.length})
                </h3>
                <Button
                  size="sm"
                  isIconOnly
                  variant="flat"
                  onPress={loadExistingSources}
                  isLoading={isLoadingExisting}
                >
                  <IoRefresh />
                </Button>
              </CardHeader>
              <CardBody>
                <div className="max-h-96 space-y-2 overflow-y-auto">
                  {existingSources.map((source, index) => (
                    <Card
                      key={index}
                      isPressable
                      onPress={() => handleLoadExisting(source.tmdb_id || source.tmdbId)}
                      className="bg-gray-700/50 hover:bg-gray-700"
                    >
                      <CardBody className="p-3">
                        <p className="font-semibold text-white">
                          {source.title}
                        </p>
                        <div className="flex items-center gap-2">
                          <Chip size="sm" color="primary" variant="flat">
                            {source.year}
                          </Chip>
                          <Chip size="sm" color="warning" variant="flat">
                            ID: {source.tmdb_id || source.tmdbId}
                          </Chip>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Right Column: Form */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800/50 backdrop-blur-sm">
              <CardHeader className="flex-col gap-3">
                <div className="flex w-full items-center justify-between">
                  <h3 className="text-2xl font-semibold text-white">
                    {selectedItem ? "Chỉnh sửa thông tin" : "Chọn phim để bắt đầu"}
                  </h3>
                  {selectedItem && (
                    <Button
                      color="primary"
                      size="md"
                      startContent={<IoSave />}
                      onPress={handleSave}
                    >
                      Lưu dữ liệu
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardBody className="space-y-6">
                {isLoadingDetails ? (
                  <div className="flex justify-center py-12">
                    <Spinner size="lg" />
                  </div>
                ) : selectedItem ? (
                  <>
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="TMDB ID"
                        type="number"
                        value={formData.tmdbId.toString()}
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, tmdbId: parseInt(e.target.value) || 0 }))}
                        description="Có thể chỉnh sửa nếu ID trên TMDB không chính xác"
                        classNames={{
                          input: "text-white",
                          inputWrapper: "bg-gray-700",
                        }}
                      />
                      <Input
                        label="Năm"
                        type="number"
                        value={formData.year.toString()}
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, year: parseInt(e.target.value) || 0 }))}
                        classNames={{
                          input: "text-white",
                          inputWrapper: "bg-gray-700",
                        }}
                      />
                    </div>

                    <Input
                      label="Tiêu đề"
                      value={formData.title}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, title: e.target.value }))}
                      classNames={{
                        input: "text-white",
                        inputWrapper: "bg-gray-700",
                      }}
                    />

                    {/* Metadata Fields */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <Select
                        label="Movie Rating"
                        selectedKeys={[formData.metadata["movie-rating"]]}
                        onChange={(e) => setFormData((prev: any) => ({
                          ...prev,
                          metadata: { ...prev.metadata, "movie-rating": e.target.value }
                        }))}
                        classNames={{
                          base: "text-white",
                        }}
                      >
                        <SelectItem key="P">P - Mọi lứa tuổi</SelectItem>
                        <SelectItem key="K">K - Dưới 13 tuổi (có phụ huynh)</SelectItem>
                        <SelectItem key="T13">T13 - Từ 13 tuổi trở lên</SelectItem>
                        <SelectItem key="T16">T16 - Từ 16 tuổi trở lên</SelectItem>
                        <SelectItem key="T18">T18 - Từ 18 tuổi trở lên</SelectItem>
                        <SelectItem key="C">C - Bị cấm chiếu</SelectItem>
                      </Select>

                      <Select
                        label="Phiên bản âm thanh"
                        selectedKeys={[formData.metadata.audioVersion]}
                        onChange={(e) => setFormData((prev: any) => ({
                          ...prev,
                          metadata: { ...prev.metadata, audioVersion: e.target.value }
                        }))}
                        classNames={{
                          base: "text-white",
                        }}
                      >
                        <SelectItem key="PhuDe">Phụ đề</SelectItem>
                        <SelectItem key="LongTieng">Lồng Tiếng</SelectItem>
                        <SelectItem key="Goc">Nguyên bản</SelectItem>
                      </Select>

                      <Input
                        label="Thời gian cập nhật"
                        type="datetime-local"
                        value={formData.metadata.lastUpdate ? new Date(formData.metadata.lastUpdate).toISOString().slice(0, 16) : ""}
                        onChange={(e) => setFormData((prev: any) => ({
                          ...prev,
                          metadata: { ...prev.metadata, lastUpdate: new Date(e.target.value).toISOString() }
                        }))}
                        classNames={{
                          input: "text-white",
                          inputWrapper: "bg-gray-700",
                        }}
                      />
                    </div>

                    <Textarea
                      label="Ghi chú"
                      value={formData.metadata.note}
                      onChange={(e) => setFormData((prev: any) => ({
                        ...prev,
                        metadata: { ...prev.metadata, note: e.target.value }
                      }))}
                      classNames={{
                        input: "text-white",
                        inputWrapper: "bg-gray-700",
                      }}
                    />

                    <Divider className="bg-gray-700" />

                    {/* Current JSON Data - Hiển thị khi load từ nguồn đã có */}
                    {currentJsonData && (
                      <>
                        <div>
                          <h4 className="mb-3 text-lg font-semibold text-white">
                            Dữ liệu JSON hiện tại
                          </h4>
                          <Card className="bg-gray-900/50">
                            <CardBody>
                              <pre className="max-h-64 overflow-auto text-xs text-green-400">
                                {currentJsonData}
                              </pre>
                            </CardBody>
                          </Card>
                        </div>
                        <Divider className="bg-gray-700" />
                      </>
                    )}

                    {/* Conditional Rendering: Movie Sources vs TV Seasons/Episodes */}
                    {contentType === "movie" ? (
                      /* MOVIE MODE: Simple Sources List */
                      <div>
                        <div className="mb-4 flex items-center justify-between">
                          <h4 className="text-lg font-semibold text-white">
                            Nguồn phát ({formData.sources?.length || 0})
                          </h4>
                          <Button
                            size="sm"
                            color="success"
                            startContent={<IoAdd />}
                            onPress={addSource}
                          >
                            Thêm nguồn
                          </Button>
                        </div>

                        <div className="space-y-4">
                          {formData.sources?.map((source: any, index: number) => (
                            <Card key={index} className="bg-gray-700/50">
                              <CardBody className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <Chip color="primary" size="sm">
                                    Nguồn #{index + 1}
                                  </Chip>
                                  <Button
                                    size="sm"
                                    color="danger"
                                    variant="flat"
                                    isIconOnly
                                    onPress={() => removeSource(index)}
                                  >
                                    <IoTrash />
                                  </Button>
                                </div>

                                <Select
                                  label="Provider"
                                  selectedKeys={[source.provider]}
                                  onChange={(e) => updateSource(index, "provider", e.target.value as any)}
                                >
                                  <SelectItem key="dailymotion">DailyMotion</SelectItem>
                                  <SelectItem key="youtube">YouTube</SelectItem>
                                  <SelectItem key="vidsrc">VidSrc</SelectItem>
                                  <SelectItem key="kkphim">KKPhim</SelectItem>
                                </Select>

                                <Input
                                  label="URL"
                                  placeholder="https://..."
                                  value={source.url}
                                  onChange={(e) => updateSource(index, "url", e.target.value)}
                                  onPaste={(e) => {
                                    const pastedText = e.clipboardData.getData('text');
                                    if (pastedText && (pastedText.includes('youtube.com') || pastedText.includes('youtu.be'))) {
                                      e.preventDefault();
                                      const norm = normalizeYouTubeUrl(pastedText);
                                      if (norm) {
                                        updateSource(index, "url", norm.url);
                                      } else {
                                        updateSource(index, "url", pastedText);
                                      }
                                    }
                                  }}
                                  classNames={{
                                    input: "text-white",
                                    inputWrapper: "bg-gray-600",
                                  }}
                                />

                                {/* Video Preview for YouTube */}
                                {source.provider === "youtube" && source.url && (
                                  <VideoPreview 
                                    videoId={normalizeYouTubeUrl(source.url)?.id || ''} 
                                    iframeId={`movie-preview-${index}`}
                                  />
                                )}

                                {/* Intro/Outro Timestamps */}
                                {source.provider === "youtube" && source.url && (
                                  <TimestampInputs
                                    source={source}
                                    iframeId={`movie-preview-${index}`}
                                    onUpdate={(field, value) => updateSource(index, field, value)}
                                  />
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                  <Input
                                    label="Ngôn ngữ"
                                    value={source.language || "vi"}
                                    onChange={(e) => updateSource(index, "language", e.target.value)}
                                    classNames={{
                                      input: "text-white",
                                      inputWrapper: "bg-gray-600",
                                    }}
                                  />
                                  <Input
                                    label="Chất lượng"
                                    placeholder="1080p, 720p..."
                                    value={source.quality || ""}
                                    onChange={(e) => updateSource(index, "quality", e.target.value)}
                                    classNames={{
                                      input: "text-white",
                                      inputWrapper: "bg-gray-600",
                                    }}
                                  />
                                </div>
                              </CardBody>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ) : (
                      /* TV SHOW MODE: Seasons & Episodes */
                      <div>
                        <div className="mb-4 flex items-center justify-between">
                          <h4 className="text-lg font-semibold text-white">
                            Seasons & Episodes
                          </h4>
                          <Button
                            size="sm"
                            color="success"
                            startContent={<IoAdd />}
                            onPress={addSeason}
                          >
                            Thêm Season
                          </Button>
                        </div>

                        {/* Season Tabs */}
                        <div className="mb-4 flex flex-wrap gap-2">
                          {Object.keys(formData.seasons || {}).map((seasonNum) => (
                            <Button
                              key={seasonNum}
                              size="sm"
                              color={selectedSeason === seasonNum ? "primary" : "default"}
                              variant={selectedSeason === seasonNum ? "solid" : "flat"}
                              onPress={() => setSelectedSeason(seasonNum)}
                            >
                              Season {seasonNum} 
                              <Chip size="sm" variant="flat" className="ml-2">
                                {Object.keys(formData.seasons[seasonNum] || {}).length} tập
                              </Chip>
                            </Button>
                          ))}
                        </div>

                        {/* Episodes for Selected Season */}
                        {selectedSeason && formData.seasons[selectedSeason] && (
                          <div>
                            <div className="mb-3 flex items-center justify-between">
                              <h5 className="text-base font-semibold text-white">
                                Season {selectedSeason} - Episodes
                              </h5>
                              <Button
                                size="sm"
                                color="primary"
                                startContent={<IoAdd />}
                                onPress={addEpisode}
                              >
                                Thêm Episode
                              </Button>
                            </div>

                            <div className="space-y-4">
                              {Object.entries(formData.seasons[selectedSeason] || {}).map(
                                ([episodeNum, episodeData]: [string, any]) => (
                                  <EpisodeItem
                                    key={episodeNum}
                                    episodeNum={episodeNum}
                                    episodeData={episodeData}
                                    selectedSeason={selectedSeason}
                                    updateEpisodeTitle={updateEpisodeTitle}
                                    removeEpisode={removeEpisode}
                                    addEpisodeSource={addEpisodeSource}
                                    removeEpisodeSource={removeEpisodeSource}
                                    updateEpisodeSource={updateEpisodeSource}
                                  />
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4">
                      <Button
                        color="primary"
                        size="lg"
                        startContent={<IoSave />}
                        onPress={handleSave}
                        className="flex-1"
                      >
                        Lưu dữ liệu
                      </Button>
                      <Button
                        color="default"
                        variant="flat"
                        size="lg"
                        onPress={() => {
                          setSelectedItem(null);
                          setFormData({
                            tmdbId: 0,
                            title: "",
                            year: 0,
                            sources: [],
                            metadata: {
                              "movie-rating": "K",
                              genre: [],
                              duration: 0,
                              status: "Released",
                              note: "",
                            },
                          });
                        }}
                      >
                        Hủy
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="py-12 text-center text-gray-400">
                    Tìm kiếm và chọn một phim/TV show để bắt đầu
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
        )}
        </div>
      </div>
    </AdminGuard>
  );
}
