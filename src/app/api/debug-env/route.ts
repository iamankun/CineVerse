import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("🔥 [DEBUG-ENV] Environment check");
    
    // Check all environment variables
    const envVars = {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_SUPABASE_URL: process.env.NEXT_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + "...",
      NEXT_SUPABASE_ANON_KEY: process.env.NEXT_SUPABASE_ANON_KEY?.substring(0, 20) + "...",
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
    };

    console.log("🔥 [DEBUG-ENV] Environment variables:", envVars);

    // Test Supabase connection
    const supabase = await createClient();
    
    // Test simple query
    const { data, error } = await supabase
      .from("profiles")
      .select("count")
      .limit(1);

    console.log("🔥 [DEBUG-ENV] Supabase test:", {
      hasData: !!data,
      error: error?.message
    });

    // Test session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    console.log("🔥 [DEBUG-ENV] Session test:", {
      hasSession: !!session,
      sessionError: sessionError?.message
    });

    return NextResponse.json({
      environment: envVars,
      supabaseTest: {
        connected: !error,
        error: error?.message
      },
      sessionTest: {
        hasSession: !!session,
        error: sessionError?.message
      }
    });

  } catch (error: any) {
    console.error("🔥 [DEBUG-ENV] Error:", error);
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
