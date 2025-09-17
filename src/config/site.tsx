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
  description: "Vũ trụ Điện Ảnh cho Gen",
  favicon: "/favicon.ico",
  navItems: [
    {
      label: "",
      href: "/",
      icon: <GoHome className="size-full" />,
      activeIcon: <GoHomeFill className="size-full" />,
    },
    {
      label: "",
      href: "/discover",
      icon: <IoCompassOutline className="size-full" />,
      activeIcon: <IoCompass className="size-full" />,
    },
    {
      label: "",
      href: "/search",
      icon: <BiSearchAlt2 className="size-full" />,
      activeIcon: <BiSolidSearchAlt2 className="size-full" />,
    },
    {
      label: "n",
      href: "/library",
      icon: <TbFolder className="size-full" />,
      activeIcon: <TbFolderFilled className="size-full" />,
    },
    {
      label: "",
      href: "/about",
      icon: <IoInformationCircleOutline className="size-full" />,
      activeIcon: <IoInformationCircle className="size-full" />,
    },
  ],
  themes: [
    {
      name: "light",
      icon: <IoIosSunny className="size-full" />,
    },
    {
      name: "dark",
      icon: <IoMoon className="size-full" />,
    },
    {
      name: "system",
      icon: <HiComputerDesktop className="size-full" />,
    },
  ],
  queryLists: {
    movies: [
      {
        name: "Tóp tren-đì (Trendy)",
        query: () => tmdb.trending.trending("movie", "day"),
        param: "todayTrending",
      },
      {
        name: "Điện Ảnh - Tuần này",
        query: () => tmdb.trending.trending("movie", "week"),
        param: "thisWeekTrending",
      },
      {
        name: "Điện Ảnh - Phổ biến",
        query: () => tmdb.movies.popular(),
        param: "popular",
      },
      {
        name: "Điện Ảnh - Xem ngay",
        query: () => tmdb.movies.nowPlaying(),
        param: "nowPlaying",
      },
      {
        name: "Điện Ảnh - Sắp tới",
        query: () => tmdb.movies.upcoming(),
        param: "upcoming",
      },
      {
        name: "Điện Ảnh - Do bạn bình chọn ",
        query: () => tmdb.movies.topRated(),
        param: "topRated",
      },
    ],
    tvShows: [
      {
        name: "Chương trình TV - Hôm nay",
        query: () => tmdb.trending.trending("tv", "day"),
        param: "todayTrending",
      },
      {
        name: "Chương trình TV - Tuần này",
        query: () => tmdb.trending.trending("tv", "week"),
        param: "thisWeekTrending",
      },
      {
        name: "Chương trình TV - Phổ biến",
        // @ts-expect-error: Property 'adult' is missing in type 'PopularTvShowResult' but required in type 'TV'.
        query: () => tmdb.tvShows.popular(),
        param: "popular",
      },
      {
        name: "Chương trình TV - On Air",
        // @ts-expect-error: Property 'adult' is missing in type 'OnTheAirResult' but required in type 'TV'.
        query: () => tmdb.tvShows.onTheAir(),
        param: "onTheAir",
      },
      {
        name: "Chương trình Tv - Do bạn lựa chọn",
        // @ts-expect-error: Property 'adult' is missing in type 'TopRatedTvShowResult' but required in type 'TV'.
        query: () => tmdb.tvShows.topRated(),
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
