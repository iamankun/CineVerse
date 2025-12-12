"use client";

import MoviePosterCard from "@/components/sections/Movie/Cards/Poster";
import TvShowPosterCard from "@/components/sections/TV/Cards/Poster";
import SectionTitle from "@/components/ui/other/SectionTitle";
import Carousel from "@/components/ui/wrapper/Carousel";
import { Link, Skeleton, Tab, Tabs } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { Movie, TV } from "tmdb-ts/dist/types";
import { IoChevronForward } from "react-icons/io5";
import { Movie as MovieIcon, TV as TVIcon } from "@/utils/icons";
import { env } from "@/utils/env";
import { useState } from "react";

type SourceItem = {
  tmdbId: number;
  title: string;
  year: number;
  type: "movie" | "tv";
};

// Fetch danh sách sources từ API
const fetchCineVerseSources = async (): Promise<SourceItem[]> => {
  const response = await fetch("/api/sources/list");
  if (!response.ok) throw new Error("Failed to fetch sources");
  const data = await response.json();
  return data.sources || [];
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
  const movies = (await Promise.all(moviePromises)).filter(Boolean) as Movie[];

  // Fetch TMDB details cho TV shows
  const tvPromises = tvSources.map((s) => fetchTMDBDetails(s.tmdbId, "tv"));
  const tvShows = (await Promise.all(tvPromises)).filter(Boolean) as TV[];

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
              title: "bg-[linear-gradient(90deg,#c4b5fd,#93c5fd,#67e8f9,#86efac,#fde047,#fca5a5,#f9a8d4,#c4b5fd,#93c5fd,#67e8f9)] bg-[length:200%] animate-gradient bg-clip-text text-transparent"
            }}
          >
            Từ CineVerse - Vũ Trụ Điện Ảnh
          </SectionTitle>
          <Link
            size="sm"
            href="/cineverse"
            isBlock
            color="foreground"
            className="rounded-full flex items-center gap-1"
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
            cursor: "bg-[linear-gradient(90deg,#c4b5fd,#93c5fd,#67e8f9,#86efac,#fde047,#fca5a5,#f9a8d4,#c4b5fd,#93c5fd,#67e8f9)] bg-[length:200%] animate-gradient h-1 rounded-full",
            tabList: "gap-4",
            tab: "px-0 h-10 data-[selected=true]:text-transparent data-[selected=true]:bg-[linear-gradient(90deg,#c4b5fd,#93c5fd,#67e8f9,#86efac,#fde047,#fca5a5,#f9a8d4,#c4b5fd,#93c5fd,#67e8f9)] data-[selected=true]:bg-[length:200%] data-[selected=true]:animate-gradient data-[selected=true]:bg-clip-text",
          }}
        >
          {/* Tab Điện Ảnh */}
          {movies.length > 0 && (
            <Tab
              key="movie"
              title={
                <span className="flex items-center gap-2">
                  <MovieIcon className={selectedTab === "movie" ? "text-primary" : "text-default-500"} /> Điện Ảnh
                </span>
              }
            >
              <Carousel>
                {movies.map((movie) => (
                  <div
                    key={movie.id}
                    className="embla__slide flex min-h-fit max-w-fit items-center px-1 py-2"
                  >
                    <MoviePosterCard movie={movie} />
                  </div>
                ))}
              </Carousel>
            </Tab>
          )}

          {/* Tab Chương Trình TV */}
          {tvShows.length > 0 && (
            <Tab
              key="tv"
              title={
                <span className="flex items-center gap-2">
                  <TVIcon className={selectedTab === "tv" ? "text-warning" : "text-default-500"} /> Chương Trình TV
                </span>
              }
            >
              <Carousel>
                {tvShows.map((tv) => (
                  <div
                    key={tv.id}
                    className="embla__slide flex min-h-fit max-w-fit items-center px-1 py-2"
                  >
                    <TvShowPosterCard tv={tv} />
                  </div>
                ))}
              </Carousel>
            </Tab>
          )}
        </Tabs>
      </div>
    </section>
  );
};

export default CineVerseList;
