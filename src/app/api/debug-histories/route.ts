import { NextResponse } from "next/server";
import { getUserHistories } from "@/actions/histories";

export async function GET() {
  try {
    console.log("🔍 [HISTORIES DEBUG] Testing getUserHistories...");
    
    const result = await getUserHistories();
    
    console.log("🔍 [HISTORIES DEBUG] Result:", {
      success: result.success,
      message: result.message,
      dataCount: result.data?.length || 0,
      data: result.data?.slice(0, 2) // First 2 items
    });
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result
    });
    
  } catch (error: any) {
    console.error("🔍 [HISTORIES DEBUG] Error:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
