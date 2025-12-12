"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Button, 
  Input, 
  Card, 
  CardBody, 
  CardHeader,
  Tabs,
  Tab,
  Chip,
  Divider,
  Select,
  SelectItem,
  Switch
} from "@heroui/react";
import { 
  IoPlayCircle, 
  IoStop, 
  IoVideocam, 
  IoLink,
  IoRefresh,
  IoExpand,
  IoVolumeHigh,
  IoVolumeMute,
  IoSettings
} from "react-icons/io5";
import SectionTitle from "@/components/ui/other/SectionTitle";
import Hls from "hls.js";
import { NextPage } from "next";

type StreamType = "hls" | "rtmp" | "dash" | "direct";

interface StreamSource {
  id: string;
  name: string;
  url: string;
  type: StreamType;
  isLive?: boolean;
}

// Demo streams - có thể thay bằng API thực tế
const demoStreams: StreamSource[] = [
  {
    id: "1",
    name: "Big Buck Bunny (HLS Test)",
    url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    type: "hls",
    isLive: false,
  },
  {
    id: "2", 
    name: "Sintel (HLS)",
    url: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
    type: "hls",
    isLive: false,
  },
  {
    id: "3",
    name: "Tears of Steel (HLS)",
    url: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
    type: "hls",
    isLive: false,
  },
];

