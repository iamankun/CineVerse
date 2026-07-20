"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { LiveStatus } from "@/types/live";

interface LivePlayerProps {
  streamUrl: string | null;
  status: LiveStatus;
  poster?: string;
  channelName?: string;
}

function isEmbedUrl(url: string): boolean {
  return /player|embed|iframe/i.test(url);
}

export default function LivePlayer({ streamUrl, status, poster, channelName }: LivePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const mountedRef = useRef(true);
  const [mpegtsModule, setMpegtsModule] = useState<any>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streamUrlRef = useRef<string | null>(null);

  const useIframe = streamUrl ? isEmbedUrl(streamUrl) : false;

  useEffect(() => {
    mountedRef.current = true;
    import("mpegts.js").then((mod) => {
      if (mountedRef.current) setMpegtsModule(mod.default);
    });
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!mpegtsModule) return;
    mpegtsModule.LoggingControl.applyConfig({ forceLog: false });
  }, [mpegtsModule]);

  const connectRef = useRef<((url: string) => void) | null>(null);

  const connect = useCallback((url: string) => {
    const video = videoRef.current;
    const mpegts = mpegtsModule;
    if (!video || !mpegts) return;

    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }
    if (reconnectRef.current) {
      clearTimeout(reconnectRef.current);
      reconnectRef.current = null;
    }

    if (!mpegts.isSupported()) {
      video.src = url;
      return;
    }

    const player = mpegts.createPlayer(
      { type: "flv", url, isLive: true },
      { lazyLoad: false, enableWorker: false }
    );
    player.attachMediaElement(video);
    player.load();
    playerRef.current = player;

    player.play().catch(() => {});

    player.on(mpegts.Events.ERROR, () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      const retryUrl = streamUrlRef.current;
      if (!retryUrl) return;
      reconnectRef.current = setTimeout(() => connectRef.current?.(retryUrl), 3000);
    });
  }, [mpegtsModule]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    if (useIframe) return;

    streamUrlRef.current = streamUrl;

    if (!streamUrl || status !== "live") {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
        reconnectRef.current = null;
      }
      return;
    }

    connect(streamUrl);

    return () => {
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
        reconnectRef.current = null;
      }
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [streamUrl, status, mpegtsModule, connect, useIframe]);

  if (useIframe && streamUrl) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
        <iframe
          src={streamUrl}
          className="w-full h-full border-0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
        {channelName && (
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-white text-sm font-semibold">{channelName}</span>
              <span className="text-red-400 text-xs font-medium uppercase tracking-wider ml-1">
                Live
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
      <video
        ref={videoRef}
        className="w-full h-full"
        poster={poster ?? undefined}
        controls
        playsInline
      />

      {status !== "live" && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/95">
          {status === "offline" && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                <span className="text-3xl">C</span>
              </div>
              <p className="text-gray-400">Chương trình chưa bắt đầu</p>
            </div>
          )}
          {status === "starting" && (
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Đang chờ nối sóng...</p>
            </div>
          )}
          {status === "error" && (
            <div className="text-center">
              <p className="text-red-400">Mất kết nối, đang nối lại...</p>
            </div>
          )}
        </div>
      )}

      {channelName && status === "live" && (
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-white text-sm font-semibold">{channelName}</span>
            <span className="text-red-400 text-xs font-medium uppercase tracking-wider ml-1">
              Live
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
