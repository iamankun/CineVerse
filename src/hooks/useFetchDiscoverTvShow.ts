"use client";

import { tmdb, fetchWithFallback } from "@/api/tmdb";
import { DiscoverTvShowsFetchQueryType } from "@/types/movie";

interface FetchDiscoverTvShows {
  type?: DiscoverTvShowsFetchQueryType;
  genres?: string;
}

const useFetchDiscoverTvShows = ({
  type = "discover",
  genres,
}: FetchDiscoverTvShows) => {
  return ({ page = 1 }: { page?: number }) => {
    switch (type) {
    case "todayTrending":
      return fetchWithFallback(
        () => tmdb.trending.trending("tv", "day", { page, language: 'vi-VN' }),
        () => tmdb.trending.trending("tv", "day", { page, language: 'en-US' }),
      );
    case "thisWeekTrending":
      return fetchWithFallback(
        () => tmdb.trending.trending("tv", "week", { page, language: 'vi-VN' }),
        () => tmdb.trending.trending("tv", "week", { page, language: 'en-US' }),
      );
    case "popular":
      return fetchWithFallback(
        () => tmdb.tvShows.popular({ page, language: 'vi-VN' }),
        () => tmdb.tvShows.popular({ page, language: 'en-US' }),
      );
    case "onTheAir":
      return fetchWithFallback(
        () => tmdb.tvShows.onTheAir({ page, language: 'vi-VN' }),
        () => tmdb.tvShows.onTheAir({ page, language: 'en-US' }),
      );
    case "topRated":
      return fetchWithFallback(
        () => tmdb.tvShows.topRated({ page, language: 'vi-VN' }),
        () => tmdb.tvShows.topRated({ page, language: 'en-US' }),
      );
    default:
      return fetchWithFallback(
        () => tmdb.discover.tvShow({ page, with_genres: genres, language: 'vi' }),
        () => tmdb.discover.tvShow({ page, with_genres: genres, language: 'en-US' }),
      );
  }
  };
};

export default useFetchDiscoverTvShows;
