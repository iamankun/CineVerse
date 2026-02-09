"use client";

import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/react";
import {
  IoStatsChart,
  IoNotifications,
  IoSettings,
  IoAnalytics,
  IoShieldCheckmark,
  IoTv,
  IoFilm,
} from "react-icons/io5";
import AdminGuard from "@/components/AdminGuard";
import { getVersionString } from "@/utils/version";

export default function AdminPage() {
  const router = useRouter();

  const adminOptions = [
    {
      title: "Bảng điều khiển",
      description: "Xem thống kê và quản lý hệ thống",
      icon: <IoStatsChart className="text-6xl" />,
      path: "/admin/dashboard",
      color: "bg-gradient-to-br from-blue-500 to-cyan-500",
    },
    {
      title: "Quản lý Media",
      description: "Quản lý phim và chương trình truyền hình",
      icon: <IoFilm className="text-6xl" />,
      path: "/admin/media",
      color: "bg-gradient-to-br from-indigo-500 to-purple-500",
    },
    {
      title: "TV",
      description: "Quản lý luồng phát Tivi trực tiếp",
      icon: <IoTv className="text-6xl" />,
      path: "/admin/tivi",
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
      title: "Phân tích SEO",
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
      <div className="flex min-h-screen bg-gray-900">
        {/* Sidebar */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">
              CineVerse Admin
            </h1>
            <p className="text-sm text-gray-400">
              Phiên bản {getVersionString()}
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            {adminOptions.map((option) => (
              <button
                key={option.path}
                onClick={() => router.push(option.path)}
                className="w-full flex items-center gap-4 p-4 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-all duration-300 text-left group"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg ${option.color} text-white shrink-0`}
                >
                  {option.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold group-hover:text-blue-400 transition-colors">
                    {option.title}
                  </h3>
                  <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                    {option.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-auto pt-8 border-t border-gray-700">
            <p className="text-xs text-gray-500 text-center">
              Bản quyền CineVerse thuộc An Kun Studio tại Việt Nam
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Chọn tính năng quản lý
            </h2>
            <p className="text-gray-400">
              Vui lòng chọn một tính năng từ menu bên trái
            </p>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
