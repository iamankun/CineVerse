"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader, Button } from "@heroui/react";
import { IoArrowBack, IoCamera } from "react-icons/io5";
import { useRouter } from "next/navigation";
import AdminGuard from "@/components/AdminGuard";
import GestureDetector from "@/components/GestureDetector";

export default function GesturePage() {
  const router = useRouter();

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
        <div className="mx-auto max-w-6xl">
          {/* Tiêu đề */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white">
                Trình Kiểm Tra Cử Chỉ Tay
              </h1>
              <p className="mt-2 text-gray-400">
                Sử dụng MediaPipe Hands để phát hiện cử chỉ tay từ camera
              </p>
            </div>
            <Button
              isIconOnly
              className="bg-gray-700 hover:bg-gray-600"
              onPress={() => router.push("/admin")}
            >
              <IoArrowBack className="text-2xl" />
            </Button>
          </div>

          {/* Nội dung chính */}
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Camera Feed & Phát hiện cử chỉ */}
            <div className="lg:col-span-2">
              <Card className="border-2 border-gray-700 bg-gray-800/50 backdrop-blur-sm">
                <CardHeader className="flex-col items-start border-b border-gray-700 px-6 py-4">
                  <div className="flex items-center gap-2">
                    <IoCamera className="text-2xl text-cyan-500" />
                    <h2 className="text-2xl font-bold text-white">
                      Nguồn Camera
                    </h2>
                  </div>
                </CardHeader>
                <CardBody className="gap-6 p-6">
                  <GestureDetector />
                </CardBody>
              </Card>
            </div>

            {/* Thông tin & Thống kê */}
            <div className="flex flex-col gap-6">
              {/* Thẻ thông tin */}
              <Card className="border-2 border-gray-700 bg-gray-800/50 backdrop-blur-sm">
                <CardHeader className="border-b border-gray-700 px-6 py-4">
                  <h3 className="text-lg font-bold text-white">
                    Thông Tin Hệ Thống
                  </h3>
                </CardHeader>
                <CardBody className="gap-4 p-6">
                  <div className="text-sm text-gray-300">
                    <p className="font-semibold text-white">MediaPipe Hands</p>
                    <p className="mt-1">
                      Phát hiện và theo dõi 21 điểm trên tay
                    </p>
                  </div>
                  <div className="my-3 border-t border-gray-700" />
                  <div className="text-sm text-gray-300">
                    <p className="font-semibold text-white">Tính Năng</p>
                    <ul className="mt-2 space-y-1">
                      <li>✓ Phát hiện tay trái/phải</li>
                      <li>✓ Theo dõi điểm khớp</li>
                      <li>✓ Nhận diện cử chỉ</li>
                      <li>✓ Thống kê thời gian thực</li>
                    </ul>
                  </div>
                </CardBody>
              </Card>

              {/* Thẻ yêu cầu */}
              <Card className="border-2 border-gray-700 bg-gray-800/50 backdrop-blur-sm">
                <CardHeader className="border-b border-gray-700 px-6 py-4">
                  <h3 className="text-lg font-bold text-white">
                    Yêu Cầu
                  </h3>
                </CardHeader>
                <CardBody className="gap-4 p-6">
                  <div className="text-sm text-gray-300">
                    <ul className="space-y-2">
                      <li>• Camera/Webcam hoạt động</li>
                      <li>• Cho phép truy cập camera</li>
                      <li>• Ánh sáng tốt để phát hiện</li>
                      <li>• Browser hỗ trợ WebGL</li>
                    </ul>
                  </div>
                </CardBody>
              </Card>

              {/* Thẻ mẹo */}
              <Card className="border-2 border-yellow-700/50 bg-gradient-to-br from-yellow-900/20 to-orange-900/20 backdrop-blur-sm">
                <CardHeader className="border-b border-yellow-700/30 px-6 py-4">
                  <h3 className="text-lg font-bold text-yellow-400">
                    Mẹo
                  </h3>
                </CardHeader>
                <CardBody className="gap-4 p-6">
                  <div className="text-sm text-yellow-100">
                    <ul className="space-y-2">
                      <li>• Đặt tay trong khung hình</li>
                      <li>• Chuyển động chậm để phát hiện tốt</li>
                      <li>• Tránh bóng mờ hoặc ánh sáng chạy</li>
                      <li>• Cử chỉ rõ ràng để nhận diện</li>
                    </ul>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
