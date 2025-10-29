import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('admin-token');

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  // Simple token validation (you can make it more complex)
  try {
    const decoded = Buffer.from(token.value, 'base64').toString('utf-8');
    const [username, timestamp] = decoded.split(':');
    
    // Check if token is still valid (24 hours)
    const tokenAge = Date.now() - parseInt(timestamp);
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    if (tokenAge > maxAge) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true, username });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
