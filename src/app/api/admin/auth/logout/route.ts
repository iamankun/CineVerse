import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Admin logout successful",
    });

    // Clear admin token cookie
    response.cookies.delete('admin-token');

    return response;
  } catch (error) {
    console.error("Admin logout error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Logout failed. Please try again.",
      },
      { status: 500 }
    );
  }
}
