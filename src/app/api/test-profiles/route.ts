import { createClient } from "@/utils/supabase/server-new";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Test 1: Basic connection without auth
    console.log("🔍 Test 1: Basic connection");
    const { data: basicTest, error: basicError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    // Test 2: Get current user
    console.log("🔍 Test 2: Get current user");
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    // Test 3: Try to fetch user's profile
    console.log("🔍 Test 3: Fetch user profile");
    let profileTest = null;
    let profileError = null;
    
    if (user) {
      const result = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      profileTest = result.data;
      profileError = result.error;
    }

    // Test 4: Check RLS policies
    console.log("🔍 Test 4: Check RLS info");
    let rlsInfo = null;
    let rlsError = null;
    
    try {
      const result = await supabase.rpc('get_role', { user_id: user?.id || null });
      rlsInfo = result.data;
      rlsError = result.error;
    } catch (err: any) {
      rlsInfo = null;
      rlsError = 'RPC not available: ' + err.message;
    }

    return NextResponse.json({
      success: true,
      tests: {
        basic: {
          success: !basicError,
          error: basicError?.message,
          data: basicTest
        },
        auth: {
          user: user ? { id: user.id, email: user.email } : null,
          error: userError?.message
        },
        profile: {
          success: !profileError,
          error: profileError?.message,
          data: profileTest
        },
        rls: {
          info: rlsInfo,
          error: rlsError
        }
      }
    });

  } catch (error: any) {
    console.error("🔍 Test profiles error:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
