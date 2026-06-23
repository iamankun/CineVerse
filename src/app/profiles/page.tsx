import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getServerSession } from "@/utils/supabase/server-session";

export const dynamic = 'force-dynamic';

async function getProfileData() {
  console.log("🔍 [PROFILES PAGE] Starting...");
  
  const { user, error: sessionError } = await getServerSession();
  
  if (!user || sessionError) {
    console.log("🔍 [PROFILES PAGE] No user found:", sessionError);
    redirect("/auth/login");
  }

  console.log("🔍 [PROFILES PAGE] User authenticated:", { id: user.id, email: user.email });

  const supabase = await createClient();
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("🔍 [PROFILES PAGE] Profile error:", profileError);
    if (profileError.message?.includes('No rows')) {
      console.log("🔍 [PROFILES PAGE] Creating basic profile...");
      const { data: newProfile, error: createError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          username: user.email?.split("@")[0] || "",
          full_name: "",
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (createError) {
        console.error("🔍 [PROFILES PAGE] Failed to create profile:", createError);
        redirect("/auth/login");
      }
      
      return { user, profile: newProfile, isNew: true as const };
    }
    redirect("/auth/login");
  }

  console.log("🔍 [PROFILES PAGE] Profile found");
  return { user, profile, isNew: false as const };
}

export default async function ProfilesPage() {
  let data;
  try {
    data = await getProfileData();
  } catch (error: any) {
    console.error("🔍 [PROFILES PAGE] Unexpected error:", error);
    return (
      <div className="min-h-screen bg-gray-900 py-12">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="bg-red-900 border border-red-700 rounded-lg p-6">
            <h1 className="text-xl font-bold text-white">Lỗi</h1>
            <p className="text-red-200 mt-2">Đã xảy ra lỗi khi tải trang cá nhân.</p>
            <p className="text-red-300 text-sm mt-2">{(error as Error).message}</p>
          </div>
        </div>
      </div>
    );
  }

  const { user, profile, isNew } = data;

  if (isNew) {
    return (
      <div className="min-h-screen bg-gray-900 py-12">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-800 shadow-xl rounded-lg border border-gray-700">
            <div className="border-b border-gray-700 px-6 py-4">
              <h1 className="text-2xl font-bold text-white">Trang cá nhân</h1>
              <p className="text-gray-400">Thông tin của bạn</p>
            </div>
            <div className="px-6 py-6">
              <p className="text-green-400">Profile đã được tạo thành công!</p>
              <p className="text-white mt-2">Vui lòng tải lại trang để xem thông tin.</p>
            </div>
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
            <h1 className="text-2xl font-bold text-white">Trang cá nhân</h1>
            <p className="text-gray-400">Thông tin của bạn</p>
          </div>

          <div className="px-6 py-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">User ID</label>
                <p className="mt-1 text-white font-mono text-sm">{user.id}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300">Email</label>
                <p className="mt-1 text-white">{user.email}</p>
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

              <div>
                <label className="block text-sm font-medium text-gray-300">Avatar URL</label>
                <p className="mt-1 text-white text-sm break-all">{profile?.avatar_url || "Chưa có"}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Cập nhật lần cuối</label>
                <p className="mt-1 text-white">{profile?.updated_at ? new Date(profile.updated_at).toLocaleString('vi-VN') : "Chưa có"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
