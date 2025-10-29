"use client";

import { useState, useEffect } from "react";
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
} from "@heroui/react";
import { IoSearch, IoSave, IoRefresh, IoAdd, IoTrash, IoList, IoCreate } from "react-icons/io5";
import { searchMovies, searchTV, getMovieDetails, getTvShowDetails } from "@/api/tmdb";
import Image from "next/image";

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
  provider: "youtube" | "dailymotion";
  title: string;
  url: string;
  quality?: string;
  language?: string;
  subtitles?: string[];
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
  title: string;
  year: number;
  type: "movie" | "tv";
  mtime: Date;
  // TV-specific
  totalSeasons?: number;
  totalEpisodes?: number;
  // Movie-specific
  sourcesCount?: number;
}

export default function DashboardPage() {
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

  // Load existing sources
  useEffect(() => {
    loadExistingSources();
    loadAllSources(); // Load tất cả sources cho bảng
  }, [contentType]);

  const loadExistingSources = async () => {
    setIsLoadingExisting(true);
    try {
      const response = await fetch(`/api/sources/list?type=${contentType}`);
      if (response.ok) {
        const data = await response.json();
        setExistingSources(data.sources || []);
      }
    } catch (error) {
      console.error("Error loading existing sources:", error);
    } finally {
      setIsLoadingExisting(false);
    }
  };

  // Load tất cả sources (không filter theo type)
  const loadAllSources = async () => {
    try {
      const response = await fetch(`/api/sources/list`);
      if (response.ok) {
        const data = await response.json();
        setAllSources(data.sources || []);
      }
    } catch (error) {
      console.error("Error loading all sources:", error);
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

  // Load existing source data
  const handleLoadExisting = async (tmdbId: number, sourceType?: "movie" | "tv") => {
    try {
      const typeToLoad = sourceType || contentType;
      const response = await fetch(`/api/sources/${typeToLoad}/${tmdbId}`);
      if (response.ok) {
        const result = await response.json();
        // API returns { success: true, data: {...} }
        const data = result.success ? result.data : result;
        
        // Set content type nếu khác với hiện tại
        if (sourceType && sourceType !== contentType) {
          setContentType(sourceType);
        }
        
        setFormData(data);
        setSelectedItem({ id: tmdbId } as TMDBResult);
        // Hiển thị JSON data
        setCurrentJsonData(JSON.stringify(data, null, 2));
        
        // Chuyển sang chế độ form
        setViewMode("form");
        
        // For TV shows, set initial season and episode
        if (typeToLoad === "tv" && data.seasons) {
          const firstSeason = Object.keys(data.seasons)[0];
          if (firstSeason) {
            setSelectedSeason(firstSeason);
            const firstEpisode = Object.keys(data.seasons[firstSeason])[0];
            if (firstEpisode) {
              setSelectedEpisode(firstEpisode);
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
          provider: "dailymotion",
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
    setFormData((prev: any) => ({
      ...prev,
      sources: prev.sources.map((src: any, i: number) => 
        i === index ? { ...src, [field]: value } : src
      ),
    }));
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
            sources: prev.seasons[seasonNum][episodeNum].sources.map((src: any, i: number) =>
              i === sourceIndex ? { ...src, [field]: value } : src
            ),
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
    
    setFormData((prev: any) => ({
      ...prev,
      seasons: {
        ...prev.seasons,
        [seasonNum]: newSeasonData,
      },
    }));
  };

  // Save data
  const handleSave = async () => {
    // Validation based on content type
    if (!formData.tmdbId) {
      alert("Vui lòng chọn phim/TV show");
      return;
    }

    if (contentType === "movie") {
      if (!formData.sources || formData.sources.length === 0) {
        alert("Vui lòng thêm ít nhất một nguồn cho phim");
        return;
      }
    } else {
      // TV show validation
      if (!formData.seasons || Object.keys(formData.seasons).length === 0) {
        alert("Vui lòng thêm ít nhất một season");
        return;
      }
      
      // Check if at least one episode exists
      const hasEpisodes = Object.values(formData.seasons).some(
        (season: any) => Object.keys(season).length > 0
      );
      
      if (!hasEpisodes) {
        alert("Vui lòng thêm ít nhất một episode");
        return;
      }
    }

    try {
      const response = await fetch(`/api/sources/${contentType}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Lưu thành công!");
        loadExistingSources();
        setCurrentJsonData(JSON.stringify(formData, null, 2));
      } else {
        const error = await response.text();
        alert(`Lỗi khi lưu dữ liệu: ${error}`);
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Lỗi khi lưu dữ liệu");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-4xl font-bold text-white">
                Hệ thống quản lý CineVerse
              </h1>
              <p className="text-gray-400">Quản lý nguồn phim và chương trình TV</p>
            </div>
            <div className="flex gap-2">
              <Button
                color={viewMode === "table" ? "primary" : "default"}
                variant={viewMode === "table" ? "solid" : "flat"}
                startContent={<IoList />}
                onPress={() => setViewMode("table")}
              >
                Xem bảng
              </Button>
              <Button
                color={viewMode === "form" ? "primary" : "default"}
                variant={viewMode === "form" ? "solid" : "flat"}
                startContent={<IoCreate />}
                onPress={() => setViewMode("form")}
              >
                Thêm/Sửa
              </Button>
            </div>
          </div>
        </div>

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
                aria-label="Bảng nguồn phim"
                classNames={{
                  base: "max-h-[600px] overflow-auto",
                  table: "min-h-[400px]",
                }}
              >
                <TableHeader>
                  <TableColumn>LOẠI</TableColumn>
                  <TableColumn>TMDB ID</TableColumn>
                  <TableColumn>TIÊU ĐỀ</TableColumn>
                  <TableColumn>NĂM</TableColumn>
                  <TableColumn>CHI TIẾT</TableColumn>
                  <TableColumn>NGÀY CẬP NHẬT</TableColumn>
                  <TableColumn>HÀNH ĐỘNG</TableColumn>
                </TableHeader>
                <TableBody>
                  {allSources.map((source) => (
                    <TableRow key={`${source.type}-${source.tmdbId}`}>
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
                          {source.tmdbId}
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
                        {source.type === "movie" ? (
                          <Chip size="sm" variant="flat" color="success">
                            {source.sourcesCount || 0} nguồn
                          </Chip>
                        ) : (
                          <div className="flex gap-2">
                            <Chip size="sm" variant="flat" color="secondary">
                              {source.totalSeasons || 0} seasons
                            </Chip>
                            <Chip size="sm" variant="flat" color="secondary">
                              {source.totalEpisodes || 0} tập
                            </Chip>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-gray-500">
                          {new Date(source.mtime).toLocaleDateString("vi-VN")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          color="primary"
                          variant="flat"
                          onPress={() => handleLoadExisting(source.tmdbId, source.type)}
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
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">{
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
                  Tìm kiếm TMDB
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
                            src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
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
                  {existingSources.map((source) => (
                    <Card
                      key={source.tmdbId}
                      isPressable
                      onPress={() => handleLoadExisting(source.tmdbId)}
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
                            ID: {source.tmdbId}
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
              <CardHeader>
                <h3 className="text-2xl font-semibold text-white">
                  {selectedItem ? "Chỉnh sửa thông tin" : "Chọn phim để bắt đầu"}
                </h3>
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
                        value={formData.tmdbId.toString()}
                        isReadOnly
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
                                </Select>

                                <Input
                                  label="URL"
                                  placeholder="https://..."
                                  value={source.url}
                                  onChange={(e) => updateSource(index, "url", e.target.value)}
                                  classNames={{
                                    input: "text-white",
                                    inputWrapper: "bg-gray-600",
                                  }}
                                />

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
                                  <Card key={episodeNum} className="bg-gray-700/30">
                                    <CardBody className="space-y-3">
                                      <div className="flex items-center justify-between">
                                        <Chip color="warning" size="sm">
                                          Episode {episodeNum}
                                        </Chip>
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
                                                  classNames={{
                                                    input: "text-white text-xs",
                                                    inputWrapper: "bg-gray-500",
                                                  }}
                                                />

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
                                    </CardBody>
                                  </Card>
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
  );
}
