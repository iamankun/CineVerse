import { LiveChannel, LiveStatus } from "@/types/live";
import { createClient } from "@/utils/supabase/server";

const MEDIA_SERVER_HOST = (process.env.MEDIA_SERVER_HOST || "localhost").replace(/^https?:\/\//, "");

function mapRow(row: any): LiveChannel {
  return {
    id: row.id,
    name: row.name,
    userId: row.user_id,
    userName: row.user_name,
    status: row.status as LiveStatus,
    streamKey: row.stream_key,
    ingestUrl: row.ingest_url,
    flvUrl: row.flv_url,
    hlsUrl: row.hls_url,
    viewerCount: row.viewer_count,
    startedAt: row.started_at,
    category: row.category,
    thumbnail: row.thumbnail,
  };
}

async function isStreamLive(streamKey: string): Promise<boolean> {
  const hosts = process.env.VERCEL
    ? [MEDIA_SERVER_HOST.replace(/^https?:\/\//, "")]
    : ["localhost"];

  for (const host of hosts) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`http://${host}:8000/live/${streamKey}.flv`, {
        method: "GET",
        headers: { Range: "bytes=0-0" },
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (res.status === 200 || res.status === 206) return true;
    } catch {}
  }
  return false;
}

export async function getAllChannels(): Promise<LiveChannel[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("livestream")
    .select("*")
    .in("status", ["live", "starting"]);

  if (error) throw error;
  if (!data?.length) return [];

  for (const row of data) {
    const live = row.stream_key ? await isStreamLive(row.stream_key) : false;

    if (row.status === "starting" && live) {
      const streamHost = process.env.VERCEL ? MEDIA_SERVER_HOST : "localhost";
      const flvUrl = `/api/proxy/stream?url=${encodeURIComponent(`http://${streamHost}:8000/live/${row.stream_key}.flv`)}`;
      await supabase.from("livestream").update({ status: "live", flv_url: flvUrl }).eq("id", row.id);
      row.status = "live";
      row.flv_url = flvUrl;
    } else if (row.status === "live" && !live) {
      await supabase.from("livestream").update({ status: "offline", flv_url: null, started_at: null }).eq("id", row.id);
    }
  }

  return data.filter((r) => r.status === "live" || r.status === "starting").map(mapRow);
}

export async function getChannel(id: string): Promise<LiveChannel | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("livestream")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return mapRow(data);
}

export async function getUserChannel(userId: string): Promise<LiveChannel | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("livestream")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return mapRow(data);
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function generateStreamKey(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let key = "";
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `live_${key}`;
}

export async function createChannel(
  userId: string,
  userName: string,
  name: string,
  category = "other"
): Promise<LiveChannel> {
  const supabase = await createClient();
  const existing = await getUserChannel(userId);
  if (existing) return existing;

  const channel = {
    id: generateId(),
    name,
    user_id: userId,
    user_name: userName,
    status: "offline" as const,
    stream_key: generateStreamKey(),
    ingest_url: "rtmp://cineverse.ankun.dev:1935/live",
    flv_url: null,
    hls_url: null,
    viewer_count: 0,
    started_at: null,
    category,
    thumbnail: null,
  };

  const { error } = await supabase.from("livestream").insert(channel);
  if (error) throw error;

  return mapRow(channel);
}

export async function startStream(
  channelId: string,
  userId: string
): Promise<LiveChannel | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("livestream")
    .select("*")
    .eq("id", channelId)
    .eq("user_id", userId)
    .single();

  if (error || !data) return null;

  const { error: updateError } = await supabase
    .from("livestream")
    .update({
      status: "starting",
      started_at: new Date().toISOString(),
      viewer_count: 0,
      flv_url: null,
      ingest_url: "rtmp://cineverse.ankun.dev:1935/live",
    })
    .eq("id", channelId)
    .eq("user_id", userId);

  if (updateError) throw updateError;

  return {
    ...mapRow(data),
    status: "starting",
    startedAt: new Date().toISOString(),
    viewerCount: 0,
    flvUrl: null,
    ingestUrl: "rtmp://cineverse.ankun.dev:1935/live",
  };
}

export async function stopStream(
  channelId: string,
  userId: string
): Promise<LiveChannel | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("livestream")
    .select("*")
    .eq("id", channelId)
    .eq("user_id", userId)
    .single();

  if (error || !data) return null;

  const { error: updateError } = await supabase
    .from("livestream")
    .update({
      status: "offline",
      flv_url: null,
      viewer_count: 0,
      started_at: null,
    })
    .eq("id", channelId)
    .eq("user_id", userId);

  if (updateError) throw updateError;

  return {
    ...mapRow(data),
    status: "offline",
    flvUrl: null,
    viewerCount: 0,
    startedAt: null,
  };
}

export async function updateChannelName(
  channelId: string,
  userId: string,
  name: string
): Promise<LiveChannel | null> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("livestream")
    .update({ name })
    .eq("id", channelId)
    .eq("user_id", userId);

  if (error) throw error;

  const channel = await getChannel(channelId);
  return channel;
}

export async function checkStatus(channelId: string): Promise<{
  status: LiveStatus;
  flvUrl: string | null;
  viewerCount: number;
  previewAvailable: boolean;
  previewFlvUrl: string | null;
} | null> {
  const channel = await getChannel(channelId);
  if (!channel) return null;

  let status = channel.status;
  let flvUrl = channel.flvUrl;
  let previewAvailable = false;
  let previewFlvUrl: string | null = null;

  if (channel.streamKey) {
    const live = await isStreamLive(channel.streamKey);
    if (live) {
      previewAvailable = true;
      const streamHost = process.env.VERCEL ? MEDIA_SERVER_HOST : "localhost";
      previewFlvUrl = `/api/proxy/stream?url=${encodeURIComponent(
        `http://${streamHost}:8000/live/${channel.streamKey}.flv`
      )}`;
    }

    if (status === "starting" && live) {
      status = "live";
      flvUrl = previewFlvUrl;
    } else if (status === "live" && !live) {
      status = "offline";
      flvUrl = null;
    }
  }

  return { status, flvUrl, viewerCount: channel.viewerCount, previewAvailable, previewFlvUrl };
}
