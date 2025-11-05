import { NextPage } from "next";
import dynamic from "next/dynamic";
const ContinueWatching = dynamic(() => import("@/components/sections/Home/ContinueWatching"));
const HomePageList = dynamic(() => import("@/components/sections/Home/List"));
const CineVerseSources = dynamic(() => import("@/components/sections/Home/CineVerseSources"));

const HomePage: NextPage = () => {
    return (
        <div className="flex flex-col">
            <div className="-mx-3 -mt-8 sm:-mx-5">
                <CineVerseSources />
            </div>
            <div className="flex flex-col gap-3 mt-3 md:gap-8 md:mt-8">
                <ContinueWatching />
                <HomePageList />
            </div>
        </div>
    );
};

export default HomePage;
