"use client";

import { useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";

interface ProfileClientProps {
  user: any;
  profile: any;
}

export default function ProfileClientSimple({ user, profile }: ProfileClientProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: profile?.username || "",
    full_name: profile?.full_name || "",
    bio: profile?.bio || "",
    website: profile?.website || "",
    location: profile?.location || ""
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [message, setMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: formData.username,
          full_name: formData.full_name,
          bio: formData.bio,
          website: formData.website,
          location: formData.location
        })
        .eq("id", user.id);

      if (error) throw error;

      setMessage("Cập nhật thành công!");
      setIsEditing(false);
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      setMessage(error.message || "Cập nhật thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setPasswordMessage("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage("Mật khẩu xác nhận không khớp");
      setIsLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage("Mật khẩu mới phải có ít nhất 6 ký tự");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Đổi mật khẩu thất bại");
      }

      setPasswordMessage("Đổi mật khẩu thành công!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setIsChangingPassword(false);
      
      setTimeout(() => {
        setPasswordMessage("");
      }, 3000);
    } catch (error: any) {
      setPasswordMessage(error.message || "Đổi mật khẩu thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("🔥 [PROFILE] Avatar upload started:", {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });

    setIsUploadingAvatar(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", user.id);

      console.log("🔥 [PROFILE] Sending upload request...");

      const response = await fetch("/api/avatar-upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      console.log("🔥 [PROFILE] Upload response:", {
        status: response.status,
        ok: response.ok,
        data: data
      });

      if (!response.ok) {
        throw new Error(data.error || "Upload thất bại");
      }

      setMessage("Cập nhật avatar thành công!");
      console.log("✅ [PROFILE] Avatar upload successful");
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error("❌ [PROFILE] Avatar upload error:", error);
      setMessage(error.message || "Upload avatar thất bại");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChangeData = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  if (isChangingPassword) {
    return (
      <div className="min-h-screen bg-gray-900 py-12">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-800 shadow-xl rounded-lg border border-gray-700">
            <div className="border-b border-gray-700 px-6 py-4">
              <h1 className="text-2xl font-bold text-white">Đổi mật khẩu</h1>
              <p className="text-gray-400">Cập nhật mật khẩu của bạn</p>
            </div>

            <form onSubmit={handlePasswordChange} className="px-6 py-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300">Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChangeData}
                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Nhập mật khẩu hiện tại"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300">Mật khẩu mới</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChangeData}
                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                    required
                    minLength={6}
                  />
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChangeData}
                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Nhập lại mật khẩu mới"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {passwordMessage && (
                <div className={`mt-4 p-3 rounded-md ${
                  passwordMessage.includes("thành công") 
                    ? "bg-green-800 text-green-200" 
                    : "bg-red-800 text-red-200"
                }`}>
                  {passwordMessage}
                </div>
              )}

              <div className="mt-6 flex space-x-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-4 py-2 rounded-md transition-colors"
                >
                  {isLoading ? "Đang lưu..." : "Đổi mật khẩu"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordMessage("");
                    setPasswordData({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: ""
                    });
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="min-h-screen bg-gray-900 py-12">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-800 shadow-xl rounded-lg border border-gray-700">
            <div className="border-b border-gray-700 px-6 py-4">
              <h1 className="text-2xl font-bold text-white">Chỉnh sửa trang cá nhân</h1>
              <p className="text-gray-400">Cập nhật thông tin của bạn</p>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Ảnh đại diện</label>
                  <div className="mt-1 flex items-center space-x-4">
                    <div className="relative">
                      <img
                        src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.full_name || user?.email}&background=1f2937&color=fff&size=100`}
                        alt="Avatar"
                        className="h-20 w-20 rounded-full object-cover border-2 border-gray-600"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingAvatar}
                        className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white p-1 rounded-full transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                      <p className="text-sm text-gray-400">
                        {isUploadingAvatar ? "Đang upload..." : "Click để thay đổi avatar"}
                      </p>
                      <p className="text-xs text-gray-500">JPG, PNG, GIF tối đa 5MB</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300">Email</label>
                  <p className="mt-1 text-white">{user?.email}</p>
                </div>
                
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-300">Tên người dùng</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Nhập tên người dùng"
                  />
                </div>
                
                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium text-gray-300">Họ và tên</label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Nhập họ và tên"
                  />
                </div>
                
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-300">Tiểu sử</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={3}
                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Giới thiệu ngắn về bản thân"
                  />
                </div>
                
                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-300">Website</label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="https://example.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-300">Địa điểm</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Thành phố, quốc gia"
                  />
                </div>
              </div>

              {message && (
                <div className={`mt-4 p-3 rounded-md ${
                  message.includes("thành công") 
                    ? "bg-green-800 text-green-200" 
                    : "bg-red-800 text-red-200"
                }`}>
                  {message}
                </div>
              )}

              <div className="mt-6 flex space-x-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-4 py-2 rounded-md transition-colors"
                >
                  {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-800 shadow-xl rounded-lg border border-gray-700">
          <div className="border-b border-gray-700 px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-white">Trang cá nhân</h1>
                <p className="text-gray-400">Thông tin của bạn</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Đổi mật khẩu
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Chỉnh sửa
                </button>
              </div>
            </div>
          </div>

          <div className="px-6 py-6">
            <div className="flex items-start space-x-6">
              <div className="shrink-0">
                <img
                  src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.full_name || user?.email}&background=1f2937&color=fff&size=120`}
                  alt="Avatar"
                  className="h-24 w-24 rounded-full object-cover border-2 border-gray-600"
                />
              </div>
              
              <div className="flex-1 space-y-4">
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
                  <p className="mt-1 text-white whitespace-pre-wrap">{profile?.bio || "Chưa có tiểu sử"}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300">Website</label>
                  <p className="mt-1 text-white">
                    {profile?.website ? (
                      <a 
                        href={profile.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline"
                      >
                        {profile.website}
                      </a>
                    ) : (
                      "Chưa có"
                    )}
                  </p>
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
    </div>
  );
}
