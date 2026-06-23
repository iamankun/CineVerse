import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getServerSession } from "@/utils/supabase/server-session";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://cineverse.ankun.dev";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Trang bảo vệ",
  description: "Trang cá nhân được bảo vệ trên CineVerse",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: `${BASE_URL}/protected`,
  },
};

export default async function ProtectedPage() {
  let user;

  try {
    const session = await getServerSession();
    user = session.user;
    const sessionError = session.error;

    if (sessionError) {
      console.error("🔍 [PROTECTED] Session error:", sessionError);
      redirect("/auth/login?error=session_failed");
    }

    if (!user) {
      redirect("/auth/login");
    }
  } catch (error) {
    console.error("🔍 [PROTECTED] Server error:", error);
    redirect("/auth/login?error=server_error");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700">
          <h1 className="text-3xl font-bold text-white mb-4">
            Chào mừng, {user.email}!
          </h1>
          <p className="text-gray-300 mb-6">
            Đây là trang được bảo vệ. Chỉ người dùng đã đăng nhập mới có thể truy cập.
          </p>
          <div className="bg-gray-900/50 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-white mb-2">Thông tin người dùng:</h2>
            <pre className="text-gray-400 text-sm overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
