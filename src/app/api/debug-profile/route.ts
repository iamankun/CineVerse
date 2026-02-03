import { createClient } from "@/utils/supabase/server-new";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("🔍 [API DEBUG] Starting profile debug endpoint...");
    
    // Check environment variables
    const envCheck = {
      nodeEnv: process.env.NODE_ENV,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not set",
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Not set",
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Set" : "Not set",
      vercelEnv: process.env.VERCEL_ENV || "Not Vercel",
      vercelUrl: process.env.VERCEL_URL || "Not set",
    };

    console.log("🔍 [API DEBUG] Environment check:", envCheck);

    // Test Supabase client creation
    let supabase;
    try {
      supabase = await createClient();
      console.log("🔍 [API DEBUG] Supabase client created successfully");
    } catch (clientError: any) {
      console.error("🔍 [API DEBUG] Failed to create Supabase client:", clientError);
      return NextResponse.json({
        success: false,
        error: "Failed to create Supabase client",
        details: clientError.message,
        env: envCheck
      }, { status: 500 });
    }
    
    // Test basic connection
    console.log("🔍 [API DEBUG] Testing database connection...");
    const { data: connectionTest, error: connectionError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    console.log("🔍 [API DEBUG] Connection test result:", { 
      success: !connectionError, 
      error: connectionError?.message,
      data: connectionTest 
    });

    // Test auth
    console.log("🔍 [API DEBUG] Testing auth...");
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    console.log("🔍 [API DEBUG] Auth test result:", { 
      user: user ? { id: user.id, email: user.email } : null,
      error: authError?.message 
    });

    // Test session
    console.log("🔍 [API DEBUG] Testing session...");
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    console.log("🔍 [API DEBUG] Session test result:", { 
      session: session ? "Exists" : "None",
      error: sessionError?.message 
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      env: envCheck,
      connection: {
        success: !connectionError,
        error: connectionError?.message,
        data: connectionTest
      },
      auth: {
        user: user ? { id: user.id, email: user.email } : null,
        error: authError?.message
      },
      session: {
        exists: !!session,
        error: sessionError?.message,
        expiresAt: session?.expires_at
      }
    });

  } catch (error: any) {
    console.error("🔍 [API DEBUG] Unexpected error:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
