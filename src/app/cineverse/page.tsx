"use client";

import MoviePosterCard from "@/components/sections/Movie/Cards/Poster";
import TvShowPosterCard from "@/components/sections/TV/Cards/Poster";
import SectionTitle from "@/components/ui/other/SectionTitle";
import BackToTopButton from "@/components/ui/button/BackToTopButton";
import { Skeleton, Tab, Tabs } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { Movie, TV } from "tmdb-ts/dist/types";
import { Movie as MovieIcon, TV as TVIcon } from "@/utils/icons";
import { env } from "@/utils/env";
import { useState } from "react";
import { NextPage } from "next";

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
    const moviesResponse = await fetch('/api/admin/dienanh');
    const moviesResult = moviesResponse.ok ? await moviesResponse.json() : {};
    const movies = moviesResult.movies || [];

    // Fetch TV shows from Supabase
    const tvResponse = await fetch('/api/admin/chuongtrinhtv');
    const tvResult = tvResponse.ok ? await tvResponse.json() : {};
    const tvShows = tvResult.tvSeries || [];

    // Combine and convert to SourceItem format
    const allSources: SourceItem[] = [
      ...movies.map((item: any) => ({
        tmdbId: item.tmdb_id,
        title: item.title,
        year: item.year,
        type: "movie" as const
      })),
      ...tvShows.map((item: any) => ({
        tmdbId: item.tmdb_id,
        title: item.title,
        year: item.year,
        type: "tv" as const
      }))
    ];

    return allSources;
  } catch (error) {
    console.error("Error fetching sources from Supabase:", error);
    return [];
  }
};

// Fetch chi tiết từ TMDB
const fetchTMDBDetails = async (id: number, type: "movie" | "tv") => {
  const token = env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN;
  const endpoint = type === "movie" ? "movie" : "tv";

  const response = await fetch(
    `https://api.themoviedb.org/3/${endpoint}/${id}?language=vi-VN`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) return null;
  return response.json();
};

// Fetch tất cả content với TMDB details
const fetchCineVerseContent = async () => {
  const sources = await fetchCineVerseSources();

  const movieSources = sources.filter((s) => s.type === "movie");
  const tvSources = sources.filter((s) => s.type === "tv");

  // Fetch TMDB details cho movies
  const moviePromises = movieSources.map((s) =>
    fetchTMDBDetails(s.tmdbId, "movie")
  );
  const movieResults = await Promise.all(moviePromises);
  const movies = movieResults.filter((result): result is Movie => 
    result !== null && result.id !== undefined
  );

  // Fetch TMDB details cho TV shows
  const tvPromises = tvSources.map((s) => fetchTMDBDetails(s.tmdbId, "tv"));
  const tvResults = await Promise.all(tvPromises);
  const tvShows = tvResults.filter((result): result is TV => 
    result !== null && result.id !== undefined
  );

  return { movies, tvShows };
};

const CineVerseSourcesPage: NextPage = () => {
  const [selectedTab, setSelectedTab] = useState<string>("movie");
  const { data, isPending } = useQuery({
    queryKey: ["cineverse-all-sources"],
    queryFn: fetchCineVerseContent,
    staleTime: 1000 * 60 * 60,
  });

  if (isPending) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-64 rounded-full" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-2/3 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const { movies = [], tvShows = [] } = data || {};

  return (
    <div className="flex flex-col gap-6 pt-4 md:pt-8 pb-8">
      <SectionTitle 
        color="secondary" 
        className="text-2xl md:text-3xl"
        classNames={{
          title: "bg-[linear-gradient(90deg,#c4b5fd,#93c5fd,#67e8f9,#86efac,#fde047,#fca5a5,#f9a8d4,#c4b5fd,#93c5fd,#67e8f9)] bg-[length:200%] animate-gradient bg-clip-text text-transparent"
        }}
      >
        CineVerse - Vũ Trụ Điện Ảnh
      </SectionTitle>

      <Tabs
        aria-label="CineVerse Content"
        variant="underlined"
        size="lg"
        selectedKey={selectedTab}
        onSelectionChange={(key) => setSelectedTab(key as string)}
        classNames={{
          cursor: "bg-[linear-gradient(90deg,#c4b5fd,#93c5fd,#67e8f9,#86efac,#fde047,#fca5a5,#f9a8d4,#c4b5fd,#93c5fd,#67e8f9)] bg-[length:200%] animate-gradient h-1 rounded-full",
          tabList: "gap-6",
          tab: "px-0 h-12 data-[selected=true]:text-transparent data-[selected=true]:bg-[linear-gradient(90deg,#c4b5fd,#93c5fd,#67e8f9,#86efac,#fde047,#fca5a5,#f9a8d4,#c4b5fd,#93c5fd,#67e8f9)] data-[selected=true]:bg-[length:200%] data-[selected=true]:animate-gradient data-[selected=true]:bg-clip-text",
        }}
      >
        {/* Tab Điện Ảnh */}
        <Tab
          key="movie"
          title={
            <span className="flex items-center gap-2 text-base">
              <MovieIcon className={selectedTab === "movie" ? "text-primary" : "text-default-500"} /> Điện Ảnh ({movies.length})
            </span>
          }
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 mt-4">
            {movies.map((movie) => (
              <MoviePosterCard key={movie.id} movie={movie} variant="bordered" />
            ))}
          </div>
          {movies.length === 0 && (
            <p className="text-center text-default-500 py-8">
              Chưa có phim nào từ CineVerse
            </p>
          )}
        </Tab>

        {/* Tab Chương Trình TV */}
        <Tab
          key="tv"
          title={
            <span className="flex items-center gap-2 text-base">
              <TVIcon className={selectedTab === "tv" ? "text-warning" : "text-default-500"} /> Chương Trình TV ({tvShows.length})
            </span>
          }
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 mt-4">
            {tvShows.map((tv) => (
              <TvShowPosterCard key={tv.id} tv={tv} variant="bordered" />
            ))}
          </div>
          {tvShows.length === 0 && (
            <p className="text-center text-default-500 py-8">
              Chưa có chương trình TV nào từ CineVerse
            </p>
          )}
        </Tab>
      </Tabs>

      <BackToTopButton />
    </div>
  );
};

export default CineVerseSourcesPage;
