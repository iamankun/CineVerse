import { NextResponse, type NextRequest } from "next/server";
import { signIn, signUp } from "@/actions/auth";

export async function GET() {
  return NextResponse.json({ 
    message: 'Auth API route is working!',
    timestamp: new Date().toISOString()
  });
}

export const POST = async (request: NextRequest) => {
  try {
    console.log("🔍 Auth API POST called");
    
    const body = await request.json();
    console.log("📝 Request body:", body);

    return NextResponse.json({ 
      success: true, 
      message: "POST method working!",
      received: body
    });

  } catch (error) {
    console.error("❌ Auth API error:", error);
    return NextResponse.json(
      { error: "Lỗi máy chủ nội bộ" },
      { status: 500 }
    );
  }
};
