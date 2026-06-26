"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/react";
import AdminGuard from "@/components/AdminGuard";
import { getVersionString } from "@/utils/version";
import { IoStatsChart, IoNotifications, IoSettingsSharp, IoAnalytics, IoShieldCheckmarkOutline } from "react-icons/io5";
import { RadioTower } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";

export default function AdminPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data?.full_name) setFullName(data.full_name);
        });
    });
  }, []);

  const adminOptions = [
    {
      title: "Dashboard",
      description: "Quản lý phim, chương trình truyền hình",
      icon: <IoStatsChart className="size-10" />,
      path: "/admin/dashboard",
      color: "bg-gradient-to-br from-blue-500 to-cyan-500",
    },
    {
      title: "Live Stream",
      description: "Phát luồng RTMP",
      icon: <RadioTower className="size-10" />,
      path: "/admin/live",
      color: "bg-gradient-to-br from-red-600 to-orange-500",
    },
      {
        title: "Thông báo",
      description: "Quản lý thông báo và tin tức",
      icon: <IoNotifications className="size-10" />,
      path: "/admin/notifications",
      color: "bg-gradient-to-br from-orange-500 to-red-500",
    },
    {
      title: "Player Settings",
      description: "Quản lý cài đặt hiển thị trong trình phát",
      icon: <IoSettingsSharp className="size-10" />,
      path: "/admin/settings",
      color: "bg-gradient-to-br from-purple-500 to-pink-500",
    },
    {
      title: "SEO Analysis",
      description: "Phân tích và tối ưu hóa SEO với Yoast Algorithm",
      icon: <IoAnalytics className="size-10" />,
      path: "/admin/seo",
      color: "bg-gradient-to-br from-green-500 to-teal-500",
    },
    {
      title: "Ad Blocker",
      description: "Quản lý filters chặn quảng cáo",
      icon: <IoShieldCheckmarkOutline className="size-10" />,
      path: "/admin/filters",
      color: "bg-gradient-to-br from-red-500 to-orange-500",
    },
  ];

  return (
    <AdminGuard>
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
        <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="mb-12 flex items-center gap-4">
          <Image src="/logo-cineverse.webp" alt="CineVerse" width={64} height={64} />
          <div>
            <p className="text-2xl text-gray-300">
              Xin chào, <span className="font-bold text-white">{fullName || "bạn"}</span> đã quay trở lại
            </p>
          </div>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {adminOptions.map((option) => (
            <Card
              key={option.path}
              isPressable
              isHoverable
              onPress={() => router.push(option.path)}
              className="transform border-2 border-transparent bg-gray-800/50 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-white/20 hover:shadow-2xl"
            >
              <CardHeader className="flex-col items-start px-6 pt-6">
                <div
                  className={`mb-4 flex h-20 w-20 items-center justify-center rounded-2xl ${option.color} text-white shadow-lg`}
                >
                  {option.icon}
                </div>
                <h2 className="text-3xl font-bold text-white text-left">
                  {option.title}
                </h2>
              </CardHeader>
              <CardBody className="px-6 pb-6">
                <p className="text-lg text-gray-400 text-left">
                  {option.description}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Bản quyền CineVerse thuộc An Kun Studio tại Việt Nam
          </p>
          <p className="mt-2 text-xs text-gray-600">
            Phiên bản {getVersionString()}
          </p>
        </div>
        </div>
      </div>
    </AdminGuard>
  );
}
