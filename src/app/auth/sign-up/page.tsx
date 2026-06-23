import type { Metadata } from "next";
import { SignUpForm } from "@/components/auth/SignUpForm";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://cineverse.ankun.dev";

export const metadata: Metadata = {
  title: "Đăng ký",
  description: "Tạo tài khoản CineVerse để khám phá vũ trụ điện ảnh",
  alternates: {
    canonical: `${BASE_URL}/auth/sign-up`,
  },
};

export default function SignUpPage() {
  return <SignUpForm />;
}
