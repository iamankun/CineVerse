import { NextRequest, NextResponse } from "next/server";
import { getAllChannels } from "@/lib/live/store";

export async function GET() {
  try {
    const channels = await getAllChannels();
    return NextResponse.json({ channels });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch live channels" }, { status: 500 });
  }
}
