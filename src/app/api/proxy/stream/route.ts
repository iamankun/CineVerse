import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const streamUrl = searchParams.get('url');

  if (!streamUrl) {
    return NextResponse.json({ error: 'Stream URL is required' }, { status: 400 });
  }

  try {
    // Fetch the stream with proper headers
    const response = await fetch(streamUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://fptplay.net/',
        'Origin': 'https://fptplay.net',
        'Accept': '*/*',
        'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
      },
      // Important: Don't follow redirects automatically to handle them properly
      redirect: 'follow',
    });

    if (!response.ok) {
      console.error('Stream proxy error:', streamUrl, response.status, response.statusText);
      return NextResponse.json(
        { error: `Failed to fetch stream: ${response.status}` },
        { status: response.status }
      );
    }

    // Get the content type
    const contentType = response.headers.get('content-type') || 'application/vnd.apple.mpegurl';

    // Check if it's binary data (video segments)
    const isBinary = contentType.includes('video/') || contentType.includes('application/octet-stream') || streamUrl.includes('.ts');
    
    if (isBinary) {
      // For binary data (video segments), return as array buffer
      const buffer = await response.arrayBuffer();
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Cache-Control': 'public, max-age=86400, immutable', // 24 hours for video segments
        },
      });
    }

    // For text data (M3U8 files, etc.)
    const streamData = await response.text();

    // For M3U8 files, we need to rewrite URLs to use our proxy
    if (contentType.includes('mpegurl') || streamUrl.includes('.m3u8')) {
      // Parse M3U8 and rewrite URLs
      const lines = streamData.split('\n');
      const rewrittenLines = lines.map(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith('#')) return line;

        if (trimmedLine.startsWith('http://') || trimmedLine.startsWith('https://')) {
          return `/api/proxy/stream?url=${encodeURIComponent(trimmedLine)}`;
        }

        if (trimmedLine.includes('.ts') || trimmedLine.includes('.m3u8')) {
          const baseUrl = new URL(streamUrl);
          const absoluteUrl = new URL(trimmedLine, baseUrl).toString();
          return `/api/proxy/stream?url=${encodeURIComponent(absoluteUrl)}`;
        }

        return line;
      });
      
      const rewrittenData = rewrittenLines.join('\n');

      return new NextResponse(rewrittenData, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Cache-Control': 'public, max-age=300, s-maxage=300', // 5 min at edge
        },
      });
    }

    // For other content types (like video chunks), return as-is
    return new NextResponse(streamData, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'max-age=3600',
      },
    });

  } catch (error) {
    console.error('Stream proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
