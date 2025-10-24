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
  description: "Vũ trụ Điện Ảnh dành cho bạn",
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
        name: "Tóp tren-đì (Trendy)",
        query: () => tmdb.trending.trending("movie", "day", { language: 'vi-VN' }),
        param: "todayTrending",
      },
      {
        name: "Điện Ảnh - Tuần này",
        query: () => tmdb.trending.trending("movie", "week", { language: 'vi-VN' }),
        param: "thisWeekTrending",
      },
      {
        name: "Điện Ảnh - Phổ biến",
        query: () => tmdb.movies.popular({ language: 'vi-VN' }),
        param: "popular",
      },
      {
        name: "Điện Ảnh - Xem ngay",
        query: () => tmdb.movies.nowPlaying({ language: 'vi-VN' }),
        param: "nowPlaying",
      },
      {
        name: "Điện Ảnh - Sắp tới",
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
        name: "Chương trình TV - Hôm nay",
        query: () => tmdb.trending.trending("tv", "day", { language: 'vi-VN' }),
        param: "todayTrending",
      },
      {
        name: "Chương trình TV - Tuần này",
        query: () => tmdb.trending.trending("tv", "week", { language: 'vi-VN' }),
        param: "thisWeekTrending",
      },
      {
        name: "Chương trình TV - Phổ biến",
        // @ts-expect-error: Property 'adult' is missing in type 'PopularTvShowResult' but required in type 'TV'.
        query: () => tmdb.tvShows.popular({ language: 'vi-VN' }),
        param: "popular",
      },
      {
        name: "Chương trình TV - On Air",
        // @ts-expect-error: Property 'adult' is missing in type 'OnTheAirResult' but required in type 'TV'.
        query: () => tmdb.tvShows.onTheAir({ language: 'vi-VN' }),
        param: "onTheAir",
      },
      {
        name: "Chương trình Tv - Do bạn lựa chọn",
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
