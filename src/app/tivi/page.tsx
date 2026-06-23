"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { Card, CardBody, Button, Chip } from "@heroui/react";
import { Tv, Play, Settings } from "lucide-react";
import SectionTitle from "@/components/ui/other/SectionTitle";
import { TVChannel, StreamType, categoryLabels, categoryColors } from "@/components/sections/Live/types";
import { NextPage } from "next";
import Link from "next/link";
import Hls from "hls.js";

// Interface cho kênh TV từ JSON
interface TiviChannel {
  id: string;
  name: string;
  logo: string;
  url: string;
  type: string;
  category: string;
  country: string;
  quality: string;
}

const TiviStreamPage: NextPage = () => {
  const [channels, setChannels] = useState<TiviChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState<TiviChannel | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Load channels from API
  useEffect(() => {
    const loadChannels = async () => {
      try {
        const response = await fetch('/api/admin/tivi');
        const data = await response.json();
        setChannels(data);
      } catch (error) {
        console.error('Error loading channels:', error);
        // Fallback to empty array if API fails
        setChannels([]);
      } finally {
        setLoading(false);
      }
    };

    loadChannels();
  }, []);

  const handleChannelSelectAndPlay = (channel: TiviChannel) => {
    setSelectedChannel(channel);
    setIsPlaying(false);
    setStreamError(null);
    setIsLoading(true);
    
    // Cleanup previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    
    // Auto play after selecting
    setTimeout(() => {
      handlePlayForChannel(channel);
    }, 100);
  };

  const handlePlayForChannel = (channel: TiviChannel) => {
    if (videoRef.current) {
      const video = videoRef.current;
      console.log('[TIVI] Bắt đầu play channel:', channel);
      if (channel.type === "m3u8" || channel.type === "hls") {
        // Nếu trình duyệt hỗ trợ native HLS (Safari, iOS), phát trực tiếp link gốc
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          console.log('[TIVI] Native HLS supported. Set video.src =', channel.url);
          video.src = channel.url;
          video.load();
          video.addEventListener("loadedmetadata", () => {
            console.log('[TIVI] loadedmetadata event');
            setIsLoading(false);
            video.play().then(() => {
              console.log('[TIVI] video.play() success');
            }).catch((e: Error) => {
              console.error("Autoplay failed:", e);
              setStreamError("Không thể tự động phát. Vui lòng nhấn nút play.");
            });
            setIsPlaying(true);
          });
          video.addEventListener('error', (e) => {
            setIsLoading(false);
            console.error('[TIVI] Native HLS video error:', e);
            setStreamError(`Không thể phát kênh ${channel.name}. Stream có thể không khả dụng.`);
          });
        } else if (Hls.isSupported()) {
          // Các trình duyệt khác dùng hls.js + proxy
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90,
            debug: false,
            xhrSetup: (xhr, url) => {
              xhr.setRequestHeader('Origin', window.location.origin);
            },
            fragLoadingTimeOut: 20000,
            manifestLoadingTimeOut: 10000,
          });
          const proxyUrl = `/api/proxy/stream?url=${encodeURIComponent(channel.url)}`;
          console.log('[TIVI] Hls.js supported. Loading stream via proxy:', proxyUrl);
          hls.loadSource(proxyUrl);
          console.log('[TIVI] hls.loadSource called');
          hls.attachMedia(video);
          console.log('[TIVI] hls.attachMedia called');
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log('[TIVI] Hls.js MANIFEST_PARSED');
            setIsLoading(false);
            video.play().then(() => {
              console.log('[TIVI] video.play() success');
            }).catch((e: Error) => {
              console.error("Autoplay failed:", e);
              setStreamError("Không thể tự động phát. Vui lòng nhấn nút play.");
            });
            setIsPlaying(true);
          });
          hls.on(Hls.Events.ERROR, (event, data) => {
            setIsLoading(false);
            console.error('[TIVI] HLS Error:', data);
            if (data.fatal) {
              switch(data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.error("Network error - trying fallback to direct URL...");
                  setStreamError("Proxy lỗi. Đang thử trực tiếp...");
                  setTimeout(() => {
                    hls.destroy();
                    const hls2 = new Hls({
                      enableWorker: true,
                      lowLatencyMode: true,
                      backBufferLength: 90,
                    });
                    console.log('[TIVI] Fallback: loading direct URL:', channel.url);
                    hls2.loadSource(channel.url);
                    hls2.attachMedia(video);
                    hls2.on(Hls.Events.MANIFEST_PARSED, () => {
                      console.log('[TIVI] Fallback Hls.js MANIFEST_PARSED');
                      setStreamError(null);
                      video.play().then(() => {
                        console.log('[TIVI] video.play() success (fallback)');
                      }).catch((e: Error) => {
                        setStreamError("Không thể phát. Vui lòng thử lại.");
                      });
                      setIsPlaying(true);
                    });
                    hls2.on(Hls.Events.ERROR, (event, data) => {
                      if (data.fatal) {
                        console.error('[TIVI] Fallback HLS Error:', data);
                        setStreamError(`Không thể phát kênh ${channel.name}. Stream không khả dụng.`);
                        setIsPlaying(false);
                      }
                    });
                    hlsRef.current = hls2;
                  }, 2000);
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.error("Media error - trying to recover...");
                  setStreamError("Lỗi media. Đang thử lại...");
                  hls.recoverMediaError();
                  break;
                default:
                  console.error("Fatal error - cannot recover");
                  setStreamError(`Không thể phát kênh ${channel.name}. Stream có thể không khả dụng.`);
                  setIsPlaying(false);
                  break;
              }
            }
          });
          hlsRef.current = hls;
        }
      } else {
        // Các stream khác vẫn dùng proxy như cũ
        const proxyUrl = `/api/proxy/stream?url=${encodeURIComponent(channel.url)}`;
        console.log('[TIVI] Non-HLS stream. Loading direct stream via proxy:', proxyUrl);
        video.src = proxyUrl;
        video.load();
        video.addEventListener('error', (e) => {
          setIsLoading(false);
          console.error('[TIVI] Video error:', e);
          console.error('Video error code:', video.error?.code);
          console.error('Video error message:', video.error?.message);
          setStreamError(`Không thể phát kênh ${channel.name}. Stream có thể không khả dụng hoặc lỗi kết nối.`);
          setIsPlaying(false);
        });
        video.addEventListener('loadstart', () => {
          console.log('[TIVI] loadstart event for:', channel.url);
        });
        video.addEventListener('canplay', () => {
          setIsLoading(false);
          console.log('[TIVI] canplay event');
        });
        video.play()
          .then(() => {
            setIsLoading(false);
            setIsPlaying(true);
            console.log('[TIVI] video.play() success');
          })
          .catch((e: Error) => {
            setIsLoading(false);
            console.error("Play error:", e);
            setStreamError("Không thể tự động phát. Vui lòng nhấn nút play.");
          });
      }
    }
  };

  const handlePlay = () => {
    if (selectedChannel) {
      setStreamError(null);
      handlePlayForChannel(selectedChannel);
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

  const getCategoryColor = (category: string) => {
    // Map Vietnamese categories to English ones
    const categoryMap: { [key: string]: string } = {
      "Tin Tức": "news",
      "Giải trí": "entertainment",
      "Thể thao": "sports",
      "Giáo dục": "education",
      "Thiếu nhi": "kids"
    };
    
    const englishCategory = categoryMap[category] || category.toLowerCase();
    return categoryColors[englishCategory as keyof typeof categoryColors] || "default";
  };

  const getCategoryName = (category: string) => {
    return category; // Keep Vietnamese category names
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 pt-4 md:pt-8 pb-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Tv className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">Đang tải danh sách kênh...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pt-4 md:pt-8 pb-8">
      <div className="flex items-center justify-between">
        <SectionTitle
          color="primary"
          className="text-2xl md:text-3xl"
          classNames={{
            title:
              "bg-[linear-gradient(90deg,#3b82f6,#06b6d4,#10b981,#3b82f6,#06b6d4)] bg-[length:200%] animate-gradient bg-clip-text text-transparent",
          }}
        >
          <span className="flex items-center gap-2">
            <Tv className="text-blue-500" />
            CineVerse TV
          </span>
        </SectionTitle>
        <Link href="/admin/tivi">
          <Button
            size="sm"
            variant="flat"
            color="primary"
            startContent={<Settings className="w-4 h-4" />}
          >
            Quản lý kênh
          </Button>
        </Link>
      </div>

      <p className="text-gray-400 -mt-4">
        Xem các kênh truyền hình Việt Nam trực tuyến với chất lượng HD
      </p>

      {/* Channel Grid */}
      {channels.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {channels.map((channel) => (
            <Card
              key={channel.id}
              className={`overflow-hidden transition-all duration-300 hover:scale-105 ${
                selectedChannel?.id === channel.id
                  ? "ring-2 ring-blue-500 shadow-lg"
                  : "hover:shadow-lg"
              }`}
            >
              <CardBody className="p-4">
                <div className="flex flex-col items-center gap-3">
                  {/* Channel Logo */}
                  <div className="w-16 h-16 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
                    <Image
                      src={channel.logo}
                      alt={channel.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-contain"
                      crossOrigin="anonymous"
                      loading="lazy"
                      onLoad={(e) => {
                        // Khi load thành công, đảm bảo icon TV bị ẩn
                        const target = e.target as HTMLImageElement;
                        const iconElement = target.nextElementSibling as HTMLElement;
                        if (iconElement) {
                          iconElement.classList.add('hidden');
                        }
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const iconElement = target.nextElementSibling as HTMLElement;
                        if (iconElement) {
                          iconElement.classList.remove('hidden');
                        }
                      }}
                    />
                    <Tv className="w-8 h-8 text-gray-400 hidden" />
                  </div>

                  {/* Channel Info */}
                  <div className="text-center">
                    <h3 className="font-semibold text-sm text-gray-800 dark:text-white mb-1">
                      {channel.name}
                    </h3>
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Chip
                        size="sm"
                        color={getCategoryColor(channel.category)}
                        variant="flat"
                      >
                        {getCategoryName(channel.category)}
                      </Chip>
                      <Chip size="sm" variant="flat" className="text-xs">
                        {channel.quality}
                      </Chip>
                    </div>
                  </div>

                  {/* Play Button */}
                  <Button
                    size="sm"
                    color="primary"
                    variant={selectedChannel?.id === channel.id ? "solid" : "flat"}
                    startContent={<Play className="w-3 h-3" />}
                    className="w-full"
                    onClick={() => handleChannelSelectAndPlay(channel)}
                  >
                    {selectedChannel?.id === channel.id ? "Đang xem" : "Xem"}
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <CardBody className="p-6">
            <div className="flex items-start gap-3">
              <Settings className="w-6 h-6 text-yellow-500 mt-1 shrink-0" />
              <div>
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                  Chưa có kênh nào
                </h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Vui lòng thêm kênh vào trang quản lý để bắt đầu xem TV trực tuyến.
                </p>
                <Link href="/admin/tivi" className="mt-3 inline-block">
                  <Button size="sm" color="primary" variant="flat">
                    Thêm kênh ngay
                  </Button>
                </Link>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Video Player */}
      {selectedChannel && (
        <Card className="overflow-hidden">
          <CardBody className="p-0">
            <div className="relative aspect-video bg-black">
              {!isPlaying && !isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                  <div className="text-center">
                    <Image
                      src={selectedChannel.logo}
                      alt={selectedChannel.name}
                      width={96}
                      height={96}
                      className="w-24 h-24 mx-auto mb-4 object-contain"
                      crossOrigin="anonymous"
                      loading="lazy"
                      onLoad={(e) => {
                        // Khi load thành công, đảm bảo icon TV bị ẩn
                        const target = e.target as HTMLImageElement;
                        const iconElement = target.nextElementSibling as HTMLElement;
                        if (iconElement) {
                          iconElement.classList.add('hidden');
                        }
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const iconElement = target.nextElementSibling as HTMLElement;
                        if (iconElement) {
                          iconElement.classList.remove('hidden');
                        }
                      }}
                    />
                    <Tv className="w-24 h-24 text-gray-500 mx-auto mb-4 hidden" />
                    <h3 className="text-xl text-white mb-2">{selectedChannel.name}</h3>
                    <p className="text-gray-400 mb-4">
                      {getCategoryName(selectedChannel.category)} • {selectedChannel.quality}
                    </p>
                    
                    {streamError && (
                      <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                        <p className="text-red-300 text-sm">{streamError}</p>
                      </div>
                    )}
                    
                    <Button
                      color="primary"
                      size="lg"
                      startContent={<Play className="text-xl" />}
                      onClick={handlePlay}
                    >
                      Xem {selectedChannel.name}
                    </Button>
                  </div>
                </div>
              ) : isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white">Đang tải kênh {selectedChannel.name}...</p>
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-full">
                  <video
                    ref={videoRef}
                    className="w-full h-full"
                    controls
                    playsInline
                  >
                    <source
                      src={selectedChannel.url}
                      type={selectedChannel.type === "m3u8" || selectedChannel.type === "hls" ? "application/x-mpegURL" : "video/mp4"}
                    />
                    Trình duyệt của bạn không hỗ trợ phát video.
                  </video>
                  
                  {/* Channel Info Overlay */}
                  <div className="absolute top-4 left-4">
                    <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2">
                      <Image
                        src={selectedChannel.logo}
                        alt={selectedChannel.name}
                        width={32}
                        height={32}
                        className="w-8 h-8 object-contain"
                        crossOrigin="anonymous"
                        loading="lazy"
                        onLoad={(e) => {
                          // Khi load thành công, đảm bảo icon TV bị ẩn
                          const target = e.target as HTMLImageElement;
                          const iconElement = target.nextElementSibling as HTMLElement;
                          if (iconElement) {
                            iconElement.classList.add('hidden');
                          }
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const iconElement = target.nextElementSibling as HTMLElement;
                          if (iconElement) {
                            iconElement.classList.remove('hidden');
                          }
                        }}
                      />
                      <Tv className="w-6 h-6 text-white hidden" />
                      <div>
                        <p className="text-white font-semibold text-sm">{selectedChannel.name}</p>
                        <p className="text-gray-300 text-xs">
                          {getCategoryName(selectedChannel.category)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Error Overlay */}
                  {streamError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                      <div className="text-center max-w-md mx-4">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Tv className="w-8 h-8 text-red-400" />
                        </div>
                        <h3 className="text-xl text-white mb-2">Lỗi phát lại</h3>
                        <p className="text-red-300 mb-4">{streamError}</p>
                        <Button
                          color="primary"
                          onClick={handlePlay}
                        >
                          Thử lại
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Live Indicator */}
                  <div className="absolute top-4 right-4">
                    <Chip color="danger" size="sm" variant="solid">
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        TRỰC TIẾP
                      </span>
                    </Chip>
                  </div>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Instructions */}
      {!selectedChannel && channels.length > 0 && (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardBody className="p-6">
            <div className="flex items-start gap-3">
              <Tv className="w-6 h-6 text-blue-500 mt-1 shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Hướng dẫn xem TV trực tuyến
                </h3>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Chọn kênh bạn muốn xem từ danh sách bên trên</li>
                  <li>• Nhấn nút &ldquo;Xem&rdquo; để bắt đầu phát</li>
                  <li>• Các kênh có chất lượng HD</li>
                  <li>• Sử dụng trình duyệt Chrome, Firefox, Safari để có trải nghiệm tốt nhất</li>
                </ul>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default TiviStreamPage;
