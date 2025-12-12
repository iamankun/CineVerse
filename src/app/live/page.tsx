"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button, Card, CardBody, Chip } from "@heroui/react";
import {
  IoPlayCircle,
  IoStop,
  IoVideocam,
  IoExpand,
  IoVolumeHigh,
  IoVolumeMute,
  IoContract,
  IoSettingsOutline
} from "react-icons/io5";
import SectionTitle from "@/components/ui/other/SectionTitle";
import Hls, { ErrorData, Events } from "hls.js";
import { NextPage } from "next";
import Link from "next/link";

type StreamType = "hls" | "direct";

interface LiveStreamConfig {
  enabled: boolean;
  url: string;
  type: StreamType;
  title: string;
  description: string;
}

const LivePage: NextPage = () => {
  const [config, setConfig] = useState<LiveStreamConfig | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [loading, setLoading] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load config from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cineverse-live-stream-config");
      if (saved) {
        const parsed = JSON.parse(saved);
        setConfig(parsed);
      }
    } catch (error) {
      console.error("Error loading config:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cleanup HLS instance
  const cleanupHls = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  }, []);

  // Play HLS stream
  const playHLS = useCallback(
    (url: string) => {
      const video = videoRef.current;
      if (!video) return;

      cleanupHls();

      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
        });

        hls.loadSource(url);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch((e: Error) => {
            console.error("Autoplay failed:", e);
            setError("Không thể tự động phát. Nhấn nút Play để bắt đầu.");
          });
          setIsPlaying(true);
          setError(null);
        });

        hls.on(Hls.Events.ERROR, (_event: Events.ERROR, data: ErrorData) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                setError("Lỗi mạng. Đang thử kết nối lại...");
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                setError("Lỗi media. Đang khôi phục...");
                hls.recoverMediaError();
                break;
              default:
                setError("Không thể phát stream này.");
                hls.destroy();
                break;
            }
          }
        });

        hlsRef.current = hls;
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Native HLS support (Safari)
        video.src = url;
        video.addEventListener("loadedmetadata", () => {
          video.play().catch((e: Error) => console.error("Autoplay failed:", e));
          setIsPlaying(true);
        });
      } else {
        setError("Trình duyệt không hỗ trợ HLS.");
      }
    },
    [cleanupHls]
  );

  // Play direct stream (MP4, WebM, etc.)
  const playDirect = useCallback(
    (url: string) => {
      const video = videoRef.current;
      if (!video) return;

      cleanupHls();
      video.src = url;
      video.load();
      video
        .play()
        .then(() => {
          setIsPlaying(true);
          setError(null);
        })
        .catch((e: Error) => {
          console.error("Play error:", e);
          setError("Không thể phát video này.");
        });
    },
    [cleanupHls]
  );

  // Main play function
  const handlePlay = useCallback(() => {
    if (!config?.url) {
      setError("Chưa có URL stream được cấu hình.");
      return;
    }

    setError(null);

    if (config.type === "hls") {
      playHLS(config.url);
    } else {
      playDirect(config.url);
    }
  }, [config, playHLS, playDirect]);

  // Stop playback
  const handleStop = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.src = "";
    }
    cleanupHls();
    setIsPlaying(false);
  }, [cleanupHls]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    } else {
      container.requestFullscreen();
      setIsFullscreen(true);
    }
  }, []);

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Auto-hide controls
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupHls();
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [cleanupHls]);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col gap-6 pt-4 md:pt-8 pb-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-400">Đang tải...</div>
        </div>
      </div>
    );
  }

  // No config or disabled
  if (!config || !config.enabled || !config.url) {
    return (
      <div className="flex flex-col gap-6 pt-4 md:pt-8 pb-8">
        <SectionTitle
          color="danger"
          className="text-2xl md:text-3xl"
          classNames={{
            title:
              "bg-[linear-gradient(90deg,#ef4444,#f97316,#eab308,#ef4444,#f97316)] bg-[length:200%] animate-gradient bg-clip-text text-transparent",
          }}
        >
          <span className="flex items-center gap-2">
            <IoVideocam className="text-red-500" />
            Live Stream
          </span>
        </SectionTitle>

        <Card className="overflow-hidden">
          <CardBody className="p-0">
            <div className="relative aspect-video bg-black flex items-center justify-center">
              <div className="text-center p-8">
                <IoVideocam className="text-6xl text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl text-gray-400 mb-2">Chưa có luồng phát trực tiếp</h3>
                <p className="text-gray-500 mb-6">
                  {!config?.enabled
                    ? "Live stream hiện đang tắt."
                    : "Chưa có URL stream được cấu hình."}
                </p>
                <Link href="/admin/live">
                  <Button
                    color="danger"
                    variant="flat"
                    startContent={<IoSettingsOutline />}
                  >
                    Cài đặt Live Stream
                  </Button>
                </Link>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pt-4 md:pt-8 pb-8">
      <div className="flex items-center justify-between">
        <SectionTitle
          color="danger"
          className="text-2xl md:text-3xl"
          classNames={{
            title:
              "bg-[linear-gradient(90deg,#ef4444,#f97316,#eab308,#ef4444,#f97316)] bg-[length:200%] animate-gradient bg-clip-text text-transparent",
          }}
        >
          <span className="flex items-center gap-2">
            <IoVideocam className="text-red-500" />
            {config.title || "Live Stream"}
          </span>
        </SectionTitle>
        <Link href="/admin/live">
          <Button isIconOnly variant="light" className="text-gray-400">
            <IoSettingsOutline className="text-xl" />
          </Button>
        </Link>
      </div>

      {/* Stream Info */}
      {config.description && (
        <p className="text-gray-400 -mt-4">{config.description}</p>
      )}

      {/* Video Player */}
      <Card className="overflow-hidden">
        <CardBody className="p-0">
          <div
            ref={containerRef}
            className="relative aspect-video bg-black"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
          >
            <video
              ref={videoRef}
              className="w-full h-full"
              playsInline
              controls={false}
              muted={isMuted}
            />

            {/* Overlay khi chưa phát */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                <div className="text-center">
                  <IoVideocam className="text-6xl text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">Nhấn để bắt đầu xem</p>
                  <Button
                    color="danger"
                    size="lg"
                    startContent={<IoPlayCircle className="text-2xl" />}
                    onClick={handlePlay}
                  >
                    Phát Live Stream
                  </Button>
                </div>
              </div>
            )}

            {/* Custom Controls */}
            {isPlaying && showControls && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="flat"
                      className="bg-white/20 text-white hover:bg-white/30"
                      onClick={handleStop}
                    >
                      <IoStop />
                    </Button>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="flat"
                      className="bg-white/20 text-white hover:bg-white/30"
                      onClick={toggleMute}
                    >
                      {isMuted ? <IoVolumeMute /> : <IoVolumeHigh />}
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Chip color="danger" size="sm" variant="flat">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        LIVE
                      </span>
                    </Chip>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="flat"
                      className="bg-white/20 text-white hover:bg-white/30"
                      onClick={toggleFullscreen}
                    >
                      {isFullscreen ? <IoContract /> : <IoExpand />}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="absolute top-4 left-4 right-4">
                <Chip color="danger" variant="flat" className="w-full justify-start">
                  {error}
                </Chip>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default LivePage;
