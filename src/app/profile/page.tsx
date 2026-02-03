import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ProfileClientSimple from "./ProfileClientSimple";

export default async function ProfilePage() {
  try {
    console.log("🔍 [PROFILE PAGE] Starting profile page...");
    
    const supabase = await createClient();
    console.log("🔍 [PROFILE PAGE] Supabase client created");
    
    // Get user on server side
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (!user || authError) {
      console.log("🔍 [PROFILE PAGE] No user found or auth error:", authError?.message);
      redirect("/auth/login");
    }

    console.log("🔍 [PROFILE PAGE] User authenticated:", { id: user.id, email: user.email });

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
      
      console.log("🔍 [PROFILE PAGE] Profile query:", {
        profile: profile ? "Found" : "Not found",
        error: profileError?.message
      });
    } catch (error: any) {
      console.error("🔍 [PROFILE PAGE] Profile query failed:", error);
      profileError = error;
    }

    // Create profile if it doesn't exist
    if (profileError && profileError.message?.includes('column') && profileError.message?.includes('does not exist')) {
      console.log("🔍 [PROFILE PAGE] Creating basic profile...");
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
        console.error("🔍 [PROFILE PAGE] Failed to create profile:", createError);
        redirect("/auth/login");
      }
    }

    if (profileError) {
      console.error("🔍 [PROFILE PAGE] Profile error:", profileError);
      redirect("/auth/login");
    }

    console.log("🔍 [PROFILE PAGE] Rendering ProfileClientSimple...");
    return <ProfileClientSimple user={user} profile={profile} />;
    
  } catch (error: any) {
    console.error("🔍 [PROFILE PAGE] Unexpected error:", error);
    redirect("/auth/login");
  }
}
