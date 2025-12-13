"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Select,
  SelectItem,
  Switch,
  Divider,
  Chip,
  Tabs,
  Tab,
  Snippet
} from "@heroui/react";
import {
  IoArrowBack,
  IoSave,
  IoVideocam,
  IoLink,
  IoTrash,
  IoCheckmarkCircle,
  IoRefresh,
  IoCopy,
  IoKey,
  IoServer
} from "react-icons/io5";
import AdminGuard from "@/components/AdminGuard";

type StreamType = "hls" | "direct" | "rtmp";
type InputMode = "manual" | "rtmp";

interface LiveStreamConfig {
  enabled: boolean;
  url: string;
  type: StreamType;
  title: string;
  description: string;
  inputMode: InputMode;
  rtmpConfig: {
    serverUrl: string;
    streamKey: string;
    hlsPlaybackUrl: string;
  };
}

const defaultConfig: LiveStreamConfig = {
  enabled: false,
  url: "",
  type: "hls",
  title: "Live Stream",
  description: "",
  inputMode: "rtmp",
  rtmpConfig: {
    serverUrl: "",
    streamKey: "",
    hlsPlaybackUrl: "",
  },
};

// Generate random stream key
const generateStreamKey = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "cv_live_";
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export default function LiveStreamSettingsPage() {
  const router = useRouter();
  const [config, setConfig] = useState<LiveStreamConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [activeTab, setActiveTab] = useState<InputMode>("rtmp");

  // Load config from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cineverse-live-stream-config");
      if (saved) {
        const parsed = JSON.parse(saved);
        setConfig(parsed);
        setActiveTab(parsed.inputMode || "rtmp");
      } else {
        // Generate initial stream key
        const streamKey = generateStreamKey();
        setConfig({
          ...defaultConfig,
          rtmpConfig: {
            ...defaultConfig.rtmpConfig,
            streamKey,
          },
        });
      }
    } catch (error) {
      console.error("Error loading config:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update config when tab changes
  const handleTabChange = (key: React.Key) => {
    const mode = key as InputMode;
    setActiveTab(mode);
    setConfig({ ...config, inputMode: mode });
  };

  // Generate new stream key
  const handleGenerateKey = () => {
    const streamKey = generateStreamKey();
    setConfig({
      ...config,
      rtmpConfig: {
        ...config.rtmpConfig,
        streamKey,
      },
    });
  };

  // Update RTMP server URL and auto-generate HLS URL
  const handleRtmpServerChange = (serverUrl: string) => {
    // Try to auto-generate HLS URL from RTMP URL
    let hlsUrl = config.rtmpConfig.hlsPlaybackUrl;
    
    // Common patterns for media servers
    if (serverUrl.includes("rtmp://")) {
      const baseUrl = serverUrl.replace("rtmp://", "https://").replace("/live", "");
      hlsUrl = `${baseUrl}/hls/${config.rtmpConfig.streamKey}.m3u8`;
    }

    setConfig({
      ...config,
      rtmpConfig: {
        ...config.rtmpConfig,
        serverUrl,
        hlsPlaybackUrl: hlsUrl,
      },
    });
  };

  // Save config
  const handleSave = () => {
    setSaving(true);
    try {
      // Set the correct URL based on input mode
      let finalConfig = { ...config };
      if (config.inputMode === "rtmp") {
        finalConfig.url = config.rtmpConfig.hlsPlaybackUrl;
        finalConfig.type = "hls";
      }
      
      localStorage.setItem("cineverse-live-stream-config", JSON.stringify(finalConfig));
      setTimeout(() => {
        setSaving(false);
        alert("✅ Đã lưu cài đặt Live Stream!");
      }, 500);
    } catch (error) {
      console.error("Error saving config:", error);
      alert("❌ Không thể lưu cài đặt!");
      setSaving(false);
    }
  };

  // Clear config
  const handleClear = () => {
    if (confirm("Bạn có chắc muốn xóa tất cả cài đặt?")) {
      const streamKey = generateStreamKey();
      setConfig({
        ...defaultConfig,
        rtmpConfig: {
          ...defaultConfig.rtmpConfig,
          streamKey,
        },
      });
      localStorage.removeItem("cineverse-live-stream-config");
    }
  };

  // Test stream URL
  const handleTest = async () => {
    const testUrl = config.inputMode === "rtmp" ? config.rtmpConfig.hlsPlaybackUrl : config.url;
    
    if (!testUrl.trim()) {
      alert("Vui lòng nhập URL stream trước!");
      return;
    }

    setTestStatus("testing");
    
    try {
      await fetch(testUrl, { method: "HEAD", mode: "no-cors" });
      setTestStatus("success");
      setTimeout(() => setTestStatus("idle"), 3000);
    } catch (error) {
      setTestStatus("error");
      setTimeout(() => setTestStatus("idle"), 3000);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`✅ Đã copy ${label}!`);
  };

  if (loading) {
    return (
      <AdminGuard>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-white">Đang tải...</div>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4 md:p-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8 flex items-center gap-4">
            <Button
              isIconOnly
              variant="flat"
              className="bg-white/10 text-white"
              onClick={() => router.push("/admin")}
            >
              <IoArrowBack className="text-xl" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <IoVideocam className="text-red-500" />
                Cài đặt Live Stream
              </h1>
              <p className="text-gray-400 mt-1">Quản lý luồng phát trực tiếp từ OBS, vMix, v.v.</p>
            </div>
          </div>

          {/* Enable/Disable Toggle */}
          <Card className="mb-6 bg-gray-800/50 backdrop-blur-sm border border-white/10">
            <CardBody className="flex flex-row justify-between items-center">
              <div>
                <h3 className="text-white font-medium">Trạng thái Live Stream</h3>
                <p className="text-gray-400 text-sm">Bật để hiển thị trang Live cho người xem</p>
              </div>
              <Switch
                isSelected={config.enabled}
                onValueChange={(value) => setConfig({ ...config, enabled: value })}
                color="danger"
                size="lg"
              >
                <span className="text-white font-medium">
                  {config.enabled ? "Đang bật" : "Đang tắt"}
                </span>
              </Switch>
            </CardBody>
          </Card>

          {/* Stream Info */}
          <Card className="mb-6 bg-gray-800/50 backdrop-blur-sm border border-white/10">
            <CardHeader>
              <h2 className="text-xl font-semibold text-white">Thông tin hiển thị</h2>
            </CardHeader>
            <Divider className="bg-white/10" />
            <CardBody className="gap-4">
              <Input
                label="Tiêu đề"
                placeholder="Nhập tiêu đề cho live stream..."
                value={config.title}
                onChange={(e) => setConfig({ ...config, title: e.target.value })}
                classNames={{
                  input: "bg-transparent",
                  inputWrapper: "bg-white/5 border-white/20",
                }}
              />
              <Input
                label="Mô tả (tùy chọn)"
                placeholder="Nhập mô tả ngắn..."
                value={config.description}
                onChange={(e) => setConfig({ ...config, description: e.target.value })}
                classNames={{
                  input: "bg-transparent",
                  inputWrapper: "bg-white/5 border-white/20",
                }}
              />
            </CardBody>
          </Card>

          {/* Stream Source Tabs */}
          <Card className="bg-gray-800/50 backdrop-blur-sm border border-white/10">
            <CardHeader>
              <h2 className="text-xl font-semibold text-white">Nguồn phát</h2>
            </CardHeader>
            <Divider className="bg-white/10" />
            <CardBody>
              <Tabs
                selectedKey={activeTab}
                onSelectionChange={handleTabChange}
                variant="underlined"
                color="danger"
                classNames={{
                  tabList: "gap-6",
                  tab: "text-gray-400",
                  cursor: "bg-red-500",
                }}
              >
                {/* RTMP Tab - For OBS/vMix */}
                <Tab
                  key="rtmp"
                  title={
                    <div className="flex items-center gap-2">
                      <IoServer />
                      <span>RTMP (OBS/vMix)</span>
                    </div>
                  }
                >
                  <div className="mt-6 space-y-6">
                    {/* RTMP Server URL */}
                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">
                        RTMP Server URL
                      </label>
                      <Input
                        placeholder="rtmp://your-server.com/live"
                        value={config.rtmpConfig.serverUrl}
                        onChange={(e) => handleRtmpServerChange(e.target.value)}
                        startContent={<IoServer className="text-default-400" />}
                        description="URL server RTMP của bạn (ví dụ: rtmp://localhost:1935/live)"
                        classNames={{
                          input: "bg-transparent",
                          inputWrapper: "bg-white/5 border-white/20",
                        }}
                      />
                    </div>

                    {/* Stream Key */}
                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">
                        Stream Key
                      </label>
                      <div className="flex gap-2">
                        <Input
                          value={config.rtmpConfig.streamKey}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              rtmpConfig: { ...config.rtmpConfig, streamKey: e.target.value },
                            })
                          }
                          startContent={<IoKey className="text-default-400" />}
                          classNames={{
                            input: "bg-transparent font-mono",
                            inputWrapper: "bg-white/5 border-white/20",
                          }}
                        />
                        <Button
                          isIconOnly
                          variant="flat"
                          className="bg-white/10 text-white"
                          onClick={handleGenerateKey}
                          title="Tạo key mới"
                        >
                          <IoRefresh />
                        </Button>
                        <Button
                          isIconOnly
                          variant="flat"
                          className="bg-white/10 text-white"
                          onClick={() => copyToClipboard(config.rtmpConfig.streamKey, "Stream Key")}
                          title="Copy"
                        >
                          <IoCopy />
                        </Button>
                      </div>
                    </div>

                    {/* Copy info for OBS */}
                    {config.rtmpConfig.serverUrl && config.rtmpConfig.streamKey && (
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                        <h4 className="text-blue-400 font-medium mb-3 flex items-center gap-2">
                          <IoVideocam />
                          Cài đặt cho OBS / vMix
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <p className="text-gray-400 text-xs mb-1">Server:</p>
                            <Snippet
                              symbol=""
                              variant="flat"
                              className="w-full bg-black/30"
                              codeString={config.rtmpConfig.serverUrl}
                            >
                              {config.rtmpConfig.serverUrl}
                            </Snippet>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs mb-1">Stream Key:</p>
                            <Snippet
                              symbol=""
                              variant="flat"
                              className="w-full bg-black/30"
                              codeString={config.rtmpConfig.streamKey}
                            >
                              {config.rtmpConfig.streamKey}
                            </Snippet>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* HLS Playback URL */}
                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">
                        HLS Playback URL
                      </label>
                      <Input
                        placeholder="https://your-server.com/hls/stream.m3u8"
                        value={config.rtmpConfig.hlsPlaybackUrl}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            rtmpConfig: { ...config.rtmpConfig, hlsPlaybackUrl: e.target.value },
                          })
                        }
                        startContent={<IoLink className="text-default-400" />}
                        description="URL HLS để phát trên trình duyệt (được tạo từ RTMP server)"
                        classNames={{
                          input: "bg-transparent",
                          inputWrapper: "bg-white/5 border-white/20",
                        }}
                      />
                    </div>

                    {/* Quick Server Templates */}
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                      <h4 className="text-purple-400 font-medium mb-3">🚀 Server Templates (Copy nhanh)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Local MediaMTX */}
                        <div className="bg-black/30 rounded-lg p-3">
                          <p className="text-white text-sm font-medium mb-2">MediaMTX (Local)</p>
                          <div className="space-y-2">
                            <div>
                              <p className="text-gray-500 text-xs">Server URL:</p>
                              <Snippet
                                symbol=""
                                variant="flat"
                                size="sm"
                                className="w-full bg-black/50"
                                codeString="rtmp://localhost:1935/live"
                              >
                                rtmp://localhost:1935/live
                              </Snippet>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs">HLS URL:</p>
                              <Snippet
                                symbol=""
                                variant="flat"
                                size="sm"
                                className="w-full bg-black/50"
                                codeString={`http://localhost:8888/${config.rtmpConfig.streamKey}/index.m3u8`}
                              >
                                {`http://localhost:8888/${config.rtmpConfig.streamKey || "stream"}/index.m3u8`}
                              </Snippet>
                            </div>
                            <Button
                              size="sm"
                              variant="flat"
                              className="w-full bg-purple-500/20 text-purple-300"
                              onClick={() => {
                                setConfig({
                                  ...config,
                                  rtmpConfig: {
                                    ...config.rtmpConfig,
                                    serverUrl: "rtmp://localhost:1935/live",
                                    hlsPlaybackUrl: `http://localhost:8888/${config.rtmpConfig.streamKey}/index.m3u8`,
                                  },
                                });
                              }}
                            >
                              Áp dụng MediaMTX
                            </Button>
                          </div>
                        </div>

                        {/* Nginx-RTMP */}
                        <div className="bg-black/30 rounded-lg p-3">
                          <p className="text-white text-sm font-medium mb-2">Nginx-RTMP (Local)</p>
                          <div className="space-y-2">
                            <div>
                              <p className="text-gray-500 text-xs">Server URL:</p>
                              <Snippet
                                symbol=""
                                variant="flat"
                                size="sm"
                                className="w-full bg-black/50"
                                codeString="rtmp://localhost:1935/live"
                              >
                                rtmp://localhost:1935/live
                              </Snippet>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs">HLS URL:</p>
                              <Snippet
                                symbol=""
                                variant="flat"
                                size="sm"
                                className="w-full bg-black/50"
                                codeString={`http://localhost:8080/hls/${config.rtmpConfig.streamKey}.m3u8`}
                              >
                                {`http://localhost:8080/hls/${config.rtmpConfig.streamKey || "stream"}.m3u8`}
                              </Snippet>
                            </div>
                            <Button
                              size="sm"
                              variant="flat"
                              className="w-full bg-purple-500/20 text-purple-300"
                              onClick={() => {
                                setConfig({
                                  ...config,
                                  rtmpConfig: {
                                    ...config.rtmpConfig,
                                    serverUrl: "rtmp://localhost:1935/live",
                                    hlsPlaybackUrl: `http://localhost:8080/hls/${config.rtmpConfig.streamKey}.m3u8`,
                                  },
                                });
                              }}
                            >
                              Áp dụng Nginx-RTMP
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* OBS Setup Guide */}
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                      <h4 className="text-green-400 font-medium mb-3">📺 Cách thêm vào OBS Studio</h4>
                      <div className="space-y-3 text-sm text-gray-300">
                        <div className="flex items-start gap-3">
                          <span className="bg-green-500/20 text-green-400 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                          <p>Mở OBS → <strong>Settings</strong> → <strong>Stream</strong></p>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="bg-green-500/20 text-green-400 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                          <p>Chọn <strong>Service: Custom...</strong></p>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="bg-green-500/20 text-green-400 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
                          <div>
                            <p className="mb-1">Dán vào ô <strong>Server</strong>:</p>
                            {config.rtmpConfig.serverUrl ? (
                              <Snippet
                                symbol=""
                                variant="flat"
                                size="sm"
                                className="bg-black/50"
                                codeString={config.rtmpConfig.serverUrl}
                              >
                                {config.rtmpConfig.serverUrl}
                              </Snippet>
                            ) : (
                              <span className="text-yellow-400">⚠️ Chưa có Server URL - Hãy nhập ở trên hoặc chọn template</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="bg-green-500/20 text-green-400 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">4</span>
                          <div>
                            <p className="mb-1">Dán vào ô <strong>Stream Key</strong>:</p>
                            <Snippet
                              symbol=""
                              variant="flat"
                              size="sm"
                              className="bg-black/50"
                              codeString={config.rtmpConfig.streamKey}
                            >
                              {config.rtmpConfig.streamKey}
                            </Snippet>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="bg-green-500/20 text-green-400 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">5</span>
                          <p>Nhấn <strong>Apply</strong> → <strong>OK</strong> → <strong>Start Streaming</strong></p>
                        </div>
                      </div>
                    </div>

                    {/* Server Setup Info */}
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                      <h4 className="text-yellow-400 font-medium mb-2">💡 Cài đặt RTMP Server</h4>
                      <ul className="text-sm text-gray-400 space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-400">•</span>
                          <div>
                            <strong className="text-white">MediaMTX (Khuyên dùng):</strong>
                            <br />Download tại: <a href="https://github.com/bluenviron/mediamtx/releases" target="_blank" className="text-blue-400 hover:underline">github.com/bluenviron/mediamtx</a>
                            <br />Chỉ cần chạy file .exe, không cần cấu hình
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-400">•</span>
                          <div>
                            <strong className="text-white">Node Media Server:</strong>
                            <br /><code className="bg-black/30 px-1 rounded">npm install node-media-server</code>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-400">•</span>
                          <div>
                            <strong className="text-white">Nginx-RTMP:</strong> Cần cài Nginx với module RTMP
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Tab>

                {/* Manual URL Tab */}
                <Tab
                  key="manual"
                  title={
                    <div className="flex items-center gap-2">
                      <IoLink />
                      <span>URL thủ công</span>
                    </div>
                  }
                >
                  <div className="mt-6 space-y-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Input
                        label="URL Stream"
                        placeholder="Nhập URL HLS (.m3u8) hoặc video trực tiếp..."
                        value={config.url}
                        onChange={(e) => setConfig({ ...config, url: e.target.value })}
                        startContent={<IoLink className="text-default-400" />}
                        className="flex-1"
                        classNames={{
                          input: "bg-transparent",
                          inputWrapper: "bg-white/5 border-white/20",
                        }}
                      />
                      <Select
                        label="Loại"
                        selectedKeys={[config.type]}
                        onChange={(e) => setConfig({ ...config, type: e.target.value as StreamType })}
                        className="w-full sm:w-44"
                        classNames={{
                          trigger: "bg-white/5 border-white/20",
                        }}
                      >
                        <SelectItem key="hls">HLS (.m3u8)</SelectItem>
                        <SelectItem key="direct">Direct (MP4/WebM)</SelectItem>
                      </Select>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                      <h4 className="text-blue-400 font-medium mb-2">Hướng dẫn:</h4>
                      <ul className="text-sm text-gray-400 space-y-1">
                        <li>• <strong>HLS:</strong> URL kết thúc bằng .m3u8</li>
                        <li>• <strong>Direct:</strong> URL video MP4, WebM trực tiếp</li>
                      </ul>
                    </div>
                  </div>
                </Tab>
              </Tabs>

              {/* Test Button */}
              <div className="flex items-center gap-3 mt-6 pt-6 border-t border-white/10">
                <Button
                  variant="flat"
                  className="bg-white/10 text-white"
                  onClick={handleTest}
                  isLoading={testStatus === "testing"}
                >
                  Test URL phát lại
                </Button>
                {testStatus === "success" && (
                  <Chip color="success" variant="flat" startContent={<IoCheckmarkCircle />}>
                    URL có thể truy cập
                  </Chip>
                )}
                {testStatus === "error" && (
                  <Chip color="danger" variant="flat">
                    Không thể kiểm tra (có thể do CORS)
                  </Chip>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Preview Card */}
          {(config.inputMode === "rtmp" ? config.rtmpConfig.hlsPlaybackUrl : config.url) && (
            <Card className="mt-6 bg-gray-800/50 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <h2 className="text-xl font-semibold text-white">Xem trước</h2>
              </CardHeader>
              <Divider className="bg-white/10" />
              <CardBody>
                <div className="bg-black/50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <IoVideocam className="text-red-500 text-2xl" />
                    <div>
                      <h3 className="text-white font-medium">{config.title || "Live Stream"}</h3>
                      {config.description && (
                        <p className="text-gray-400 text-sm">{config.description}</p>
                      )}
                    </div>
                    {config.enabled && (
                      <Chip color="danger" size="sm" variant="flat" className="ml-auto">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                          LIVE
                        </span>
                      </Chip>
                    )}
                  </div>
                  <p className="text-gray-500 text-xs truncate">
                    URL: {config.inputMode === "rtmp" ? config.rtmpConfig.hlsPlaybackUrl : config.url}
                  </p>
                  <p className="text-gray-500 text-xs">
                    Nguồn: {config.inputMode === "rtmp" ? "RTMP → HLS" : config.type.toUpperCase()}
                  </p>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            <Button
              color="danger"
              size="lg"
              startContent={<IoSave className="text-xl" />}
              onClick={handleSave}
              isLoading={saving}
              className="flex-1"
            >
              Lưu cài đặt
            </Button>
            <Button
              variant="flat"
              size="lg"
              startContent={<IoTrash className="text-xl" />}
              onClick={handleClear}
              className="bg-white/10 text-white"
            >
              Xóa
            </Button>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
