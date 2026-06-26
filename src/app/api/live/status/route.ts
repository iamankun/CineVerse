import { NextRequest, NextResponse } from "next/server";
import { checkStatus } from "@/lib/live/store";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get("channelId");

    if (!channelId) {
      return NextResponse.json({ error: "channelId is required" }, { status: 400 });
    }

    const result = await checkStatus(channelId);
    if (!result) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[LIVE STATUS]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
