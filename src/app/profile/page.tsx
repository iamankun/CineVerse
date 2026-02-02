"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client-new";
import { addToast, Button, Input, Avatar, Textarea } from "@heroui/react";
import { Camera, Save, User } from "@/utils/icons";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  
  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    bio: "",
    website: "",
    location: "",
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/auth/login");
        return;
      }

      setUser(user);

      // Fetch profile data
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        setFormData({
          username: profile.username || "",
          full_name: profile.full_name || "",
          bio: profile.bio || "",
          website: profile.website || "",
          location: profile.location || "",
        });
        
        if (profile.avatar_url) {
          setAvatarPreview(profile.avatar_url);
        }
      }
    } catch (error: any) {
      console.error("Lỗi tải trang cá nhân:", error);
      addToast({
        title: "Lỗi",
        description: "Không thể tải thông tin trang cá nhân",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

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
          const avatarsBucket = buckets?.find(b => b.name === 'avatars');
          
          if (!avatarsBucket) {
            // Create bucket if it doesn't exist
            const { error: createError } = await supabase.storage.createBucket('avatars', {
              public: true,
              fileSizeLimit: 5242880, // 5MB
              allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
            });
            
            if (createError) {
              console.error("Lỗi tạo bucket:", createError);
              throw new Error("Không thể tạo ổ lưu trữ. Vui lòng liên hệ admin.");
            }
          }
        } catch (bucketError) {
          console.error("Lỗi kiểm tra bucket:", bucketError);
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

      // Update profile using RPC function
      const { error: updateError } = await supabase.rpc('upsert_profile', {
        p_id: user.id,
        p_username: formData.username,
        p_full_name: formData.full_name,
        p_bio: formData.bio,
        p_website: formData.website,
        p_location: formData.location,
        p_avatar_url: avatarUrl,
        p_public_profile: true
      });

      if (updateError) {
        console.error("Lỗi cập nhật trang cá nhân:", updateError);
        
        // Handle specific RLS errors
        if (updateError.message?.includes('row-level security')) {
          throw new Error("Không có quyền truy cập trang cá nhân. Vui lòng đăng nhập lại.");
        }
        
        throw new Error(updateError.message || "Không thể cập nhật trang cá nhân");
      }

      addToast({
        title: "Thành công",
        description: "Trang cá nhân đã được cập nhật",
        color: "success",
      });

    } catch (error: any) {
      console.error("Lỗi cập nhật trang cá nhân:", error);
      addToast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật trang cá nhân",
        color: "danger",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-t-transparent"></div>
          <p>Đang tải thông tin trang cá nhân...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg">
          <div className="border-b border-gray-200 px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Chỉnh Sửa trang cá nhân</h1>
            <p className="text-gray-600">Cập nhật thông tin cá nhân của bạn</p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6">
            {/* Avatar Section */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Ảnh Đại Diện
              </label>
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <Avatar
                    src={avatarPreview}
                    size="lg"
                    className="h-24 w-24"
                    fallback={<User className="h-12 w-12" />}
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
                  <p className="text-sm text-gray-600">
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
                />
              </div>
              
              <div>
                <Input
                  label="Họ và tên"
                  placeholder="Nhập họ và tên đầy đủ"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange("full_name", e.target.value)}
                  variant="bordered"
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
              />
            </div>

            {/* Additional Information */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mt-6">
              <div>
                <Input
                  label="Website"
                  placeholder="https://example.com"
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  variant="bordered"
                  type="url"
                />
              </div>
              
              <div>
                <Input
                  label="Địa điểm"
                  placeholder="Thành phố, Quốc gia"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  variant="bordered"
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
              />
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-end space-x-4">
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
          </form>
        </div>
      </div>
    </div>
  );
}
