"use client";

import { Card, CardBody, CardHeader } from '@heroui/react';
import { Shield, Eye, Lock, Database } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Chính sách Quyền riêng tư</h1>
          <p className="text-gray-400 text-lg">Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}</p>
        </div>

        <div className="space-y-8">
          {/* Giới thiệu */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-blue-400" />
                <h2 className="text-2xl font-semibold text-white">Giới thiệu</h2>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-gray-300 leading-relaxed">
                CineVerse cam kết bảo vệ quyền riêng tư của bạn. Chính sách Quyền riêng tư này giải thích cách chúng tôi thu thập, 
                sử dụng và bảo vệ thông tin của bạn khi sử dụng nền tảng streaming của chúng tôi.
              </p>
            </CardBody>
          </Card>

          {/* Thông tin chúng tôi thu thập */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <Database className="w-6 h-6 text-green-400" />
                <h2 className="text-2xl font-semibold text-white">Thông tin chúng tôi thu thập</h2>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Thông tin tài khoản</h3>
                <p className="text-gray-300">
                  Khi bạn tạo tài khoản, chúng tôi thu thập địa chỉ email, tên người dùng và thông tin xác thực 
                  được cung cấp thông qua Supabase Auth.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Dữ liệu sử dụng</h3>
                <p className="text-gray-300">
                  Chúng tôi thu thập thông tin về cách bạn sử dụng dịch vụ của chúng tôi, bao gồm nội dung đã xem, 
                  lịch sử xem và sở thích để cải thiện trải nghiệm của bạn.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Dữ liệu kỹ thuật</h3>
                <p className="text-gray-300">
                  Chúng tôi tự động thu thập thông tin kỹ thuật như địa chỉ IP, loại trình duyệt, 
                  thông tin thiết bị và nhật ký truy cập để bảo mật và cải thiện dịch vụ.
                </p>
              </div>
            </CardBody>
          </Card>

          {/* Cách chúng tôi sử dụng thông tin của bạn */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <Eye className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-semibold text-white">Cách chúng tôi sử dụng thông tin của bạn</h2>
              </div>
            </CardHeader>
            <CardBody>
              <ul className="space-y-3 text-gray-300">
                <li>• Cung cấp và duy trì dịch vụ streaming của chúng tôi</li>
                <li>• Cá nhân hóa trải nghiệm xem của bạn</li>
                <li>• Cải thiện dịch vụ của chúng tôi và phát triển tính năng mới</li>
                <li>• Giao tiếp với bạn về các cập nhật dịch vụ</li>
                <li>• Đảm bảo bảo mật và ngăn chặn gian lận</li>
                <li>• Tuân thủ các nghĩa vụ pháp lý</li>
              </ul>
            </CardBody>
          </Card>

          {/* Cookie và theo dõi */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <Lock className="w-6 h-6 text-yellow-400" />
                <h2 className="text-2xl font-semibold text-white">Cookie và theo dõi</h2>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Cookie thiết yếu</h3>
                <p className="text-gray-300">
                  Yêu cầu cho chức năng cơ bản của trang web, bao gồm xác thực người dùng và bảo mật.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Cookie phân tích</h3>
                <p className="text-gray-300">
                  Giúp chúng tôi hiểu cách khách truy cập tương tác với trang web của chúng tôi để cải thiện trải nghiệm người dùng.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Cookie sở thích</h3>
                <p className="text-gray-300">
                  Ghi nhớ các sở thích và cài đặt cá nhân hóa của bạn.
                </p>
              </div>
            </CardBody>
          </Card>

          {/* Bảo vệ dữ liệu */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-red-400" />
                <h2 className="text-2xl font-semibold text-white">Bảo vệ dữ liệu</h2>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-gray-300 leading-relaxed mb-4">
                Chúng tôi thực hiện các biện pháp bảo mật thích hợp để bảo vệ thông tin cá nhân của bạn khỏi 
                truy cập trái phép, thay đổi, tiết lộ hoặc phá hủy.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Dữ liệu của bạn được lưu trữ an toàn bằng cơ sở hạ tầng của Supabase, tuân thủ 
                các giao thức bảo mật tiêu chuẩn của ngành và các quy định bao gồm GDPR.
              </p>
            </CardBody>
          </Card>

          {/* Liên hệ */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-4">
              <h2 className="text-2xl font-semibold text-white">Liên hệ với chúng tôi</h2>
            </CardHeader>
            <CardBody>
              <p className="text-gray-300">
                Nếu bạn có bất kỳ câu hỏi nào về Chính sách Quyền riêng tư này hoặc các thực hành dữ liệu của chúng tôi, 
                vui lòng liên hệ với chúng tôi tại admin@ankun.dev
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
