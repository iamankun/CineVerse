import { NextRequest, NextResponse } from "next/server";
import { getUserChannel, updateStreamUrl } from "@/lib/live/store";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id ?? "guest";

    const body = await request.json();
    const { streamUrl } = body;

    if (!streamUrl?.trim()) {
      return NextResponse.json({ error: "Thiếu link phát luồng" }, { status: 400 });
    }

    const channel = await getUserChannel(userId);
    if (!channel) {
      return NextResponse.json({ error: "Chưa có kênh" }, { status: 400 });
    }

    const updated = await updateStreamUrl(channel.id, userId, streamUrl.trim());
    if (!updated) {
      return NextResponse.json({ error: "Cập nhật thất bại" }, { status: 500 });
    }

    return NextResponse.json({ flvUrl: updated.flvUrl });
  } catch (error) {
    console.error("[LIVE STREAM URL]", error);
    return NextResponse.json({ error: "Lỗi máy chủ nội bộ" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id ?? "guest";

    const channel = await getUserChannel(userId);
    if (!channel) {
      return NextResponse.json({ error: "Chưa có kênh" }, { status: 400 });
    }

    const updated = await updateStreamUrl(channel.id, userId, "");
    if (!updated) {
      return NextResponse.json({ error: "Xóa thất bại" }, { status: 500 });
    }

    return NextResponse.json({ flvUrl: null });
  } catch (error) {
    console.error("[LIVE STREAM URL DELETE]", error);
    return NextResponse.json({ error: "Lỗi máy chủ nội bộ" }, { status: 500 });
  }
}
