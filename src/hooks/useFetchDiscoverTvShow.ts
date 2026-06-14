"use client";

import { tmdb, fetchWithFallback } from "@/api/tmdb";
import { DiscoverTvShowsFetchQueryType } from "@/types/movie";

interface FetchDiscoverTvShows {
  page?: number;
  type?: DiscoverTvShowsFetchQueryType;
  genres?: string;
}

const useFetchDiscoverTvShows = ({
  page = 1,
  type = "discover",
  genres,
}: FetchDiscoverTvShows) => {
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
      // @ts-expect-error: Property 'adult' is missing in type 'PopularTvShowResult'
      return fetchWithFallback(
        () => tmdb.tvShows.popular({ page, language: 'vi-VN' }),
        () => tmdb.tvShows.popular({ page, language: 'en-US' }),
      );
    case "onTheAir":
      // @ts-expect-error: Property 'adult' is missing in type 'OnTheAirResult'
      return fetchWithFallback(
        () => tmdb.tvShows.onTheAir({ page, language: 'vi-VN' }),
        () => tmdb.tvShows.onTheAir({ page, language: 'en-US' }),
      );
    case "topRated":
      // @ts-expect-error: Property 'adult' is missing in type 'TopRatedTvShowResult'
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

export default useFetchDiscoverTvShows;
