export type LiveStatus = "offline" | "starting" | "live" | "stopping" | "error";

export interface LiveChannel {
  id: string;
  name: string;
  userId: string;
  userName: string;
  status: LiveStatus;
  streamKey: string;
  ingestUrl: string;
  flvUrl: string | null;
  viewerCount: number;
  startedAt: string | null;
  category: string;
  thumbnail: string | null;
}

export interface CreateChannelInput {
  name: string;
  category?: string;
}

export interface LiveStatusResponse {
  channelId: string;
  status: LiveStatus;
  flvUrl: string | null;
  viewerCount: number;
  ingestUrl: string;
  streamKey: string;
}

export interface StartStreamResponse {
  channelId: string;
  ingestUrl: string;
  streamKey: string;
  flvUrl: string | null;
  status: LiveStatus;
}
