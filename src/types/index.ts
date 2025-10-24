import { Movie, TV } from "tmdb-ts/dist/types";

export type ContentType = "movie" | "tv";

export type Params<T> = {
  params: Promise<T>;
};

export type ActionResponse<T = null> = Promise<{
  success: boolean;
  message?: string;
  data?: T;
}>;

export type MovieParam =
  | "todayTrending"
  | "thisWeekTrending"
  | "popular"
  | "nowPlaying"
  | "upcoming"
  | "topRated";

export type TvShowParam =
  | "todayTrending"
  | "thisWeekTrending"
  | "popular"
  | "onTheAir"
  | "topRated";

export type QueryList<T extends Movie | TV> = {
  name: string;
  query: () => Promise<{
    page: number;
    results: T[];
    total_results: number;
    total_pages: number;
  }>;
  param: T extends Movie ? MovieParam : TvShowParam;
};

export type SiteConfigType = {
  name: string;
  description: string;
  favicon: string;
  navItems: {
    label: string;
    href: string;
    icon: React.ReactNode;
    activeIcon: React.ReactNode;
  }[];
  queryLists: {
    movies: QueryList<Movie>[];
    tvShows: QueryList<TV>[];
  };
  themes: {
    name: "light" | "dark" | "system";
    label: string;
    icon: React.ReactNode;
  }[];
  socials: {
    website: string;
    facebook: string;
    youtube: string;
  };
};

export type PlayersProps = {
  title: string;
  source: `https://${string}`;
  recommended?: boolean;
  fast?: boolean;
  ads?: false;
  resumable?: boolean;
  isCineVerseSource?: boolean;
};

export type CineVerseSource = {
  provider: "youtube" | "dailymotion";
  title: string;
  url: string;
  quality?: string;
  language?: string;
  subtitles?: string[];
};

export type CineVerseMovieData = {
  tmdbId: number;
  title: string;
  sources: CineVerseSource[];
  lastUpdated: string;
};

export type CineVerseTvData = {
  tmdbId: number;
  title: string;
  seasons: {
    [season: string]: {
      [episode: string]: {
        sources: CineVerseSource[];
      };
    };
  };
  lastUpdated: string;
};

export type Settings = {
  theme: "light" | "dark" | "system";
  showSpecialSeason: true;
  disableAnimation: false;
  saveWatchHistory: true;
};
