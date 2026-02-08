import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/utils/supabase/server-session';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [SESSION-DEBUG] Starting session debug...');
    
    // 1. Check raw cookies from request
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies: { [key: string]: string } = {};
    
    if (cookieHeader) {
      cookieHeader.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        if (name && value) {
          cookies[name] = value;
        }
      });
    }
    
    console.log('🔍 [SESSION-DEBUG] Raw cookies:', Object.keys(cookies));
    
    // 2. Test getServerSession
    console.log('🔍 [SESSION-DEBUG] Testing getServerSession...');
    const sessionResult = await getServerSession();
    
    // 3. Test direct Supabase client
    console.log('🔍 [SESSION-DEBUG] Testing direct Supabase client...');
    const supabase = await createClient();
    const directResult = await supabase.auth.getUser();
    
    // 4. Test getSession for comparison
    console.log('🔍 [SESSION-DEBUG] Testing getSession...');
    const sessionCheck = await supabase.auth.getSession();
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      request: {
        url: request.url,
        pathname: request.nextUrl.pathname,
      },
      cookies: {
        total: Object.keys(cookies).length,
        all: Object.keys(cookies),
        supabase: Object.keys(cookies).filter(key => 
          key.includes('sb-') || key.includes('supabase') || key.includes('auth')
        ),
        headerPreview: cookieHeader.substring(0, 200)
      },
      getServerSession: {
        hasUser: !!sessionResult.user,
        userId: sessionResult.user?.id,
        userEmail: sessionResult.user?.email,
        error: sessionResult.error,
        session: sessionResult.session
      },
      directSupabase: {
        hasUser: !!directResult.data?.user,
        userId: directResult.data?.user?.id,
        userEmail: directResult.data?.user?.email,
        error: directResult.error?.message
      },
      getSession: {
        hasSession: !!sessionCheck.data?.session,
        userId: sessionCheck.data?.session?.user?.id,
        userEmail: sessionCheck.data?.session?.user?.email,
        error: sessionCheck.error?.message
      }
    });
    
  } catch (error: any) {
    console.error('🔍 [SESSION-DEBUG] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
