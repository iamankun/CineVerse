"use client";

import { useState, useEffect } from "react";
import { Input, Button, Card, CardBody, CardHeader, Spinner, Select, SelectItem, Chip, Divider, addToast, Image } from "@heroui/react";
import { Copy, Search, Film, Tv, ExternalLink, Check } from "lucide-react";
import { kkphim, KKPhimResponse, KKPhimEpisode } from "@/services";
import { parseAsString, useQueryState } from "nuqs";
import { tmdb } from "@/api/tmdb";
import { useDebouncedValue } from "@mantine/hooks";
import { Movie, TV } from "tmdb-ts/dist/types";
import { isEmpty } from "@/utils/helpers";
import { getImageUrl } from "@/utils/movies";

interface SearchResult {
  type: "tmdb" | "slug";
  data: KKPhimResponse;
}

interface TMDBSearchResult {
  id: number;
  title: string;
  name: string;
  release_date?: string;
  first_air_date?: string;
  poster_path?: string;
  media_type: "movie" | "tv";
}

export default function KKPhimPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"tmdb" | "slug" | "name">("name");
  const [contentType, setContentType] = useState<"movie" | "tv">("movie");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [copiedLinks, setCopiedLinks] = useState<Set<string>>(new Set());
  
  // TMDB Search states
  const [tmdbResults, setTmdbResults] = useState<TMDBSearchResult[]>([]);
  const [tmdbLoading, setTmdbLoading] = useState(false);
  const [debouncedSearchQuery] = useDebouncedValue(searchQuery.trim(), searchQuery ? 500 : 0);

  // Get query parameters from URL
  const [type] = useQueryState("type", parseAsString);
  const [id] = useQueryState("id", parseAsString);

  // Auto-search when coming from search page
  useEffect(() => {
    if (type && id) {
      setSearchType("tmdb");
      setContentType(type as "movie" | "tv");
      setSearchQuery(id);
      // Trigger search after a short delay to ensure state is updated
      setTimeout(() => {
        handleSearch();
      }, 100);
    }
  }, [type, id]);

  // TMDB Search when query changes
  useEffect(() => {
    if (searchType === "name" && debouncedSearchQuery) {
      handleTMDBSearch();
    } else {
      setTmdbResults([]);
    }
  }, [debouncedSearchQuery, searchType]);

  const handleTMDBSearch = async () => {
    if (!debouncedSearchQuery || searchType !== "name") return;
    
    setTmdbLoading(true);
    try {
      const [movieResults, tvResults] = await Promise.all([
        tmdb.search.movies({ query: debouncedSearchQuery, page: 1, language: "vi-VN", region: "VN" }),
        tmdb.search.tvShows({ query: debouncedSearchQuery, page: 1, language: "vi-VN" })
      ]);

      const combinedResults: TMDBSearchResult[] = [
        ...movieResults.results.map(movie => ({
          id: movie.id,
          title: movie.title,
          name: movie.title,
          release_date: movie.release_date,
          poster_path: movie.poster_path,
          media_type: "movie" as const
        })),
        ...tvResults.results.map(tv => ({
          id: tv.id,
          title: tv.name,
          name: tv.name,
          first_air_date: tv.first_air_date,
          poster_path: tv.poster_path,
          media_type: "tv" as const
        }))
      ];

      setTmdbResults(combinedResults.slice(0, 10)); // Limit to 10 results
    } catch (error) {
      console.error("TMDB Search error:", error);
      setTmdbResults([]);
    } finally {
      setTmdbLoading(false);
    }
  };

  // Debug function to test KKPhim API directly
  const testKKPhimAPI = async () => {
    console.log("🧪 Testing KKPhim API directly...");
    try {
      const testId = "1396965"; // Detective Conan: One-Eyed Flashback
      console.log(`🔍 Testing with TMDB ID: ${testId}`);
      
      const result = await kkphim.findKKPhimByTMDB(testId);
      console.log("📊 KKPhim API result:", result);
      
      if (result) {
        console.log("✅ KKPhim API success!");
        console.log("🎬 Movie name:", result.movie.name);
        console.log("🎬 Movie type:", result.movie.type);
        console.log("🎬 Episodes count:", result.episodes?.length || 0);
      } else {
        console.log("❌ KKPhim API returned null");
      }
    } catch (error) {
      console.error("❌ KKPhim API test error:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setResults([]);

    try {
      let apiUrl = '';
      
      if (searchType === "tmdb") {
        // Use auto-detect by not providing type parameter
        // API route will try TV first, then movie
        apiUrl = `/api/kkphim?id=${searchQuery}`;
      } else if (searchType === "slug") {
        // Search by slug
        apiUrl = `/api/kkphim?slug=${encodeURIComponent(searchQuery)}`;
      } else {
        // "name" type - shouldn't reach here for KKPhim search
        console.log("❌ Invalid search type for KKPhim API:", searchType);
        addToast({
          title: "Lỗi",
          description: "Vui lòng chọn TMDB ID hoặc Slug để tìm kiếm KKPhim",
          color: "danger",
        });
        return;
      }

      console.log(`🔍 API Route: ${apiUrl}`);
      console.log(`🔍 Debug: searchType=${searchType}, searchQuery=${searchQuery}`);
      
      const response = await fetch(apiUrl);
      
      console.log(`📡 Response status: ${response.status}`);
      console.log(`📡 Response headers:`, Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ API Error ${response.status}:`, errorText);
        console.error(`❌ Full error details:`, {
          apiUrl,
          searchType,
          searchQuery,
          responseStatus: response.status,
          errorText,
          responseHeaders: Object.fromEntries(response.headers.entries())
        });
        
        // Handle specific error cases
        if (response.status === 404) {
          addToast({
            title: "Không tìm thấy",
            description: `KKPhim không hỗ trợ TMDB ID: ${searchQuery}. Thử tìm bằng slug hoặc tên phim khác.`,
            color: "warning",
          });
        } else {
          addToast({
            title: "Lỗi server",
            description: `Lỗi ${response.status}: ${errorText || 'Không thể kết nối đến KKPhim API'}`,
            color: "danger",
          });
        }
        return;
      }

      const data = await response.json();
      console.log(`📦 API Response:`, data);
      console.log(`🔍 Debug - Movie type:`, data.movie?.type);
      console.log(`🔍 Debug - Movie name:`, data.movie?.name);
      
      if (!data.status) {
        addToast({
          title: "Không tìm thấy",
          description: data.msg || "Không tìm thấy nội dung",
          color: "warning",
        });
        return;
      }

      setResults([{ type: searchType, data }]);
      
    } catch (error) {
      console.error("Search error:", error);
      addToast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Đã xảy ra lỗi khi tìm kiếm",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLinks(prev => new Set(prev).add(link));
      addToast({
        title: "Đã sao chép",
        description: "Link đã được sao chép vào clipboard",
        color: "success",
      });
      
      // Remove from copied state after 3 seconds
      setTimeout(() => {
        setCopiedLinks(prev => {
          const newSet = new Set(prev);
          newSet.delete(link);
          return newSet;
        });
      }, 3000);
    } catch (error) {
      addToast({
        title: "Lỗi",
        description: "Không thể sao chép link",
        color: "danger",
      });
    }
  };

  const extractAllLinks = (data: KKPhimResponse): string[] => {
    const links: string[] = [];
    
    if (data.episodes) {
      data.episodes.forEach(server => {
        if (server.server_data) {
          server.server_data.forEach(episode => {
            if (episode.link_embed) {
              links.push(episode.link_embed);
            }
            if (episode.link_m3u8) {
              links.push(episode.link_m3u8);
            }
          });
        }
      });
    }
    
    return links;
  };

  return (
    <div className="mx-auto max-w-5xl px-3 sm:px-5 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">KKPhim Link Extractor</h1>
        <p className="text-foreground/60">Tìm kiếm và sao chép link-embed từ KKPhim API</p>
      </div>

      {/* Search Section */}
      <Card className="mb-8">
        <CardBody className="gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select
              label=""
              selectedKeys={[searchType]}
              onSelectionChange={(keys) => setSearchType(Array.from(keys)[0] as "tmdb" | "slug" | "name")}
              className="sm:max-w-[200px]"
            >
              <SelectItem key="name">
                Tên phim
              </SelectItem>
              <SelectItem key="tmdb">
                TMDB ID
              </SelectItem>
              <SelectItem key="slug">
                Slug
              </SelectItem>
            </Select>

            <Input
              label={searchType === "tmdb" ? "TMDB ID" : searchType === "name" ? "Tên phim" : "Slug"}
              placeholder={
                searchType === "tmdb" 
                  ? "Nhập TMDB ID..." 
                  : searchType === "name"
                    ? "Nhập tên phim..."
                    : "Nhập slug phim..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
            />

            <Button
              color="primary"
              onPress={handleSearch}
              isLoading={loading}
              disabled={!searchQuery.trim()}
              className="sm:max-w-[120px]"
            >
              {loading ? <Spinner size="sm" /> : <Search size={16} />}
              Tìm kiếm
            </Button>
            <Button
              color="secondary"
              variant="flat"
              onPress={testKKPhimAPI}
              className="sm:max-w-[120px]"
            >
              Test API
            </Button>
          </div>
          {searchType === "tmdb" && (
            <div className="mt-2 text-xs text-foreground/60">
              ℹ️ KKPhim lưu nhiều movies như TV shows, nên sẽ tự động tìm cả 2 loại. 
              💡 Nếu không tìm thấy, thử tìm bằng tên phim để lấy TMDB ID chính xác.
            </div>
          )}
        </CardBody>
      </Card>

      {/* TMDB Search Results */}
      {searchType === "name" && (tmdbLoading || tmdbResults.length > 0) && (
        <Card className="mb-8">
          <CardBody>
            <h3 className="text-lg font-semibold text-white mb-4">
              Kết quả tìm kiếm TMDB
              {tmdbLoading && <Spinner size="sm" className="ml-2" />}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {tmdbResults.map((result, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-[2/3] rounded-lg overflow-hidden bg-content2/50">
                    <Image
                      isBlurred
                      alt={result.name}
                      src={getImageUrl(result.poster_path)}
                      className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
                      fallbackSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='60' viewBox='0 0 40 60'%3E%3Crect width='40' height='60' fill='%23333'/%3E%3Ctext x='20' y='35' text-anchor='middle' fill='%23666' font-size='8'%3ENo Image%3C/text%3E%3C/svg%3E"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="mt-2">
                    <p className="text-white text-sm font-medium line-clamp-2">{result.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Chip color="primary" variant="flat" size="sm">
                        {result.media_type === "movie" ? "Movie" : "TV"}
                      </Chip>
                      <span className="text-foreground/60 text-xs">ID: {result.id}</span>
                    </div>
                    {(result.release_date || result.first_air_date) && (
                      <p className="text-foreground/60 text-xs mt-1">
                        {result.release_date?.substring(0, 4) || result.first_air_date?.substring(0, 4)}
                      </p>
                    )}
                    <Button
                      as="a"
                      href={`/kkphim?type=${result.media_type}&id=${result.id}`}
                      size="sm"
                      color="primary"
                      variant="flat"
                      className="w-full mt-2"
                    >
                      KKPhim
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Results */}
      {results.map((result, index) => (
        <Card key={index} className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <div className="w-[60px] h-[90px] rounded-lg overflow-hidden bg-content2/50">
                  {result.data.movie.poster_url ? (
                    <Image
                      isBlurred
                      alt={result.data.movie.name}
                      src={result.data.movie.poster_url}
                      className="w-full h-full object-cover object-center"
                      fallbackSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='90' viewBox='0 0 60 90'%3E%3Crect width='60' height='90' fill='%23333'/%3E%3Ctext x='30' y='50' text-anchor='middle' fill='%23666' font-size='10'%3ENo Image%3C/text%3E%3C/svg%3E"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film size={24} className="text-foreground/60" />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {result.type === "tmdb" ? (
                    <>
                      <Chip color="primary" variant="flat" size="sm">
                        TMDB
                      </Chip>
                      <span className="text-white font-semibold">
                        {result.data.movie.name}
                      </span>
                      <Chip color="secondary" variant="flat" size="sm">
                        {result.data.movie.type === "single" ? (
                          <><Film size={12} /> Movie</>
                        ) : (
                          <><Tv size={12} /> TV Show</>
                        )}
                      </Chip>
                    </>
                  ) : (
                    <>
                      <Chip color="success" variant="flat" size="sm">
                        Slug
                      </Chip>
                      <span className="text-white font-semibold">
                        {result.data.movie.name}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            {/* Movie Info */}
            <div className="mb-4 p-4 bg-content2/50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-foreground/60">Tên phim:</span>
                  <p className="text-white font-medium">{result.data.movie.name}</p>
                </div>
                <div>
                  <span className="text-foreground/60">Loại:</span>
                  <p className="text-white font-medium">
                    {result.data.movie.type === "single" ? "Phim lẻ" : "Phim bộ"}
                  </p>
                </div>
                {result.data.movie.slug && (
                  <div>
                    <span className="text-foreground/60">Slug:</span>
                    <p className="text-white font-medium">{result.data.movie.slug}</p>
                  </div>
                )}
                {result.data.movie.tmdb && (
                  <div>
                    <span className="text-foreground/60">TMDB ID:</span>
                    <p className="text-white font-medium">{result.data.movie.tmdb.id}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Episodes and Links */}
            {result.data.episodes && result.data.episodes.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Link-embed</h3>
                {result.data.episodes.map((server, serverIndex) => (
                  <div key={serverIndex} className="p-4 bg-content2/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Chip color="primary" variant="flat" size="sm">
                        Server {serverIndex + 1}
                      </Chip>
                      {server.server_name && (
                        <span className="text-foreground/60 text-sm">{server.server_name}</span>
                      )}
                    </div>
                    <div className="space-y-2">
                      {server.server_data.map((episode, episodeIndex) => (
                        <div key={episodeIndex} className="flex items-center justify-between p-3 bg-content1/50 rounded-lg">
                          <div className="flex-1">
                            <p className="text-white font-medium">{episode.name}</p>
                            {episode.link_embed && (
                              <p className="text-foreground/60 text-xs font-mono break-all">
                                {episode.link_embed}
                              </p>
                            )}
                            {episode.link_m3u8 && (
                              <p className="text-foreground/60 text-xs font-mono break-all">
                                {episode.link_m3u8}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {episode.link_embed && (
                              <Button
                                size="sm"
                                color="primary"
                                variant="flat"
                                onPress={() => handleCopyLink(episode.link_embed!)}
                                className="min-w-[80px]"
                              >
                                {copiedLinks.has(episode.link_embed!) ? (
                                  <><Check size={14} /> Đã copy</>
                                ) : (
                                  <><Copy size={14} /> Copy</>
                                )}
                              </Button>
                            )}
                            {episode.link_m3u8 && (
                              <Button
                                size="sm"
                                color="secondary"
                                variant="flat"
                                onPress={() => handleCopyLink(episode.link_m3u8!)}
                                className="min-w-[80px]"
                              >
                                {copiedLinks.has(episode.link_m3u8!) ? (
                                  <><Check size={14} /> Đã copy</>
                                ) : (
                                  <><Copy size={14} /> Copy</>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-foreground/60">Không có episode nào</p>
              </div>
            )}
          </CardBody>
        </Card>
      ))}

      {/* No Results */}
      {!loading && results.length === 0 && searchQuery && (
        <Card>
          <CardBody className="text-center py-8">
            <p className="text-foreground/60">Không tìm thấy kết quả nào</p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}