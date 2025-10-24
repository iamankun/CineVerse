"use client";

import { tmdb } from "@/api/tmdb";
import TvShowHomeCard from "@/components/sections/TV/Cards/Poster";
import MoviePosterCard from "@/components/sections/Movie/Cards/Poster";
import { ContentType } from "@/types";
import { isEmpty } from "@/utils/helpers";
import { Spinner, Input } from "@heroui/react";
import { useDebouncedValue } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Movie, Search as SearchType, TV } from "tmdb-ts/dist/types";
import { IoSearchOutline, IoCloseOutline } from "react-icons/io5";

const fetchSearchData = async (
  query: string,
  type: ContentType,
): Promise<SearchType<Movie> | SearchType<TV>> => {
  if (type === "movie")
    return tmdb.search.movies({ query, page: 1, language: "vi-VN", region: "VN" });
  return tmdb.search.tvShows({ query, page: 1, language: "vi-VN" });
};

const HomeSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [contentType, setContentType] = useState<ContentType>("movie");
  const [debouncedSearchQuery] = useDebouncedValue(searchQuery.trim(), 500);

  const isSearchTriggered = !isEmpty(debouncedSearchQuery);

  const { data, isPending } = useQuery({
    enabled: isSearchTriggered,
    queryKey: ["home-search", contentType, debouncedSearchQuery],
    queryFn: () => fetchSearchData(debouncedSearchQuery, contentType),
  });

  const handleClear = () => {
    setSearchQuery("");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Search Input */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          value={searchQuery}
          onValueChange={setSearchQuery}
          placeholder="Tìm kiếm phim, chương trình TV..."
          size="lg"
          startContent={<IoSearchOutline className="text-2xl text-foreground-400" />}
          endContent={
            searchQuery && (
              <button onClick={handleClear} className="text-foreground-400 hover:text-foreground">
                <IoCloseOutline className="text-2xl" />
              </button>
            )
          }
          classNames={{
            input: "text-base",
            inputWrapper: "bg-foreground-100 hover:bg-foreground-200",
          }}
        />
        <div className="flex gap-2">
          <button
            onClick={() => setContentType("movie")}
            className={`rounded-lg px-6 py-2 text-sm font-medium transition-colors ${
              contentType === "movie"
                ? "bg-primary text-white"
                : "bg-foreground-100 text-foreground hover:bg-foreground-200"
            }`}
          >
            Phim
          </button>
          <button
            onClick={() => setContentType("tv")}
            className={`rounded-lg px-6 py-2 text-sm font-medium transition-colors ${
              contentType === "tv"
                ? "bg-warning text-white"
                : "bg-foreground-100 text-foreground hover:bg-foreground-200"
            }`}
          >
            TV
          </button>
        </div>
      </div>

      {/* Search Results */}
      {isSearchTriggered && (
        <div className="flex flex-col gap-4">
          {isPending ? (
            <div className="flex h-40 items-center justify-center">
              <Spinner
                size="lg"
                color={contentType === "movie" ? "primary" : "warning"}
                variant="simple"
              />
            </div>
          ) : isEmpty(data?.results) ? (
            <p className="py-8 text-center text-foreground-500">
              Không tìm thấy {contentType === "movie" ? "phim" : "chương trình TV"} nào với từ khóa "
              <span className="font-bold text-warning">{debouncedSearchQuery}</span>"
            </p>
          ) : (
            <>
              <p className="text-sm text-foreground-500">
                Tìm thấy <span className="font-bold text-primary">{data?.total_results}</span>{" "}
                {contentType === "movie" ? "phim" : "chương trình TV"}
              </p>
              <div className="movie-grid">
                {contentType === "movie"
                  ? data?.results.slice(0, 12).map((movie) => (
                      <MoviePosterCard
                        key={movie.id}
                        movie={movie as Movie}
                        variant="bordered"
                      />
                    ))
                  : data?.results.slice(0, 12).map((tv) => (
                      <TvShowHomeCard key={tv.id} tv={tv as TV} variant="bordered" />
                    ))}
              </div>
              {data && data.total_results > 12 && (
                <a
                  href={`/search?q=${encodeURIComponent(debouncedSearchQuery)}&content=${contentType}`}
                  className="mx-auto rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                >
                  Xem tất cả {data.total_results} kết quả
                </a>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default HomeSearch;
