import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      urlDomain: process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '').split('.')[0],
      anonKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    },
    environment: {
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      isProduction: process.env.NODE_ENV === 'production'
    }
  });
}
