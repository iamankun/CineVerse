import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://cineverse.ankun.dev";

export const metadata: Metadata = {
  title: "Đăng nhập",
  description: "Đăng nhập vào CineVerse để tiếp tục trải nghiệm vũ trụ điện ảnh",
  alternates: {
    canonical: `${BASE_URL}/auth/login`,
  },
};

export default function LoginPage() {
  return <LoginForm />;
}
