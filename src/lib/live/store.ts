import { LiveChannel, LiveStatus } from "@/types/live";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import os from "os";

const STORE_PATH = path.join(process.cwd(), "src/lib/live/channels.json");

let memoryStore: LiveChannel[] | null = null;

function getServerAddress(): string {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] ?? []) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "localhost";
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

async function readStore(): Promise<LiveChannel[]> {
  if (memoryStore) return memoryStore;
  try {
    const data = await readFile(STORE_PATH, "utf-8");
    memoryStore = JSON.parse(data);
  } catch {
    memoryStore = [];
  }
  return memoryStore!;
}

async function writeStore(channels: LiveChannel[]): Promise<void> {
  memoryStore = channels;
  try {
    await writeFile(STORE_PATH, JSON.stringify(channels, null, 2), "utf-8");
  } catch (e) {
    console.error("[LIVE STORE] Write failed:", e);
  }
}

async function isStreamLive(streamKey: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`http://localhost:8000/live/${streamKey}.flv`, {
      signal: controller.signal,
    });
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}

export async function getAllChannels(): Promise<LiveChannel[]> {
  const channels = await readStore();
  const result: LiveChannel[] = [];

  for (const ch of channels) {
    if (ch.status === "live" || ch.status === "starting") {
      const live = ch.streamKey ? await isStreamLive(ch.streamKey) : false;
      if (ch.status === "starting" && live) {
        ch.status = "live";
        const host = getServerAddress();
        ch.flvUrl = `/api/proxy/stream?url=${encodeURIComponent(
          `http://${host}:8000/live/${ch.streamKey}.flv`
        )}`;
      } else if (ch.status === "live" && !live) {
        ch.status = "offline";
        ch.flvUrl = null;
        ch.startedAt = null;
      }
      if (ch.status === "live" || ch.status === "starting") {
        result.push(ch);
      }
    }
  }

  await writeStore(channels);
  return result;
}

export async function getChannel(id: string): Promise<LiveChannel | null> {
  const channels = await readStore();
  return channels.find((c) => c.id === id) ?? null;
}

export async function getUserChannel(userId: string): Promise<LiveChannel | null> {
  const channels = await readStore();
  return channels.find((c) => c.userId === userId) ?? null;
}

export async function createChannel(
  userId: string,
  userName: string,
  name: string,
  category = "other"
): Promise<LiveChannel> {
  const channels = await readStore();
  const existing = channels.find((c) => c.userId === userId);
  if (existing) return existing;

  const host = getServerAddress();
  const channel: LiveChannel = {
    id: generateId(),
    name,
    userId,
    userName,
    status: "offline",
    streamKey: generateStreamKey(),
    ingestUrl: `rtmp://${host}:1935/live`,
    flvUrl: null,
    viewerCount: 0,
    startedAt: null,
    category,
    thumbnail: null,
  };

  channels.push(channel);
  await writeStore(channels);
  return channel;
}

export async function startStream(
  channelId: string,
  userId: string
): Promise<LiveChannel | null> {
  const channels = await readStore();
  const idx = channels.findIndex((c) => c.id === channelId && c.userId === userId);
  if (idx === -1) return null;

  const host = getServerAddress();
  channels[idx] = {
    ...channels[idx],
    status: "starting",
    startedAt: new Date().toISOString(),
    viewerCount: 0,
    flvUrl: null,
    ingestUrl: `rtmp://${host}:1935/live`,
  };

  await writeStore(channels);
  return channels[idx];
}

export async function stopStream(
  channelId: string,
  userId: string
): Promise<LiveChannel | null> {
  const channels = await readStore();
  const idx = channels.findIndex((c) => c.id === channelId && c.userId === userId);
  if (idx === -1) return null;

  channels[idx] = {
    ...channels[idx],
    status: "offline",
    flvUrl: null,
    viewerCount: 0,
    startedAt: null,
  };

  await writeStore(channels);
  return channels[idx];
}

export async function updateChannelName(
  channelId: string,
  userId: string,
  name: string
): Promise<LiveChannel | null> {
  const channels = await readStore();
  const idx = channels.findIndex((c) => c.id === channelId && c.userId === userId);
  if (idx === -1) return null;
  channels[idx].name = name;
  await writeStore(channels);
  return channels[idx];
}

export async function checkStatus(channelId: string): Promise<{
  status: LiveStatus;
  flvUrl: string | null;
  viewerCount: number;
  previewAvailable: boolean;
  previewFlvUrl: string | null;
} | null> {
  const channels = await readStore();
  const channel = channels.find((c) => c.id === channelId);
  if (!channel) return null;

  let status = channel.status;
  let flvUrl = channel.flvUrl;

  const host = getServerAddress();
  let previewAvailable = false;
  let previewFlvUrl: string | null = null;

  if (channel.streamKey) {
    const live = await isStreamLive(channel.streamKey);
    if (live) {
      previewAvailable = true;
      previewFlvUrl = `/api/proxy/stream?url=${encodeURIComponent(
        `http://${host}:8000/live/${channel.streamKey}.flv`
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
