"use client";

import MoviePosterCard from "@/components/sections/Movie/Cards/Poster";
import TvShowPosterCard from "@/components/sections/TV/Cards/Poster";
import SectionTitle from "@/components/ui/other/SectionTitle";
import Carousel from "@/components/ui/wrapper/Carousel";
import { Skeleton, Tab, Tabs } from "@heroui/react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Movie, TV } from "tmdb-ts/dist/types";
import { IoChevronForward } from "react-icons/io5";
import { Movie as MovieIcon, TV as TVIcon } from "@/utils/icons";
import { tmdb, fetchDetailWithFallback } from "@/api/tmdb";
import { useState } from "react";

type SourceItem = {
  tmdbId: number;
  title: string;
  year: number;
  type: "movie" | "tv";
};

// Fetch danh sách sources từ Supabase
const fetchCineVerseSources = async (): Promise<SourceItem[]> => {
  try {
    // Fetch movies from Supabase
    const moviesResponse = await fetch("/api/admin/dienanh");
    const moviesResult = moviesResponse.ok ? await moviesResponse.json() : {};
    const movies = moviesResult.movies || [];

    // Fetch TV shows from Supabase
    const tvResponse = await fetch("/api/admin/chuongtrinhtv");
    const tvResult = tvResponse.ok ? await tvResponse.json() : {};
    const tvShows = tvResult.tvSeries || [];

    // Combine and convert to SourceItem format
    const allSources: SourceItem[] = [
      ...movies.map((item: any) => ({
        tmdbId: item.tmdb_id,
        title: item.title,
        year: item.year,
        type: "movie" as const,
      })),
      ...tvShows.map((item: any) => ({
        tmdbId: item.tmdb_id,
        title: item.title,
        year: item.year,
        type: "tv" as const,
      })),
    ];

    return allSources;
  } catch (error) {
    console.error("Error fetching sources from Supabase:", error);
    return [];
  }
};

// Fetch chi tiết từ TMDB với fallback ngôn ngữ
const fetchTMDBDetails = async (id: number, type: "movie" | "tv") => {
  try {
    if (type === "movie") {
      return await fetchDetailWithFallback(
        () => tmdb.movies.details(id, [], 'vi-VN'),
        () => tmdb.movies.details(id, [], 'en-US'),
      );
    }
    return await fetchDetailWithFallback(
      () => tmdb.tvShows.details(id, [], 'vi-VN'),
      () => tmdb.tvShows.details(id, [], 'en-US'),
    );
  } catch {
    return null;
  }
};

// Fetch tất cả content với TMDB details
const fetchCineVerseContent = async () => {
  const sources = await fetchCineVerseSources();

  const movieSources = sources.filter((s) => s.type === "movie");
  const tvSources = sources.filter((s) => s.type === "tv");

  // Fetch TMDB details cho movies
  const moviePromises = movieSources.map((s) => fetchTMDBDetails(s.tmdbId, "movie"));
  const movieResults = await Promise.all(moviePromises);
  const movies = movieResults.filter(
    (result): result is NonNullable<typeof result> => result !== null,
  );

  // Fetch TMDB details cho TV shows
  const tvPromises = tvSources.map((s) => fetchTMDBDetails(s.tmdbId, "tv"));
  const tvResults = await Promise.all(tvPromises);
  const tvShows = tvResults.filter(
    (result): result is NonNullable<typeof result> => result !== null,
  );

  return { movies, tvShows };
};

