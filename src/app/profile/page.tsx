import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import ProfileClientSimple from "./ProfileClientSimple";
import { getServerSession } from "@/utils/supabase/server-session";

export const dynamic = 'force-dynamic';

async function getProfileData() {
  console.log("🔍 [PROFILE PAGE] Starting profile page...");
  
  // 🔥 DEBUG: Check what cookies server component receives
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  console.log("🔍 [PROFILE PAGE] Server cookies:", {
    total: allCookies.length,
    cookies: allCookies.map(c => ({ name: c.name, value: c.value.substring(0, 50) + '...' })),
    hasSupabase: allCookies.some(c => c.name.includes('sb-exsoflgvdreikabvhvkg'))
  });
  
  // Use getServerSession instead of getUser to avoid conflicts
  const { user, error: sessionError } = await getServerSession();
  
  console.log("🔍 [PROFILE PAGE] Auth result:", {
    hasUser: !!user,
    userId: user?.id,
    userEmail: user?.email,
    sessionError: sessionError
  });
  
  if (!user || sessionError) {
    redirect("/auth/login");
  }

  const targetUserId = user.id;

  console.log("🔍 [PROFILE PAGE] Using user ID:", targetUserId);

  // Create Supabase client for database operations
  const supabase = await createClient();
  
  // Get profile data
  let profile = null;
  let profileError = null;
  
  try {
    const result = await supabase
      .from("profiles")
      .select("*")
      .eq("id", targetUserId)
      .single();
    
    profile = result.data;
    profileError = result.error;
    
    console.log("🔍 [PROFILE PAGE] Profile query:", {
      profile: profile ? "Found" : "Not found",
      profileData: profile,
      error: profileError?.message,
      errorCode: profileError?.code
    });
  } catch (error: any) {
    console.error("🔍 [PROFILE PAGE] Profile query failed:", error);
    profileError = error;
  }

  // Create profile if it doesn't exist
  if (profileError && (profileError.code === 'PGRST116' || profileError.message?.includes('No rows'))) {
    console.log("🔍 [PROFILE PAGE] Creating basic profile...");
    try {
      const { data: newProfile, error: createError } = await supabase
        .from("profiles")
        .upsert({
          id: targetUserId,
          username: user?.email?.split("@")[0] || "user_" + targetUserId?.substring(0, 8),
          full_name: user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User"
        })
        .select()
        .single();
      
      if (createError) {
        throw createError;
      }
      
      profile = newProfile;
      profileError = null;
      console.log("🔍 [PROFILE PAGE] Profile created successfully:", newProfile);
    } catch (createError: any) {
      console.error("🔍 [PROFILE PAGE] Failed to create profile:", createError);
      redirect("/auth/login");
    }
  }

  if (profileError) {
    console.error("🔍 [PROFILE PAGE] Profile error:", profileError);
    redirect("/auth/login");
  }

  console.log("🔍 [PROFILE PAGE] Rendering ProfileClientSimple...");

  return { user, profile } as const;
}

export default async function ProfilePage() {
  let data;
  try {
    data = await getProfileData();
  } catch (error: any) {
    console.error("🔍 [PROFILE PAGE] Unexpected error:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    redirect("/auth/login");
    return;
  }

  return <ProfileClientSimple user={data.user} profile={data.profile} />;
}
