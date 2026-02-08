import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get all cookies from request
    const cookieHeader = request.headers.get('cookie') || '';
    
    // Parse all cookies for inspection
    const cookies: { [key: string]: string } = {};
    
    if (cookieHeader) {
      cookieHeader.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        if (name && value) {
          cookies[name] = value;
        }
      });
    }
    
    // Check for various Supabase cookie patterns
    const supabaseCookies = Object.keys(cookies).filter(key => 
      key.includes('sb-') || 
      key.includes('supabase') || 
      key.includes('auth') ||
      key.includes('exsoflgvdreikabvhvkg')
    );
    
    console.log('🔍 [COOKIE-DEBUG] All cookies:', Object.keys(cookies));
    console.log('🔍 [COOKIE-DEBUG] Supabase cookies:', supabaseCookies);
    console.log('🔍 [COOKIE-DEBUG] Cookie header preview:', cookieHeader.substring(0, 200));
    
    // Check specific patterns
    const patterns = {
      'sb-access-token': cookieHeader.includes('sb-access-token='),
      'sb:access-token': cookieHeader.includes('sb:access-token='),
      'supabase.auth.token': cookieHeader.includes('supabase.auth.token='),
      'auth-token': cookieHeader.includes('auth-token='),
      'sb-exsoflgvdreikabvhvkg-auth-token.0': cookieHeader.includes('sb-exsoflgvdreikabvhvkg-auth-token.0='),
      'sb-refresh-token': cookieHeader.includes('sb-refresh-token='),
      'sb:refresh-token': cookieHeader.includes('sb:refresh-token='),
      'supabase.auth.refresh_token': cookieHeader.includes('supabase.auth.refresh_token='),
      'refresh-token': cookieHeader.includes('refresh-token='),
    };
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      request: {
        url: request.url,
        pathname: request.nextUrl.pathname,
        userAgent: request.headers.get('user-agent'),
      },
      cookies: {
        total: Object.keys(cookies).length,
        all: Object.keys(cookies),
        supabase: supabaseCookies,
        patterns: patterns,
        headerPreview: cookieHeader.substring(0, 300)
      }
    });
    
  } catch (error: any) {
    console.error('🔍 [COOKIE-DEBUG] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