const CineVerseList: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<string>("movie");
  const { data, isPending } = useQuery({
    queryKey: ["cineverse-list"],
    queryFn: fetchCineVerseContent,
    staleTime: 1000 * 60 * 60, // Cache 1 giờ
  });

  if (isPending) {
    return (
      <section className="min-h-[250px] md:min-h-[300px]">
        <div className="flex w-full flex-col gap-5">
          <div className="flex grow items-center justify-between">
            <Skeleton className="h-7 w-64 rounded-full" />
          </div>
          <Skeleton className="h-[250px] rounded-lg md:h-[300px]" />
        </div>
      </section>
    );
  }

  const { movies = [], tvShows = [] } = data || {};

  // Nếu không có content nào thì không hiển thị
  if (movies.length === 0 && tvShows.length === 0) {
    return null;
  }

  return (
    <section className="min-h-[250px] md:min-h-[300px]">
      <div className="z-3 flex flex-col gap-2">
        <div className="flex grow items-center justify-between">
          <SectionTitle
            color="secondary"
            classNames={{
              title:
                "bg-[linear-gradient(90deg,#c4b5fd,#93c5fd,#67e8f9,#86efac,#fde047,#fca5a5,#f9a8d4,#c4b5fd,#93c5fd,#67e8f9)] bg-[length:200%] animate-gradient bg-clip-text text-transparent",
            }}
          >
            CineVerse - Vũ Trụ Điện Ảnh
          </SectionTitle>
          <Link
            href="/cineverse"
            className="text-foreground bg-default-100 hover:bg-default-200 flex items-center gap-1 rounded-full px-3 py-1 text-sm transition-colors"
          >
            Xem tất cả <IoChevronForward />
          </Link>
        </div>

        <Tabs
          aria-label="CineVerse Content"
          variant="underlined"
          selectedKey={selectedTab}
          onSelectionChange={(key) => setSelectedTab(key as string)}
          classNames={{
            cursor:
              "bg-[linear-gradient(90deg,#c4b5fd,#93c5fd,#67e8f9,#86efac,#fde047,#fca5a5,#f9a8d4,#c4b5fd,#93c5fd,#67e8f9)] bg-[length:200%] animate-gradient h-1 rounded-full",
            tabList: "gap-4",
            tab: "px-0 h-10 data-[selected=true]:text-transparent data-[selected=true]:bg-[linear-gradient(90deg,#c4b5fd,#93c5fd,#67e8f9,#86efac,#fde047,#fca5a5,#f9a8d4,#c4b5fd,#93c5fd,#67e8f9)] data-[selected=true]:bg-[length:200%] data-[selected=true]:animate-gradient data-[selected=true]:bg-clip-text",
          }}
        >
          {/* Tab Điện Ảnh */}
          <Tab
            key="movie"
            textValue="Điện Ảnh"
            title={
              <span className="flex items-center gap-2">
                <MovieIcon
                  className={selectedTab === "movie" ? "text-primary" : "text-default-500"}
                />{" "}
                Điện Ảnh
              </span>
            }
          >
            <Carousel>
              {movies.map((movie) => (
                <div
                  key={movie.id}
                  className="embla__slide flex min-h-fit max-w-fit items-center px-1 py-2"
                >
                  <MoviePosterCard movie={movie as unknown as Movie} />
                </div>
              ))}
            </Carousel>
            {movies.length === 0 && (
              <p className="text-default-500 py-8 text-center">Chưa có phim nào từ CineVerse</p>
            )}
          </Tab>

          {/* Tab Chương Trình TV */}
          <Tab
            key="tv"
            textValue="Chương Trình TV"
            title={
              <span className="flex items-center gap-2">
                <TVIcon className={selectedTab === "tv" ? "text-warning" : "text-default-500"} />{" "}
                Chương Trình TV
              </span>
            }
          >
            <Carousel>
              {tvShows.map((tv) => (
                <div
                  key={tv.id}
                  className="embla__slide flex min-h-fit max-w-fit items-center px-1 py-2"
                >
                  <TvShowPosterCard tv={tv as unknown as TV} />
                </div>
              ))}
            </Carousel>
            {tvShows.length === 0 && (
              <p className="text-default-500 py-8 text-center">
                Chương trình hoặc điện ảnh chưa có trên CineVerse
              </p>
            )}
          </Tab>
        </Tabs>
      </div>
    </section>
  );
};

export default CineVerseList;
