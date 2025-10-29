import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    const ADMIN_ACCOUNT = process.env.ADMIN_ACCOUNT;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    if (!ADMIN_ACCOUNT || !ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, message: "Admin credentials not configured" },
        { status: 500 }
      );
    }

    if (username === ADMIN_ACCOUNT && password === ADMIN_PASSWORD) {
      // Create session token (simple approach)
      const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
      
      const response = NextResponse.json({
        success: true,
        message: "Login successful",
      });

      // Set cookie
      response.cookies.set('admin-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      });

      return response;
    }

    return NextResponse.json(
      { success: false, message: "Invalid credentials" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Login failed" },
      { status: 500 }
    );
  }
}
