"use client";

import { useState, useCallback } from "react";
import { LiveStatus, StartStreamResponse } from "@/types/live";

export function useBroadcaster() {
  const [loading, setLoading] = useState(false);
  const [channelId, setChannelId] = useState<string | null>(null);
  const [ingestUrl, setIngestUrl] = useState<string | null>(null);
  const [streamKey, setStreamKey] = useState<string | null>(null);
  const [channelName, setChannelName] = useState<string>("");
  const [status, setStatus] = useState<LiveStatus>("offline");
  const [error, setError] = useState<string | null>(null);

  const prepare = useCallback(async (name: string, category = "other") => {
    setLoading(true);
    setError(null);
    try {
      // First try to get/create channel info (offline)
      const res = await fetch("/api/live/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to get channel info");
      setChannelId(data.channelId);
      setIngestUrl(data.ingestUrl);
      setStreamKey(data.streamKey);
      setChannelName(data.channelName || name);
      setStatus(data.status);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const start = useCallback(async () => {
    if (!channelId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/live/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data: StartStreamResponse & { error?: string } = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to start");
      setStatus(data.status);
      if (data.flvUrl) {
        // flvUrl might be available immediately or from status poll
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [channelId]);

  const stop = useCallback(async () => {
    if (!channelId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/live/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to stop");
      setStatus("offline");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [channelId]);

  const reset = useCallback(() => {
    setChannelId(null);
    setIngestUrl(null);
    setStreamKey(null);
    setChannelName("");
    setStatus("offline");
    setError(null);
  }, []);

  return { channelId, ingestUrl, streamKey, channelName, setChannelName, status, loading, error, prepare, start, stop, reset };
}
