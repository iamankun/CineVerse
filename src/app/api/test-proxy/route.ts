import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const testUrl = 'https://live.fptplay53.net/epzhd1/htv3_hls.smil/chunklist.m3u8';
  
  try {
    console.log('Testing proxy with URL:', testUrl);
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://fptplay.net/',
        'Origin': 'https://fptplay.net',
      },
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      return NextResponse.json({
        error: `HTTP ${response.status}: ${response.statusText}`,
        url: testUrl,
      });
    }

    const data = await response.text();
    const lines = data.split('\n').slice(0, 10); // First 10 lines
    
    return NextResponse.json({
      success: true,
      url: testUrl,
      status: response.status,
      contentType: response.headers.get('content-type'),
      dataLength: data.length,
      firstLines: lines,
    });

  } catch (error) {
    console.error('Test proxy error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      url: testUrl,
    });
  }
}
