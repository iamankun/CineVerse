import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("🔍 [MINIMAL TEST] Starting...");
    
    // Test 1: Basic response
    return NextResponse.json({
      success: true,
      message: "Minimal test works",
      timestamp: new Date().toISOString(),
      env: {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV || "Not Vercel"
      }
    });
    
  } catch (error: any) {
    console.error("🔍 [MINIMAL TEST] Error:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
