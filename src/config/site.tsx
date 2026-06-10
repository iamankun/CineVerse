import { tmdb } from "@/api/tmdb";
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
        query: () => tmdb.trending.trending("movie", "day", { language: 'vi-VN' }),
        param: "todayTrending",
      },
      {
        name: "Phim ảnh - Tuần này",
        query: () => tmdb.trending.trending("movie", "week", { language: 'vi-VN' }),
        param: "thisWeekTrending",
      },
      {
        name: "Phim ảnh - Toàn cầu",
        query: () => tmdb.movies.popular({ language: 'vi-VN' }),
        param: "popular",
      },
      {
        name: "Phim ảnh - Đáng xem",
        query: () => tmdb.movies.nowPlaying({ language: 'vi-VN' }),
        param: "nowPlaying",
      },
      {
        name: "Phim ảnh - Sắp ra mắt",
        query: () => tmdb.movies.upcoming({ language: 'vi-VN' }),
        param: "upcoming",
      },
      {
        name: "Điện Ảnh - Do bạn bình chọn ",
        query: () => tmdb.movies.topRated({ language: 'vi-VN' }),
        param: "topRated",
      },
    ],
    tvShows: [
      {
        name: "Chương trình - Hôm nay",
        query: () => tmdb.trending.trending("tv", "day", { language: 'vi-VN' }),
        param: "todayTrending",
      },
      {
        name: "Chương trình - Tuần này",
        query: () => tmdb.trending.trending("tv", "week", { language: 'vi-VN' }),
        param: "thisWeekTrending",
      },
      {
        name: "Chương trình - Toàn cầu",
        // @ts-expect-error: Property 'adult' is missing in type 'PopularTvShowResult' but required in type 'TV'.
        query: () => tmdb.tvShows.popular({ language: 'vi-VN' }),
        param: "popular",
      },
      {
        name: "Chương trình - Đang phát sóng",
        // @ts-expect-error: Property 'adult' is missing in type 'OnTheAirResult' but required in type 'TV'.
        query: () => tmdb.tvShows.onTheAir({ language: 'vi-VN' }),
        param: "onTheAir",
      },
      {
        name: "Chương trình - Đề xuất",
        // @ts-expect-error: Property 'adult' is missing in type 'TopRatedTvShowResult' but required in type 'TV'.
        query: () => tmdb.tvShows.topRated({ language: 'vi-VN' }),
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
