"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { LiveStatus } from "@/types/live";

interface StatusResult {
  status: LiveStatus;
  flvUrl: string | null;
  viewerCount: number;
  previewAvailable: boolean;
  previewFlvUrl: string | null;
}

export function useLiveStatus(channelId: string | null) {
  const [result, setResult] = useState<StatusResult | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const loading = result === null;

  const check = useCallback(async (): Promise<StatusResult | null> => {
    if (!channelId) return null;
    try {
      const res = await fetch(`/api/live/status?channelId=${channelId}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // silent
    }
    return null;
  }, [channelId]);

  useEffect(() => {
    const poll = () => {
      check().then(data => { if (data) setResult(data); });
    };

    poll();
    intervalRef.current = setInterval(poll, 10000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [check]);

  return {
    status: result?.status ?? "offline",
    flvUrl: result?.flvUrl ?? null,
    viewerCount: result?.viewerCount ?? 0,
    previewAvailable: result?.previewAvailable ?? false,
    previewFlvUrl: result?.previewFlvUrl ?? null,
    loading,
    refresh: check,
  };
}
