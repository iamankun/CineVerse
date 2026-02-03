import { createClient } from "@/utils/supabase/server-new";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const supabase = await createClient();
  
  // Get user on server side
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (!user || authError) {
    console.log("🔍 [PROFILE SERVER] No user found or auth error:", authError?.message);
    redirect("/auth/login");
  }

  // Get profile data on server side
  let profile = null;
  let profileError = null;
  
  try {
    const result = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    
    profile = result.data;
    profileError = result.error;
    
    console.log("🔍 [PROFILE SERVER] Profile query:", {
      profile: profile ? "Found" : "Not found",
      error: profileError?.message
    });
  } catch (error: any) {
    console.error("🔍 [PROFILE SERVER] Profile query failed:", error);
    profileError = error;
  }

  // Create profile if it doesn't exist
  if (profileError && profileError.message?.includes('column') && profileError.message?.includes('does not exist')) {
    console.log("🔍 [PROFILE SERVER] Creating basic profile...");
    try {
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
        throw createError;
      }
      
      profile = newProfile;
      profileError = null;
    } catch (createError: any) {
      console.error("🔍 [PROFILE SERVER] Failed to create profile:", createError);
      redirect("/auth/login");
    }
  }

  if (profileError) {
    console.error("🔍 [PROFILE SERVER] Profile error:", profileError);
    redirect("/auth/login");
  }

  return <ProfileClient user={user} profile={profile} />;
}
