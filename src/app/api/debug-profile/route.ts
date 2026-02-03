import { createClient } from "@/utils/supabase/server-new";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Check environment variables
    const envCheck = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    };

    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    // Test auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    return NextResponse.json({
      success: true,
      env: envCheck,
      connection: {
        success: !connectionError,
        error: connectionError?.message,
        data: connectionTest
      },
      auth: {
        user: user ? { id: user.id, email: user.email } : null,
        error: authError?.message
      }
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
