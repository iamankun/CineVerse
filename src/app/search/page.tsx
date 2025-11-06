import { siteConfig } from "@/config/site";
import dynamic from "next/dynamic";
import { Metadata, NextPage } from "next/types";
const SearchList = dynamic(() => import("@/components/sections/Search/List"));

export const metadata: Metadata = {
  title: `Tìm kiếm Phim | ${siteConfig.name}`,
};

const SearchPage: NextPage = () => {
  return <SearchList />;
};

export default SearchPage;
