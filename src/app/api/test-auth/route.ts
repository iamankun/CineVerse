import { createClient } from "@/utils/supabase/client";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log(" [AUTH TEST] Testing client-side auth...");
    
    // Test with browser client (same as profile page)
    const supabase = createClient();
    
    // Test getUser
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log("🔍 [AUTH TEST] getUser result:", { 
      user: user ? { id: user.id, email: user.email } : null,
      error: userError?.message 
    });
    
    // ⚠️ SECURITY WARNING: getSession() is insecure for production use
    // Only use for testing/debugging purposes
    // For production, always use getUser() instead
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log("🔍 [AUTH TEST] getSession result:", { 
      session: session ? "Exists" : "None",
      error: sessionError?.message 
    });
    
    // Test current user with session
    let currentUser = null;
    let currentError = null;
    
    if (session) {
      const { data: { user: sessionUser }, error: sessionUserError } = await supabase.auth.getUser(session.access_token);
      currentUser = sessionUser;
      currentError = sessionUserError;
      console.log("🔍 [AUTH TEST] getUser with session token:", { 
        user: sessionUser ? { id: sessionUser.id, email: sessionUser.email } : null,
        error: sessionUserError?.message 
      });
    }
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      tests: {
        getUser: {
          user: user ? { id: user.id, email: user.email } : null,
          error: userError?.message
        },
        getSession: {
          session: session ? {
            exists: true,
            expiresAt: session.expires_at,
            userId: session.user?.id
          } : null,
          error: sessionError?.message
        },
        getUserWithSession: {
          user: currentUser ? { id: currentUser.id, email: currentUser.email } : null,
          error: currentError?.message
        }
      }
    });
    
  } catch (error: any) {
    console.error("🔍 [AUTH TEST] Unexpected error:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
