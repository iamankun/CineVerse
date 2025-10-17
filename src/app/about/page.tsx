import { Metadata } from "next";
import { siteConfig } from "@/config/site";
import About from "@/components/sections/About/about";

export const metadata: Metadata = {
  title: `Giới thiệu | ${siteConfig.name}`,
  description: "Giới thiệu về CineVerse - Nền tảng xem phim và TV Show trực tuyến"
};

export default function AboutPage() {
  return <About />;
}