"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client-new";
import { addToast, Button, Input, Avatar, Textarea } from "@heroui/react";
import { Camera, Save, User, LogOut } from "lucide-react";

interface ProfileClientProps {
  user: any;
  profile: any;
}

export default function ProfileClient({ user, profile }: ProfileClientProps) {
  const router = useRouter();
  const supabase = createClient();
  
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(profile?.avatar_url || "");
  
  // Password change states
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    username: profile?.username || user.email?.split("@")[0] || "",
    full_name: profile?.full_name || "",
    bio: profile?.bio || "",
    website: profile?.website || "",
    location: profile?.location || "",
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let avatarUrl = avatarPreview;

      // Upload avatar if changed
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `avatar.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
        
        // Check if bucket exists, create if needed
        try {
          const { data: buckets } = await supabase.storage.listBuckets();
          const avatarsBucket = buckets?.find((b: any) => b.name === 'avatars');
          
          if (!avatarsBucket) {
            const { error: createError } = await supabase.storage.createBucket('avatars', {
              public: true,
              fileSizeLimit: 5242880, // 5MB
              allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
            });
            
            if (createError) {
              console.error("Lỗi tạo bucket lưu trữ:", createError);
              throw new Error("Không thể tạo bucket lưu trữ. Vui lòng liên hệ quản trị viên.");
            }
          }
        } catch (bucketError) {
          console.error("Lỗi kiểm tra bucket lưu trữ:", bucketError);
        }

        // Upload avatar
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) {
          console.error("Lỗi tải lên ảnh đại diện:", uploadError);
          throw new Error("Không thể tải lên ảnh đại diện: " + uploadError.message);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        avatarUrl = publicUrl;
      }

      // Update profile
      const updateData: any = {
        full_name: formData.full_name,
        updated_at: new Date().toISOString()
      };
      
      if (formData.username) updateData.username = formData.username;
      if (formData.bio) updateData.bio = formData.bio;
      if (formData.website) updateData.website = formData.website;
      if (formData.location) updateData.location = formData.location;
      if (avatarUrl) updateData.avatar_url = avatarUrl;
      
      const { error: updateError } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id);

      if (updateError) {
        console.error("Lỗi cập nhật thông tin trang cá nhân:", updateError);
        throw new Error(updateError.message || "Không thể cập nhật thông tin trang cá nhân");
      }

      addToast({
        title: "Thành công",
        description: "Trang cá nhân đã được cập nhật",
        color: "success",
      });

    } catch (error: any) {
      console.error("Lỗi cập nhật thông tin trang cá nhân:", error);
      
      addToast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật thông tin trang cá nhân",
        color: "danger",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      addToast({
        title: "Lỗi",
        description: "Mật khẩu xác nhận không khớp",
        color: "danger",
      });
      return;
    }

    if (newPassword.length < 6) {
      addToast({
        title: "Lỗi", 
        description: "Mật khẩu mới phải có ít nhất 6 ký tự",
        color: "danger",
      });
      return;
    }

    setChangingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      addToast({
        title: "Thành công",
        description: "Mật khẩu đã được thay đổi",
        color: "success",
      });

      // Reset password form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordChange(false);

    } catch (error: any) {
      addToast({
        title: "Lỗi",
        description: error.message || "Không thể thay đổi mật khẩu",
        color: "danger",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-800 shadow-xl rounded-lg border border-gray-700">
          <div className="border-b border-gray-700 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Chỉnh Sửa trang cá nhân</h1>
            <p className="text-gray-400">Cập nhật thông tin cá nhân của bạn</p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6">
            {/* Avatar Section */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-300 mb-4">
                Ảnh Đại Diện
              </label>
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <Avatar
                    src={avatarPreview}
                    size="lg"
                    className="h-24 w-24"
                    fallback={<User className="h-12 w-12 text-gray-400" />}
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <Camera className="h-4 w-4" />
                    <input
                      id="avatar-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                  </label>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-400">
                    Nhấp vào biểu tượng camera để thay đổi ảnh đại diện
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Định dạng: JPG, PNG, GIF. Tối đa: 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <Input
                  label="Tên người dùng"
                  placeholder="Nhập tên người dùng"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  variant="bordered"
                  classNames={{
                    label: "text-gray-300",
                    input: "bg-gray-700 text-white border-gray-600",
                    inputWrapper: "border-gray-600",
                    helperWrapper: "text-gray-400"
                  }}
                />
              </div>
              
              <div>
                <Input
                  label="Họ và tên"
                  placeholder="Nhập họ và tên đầy đủ"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange("full_name", e.target.value)}
                  variant="bordered"
                  classNames={{
                    label: "text-gray-300",
                    input: "bg-gray-700 text-white border-gray-600",
                    inputWrapper: "border-gray-600",
                    helperWrapper: "text-gray-400"
                  }}
                />
              </div>
            </div>

            {/* Bio */}
            <div className="mt-6">
              <Textarea
                label="Tiểu sử"
                placeholder="Giới thiệu ngắn về bản thân..."
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                variant="bordered"
                minRows={3}
                maxRows={6}
                classNames={{
                  label: "text-gray-300",
                  input: "bg-gray-700 text-white border-gray-600",
                  inputWrapper: "border-gray-600",
                  helperWrapper: "text-gray-400"
                }}
              />
            </div>

            {/* Additional Information */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mt-6">
              <div>
                <Input
                  label="Trang chủ"
                  placeholder="https://cineverse.ankun.dev"
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  variant="bordered"
                  type="url"
                  classNames={{
                    label: "text-gray-300",
                    input: "bg-gray-700 text-white border-gray-600",
                    inputWrapper: "border-gray-600",
                    helperWrapper: "text-gray-400"
                  }}
                />
              </div>
              
              <div>
                <Input
                  label="Địa điểm"
                  placeholder="Thành phố, Quốc gia"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  variant="bordered"
                  classNames={{
                    label: "text-gray-300",
                    input: "bg-gray-700 text-white border-gray-600",
                    inputWrapper: "border-gray-600",
                    helperWrapper: "text-gray-400"
                  }}
                />
              </div>
            </div>

            {/* Email Display (Read-only) */}
            <div className="mt-6">
              <Input
                label="Email"
                value={user?.email || ""}
                variant="bordered"
                isReadOnly
                description="Email không thể thay đổi"
                classNames={{
                  label: "text-gray-300",
                  input: "bg-gray-700 text-gray-400 border-gray-600",
                  inputWrapper: "border-gray-600",
                  helperWrapper: "text-gray-400"
                }}
              />
            </div>

            {/* Password Change Section */}
            <div className="border-t border-gray-700 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Đổi Mật Khẩu</h3>
                <Button
                  type="button"
                  variant="flat"
                  color="primary"
                  size="sm"
                  onPress={() => setShowPasswordChange(!showPasswordChange)}
                >
                  {showPasswordChange ? "Hủy" : "Đổi mật khẩu"}
                </Button>
              </div>

              {showPasswordChange && (
                <div className="space-y-4">
                  <Input
                    type="password"
                    label="Mật khẩu hiện tại"
                    placeholder="Nhập mật khẩu hiện tại"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    variant="bordered"
                    classNames={{
                      label: "text-gray-300",
                      input: "bg-gray-700 text-white border-gray-600",
                      inputWrapper: "border-gray-600",
                      helperWrapper: "text-gray-400"
                    }}
                  />
                  
                  <Input
                    type="password"
                    label="Mật khẩu mới"
                    placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    variant="bordered"
                    classNames={{
                      label: "text-gray-300",
                      input: "bg-gray-700 text-white border-gray-600",
                      inputWrapper: "border-gray-600",
                      helperWrapper: "text-gray-400"
                    }}
                  />
                  
                  <Input
                    type="password"
                    label="Xác nhận mật khẩu mới"
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    variant="bordered"
                    classNames={{
                      label: "text-gray-300",
                      input: "bg-gray-700 text-white border-gray-600",
                      inputWrapper: "border-gray-600",
                      helperWrapper: "text-gray-400"
                    }}
                  />
                  
                  <Button
                    type="button"
                    color="success"
                    className="w-full"
                    isLoading={changingPassword}
                    onPress={handlePasswordChange}
                    startContent={<Save className="h-4 w-4" />}
                  >
                    {changingPassword ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
                  </Button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-between items-center">
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="flat"
                  color="danger"
                  onPress={handleLogout}
                  startContent={<LogOut className="h-4 w-4" />}
                >
                  Đăng xuất
                </Button>
              </div>
              
              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="bordered"
                  onPress={() => router.back()}
                >
                  Hủy
                </Button>
                
                <Button
                  type="submit"
                  color="primary"
                  isLoading={saving}
                  startContent={<Save className="h-4 w-4" />}
                >
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
