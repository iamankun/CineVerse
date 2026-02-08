import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [COOKIE-TEST] Starting cookie test...');
    
    // 1. Get all cookies from request
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
    
    // 2. Check specific Supabase patterns
    const supabaseCookies = Object.keys(cookies).filter(key => 
      key.includes('sb-') || 
      key.includes('supabase') || 
      key.includes('auth') ||
      key.includes('exsoflgvdreikabvhvkg')
    );
    
    // 3. Test cookie patterns from middleware
    const patterns = {
      'sb-access-token': cookieHeader.includes('sb-access-token='),
      'sb:access-token': cookieHeader.includes('sb:access-token='),
      'supabase.auth.token': cookieHeader.includes('supabase.auth.token='),
      'auth-token': cookieHeader.includes('auth-token='),
      'sb-exsoflgvdreikabvhvkg-auth-token.0': cookieHeader.includes('sb-exsoflgvdreikabvhvkg-auth-token.0='),
      'sb-exsoflgvdreikabvhvkg-auth-token.1': cookieHeader.includes('sb-exsoflgvdreikabvhvkg-auth-token.1='),
      'sb-refresh-token': cookieHeader.includes('sb-refresh-token='),
      'sb:refresh-token': cookieHeader.includes('sb:refresh-token='),
      'supabase.auth.refresh_token': cookieHeader.includes('supabase.auth.refresh_token='),
      'refresh-token': cookieHeader.includes('refresh-token=')
    };
    
    // 4. Request info
    const requestInfo = {
      url: request.url,
      pathname: request.nextUrl.pathname,
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer'),
      origin: request.headers.get('origin'),
      host: request.headers.get('host')
    };
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      request: requestInfo,
      cookies: {
        total: Object.keys(cookies).length,
        all: Object.keys(cookies),
        supabase: supabaseCookies,
        headerPreview: cookieHeader.substring(0, 200),
        fullHeader: cookieHeader
      },
      patterns: patterns,
      middlewareLogic: {
        hasAccessToken: Object.values(patterns).slice(0, 5).some(Boolean),
        hasRefreshToken: Object.values(patterns).slice(5).some(Boolean),
        shouldRedirect: !Object.values(patterns).slice(0, 5).some(Boolean) && 
                     !Object.values(patterns).slice(5).some(Boolean)
      }
    });
    
  } catch (error: any) {
    console.error('🔍 [COOKIE-TEST] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
