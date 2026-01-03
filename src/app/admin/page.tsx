"use client";

import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/react";
import {
  IoStatsChart,
  IoNotifications,
  IoSettings,
  IoAnalytics,
  IoShieldCheckmark,
  IoVideocam,
} from "react-icons/io5";
import AdminGuard from "@/components/AdminGuard";
import { getVersionString } from "@/utils/version";

export default function AdminPage() {
  const router = useRouter();

  const adminOptions = [
    {
      title: "Dashboard",
      description: "Xem thống kê và quản lý hệ thống",
      icon: <IoStatsChart className="text-6xl" />,
      path: "/admin/dashboard",
      color: "bg-gradient-to-br from-blue-500 to-cyan-500",
    },
    {
      title: "Live Stream",
      description: "Quản lý luồng phát trực tiếp",
      icon: <IoVideocam className="text-6xl" />,
      path: "/admin/live",
      color: "bg-gradient-to-br from-red-500 to-pink-500",
    },
    {
      title: "Thông báo",
      description: "Quản lý thông báo và tin tức",
      icon: <IoNotifications className="text-6xl" />,
      path: "/admin/notifications",
      color: "bg-gradient-to-br from-orange-500 to-red-500",
    },
    {
      title: "Cài đặt Overlay",
      description: "Quản lý cài đặt hiển thị trong trình phát",
      icon: <IoSettings className="text-6xl" />,
      path: "/admin/settings",
      color: "bg-gradient-to-br from-purple-500 to-pink-500",
    },
    {
      title: "SEO Analyzer",
      description: "Phân tích và tối ưu hóa SEO với Yoast Algorithm",
      icon: <IoAnalytics className="text-6xl" />,
      path: "/admin/seo",
      color: "bg-gradient-to-br from-green-500 to-teal-500",
    },
    {
      title: "Ad Blocker",
      description: "Quản lý filters chặn quảng cáo",
      icon: <IoShieldCheckmark className="text-6xl" />,
      path: "/admin/filters",
      color: "bg-gradient-to-br from-red-500 to-orange-500",
    },
  ];

  return (
    <AdminGuard>
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold text-white">
            CineVerse by An Kun Studio
          </h1>
          <p className="text-xl text-gray-400">
            Lựa chọn tính năng
          </p>
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
                <h2 className="text-3xl font-bold text-white">
                  {option.title}
                </h2>
              </CardHeader>
              <CardBody className="px-6 pb-6">
                <p className="text-lg text-gray-400">
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
