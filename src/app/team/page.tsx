import type { Metadata } from "next";
import { TeamPage } from '@/components/team/TeamPage'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://cineverse.ankun.dev";

export const metadata: Metadata = {
  title: "Đội ngũ",
  description: "Gặp gỡ đội ngũ phát triển CineVerse - Vũ trụ điện ảnh của bạn",
  alternates: {
    canonical: `${BASE_URL}/team`,
  },
};

export default function Team() {
  return <TeamPage />
}
