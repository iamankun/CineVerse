"use client";

import MoviePosterCard from "@/components/sections/Movie/Cards/Poster";
import TvShowPosterCard from "@/components/sections/TV/Cards/Poster";
import SectionTitle from "@/components/ui/other/SectionTitle";
import PosterCardSkeleton from "@/components/ui/other/PosterCardSkeleton";
import Carousel from "@/components/ui/wrapper/Carousel";
import { Skeleton, Tab, Tabs } from "@heroui/react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { Movie, TV } from "tmdb-ts/dist/types";
import { IoChevronForward } from "react-icons/io5";
import { Movie as MovieIcon, TV as TVIcon } from "@/utils/icons";
import { fetchDetailWithFallback } from "@/api/tmdb";
import { useState } from "react";

type SourceItem = {
  tmdbId: number;
  title: string;
  year: number;
  type: "movie" | "tv";
};

// Giới hạn số request TMDB chạy đồng thời để tránh dội hàng loạt khi nhiều
// slide cùng lọt vào viewport. Các request vượt ngưỡng sẽ xếp hàng chờ.
function createLimiter(max: number) {
  let active = 0;
  const queue: Array<() => void> = [];

  const runNext = () => {
    if (active >= max) return;
    const task = queue.shift();
    if (task) task();
  };

  return function limit<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      queue.push(() => {
        active += 1;
        fn()
          .then(resolve, reject)
          .finally(() => {
            active -= 1;
            runNext();
          });
      });
      runNext();
    });
  };
}

const tmdbDetailLimiter = createLimiter(6);

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

// Fetch chi tiết từ TMDB qua proxy (tránh CORS)
const fetchTMDBDetails = async (id: number, type: "movie" | "tv") => {
  try {
    const proxyUrl = (lang: string) =>
      `/api/proxy/tmdb/${type}/${id}?language=${lang}`;

    // Bọc qua limiter cho từng request để không bắn quá nhiều cùng lúc.
    const request = (lang: string) =>
      tmdbDetailLimiter(() =>
        fetch(proxyUrl(lang)).then((r) => (r.ok ? r.json() : Promise.reject())),
      );

    return await fetchDetailWithFallback(
      () => request("vi-VN"),
      () => request("en-US"),
    );
  } catch {
    return null;
  }
};

/**
 * Slide poster chỉ tải chi tiết TMDB khi lọt vào viewport.
 * Trước đó hiển thị skeleton để giữ chỗ, tránh gọi API hàng loạt.
 */
const LazyPoster: React.FC<{ source: SourceItem }> = ({ source }) => {
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: "300px" });

  const { data } = useQuery({
    queryKey: ["cineverse-detail", source.type, source.tmdbId],
    queryFn: () => fetchTMDBDetails(source.tmdbId, source.type),
    enabled: inView,
    staleTime: 1000 * 60 * 60, // Cache 1 giờ
  });

  return (
    <div
      ref={ref}
      className="embla__slide flex min-h-fit max-w-fit items-center px-1 py-2"
    >
      {data ? (
        source.type === "movie" ? (
          <MoviePosterCard movie={data as unknown as Movie} />
        ) : (
          <TvShowPosterCard tv={data as unknown as TV} />
        )
      ) : (
        <div className="h-[250px] aspect-2/3 md:h-[300px]">
          <PosterCardSkeleton variant="full" />
        </div>
      )}
    </div>
  );
};

const CineVerseList: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<string>("movie");
  const { data: sources = [], isPending } = useQuery({
    queryKey: ["cineverse-sources"],
    queryFn: fetchCineVerseSources,
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

  const movies = sources.filter((s) => s.type === "movie");
  const tvShows = sources.filter((s) => s.type === "tv");

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
              {movies.map((source) => (
                <LazyPoster key={`movie-${source.tmdbId}`} source={source} />
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
              {tvShows.map((source) => (
                <LazyPoster key={`tv-${source.tmdbId}`} source={source} />
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
