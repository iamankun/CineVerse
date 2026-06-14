"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Input, Textarea, Autocomplete, AutocompleteItem, Spinner, Tabs, Tab, Button } from "@heroui/react";
import SEOAnalyzer from "@/components/ui/seo/SEOAnalyzer";
import { type SEOConfig } from "@/utils/seo/yoast-algorithm";
import { generateCompleteSEO } from "@/utils/seo/content-generator";
import { IoAnalytics, IoSearch, IoArrowBack } from "react-icons/io5";
import { useQuery } from "@tanstack/react-query";
import { tmdb, fetchWithFallback, fetchDetailWithFallback } from "@/api/tmdb";
import { Movie, TV } from "tmdb-ts";
import { getImageUrl } from "@/utils/movies";
import { useRouter } from "next/navigation";

type MediaType = "movie" | "tv";

export default function SEOPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<MediaType>("movie");
  const [config, setConfig] = useState<SEOConfig>({
    title: "",
    description: "",
    url: "",
    content: "",
    focusKeyphrase: "",
    images: [],
  });

  const { data: searchResults, isFetching: isSearching } = useQuery({
    queryKey: ["seo-search", selectedType, searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return null;
      if (selectedType === "movie") {
        return await fetchWithFallback(
          () => tmdb.search.movies({ query: searchQuery, language: "vi-VN" }),
          () => tmdb.search.movies({ query: searchQuery, language: "en-US" }),
        );
      } else {
        return await fetchWithFallback(
          () => tmdb.search.tvShows({ query: searchQuery, language: "vi-VN" }),
          () => tmdb.search.tvShows({ query: searchQuery, language: "en-US" }),
        );
      }
    },
    enabled: searchQuery.length >= 2,
  });

  const { data: itemDetails, isFetching: isLoadingDetails } = useQuery({
    queryKey: ["seo-details", selectedType, selectedId],
    queryFn: async () => {
      if (!selectedId) return null;
      if (selectedType === "movie") {
        return await fetchDetailWithFallback(
          () => tmdb.movies.details(selectedId, undefined, "vi-VN"),
          () => tmdb.movies.details(selectedId, undefined, "en-US"),
        );
      } else {
        return await fetchDetailWithFallback(
          () => tmdb.tvShows.details(selectedId, undefined, "vi-VN"),
          () => tmdb.tvShows.details(selectedId, undefined, "en-US"),
        );
      }
    },
    enabled: !!selectedId,
  });

  useEffect(() => {
    if (itemDetails && selectedId) {
      const seoData = generateCompleteSEO(itemDetails as any, selectedType);
      setConfig(seoData);
    }
  }, [itemDetails, selectedId, selectedType]);

  const handleManualChange = (field: keyof SEOConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const results = searchResults?.results || [];

  return (
    <div className="container mx-auto space-y-4 p-4">
      <div className="flex items-center gap-3 mb-4">
        <Button
          isIconOnly
          variant="light"
          onPress={() => router.push("/admin")}
        >
          <IoArrowBack size={24} />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">SEO Analyzer - Phân tích SEO thực tế</h1>
          <p className="text-foreground-600">
            Tìm kiếm phim/TV show và phân tích SEO tự động dựa trên thuật toán Yoast.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <IoSearch size={24} />
                <h2 className="text-xl font-semibold"> Tìm kiếm trang</h2>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <Tabs 
                selectedKey={selectedType} 
                onSelectionChange={(key) => {
                  setSelectedType(key as MediaType);
                  setSelectedId(null);
                  setSearchQuery("");
                }}
              >
                <Tab key="movie" title=" Phim" />
                <Tab key="tv" title=" TV Show" />
              </Tabs>

              <Autocomplete
                label={selectedType === "movie" ? "Tìm kiếm phim" : "Tìm kiếm TV show"}
                placeholder="Nhập tên phim hoặc TV show..."
                inputValue={searchQuery}
                onInputChange={setSearchQuery}
                isLoading={isSearching}
                items={results}
                onSelectionChange={(key) => {
                  if (key) {
                    setSelectedId(Number(key));
                  }
                }}
              >
                {(item: any) => (
                  <AutocompleteItem 
                    key={item.id} 
                    textValue={item.title || item.name}
                  >
                    <div className="flex items-center gap-3">
                      {item.poster_path && (
                        <img
                          src={getImageUrl(item.poster_path, "poster")}
                          alt={item.title || item.name}
                          className="h-12 w-8 rounded object-cover"
                        />
                      )}
                      <div>
                        <div className="font-semibold">
                          {item.title || item.name}
                        </div>
                        <div className="text-xs text-foreground-500">
                          {item.release_date || item.first_air_date}
                        </div>
                      </div>
                    </div>
                  </AutocompleteItem>
                )}
              </Autocomplete>

              {isLoadingDetails && (
                <div className="flex items-center justify-center gap-2 py-4">
                  <Spinner size="sm" />
                  <span className="text-sm">Đang tải và phân tích SEO...</span>
                </div>
              )}

              {itemDetails && (
                <div className="rounded-lg border-2 border-primary p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-lg"></span>
                    <span className="font-semibold text-success">
                      Đã tải thông tin SEO tự động
                    </span>
                  </div>
                  <p className="text-sm text-foreground-600">
                    Bạn có thể chỉnh sửa các trường bên dưới để tối ưu SEO.
                  </p>
                </div>
              )}
            </CardBody>
          </Card>

          {config.title && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold"> Chỉnh sửa SEO</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <Input
                  label="Từ khóa chính"
                  placeholder="ví dụ: xem phim avengers endgame"
                  value={config.focusKeyphrase || ""}
                  onChange={(e) => handleManualChange("focusKeyphrase", e.target.value)}
                />

                <Input
                  label="Tiêu đề SEO"
                  placeholder="Tiêu đề SEO (50-60 ký tự)"
                  value={config.title}
                  onChange={(e) => handleManualChange("title", e.target.value)}
                  description={`${config.title.length} ký tự`}
                />

                <Textarea
                  label="Mô tả Meta"
                  placeholder="Mô tả SEO (120-155 ký tự)"
                  value={config.description}
                  onChange={(e) => handleManualChange("description", e.target.value)}
                  description={`${config.description.length} ký tự`}
                  minRows={3}
                />

                <Input
                  label="Đường dẫn URL"
                  placeholder="/movie/id/slug"
                  value={config.url}
                  onChange={(e) => handleManualChange("url", e.target.value)}
                  description={`${config.url.length} ký tự`}
                />

                <Textarea
                  label="Nội dung trang (HTML)"
                  placeholder="Nội dung trang với thẻ HTML"
                  value={config.content}
                  onChange={(e) => handleManualChange("content", e.target.value)}
                  minRows={8}
                  description={`${config.content.split(/\s+/).filter((w) => w.length > 0).length} từ`}
                />
              </CardBody>
            </Card>
          )}
        </div>

        <div>
          {config.title ? (
            <SEOAnalyzer config={config} />
          ) : (
            <Card>
              <CardBody className="flex flex-col items-center justify-center py-12 text-center">
                <IoSearch size={64} className="mb-4 text-foreground-300" />
                <h3 className="mb-2 text-xl font-semibold">
                  Tìm kiếm phim hoặc TV show
                </h3>
                <p className="text-foreground-500">
                  Nhập tên phim hoặc TV show ở bên trái để bắt đầu phân tích SEO
                </p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
