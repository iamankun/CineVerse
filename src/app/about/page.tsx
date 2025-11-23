import { Metadata } from "next";
import { siteConfig } from "@/config/site";
import About from "@/components/sections/About/about";

export const metadata: Metadata = {
  title: `Giới thiệu | ${siteConfig.name}`,
  description: "CineVerse - Vũ trụ Điện Ảnh, nơi những bộ phim điện ảnh và chương trình TV dành cho bạn. Những con người yêu điện ảnh và chương trình TV."
};

export default function AboutPage() {
  return <About />;
}