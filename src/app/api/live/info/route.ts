import { NextRequest, NextResponse } from "next/server";
import { createChannel, getUserChannel, updateChannelName } from "@/lib/live/store";
import { createClient } from "@/utils/supabase/server";

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id ?? "guest";

    const body = await request.json();
    const { channelId, name } = body;

    if (!channelId || !name?.trim()) {
      return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
    }

    const updated = await updateChannelName(channelId, userId, name.trim());
    if (!updated) {
      return NextResponse.json({ error: "Không tìm thấy kênh" }, { status: 404 });
    }

    return NextResponse.json({ name: updated.name });
  } catch (error) {
    console.error("[LIVE RENAME]", error);
    return NextResponse.json({ error: "Lỗi máy chủ nội bộ" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    let userId: string;
    let userName: string;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      userId = user.id;
      userName = user.email ?? user.user_metadata?.full_name ?? user.id;
    } else {
      userId = "guest";
      userName = "Khách";
    }

    const body = await request.json();
    const { name, category = "other" } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Tên kênh không được để trống" }, { status: 400 });
    }

    const existing = await getUserChannel(userId);
    if (existing) {
      if (existing.name !== name.trim()) {
        await updateChannelName(existing.id, userId, name.trim());
      }
      return NextResponse.json({
        channelId: existing.id,
        ingestUrl: existing.ingestUrl,
        streamKey: existing.streamKey,
        channelName: name.trim(),
        status: existing.status,
        flvUrl: existing.flvUrl,
      });
    }

    const channel = await createChannel(userId, userName, name.trim(), category);
    return NextResponse.json({
      channelId: channel.id,
      ingestUrl: channel.ingestUrl,
      streamKey: channel.streamKey,
      channelName: channel.name,
      status: channel.status,
      flvUrl: channel.flvUrl,
    });
  } catch (error) {
    console.error("[LIVE INFO]", error);
    return NextResponse.json({ error: "Lỗi máy chủ nội bộ" }, { status: 500 });
  }
}
