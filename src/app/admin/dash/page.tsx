"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Select,
  SelectItem,
  Textarea,
  Chip,
  Tabs,
  Tab,
  Divider,
} from "@heroui/react";
import { IoAdd, IoRemove, IoSave, IoCheckmarkCircle, IoLogOut, IoNotifications } from "react-icons/io5";
import AdminGuard from "@/components/AdminGuard";

type SourceItem = {
  provider: string;
  title: string;
  url: string;
  language: string;
  subtitles: string[];
};

type Episode = {
  episodeNumber: string;
  title: string;
  sources: SourceItem[];
};

type Season = {
  seasonNumber: string;
  episodes: Episode[];
};

const AdminDashboard = () => {
  const router = useRouter();
  const [contentType, setContentType] = useState<"movie" | "tv">("movie");
  const [tmdbId, setTmdbId] = useState("");
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [movieRating, setMovieRating] = useState("K");
  const [status, setStatus] = useState("Released");
  const [genres, setGenres] = useState<string[]>([]);
  const [genreInput, setGenreInput] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Movie specific
  const [duration, setDuration] = useState("");
  const [movieSources, setMovieSources] = useState<SourceItem[]>([
    { provider: "DailyMotion", title: "", url: "", language: "vi", subtitles: ["vi"] },
  ]);

  // TV specific
  const [studio, setStudio] = useState("");
  const [seasons, setSeasons] = useState<Season[]>([
    {
      seasonNumber: "1",
      episodes: [
        {
          episodeNumber: "1",
          title: "",
          sources: [
            { provider: "YouTube", title: "", url: "", language: "vi", subtitles: ["vi"] },
          ],
        },
      ],
    },
  ]);

  const handleAddGenre = () => {
    if (genreInput.trim() && !genres.includes(genreInput.trim())) {
      setGenres([...genres, genreInput.trim()]);
      setGenreInput("");
    }
  };

  const handleRemoveGenre = (genre: string) => {
    setGenres(genres.filter((g) => g !== genre));
  };

  const handleAddMovieSource = () => {
    setMovieSources([
      ...movieSources,
      { provider: "dailymotion", title: "", url: "", language: "vi", subtitles: ["vi"] },
    ]);
  };

  const handleRemoveMovieSource = (index: number) => {
    setMovieSources(movieSources.filter((_, i) => i !== index));
  };

  const handleUpdateMovieSource = (index: number, field: keyof SourceItem, value: any) => {
    const updated = [...movieSources];
    updated[index] = { ...updated[index], [field]: value };
    setMovieSources(updated);
  };

  const handleAddSeason = () => {
    const nextSeasonNum = (seasons.length + 1).toString();
    setSeasons([
      ...seasons,
      {
        seasonNumber: nextSeasonNum,
        episodes: [
          {
            episodeNumber: "1",
            title: "",
            sources: [
              { provider: "youtube", title: "", url: "", language: "vi", subtitles: ["vi"] },
            ],
          },
        ],
      },
    ]);
  };

  const handleRemoveSeason = (seasonIndex: number) => {
    setSeasons(seasons.filter((_, i) => i !== seasonIndex));
  };

  const handleAddEpisode = (seasonIndex: number) => {
    const updated = [...seasons];
    const nextEpNum = (updated[seasonIndex].episodes.length + 1).toString();
    updated[seasonIndex].episodes.push({
      episodeNumber: nextEpNum,
      title: "",
      sources: [
        { provider: "youtube", title: "", url: "", language: "vi", subtitles: ["vi"] },
      ],
    });
    setSeasons(updated);
  };

  const handleRemoveEpisode = (seasonIndex: number, episodeIndex: number) => {
    const updated = [...seasons];
    updated[seasonIndex].episodes = updated[seasonIndex].episodes.filter(
      (_, i) => i !== episodeIndex
    );
    setSeasons(updated);
  };

  const handleUpdateEpisode = (
    seasonIndex: number,
    episodeIndex: number,
    field: string,
    value: any
  ) => {
    const updated = [...seasons];
    updated[seasonIndex].episodes[episodeIndex] = {
      ...updated[seasonIndex].episodes[episodeIndex],
      [field]: value,
    };
    setSeasons(updated);
  };

  const handleAddEpisodeSource = (seasonIndex: number, episodeIndex: number) => {
    const updated = [...seasons];
    updated[seasonIndex].episodes[episodeIndex].sources.push({
      provider: "youtube",
      title: "",
      url: "",
      language: "vi",
      subtitles: ["vi"],
    });
    setSeasons(updated);
  };

  const handleRemoveEpisodeSource = (
    seasonIndex: number,
    episodeIndex: number,
    sourceIndex: number
  ) => {
    const updated = [...seasons];
    updated[seasonIndex].episodes[episodeIndex].sources = updated[seasonIndex].episodes[
      episodeIndex
    ].sources.filter((_, i) => i !== sourceIndex);
    setSeasons(updated);
  };

  const handleUpdateEpisodeSource = (
    seasonIndex: number,
    episodeIndex: number,
    sourceIndex: number,
    field: keyof SourceItem,
    value: any
  ) => {
    const updated = [...seasons];
    updated[seasonIndex].episodes[episodeIndex].sources[sourceIndex] = {
      ...updated[seasonIndex].episodes[episodeIndex].sources[sourceIndex],
      [field]: value,
    };
    setSeasons(updated);
  };

  const handleSubmit = async () => {
    if (!tmdbId || !title || !year) {
      alert("Vui lòng điền đầy đủ TMDB ID, Title và Year");
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage("");

    try {
      let data: any;

      if (contentType === "movie") {
        data = {
          tmdbId: parseInt(tmdbId),
          title,
          year: parseInt(year),
          sources: movieSources,
          metadata: {
            "movie-rating": movieRating,
            genre: genres,
            duration: parseInt(duration) || 0,
            status,
            ...(note && { note }),
          },
        };
      } else {
        // Convert seasons to the required format
        const seasonsObj: any = {};
        seasons.forEach((season) => {
          const episodesObj: any = {};
          season.episodes.forEach((ep) => {
            episodesObj[ep.episodeNumber] = {
              title: ep.title,
              sources: ep.sources,
            };
          });
          seasonsObj[season.seasonNumber] = episodesObj;
        });

        const totalEpisodes = seasons.reduce((acc, s) => acc + s.episodes.length, 0);

        data = {
          tmdbId: parseInt(tmdbId),
          title,
          year: parseInt(year),
          seasons: seasonsObj,
          metadata: {
            "movie-rating": movieRating,
            ...(studio && { studio }),
            genre: genres,
            totalEpisodes,
            totalSeasons: seasons.length,
            status,
            ...(note && { note }),
          },
        };
      }

      const response = await fetch("/api/admin/sources/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: contentType, data }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage(`✅ Tạo thành công: ${result.filePath}`);
        // Reset form after 3 seconds
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else {
        alert(`❌ Lỗi: ${result.message}`);
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("❌ Có lỗi xảy ra khi tạo file");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AdminGuard>
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <Card>
          <CardHeader className="flex flex-row justify-between items-center gap-2">
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-bold text-warning">Hệ thống cập nhật Điện Ảnh</h1>
              <p className="text-foreground-500">Tạo file JSON cho Movie và ChuongTrinhTV</p>
            </div>
            <div className="flex gap-2">
              <Button
                color="warning"
                variant="flat"
                startContent={<IoNotifications />}
                onPress={() => router.push("/admin/dash/thongbao")}
              >
                Thông báo
              </Button>
              <Button
                color="danger"
                variant="flat"
                startContent={<IoLogOut />}
                onPress={handleLogout}
              >
                Logout
              </Button>
            </div>
          </CardHeader>
        <CardBody className="gap-6">
          {successMessage && (
            <div className="rounded-lg bg-success-50 p-4 text-success">
              <div className="flex items-center gap-2">
                <IoCheckmarkCircle size={24} />
                <span>{successMessage}</span>
              </div>
            </div>
          )}

          {/* Content Type Selection */}
          <Tabs
            selectedKey={contentType}
            onSelectionChange={(key) => setContentType(key as "movie" | "tv")}
            color="warning"
            variant="bordered"
          >
            <Tab key="movie" title="Movie (Phim lẻ)" />
            <Tab key="tv" title="TV Show (Chương trình TV)" />
          </Tabs>

          {/* Basic Info */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Input
              label="TMDB ID"
              placeholder="374856"
              value={tmdbId}
              onChange={(e) => setTmdbId(e.target.value)}
              isRequired
              variant="bordered"
              color="warning"
            />
            <Input
              label="Title"
              placeholder="Tên phim..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              isRequired
              variant="bordered"
              color="warning"
            />
            <Input
              label="Year"
              placeholder="2025"
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              isRequired
              variant="bordered"
              color="warning"
            />
          </div>

          {/* Metadata */}
          <Divider />
          <h3 className="text-lg font-semibold">Metadata</h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Select
              label="Movie Rating"
              selectedKeys={[movieRating]}
              onChange={(e) => setMovieRating(e.target.value)}
              variant="bordered"
              color="warning"
            >
              <SelectItem key="K">K - Mọi lứa tuổi</SelectItem>
              <SelectItem key="P">P - Dưới 13 tuổi cần hướng dẫn</SelectItem>
              <SelectItem key="T13">T13 - Từ 13 tuổi trở lên</SelectItem>
              <SelectItem key="T16">T16 - Từ 16 tuổi trở lên</SelectItem>
              <SelectItem key="T18">T18 - Từ 18 tuổi trở lên</SelectItem>
              <SelectItem key="C">C - Phim cấm</SelectItem>
            </Select>

            <Select
              label="Status"
              selectedKeys={[status]}
              onChange={(e) => setStatus(e.target.value)}
              variant="bordered"
              color="warning"
            >
              <SelectItem key="Released">Released</SelectItem>
              <SelectItem key="Returning Series">Returning Series</SelectItem>
              <SelectItem key="Ended">Ended</SelectItem>
              <SelectItem key="Canceled">Canceled</SelectItem>
            </Select>

            {contentType === "movie" ? (
              <Input
                label="Duration (phút)"
                placeholder="120"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                variant="bordered"
                color="warning"
              />
            ) : (
              <Input
                label="Studio"
                placeholder="Science SARU"
                value={studio}
                onChange={(e) => setStudio(e.target.value)}
                variant="bordered"
                color="warning"
              />
            )}
          </div>

          {/* Genres */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Genres</label>
            <div className="flex gap-2">
              <Input
                placeholder="Nhập genre và Enter..."
                value={genreInput}
                onChange={(e) => setGenreInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddGenre()}
                variant="bordered"
                color="warning"
              />
              <Button color="warning" onPress={handleAddGenre} isIconOnly>
                <IoAdd size={20} />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => (
                <Chip
                  key={genre}
                  onClose={() => handleRemoveGenre(genre)}
                  variant="flat"
                  color="warning"
                >
                  {genre}
                </Chip>
              ))}
            </div>
          </div>

          {/* Note */}
          <Textarea
            label="Note (tùy chọn)"
            placeholder="Ghi chú về phim..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            variant="bordered"
            color="warning"
          />

          {/* Sources for Movie */}
          {contentType === "movie" && (
            <>
              <Divider />
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Sources</h3>
                <Button
                  color="warning"
                  variant="flat"
                  startContent={<IoAdd />}
                  onPress={handleAddMovieSource}
                >
                  Thêm Source
                </Button>
              </div>

              {movieSources.map((source, index) => (
                <Card key={index} shadow="sm">
                  <CardBody className="gap-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Source #{index + 1}</span>
                      {movieSources.length > 1 && (
                        <Button
                          color="danger"
                          variant="flat"
                          size="sm"
                          isIconOnly
                          onPress={() => handleRemoveMovieSource(index)}
                        >
                          <IoRemove />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <Select
                        label="Provider"
                        selectedKeys={[source.provider]}
                        onChange={(e) => handleUpdateMovieSource(index, "provider", e.target.value)}
                        variant="bordered"
                      >
                        <SelectItem key="youtube">YouTube</SelectItem>
                        <SelectItem key="dailymotion">Dailymotion</SelectItem>
                        <SelectItem key="vimeo">Vimeo</SelectItem>
                      </Select>
                      <Input
                        label="Title"
                        placeholder="Tên nguồn..."
                        value={source.title}
                        onChange={(e) => handleUpdateMovieSource(index, "title", e.target.value)}
                        variant="bordered"
                      />
                    </div>
                    <Input
                      label="URL (embed)"
                      placeholder="https://www.youtube.com/embed/..."
                      value={source.url}
                      onChange={(e) => handleUpdateMovieSource(index, "url", e.target.value)}
                      variant="bordered"
                    />
                  </CardBody>
                </Card>
              ))}
            </>
          )}

          {/* Seasons/Episodes for TV */}
          {contentType === "tv" && (
            <>
              <Divider />
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Seasons & Episodes</h3>
                <Button
                  color="warning"
                  variant="flat"
                  startContent={<IoAdd />}
                  onPress={handleAddSeason}
                >
                  Thêm Season
                </Button>
              </div>

              {seasons.map((season, seasonIndex) => (
                <Card key={seasonIndex} className="bg-warning-50/50">
                  <CardBody className="gap-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold">Season {season.seasonNumber}</h4>
                      <div className="flex gap-2">
                        <Button
                          color="warning"
                          variant="flat"
                          size="sm"
                          startContent={<IoAdd />}
                          onPress={() => handleAddEpisode(seasonIndex)}
                        >
                          Thêm Episode
                        </Button>
                        {seasons.length > 1 && (
                          <Button
                            color="danger"
                            variant="flat"
                            size="sm"
                            isIconOnly
                            onPress={() => handleRemoveSeason(seasonIndex)}
                          >
                            <IoRemove />
                          </Button>
                        )}
                      </div>
                    </div>

                    {season.episodes.map((episode, episodeIndex) => (
                      <Card key={episodeIndex} shadow="sm">
                        <CardBody className="gap-4">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">
                              Tập {episode.episodeNumber}
                            </span>
                            {season.episodes.length > 1 && (
                              <Button
                                color="danger"
                                variant="flat"
                                size="sm"
                                isIconOnly
                                onPress={() => handleRemoveEpisode(seasonIndex, episodeIndex)}
                              >
                                <IoRemove />
                              </Button>
                            )}
                          </div>
                          <Input
                            label="Episode Title"
                            placeholder="Tên tập..."
                            value={episode.title}
                            onChange={(e) =>
                              handleUpdateEpisode(seasonIndex, episodeIndex, "title", e.target.value)
                            }
                            variant="bordered"
                          />

                          {/* Episode Sources */}
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <label className="text-sm font-medium">Sources</label>
                              <Button
                                color="primary"
                                variant="flat"
                                size="sm"
                                onPress={() => handleAddEpisodeSource(seasonIndex, episodeIndex)}
                              >
                                <IoAdd /> Source
                              </Button>
                            </div>

                            {episode.sources.map((source, sourceIndex) => (
                              <div key={sourceIndex} className="rounded-lg border p-3">
                                <div className="mb-2 flex items-center justify-between">
                                  <span className="text-xs text-foreground-500">
                                    Source #{sourceIndex + 1}
                                  </span>
                                  {episode.sources.length > 1 && (
                                    <Button
                                      color="danger"
                                      variant="light"
                                      size="sm"
                                      isIconOnly
                                      onPress={() =>
                                        handleRemoveEpisodeSource(
                                          seasonIndex,
                                          episodeIndex,
                                          sourceIndex
                                        )
                                      }
                                    >
                                      <IoRemove />
                                    </Button>
                                  )}
                                </div>
                                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                  <Select
                                    label="Provider"
                                    selectedKeys={[source.provider]}
                                    onChange={(e) =>
                                      handleUpdateEpisodeSource(
                                        seasonIndex,
                                        episodeIndex,
                                        sourceIndex,
                                        "provider",
                                        e.target.value
                                      )
                                    }
                                    size="sm"
                                    variant="bordered"
                                  >
                                    <SelectItem key="youtube">YouTube</SelectItem>
                                    <SelectItem key="dailymotion">Dailymotion</SelectItem>
                                  </Select>
                                  <Input
                                    label="Title"
                                    placeholder="Tên nguồn..."
                                    value={source.title}
                                    onChange={(e) =>
                                      handleUpdateEpisodeSource(
                                        seasonIndex,
                                        episodeIndex,
                                        sourceIndex,
                                        "title",
                                        e.target.value
                                      )
                                    }
                                    size="sm"
                                    variant="bordered"
                                  />
                                </div>
                                <Input
                                  label="URL (embed)"
                                  placeholder="https://www.youtube.com/embed/..."
                                  value={source.url}
                                  onChange={(e) =>
                                    handleUpdateEpisodeSource(
                                      seasonIndex,
                                      episodeIndex,
                                      sourceIndex,
                                      "url",
                                      e.target.value
                                    )
                                  }
                                  size="sm"
                                  variant="bordered"
                                  className="mt-2"
                                />
                              </div>
                            ))}
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </CardBody>
                </Card>
              ))}
            </>
          )}

          {/* Submit Button */}
          <Divider />
          <Button
            color="warning"
            size="lg"
            startContent={<IoSave />}
            onPress={handleSubmit}
            isLoading={isSubmitting}
            className="w-full font-bold"
          >
            {isSubmitting ? "Đang tạo file..." : "Tạo File JSON"}
          </Button>
        </CardBody>
      </Card>
      </div>
    </AdminGuard>
  );
};

export default AdminDashboard;
