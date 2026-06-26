import { NextRequest, NextResponse } from "next/server";
import { getChannel, stopStream } from "@/lib/live/store";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    let userId: string;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id ?? "guest";

    const body = await request.json();
    const { channelId } = body;

    if (!channelId) {
      return NextResponse.json({ error: "channelId là bắt buộc" }, { status: 400 });
    }

    const channel = await getChannel(channelId);
    if (!channel) {
      return NextResponse.json({ error: "Không tìm thấy kênh" }, { status: 404 });
    }

    const result = await stopStream(channelId, userId);
    if (!result) {
      return NextResponse.json({ error: "Không thể dừng stream" }, { status: 500 });
    }

    return NextResponse.json({ success: true, status: result.status });
  } catch (error) {
    console.error("[LIVE STOP]", error);
    return NextResponse.json({ error: "Lỗi máy chủ nội bộ" }, { status: 500 });
  }
}
