import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/utils/env';

const SUPABASE_URL = 'https://exsoflgvdreikabvhvkg.supabase.co';
const SUPABASE_ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, context);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, context);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, context);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, context);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, context);
}

async function handleRequest(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const params = await context.params;
  const path = params.path.join('/');
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  
  // Build Supabase URL
  const supabaseUrl = `${SUPABASE_URL}/rest/v1/${path}?${searchParams}`;
  
  console.log(`🔄 Proxying to: ${supabaseUrl}`);

  try {
    // Clone the request to modify headers
    const requestHeaders = new Headers(request.headers);
    
    // Add Supabase headers
    requestHeaders.set('apikey', SUPABASE_ANON_KEY);
    requestHeaders.set('Authorization', `Bearer ${SUPABASE_ANON_KEY}`);
    
    // Remove problematic headers
    requestHeaders.delete('host');
    requestHeaders.delete('origin');
    requestHeaders.delete('referer');

    // Create new request
    const newRequest = new Request(supabaseUrl, {
      method: request.method,
      headers: requestHeaders,
      body: request.body,
      redirect: 'manual',
    });

    const response = await fetch(newRequest);

    // Create new response with CORS headers
    const responseHeaders = new Headers(response.headers);
    
    // Add CORS headers
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey, prefer');
    
    // Remove problematic response headers
    responseHeaders.delete('content-encoding');

    const responseText = await response.text();

    return new NextResponse(responseText, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error('❌ Proxy error:', error);
    return NextResponse.json(
      { error: 'Proxy error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, prefer',
    },
  });
}
