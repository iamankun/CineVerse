import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logout successful",
  });

  // Clear cookie
  response.cookies.delete('admin-token');

  return response;
}
