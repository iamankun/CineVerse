import { NextRequest, NextResponse } from "next/server";
import { getUserChannel, startStream } from "@/lib/live/store";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    let userId: string;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id ?? "guest";

    const channel = await getUserChannel(userId);
    if (!channel) {
      return NextResponse.json({ error: "Chưa có kênh, hãy tạo kênh trước" }, { status: 400 });
    }

    const result = await startStream(channel.id, userId);
    if (!result) {
      return NextResponse.json({ error: "Không thể bắt đầu stream" }, { status: 500 });
    }

    return NextResponse.json({
      channelId: result.id,
      ingestUrl: result.ingestUrl,
      streamKey: result.streamKey,
      flvUrl: result.flvUrl,
      status: result.status,
    });
  } catch (error) {
    console.error("[LIVE START]", error);
    return NextResponse.json({ error: "Lỗi máy chủ nội bộ" }, { status: 500 });
  }
}
