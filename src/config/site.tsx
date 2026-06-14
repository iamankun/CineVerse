import { tmdb, fetchWithFallback } from "@/api/tmdb";
import { SiteConfigType } from "@/types";
import { BiSearchAlt2, BiSolidSearchAlt2 } from "react-icons/bi";
import { GoHomeFill, GoHome } from "react-icons/go";
import { HiComputerDesktop } from "react-icons/hi2";
import { IoIosSunny } from "react-icons/io";
import {
  IoCompass,
  IoCompassOutline,
  IoInformationCircle,
  IoInformationCircleOutline,
  IoMoon,
} from "react-icons/io5";
import { TbFolder, TbFolderFilled } from "react-icons/tb";

export const siteConfig: SiteConfigType = {
  name: "CineVerse",
  description: "Vũ trụ điện ảnh của bạn",
  favicon: "/favicon.ico",
  navItems: [
    {
      label: "CineVerse",
      href: "/",
      icon: <GoHome className="size-full" />,
      activeIcon: <GoHomeFill className="size-full" />,
    },
    {
      label: "Khám phá",
      href: "/discover",
      icon: <IoCompassOutline className="size-full" />,
      activeIcon: <IoCompass className="size-full" />,
    },
    {
      label: "Tìm kiếm",
      href: "/search",
      icon: <BiSearchAlt2 className="size-full" />,
      activeIcon: <BiSolidSearchAlt2 className="size-full" />,
    },
    {
      label: "Thư viện",
      href: "/library",
      icon: <TbFolder className="size-full" />,
      activeIcon: <TbFolderFilled className="size-full" />,
    },
    {
      label: "Giới thiệu",
      href: "/about",
      icon: <IoInformationCircleOutline className="size-full" />,
      activeIcon: <IoInformationCircle className="size-full" />,
    },
  ],
  themes: [
    {
      name: "light",
      label: "Sáng",
      icon: <IoIosSunny className="size-full" />,
    },
    {
      name: "dark",
      label: "Tối",
      icon: <IoMoon className="size-full" />,
    },
    {
      name: "system",
      label: "Hệ thống",
      icon: <HiComputerDesktop className="size-full" />,
    },
  ],
  queryLists: {
    movies: [
      {
        name: "Đề xuất trong ngày",
        query: () => fetchWithFallback(
          () => tmdb.trending.trending("movie", "day", { language: 'vi-VN' }),
          () => tmdb.trending.trending("movie", "day", { language: 'en-US' }),
        ),
        param: "todayTrending",
      },
      {
        name: "Phim ảnh tuần này",
        query: () => fetchWithFallback(
          () => tmdb.trending.trending("movie", "week", { language: 'vi-VN' }),
          () => tmdb.trending.trending("movie", "week", { language: 'en-US' }),
        ),
        param: "thisWeekTrending",
      },
      {
        name: "Phim ảnh toàn cầu",
        query: () => fetchWithFallback(
          () => tmdb.movies.popular({ language: 'vi-VN' }),
          () => tmdb.movies.popular({ language: 'en-US' }),
        ),
        param: "popular",
      },
      {
        name: "Phim ảnh đang chiếu",
        query: () => fetchWithFallback(
          () => tmdb.movies.nowPlaying({ language: 'vi-VN' }),
          () => tmdb.movies.nowPlaying({ language: 'en-US' }),
        ),
        param: "nowPlaying",
      },
      {
        name: "Phim ảnh sắp ra mắt",
        query: () => fetchWithFallback(
          () => tmdb.movies.upcoming({ language: 'vi-VN' }),
          () => tmdb.movies.upcoming({ language: 'en-US' }),
        ),
        param: "upcoming",
      },
      {
        name: "Phim ảnh đề xuất",
        query: () => fetchWithFallback(
          () => tmdb.movies.topRated({ language: 'vi-VN' }),
          () => tmdb.movies.topRated({ language: 'en-US' }),
        ),
        param: "topRated",
      },
    ],
    tvShows: [
      {
        name: "Chương trình hôm nay",
        query: () => fetchWithFallback(
          () => tmdb.trending.trending("tv", "day", { language: 'vi-VN' }),
          () => tmdb.trending.trending("tv", "day", { language: 'en-US' }),
        ),
        param: "todayTrending",
      },
      {
        name: "Chương trình tuần này",
        query: () => fetchWithFallback(
          () => tmdb.trending.trending("tv", "week", { language: 'vi-VN' }),
          () => tmdb.trending.trending("tv", "week", { language: 'en-US' }),
        ),
        param: "thisWeekTrending",
      },
      {
        name: "Chương trình toàn cầu",
        // @ts-expect-error: Property 'adult' is missing in type 'PopularTvShowResult' but required in type 'TV'.
        query: () => fetchWithFallback(
          () => tmdb.tvShows.popular({ language: 'vi-VN' }),
          () => tmdb.tvShows.popular({ language: 'en-US' }),
        ),
        param: "popular",
      },
      {
        name: "Chương trình đang phát sóng",
        // @ts-expect-error: Property 'adult' is missing in type 'OnTheAirResult' but required in type 'TV'.
        query: () => fetchWithFallback(
          () => tmdb.tvShows.onTheAir({ language: 'vi-VN' }),
          () => tmdb.tvShows.onTheAir({ language: 'en-US' }),
        ),
        param: "onTheAir",
      },
      {
        name: "Chương trình đề xuất",
        // @ts-expect-error: Property 'adult' is missing in type 'TopRatedTvShowResult' but required in type 'TV'.
        query: () => fetchWithFallback(
          () => tmdb.tvShows.topRated({ language: 'vi-VN' }),
          () => tmdb.tvShows.topRated({ language: 'en-US' }),
        ),
        param: "topRated",
      },
    ],
  },
  socials: {
    website: "https://cineverse.ankun.dev",
    youtube: "https://youtube.com/@ankun_music",
    facebook: "https://facebook.com/ankunstudio",

  },
};

export type SiteConfig = typeof siteConfig;
