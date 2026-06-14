"use client";

import { tmdb, fetchWithFallback } from "@/api/tmdb";
import { DiscoverMoviesFetchQueryType } from "@/types/movie";

interface FetchDiscoverMovies {
  page?: number;
  type?: DiscoverMoviesFetchQueryType;
  genres?: string;
}

const useFetchDiscoverMovies = ({
  page = 1,
  type = "discover",
  genres,
}: FetchDiscoverMovies) => {
  switch (type) {
    case "todayTrending":
      return fetchWithFallback(
        () => tmdb.trending.trending("movie", "day", { page, language: 'vi-VN' }),
        () => tmdb.trending.trending("movie", "day", { page, language: 'en-US' }),
      );
    case "thisWeekTrending":
      return fetchWithFallback(
        () => tmdb.trending.trending("movie", "week", { page, language: 'vi-VN' }),
        () => tmdb.trending.trending("movie", "week", { page, language: 'en-US' }),
      );
    case "popular":
      return fetchWithFallback(
        () => tmdb.movies.popular({ page, language: 'vi-VN' }),
        () => tmdb.movies.popular({ page, language: 'en-US' }),
      );
    case "nowPlaying":
      return fetchWithFallback(
        () => tmdb.movies.nowPlaying({ page, language: 'vi-VN' }),
        () => tmdb.movies.nowPlaying({ page, language: 'en-US' }),
      );
    case "upcoming":
      return fetchWithFallback(
        () => tmdb.movies.upcoming({ page, language: 'vi-VN' }),
        () => tmdb.movies.upcoming({ page, language: 'en-US' }),
      );
    case "topRated":
      return fetchWithFallback(
        () => tmdb.movies.topRated({ page, language: 'vi-VN' }),
        () => tmdb.movies.topRated({ page, language: 'en-US' }),
      );
    default:
      return fetchWithFallback(
        () => tmdb.discover.movie({ page, with_genres: genres, language: 'vi-VN' }),
        () => tmdb.discover.movie({ page, with_genres: genres, language: 'en-US' }),
      );
  }
};

export default useFetchDiscoverMovies;
