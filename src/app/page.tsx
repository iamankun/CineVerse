import type { Metadata } from "next";
import { NextPage } from "next";
import dynamic from "next/dynamic";
import LoadingWrapper from "@/components/LoadingWrapper";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://cineverse.ankun.dev";

export const metadata: Metadata = {
  title: "Trang chủ",
  alternates: {
    canonical: BASE_URL,
  },
};
const ContinueWatching = dynamic(() => import("@/components/sections/Home/ContinueWatching"));
const HomePageList = dynamic(() => import("@/components/sections/Home/List"));
const CineVerseSources = dynamic(() => import("@/components/sections/Home/CineVerseSources"));
const CineVerseList = dynamic(() => import("@/components/sections/Home/CineVerseList"));
const HomeNotification = dynamic(() => import("@/components/ui/notification/HomeNotification"));

const HomePage: NextPage = () => {
    return (
        <LoadingWrapper>
            <div className="flex flex-col">
                <div className="-mx-3 -mt-8 sm:-mx-5">
                    <CineVerseSources />
                </div>
                <div className="relative flex flex-col gap-3 mt-3 md:gap-8 md:mt-8">
                    {/* Gradient fade overlay to blend with hero */}
                    <div className="absolute -top-32 -left-8 -right-8 h-32 bg-gradient-to-b from-black/0 via-background/100 to-background pointer-events-none z-10" />
                    <ContinueWatching />
                    <CineVerseList />
                    <HomePageList />
                </div>
            </div>
            <HomeNotification />
        </LoadingWrapper>
    );
};

export default HomePage;