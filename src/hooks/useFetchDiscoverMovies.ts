"use client";

import { tmdb } from "@/api/tmdb";
import { DiscoverMoviesFetchQueryType } from "@/types/movie";
import { MovieDiscoverResult } from "tmdb-ts/dist/types/discover";

interface FetchDiscoverMovies {
  page?: number;
  type?: DiscoverMoviesFetchQueryType;
  genres?: string;
}

const useFetchDiscoverMovies = ({
  page = 1,
  type = "discover",
  genres,
}: FetchDiscoverMovies): Promise<MovieDiscoverResult> => {
  const discover = () => tmdb.discover.movie({ page: page, with_genres: genres, language: 'vi-VN' });
  const todayTrending = () => tmdb.trending.trending("movie", "day", { page: page, language: 'vi-VN' });
  const thisWeekTrending = () => tmdb.trending.trending("movie", "week", { page: page, language: 'vi-VN' });
  const popular = () => tmdb.movies.popular({ page: page, language: 'vi-VN' });
  const nowPlaying = () => tmdb.movies.nowPlaying({ page: page, language: 'vi-VN' });
  const upcoming = () => tmdb.movies.upcoming({ page: page, language: 'vi-VN' });
  const topRated = () => tmdb.movies.topRated({ page: page, language: 'vi-VN' });

  const queryData = {
    discover,
    todayTrending,
    thisWeekTrending,
    popular,
    nowPlaying,
    upcoming,
    topRated,
  }[type];

  return queryData();
};

export default useFetchDiscoverMovies;
