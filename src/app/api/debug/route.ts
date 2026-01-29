import { NextResponse } from 'next/server';
import { env } from '@/utils/env';

export async function GET() {
  try {
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: {
        hasSupabaseUrl: !!env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseAnonKey: !!env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
        supabaseAnonKeyLength: env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
        hasCaptchaSiteKey: !!env.NEXT_PUBLIC_CAPTCHA_SITE_KEY,
        hasCaptchaSecretKey: !!env.CAPTCHA_SECRET_KEY,
      },
      status: 'ok'
    };

    return NextResponse.json(debugInfo);
  } catch (error) {
    return NextResponse.json({
      error: 'Debug endpoint error',
      details: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    }, { status: 500 });
  }
}