const LivePage: NextPage = () => {
  const [streamUrl, setStreamUrl] = useState<string>("");
  const [streamType, setStreamType] = useState<StreamType>("hls");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStream, setSelectedStream] = useState<string | null>(null);
  const [customStreams, setCustomStreams] = useState<StreamSource[]>([]);
  const [showControls, setShowControls] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Load custom streams from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("cineverse-custom-streams");
    if (saved) {
      try {
        setCustomStreams(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading custom streams:", e);
      }
    }
  }, []);

  // Save custom streams to localStorage
  const saveCustomStream = () => {
    if (!streamUrl.trim()) return;
    
    const newStream: StreamSource = {
      id: Date.now().toString(),
      name: `Custom Stream ${customStreams.length + 1}`,
      url: streamUrl,
      type: streamType,
      isLive: true,
    };
    
    const updated = [...customStreams, newStream];
    setCustomStreams(updated);
    localStorage.setItem("cineverse-custom-streams", JSON.stringify(updated));
  };

  // Play HLS stream
  const playHLS = (url: string) => {
    const video = videoRef.current;
    if (!video) return;

    // Cleanup previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });
      
      hls.loadSource(url);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(e => {
          console.error("Autoplay failed:", e);
          setError("Không thể tự động phát. Nhấn nút Play để bắt đầu.");
        });
        setIsPlaying(true);
        setError(null);
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
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
        video.play().catch(e => console.error("Autoplay failed:", e));
        setIsPlaying(true);
      });
    } else {
      setError("Trình duyệt không hỗ trợ HLS.");
    }
  };

  // Play direct stream (MP4, WebM, etc.)
  const playDirect = (url: string) => {
    const video = videoRef.current;
    if (!video) return;

    video.src = url;
    video.load();
    video.play().then(() => {
      setIsPlaying(true);
      setError(null);
    }).catch(e => {
      console.error("Play error:", e);
      setError("Không thể phát video này.");
    });
  };

  // Main play function
  const handlePlay = (url?: string, type?: StreamType) => {
    const playUrl = url || streamUrl;
    const playType = type || streamType;

    if (!playUrl.trim()) {
      setError("Vui lòng nhập URL stream.");
      return;
    }

    setError(null);

    switch (playType) {
      case "hls":
        playHLS(playUrl);
        break;
      case "dash":
        // DASH support can be added with dash.js
        setError("DASH sẽ được hỗ trợ trong bản cập nhật tiếp theo.");
        break;
      case "rtmp":
        setError("RTMP cần được chuyển đổi qua server. Hãy sử dụng HLS thay thế.");
        break;
      case "direct":
        playDirect(playUrl);
        break;
      default:
        playHLS(playUrl);
    }
  };

  // Stop playback
  const handleStop = () => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.src = "";
    }
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    setIsPlaying(false);
    setSelectedStream(null);
  };

  // Select a preset stream
  const selectStream = (stream: StreamSource) => {
    setSelectedStream(stream.id);
    setStreamUrl(stream.url);
    setStreamType(stream.type);
    handlePlay(stream.url, stream.type);
  };

  // Toggle mute
  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
      setIsMuted(!isMuted);
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (video) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        video.requestFullscreen();
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, []);

  const allStreams = [...demoStreams, ...customStreams];

  return (
    <div className="flex flex-col gap-6 pt-4 md:pt-8 pb-8">
      <SectionTitle 
        color="danger"
        className="text-2xl md:text-3xl"
        classNames={{
          title: "bg-[linear-gradient(90deg,#ef4444,#f97316,#eab308,#ef4444,#f97316)] bg-[length:200%] animate-gradient bg-clip-text text-transparent"
        }}
      >
        <span className="flex items-center gap-2">
          <IoVideocam className="text-red-500" />
          Live Stream
        </span>
      </SectionTitle>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardBody className="p-0">
              <div 
                className="relative aspect-video bg-black"
                onMouseEnter={() => setShowControls(true)}
                onMouseLeave={() => setShowControls(false)}
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
                      <p className="text-gray-400">Chọn hoặc nhập URL stream để bắt đầu</p>
                    </div>
                  </div>
                )}

                {/* Custom Controls */}
                {isPlaying && showControls && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="flat"
                          className="bg-white/20 text-white"
                          onClick={handleStop}
                        >
                          <IoStop />
                        </Button>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="flat"
                          className="bg-white/20 text-white"
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
                          className="bg-white/20 text-white"
                          onClick={toggleFullscreen}
                        >
                          <IoExpand />
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

          {/* Stream Input */}
          <Card className="mt-4">
            <CardBody>
              <div className="flex flex-col gap-4">
                <div className="flex gap-2 items-end">
                  <Input
                    label="URL Stream"
                    placeholder="Nhập URL HLS, RTMP, hoặc Direct..."
                    value={streamUrl}
                    onChange={(e) => setStreamUrl(e.target.value)}
                    startContent={<IoLink className="text-default-400" />}
                    className="flex-1"
                  />
                  <Select
                    label="Loại"
                    selectedKeys={[streamType]}
                    onChange={(e) => setStreamType(e.target.value as StreamType)}
                    className="w-32"
                  >
                    <SelectItem key="hls">HLS</SelectItem>
                    <SelectItem key="dash">DASH</SelectItem>
                    <SelectItem key="rtmp">RTMP</SelectItem>
                    <SelectItem key="direct">Direct</SelectItem>
                  </Select>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    color="danger"
                    startContent={<IoPlayCircle />}
                    onClick={() => handlePlay()}
                    className="flex-1"
                  >
                    Phát Stream
                  </Button>
                  <Button
                    variant="flat"
                    startContent={<IoRefresh />}
                    onClick={saveCustomStream}
                  >
                    Lưu
                  </Button>
                  {isPlaying && (
                    <Button
                      color="default"
                      variant="flat"
                      startContent={<IoStop />}
                      onClick={handleStop}
                    >
                      Dừng
                    </Button>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Stream List */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <h3 className="text-lg font-semibold">Danh sách Stream</h3>
            </CardHeader>
            <Divider />
            <CardBody>
              <Tabs variant="underlined" classNames={{ tabList: "gap-4" }}>
                <Tab key="demo" title="Demo">
                  <div className="flex flex-col gap-2 mt-2">
                    {demoStreams.map((stream) => (
                      <Button
                        key={stream.id}
                        variant={selectedStream === stream.id ? "solid" : "flat"}
                        color={selectedStream === stream.id ? "danger" : "default"}
                        className="justify-start h-auto py-3"
                        onClick={() => selectStream(stream)}
                      >
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{stream.name}</span>
                          <span className="text-xs text-default-400 uppercase">{stream.type}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </Tab>
                <Tab key="custom" title={`Đã lưu (${customStreams.length})`}>
                  <div className="flex flex-col gap-2 mt-2">
                    {customStreams.length === 0 ? (
                      <p className="text-default-400 text-sm text-center py-4">
                        Chưa có stream nào được lưu
                      </p>
                    ) : (
                      customStreams.map((stream) => (
                        <Button
                          key={stream.id}
                          variant={selectedStream === stream.id ? "solid" : "flat"}
                          color={selectedStream === stream.id ? "danger" : "default"}
                          className="justify-start h-auto py-3"
                          onClick={() => selectStream(stream)}
                        >
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{stream.name}</span>
                            <span className="text-xs text-default-400 truncate max-w-[200px]">
                              {stream.url}
                            </span>
                          </div>
                        </Button>
                      ))
                    )}
                  </div>
                </Tab>
              </Tabs>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Info Section */}
      <Card>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <h4 className="font-semibold mb-2">HLS Streaming</h4>
              <p className="text-sm text-default-500">
                Hỗ trợ đầy đủ HTTP Live Streaming (.m3u8) với adaptive bitrate
              </p>
            </div>
            <div className="text-center p-4">
              <h4 className="font-semibold mb-2">Low Latency</h4>
              <p className="text-sm text-default-500">
                Tối ưu hóa cho độ trễ thấp với HLS LL và CMAF
              </p>
            </div>
            <div className="text-center p-4">
              <h4 className="font-semibold mb-2">Multi-format</h4>
              <p className="text-sm text-default-500">
                Hỗ trợ MP4, WebM, và các định dạng video phổ biến
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default LivePage;
