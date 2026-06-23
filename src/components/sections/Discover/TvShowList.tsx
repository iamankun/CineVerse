"use client";

import Loop from "@/components/ui/other/Loop";
import PosterCardSkeleton from "@/components/ui/other/PosterCardSkeleton";
import useDiscoverFilters from "@/hooks/useDiscoverFilters";
import useFetchDiscoverTvShows from "@/hooks/useFetchDiscoverTvShow";
import { DiscoverTvShowsFetchQueryType } from "@/types/movie";
import { getLoadingLabel } from "@/utils/movies";
import { Spinner } from "@heroui/react";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { TV } from "tmdb-ts/dist/types";
import { useEffect } from "react";
import TvShowPosterCard from "../TV/Cards/Poster";

const TvShowDiscoverList = () => {
  const { ref, inView } = useInView();
  const { genresString, queryType } = useDiscoverFilters();
  const fetchTvShows = useFetchDiscoverTvShows({
    type: queryType as DiscoverTvShowsFetchQueryType,
    genres: genresString,
  });

  const { data, isPending, status, fetchNextPage, isFetchingNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["discover-tv-shows", queryType, genresString],
      queryFn: ({ pageParam }) => fetchTvShows({ page: pageParam }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    });

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView]);

  if (status === "error") return notFound();

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center gap-10">
        <div className="movie-grid">
          <Loop count={20} prefix="SkeletonDiscoverPosterCard">
            <PosterCardSkeleton variant="bordered" />
          </Loop>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-10">
      <div className="movie-grid">
        {data.pages.map((page) => {
          return page.results.map((tv) => {
            return <TvShowPosterCard key={tv.id} tv={tv as unknown as TV} variant="bordered" />;
          });
        })}
      </div>
      <div ref={ref} className="flex h-24 items-center justify-center">
        {isFetchingNextPage && (
          <Spinner size="lg" variant="wave" color="warning" label={getLoadingLabel()} />
        )}
        {!hasNextPage && !isPending && (
          <p className="text-muted-foreground text-center text-base">
            You have reached the end of the list.
          </p>
        )}
      </div>
    </div>
  );
};

export default TvShowDiscoverList;
