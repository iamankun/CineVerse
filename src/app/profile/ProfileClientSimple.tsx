"use client";

interface ProfileClientProps {
  user: any;
  profile: any;
}

export default function ProfileClientSimple({ user, profile }: ProfileClientProps) {
  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-800 shadow-xl rounded-lg border border-gray-700">
          <div className="border-b border-gray-700 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Trang cá nhân</h1>
            <p className="text-gray-400">Thông tin của bạn</p>
          </div>

          <div className="px-6 py-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Email</label>
                <p className="mt-1 text-white">{user?.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300">Tên người dùng</label>
                <p className="mt-1 text-white">{profile?.username || "Chưa đặt"}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300">Họ và tên</label>
                <p className="mt-1 text-white">{profile?.full_name || "Chưa đặt"}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300">Tiểu sử</label>
                <p className="mt-1 text-white">{profile?.bio || "Chưa có tiểu sử"}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300">Website</label>
                <p className="mt-1 text-white">{profile?.website || "Chưa có"}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300">Địa điểm</label>
                <p className="mt-1 text-white">{profile?.location || "Chưa có"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
