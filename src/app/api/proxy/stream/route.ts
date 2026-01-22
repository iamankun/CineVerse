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

    // Log chi tiết response
    console.log('--- Proxy Stream Debug ---');
    console.log('Request URL:', streamUrl);
    console.log('Response status:', response.status);
    console.log('Response statusText:', response.statusText);
    console.log('Response headers:');
    for (const [key, value] of response.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }

    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = '[Không đọc được nội dung lỗi]';
      }
      console.error('Stream proxy error:', response.status, response.statusText, errorText);
      return NextResponse.json(
        { error: `Failed to fetch stream: ${response.status} ${response.statusText}`, detail: errorText },
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
          'Cache-Control': 'max-age=3600',
        },
      });
    }

    // For text data (M3U8 files, etc.)
    const streamData = await response.text();
    console.log('Response status:', response.status);
    console.log('Content type:', contentType);
    console.log('Stream URL:', streamUrl);
    console.log('Response data length:', streamData.length);

    // For M3U8 files, we need to rewrite URLs to use our proxy
    if (contentType.includes('mpegurl') || streamUrl.includes('.m3u8')) {
      console.log('Processing M3U8 file:', streamUrl);
      
      // Parse M3U8 and rewrite URLs
      const lines = streamData.split('\n');
      const rewrittenLines = lines.map(line => {
        const trimmedLine = line.trim();
        
        // Skip comments and empty lines
        if (!trimmedLine || trimmedLine.startsWith('#')) {
          return line;
        }
        
        // Check if it's a URL
        if (trimmedLine.startsWith('http://') || trimmedLine.startsWith('https://')) {
          const rewrittenUrl = `/api/proxy/stream?url=${encodeURIComponent(trimmedLine)}`;
          console.log('Rewriting URL:', trimmedLine, '->', rewrittenUrl);
          return rewrittenUrl;
        }
        
        // Handle relative URLs
        if (trimmedLine.includes('.ts') || trimmedLine.includes('.m3u8')) {
          const baseUrl = new URL(streamUrl);
          const absoluteUrl = new URL(trimmedLine, baseUrl).toString();
          const rewrittenUrl = `/api/proxy/stream?url=${encodeURIComponent(absoluteUrl)}`;
          console.log('Rewriting relative URL:', trimmedLine, '->', rewrittenUrl);
          return rewrittenUrl;
        }
        
        return line;
      });
      
      const rewrittenData = rewrittenLines.join('\n');
      console.log('M3U8 processing completed');
      console.log('First few lines:', rewrittenData.split('\n').slice(0, 5));

      return new NextResponse(rewrittenData, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
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
