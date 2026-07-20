"use client";

import { useState, useEffect } from "react";
import AdminGuard from "@/components/AdminGuard";
import LivePlayer from "@/components/LivePlayer";
import { Card, CardBody, Button, Input, Chip } from "@heroui/react";
import { RadioTower, Link as LinkIcon, Trash2, AlertCircle, Copy, Check } from "lucide-react";
import { LiveStatus } from "@/types/live";

export default function AdminLivePage() {
  const [channelName, setChannelName] = useState("");
  const [channelId, setChannelId] = useState<string | null>(null);
  const [channelLoading, setChannelLoading] = useState(false);
  const [channelError, setChannelError] = useState<string | null>(null);

  const [streamUrl, setStreamUrl] = useState("");
  const [savedUrl, setSavedUrl] = useState<string | null>(null);
  const [streamLoading, setStreamLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/live/info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "default", category: "other" }),
        });
        const data = await res.json();
        if (res.ok && data.channelId) {
          setChannelId(data.channelId);
          setChannelName(data.channelName || "");
          if (data.flvUrl) {
            setSavedUrl(data.flvUrl);
            setStreamUrl(data.flvUrl);
          }
        }
      } catch {}
    })();
  }, []);

  const handleSaveChannel = async () => {
    const name = channelName.trim();
    if (!name) return;
    setChannelLoading(true);
    setChannelError(null);
    try {
      const res = await fetch("/api/live/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category: "other" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Lỗi lưu tên kênh");
      setChannelId(data.channelId);
    } catch (e: any) {
      setChannelError(e.message);
    } finally {
      setChannelLoading(false);
    }
  };

  const handleSaveStreamUrl = async () => {
    const url = streamUrl.trim();
    if (!url) return;
    setStreamLoading(true);
    try {
      const res = await fetch("/api/live/stream-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ streamUrl: url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Lỗi lưu link");
      setSavedUrl(data.flvUrl);
    } catch {}
    setStreamLoading(false);
  };

  const handleClearStreamUrl = async () => {
    setStreamLoading(true);
    try {
      const res = await fetch("/api/live/stream-url", { method: "DELETE" });
      const data = await res.json();
      setSavedUrl(data.flvUrl);
      setStreamUrl("");
    } catch {}
    setStreamLoading(false);
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const isLive = !!savedUrl;
  const displayStatus: LiveStatus = isLive ? "live" : "offline";

  return (
    <AdminGuard>
      <div className="flex flex-col gap-6 pt-4 md:pt-8 pb-8 max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RadioTower className="w-7 h-7 text-red-500" />
            <h1 className="text-2xl md:text-3xl font-bold text-white">Phát trực tiếp</h1>
          </div>
          <Chip
            color={isLive ? "success" : "default"}
            size="sm"
            variant="flat"
            startContent={
              <span className={`w-2 h-2 rounded-full ${isLive ? "bg-green-500" : "bg-gray-500"}`} />
            }
          >
            {isLive ? "Đang phát" : "Chưa phát"}
          </Chip>
        </div>

        {/* Channel Name */}
        <Card>
          <CardBody className="p-6">
            <h2 className="text-lg font-semibold mb-2">Tên chương trình</h2>
            <p className="text-sm text-gray-400 mb-4">
              Nhập tên chương trình để hiển thị trên trang live.
            </p>
            <div className="flex gap-3">
              <Input
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                placeholder="Nhập tên chương trình..."
                onKeyDown={(e) => e.key === "Enter" && handleSaveChannel()}
                className="flex-1"
              />
              <Button
                color="primary"
                onPress={handleSaveChannel}
                isLoading={channelLoading}
                isDisabled={!channelName.trim()}
              >
                Lưu tên
              </Button>
            </div>
            {channelError && (
              <div className="mt-3 flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {channelError}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Stream URL Input */}
        <Card>
          <CardBody className="p-6">
            <h2 className="text-lg font-semibold mb-2">Link phát luồng trực tiếp</h2>
            <p className="text-sm text-gray-400 mb-4">
              Dán link phát luồng trực tiếp (HLS, FLV, M3U8, embed...) để hiển thị trên trang live.
            </p>
            <div className="flex gap-3">
              <Input
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                placeholder="https://example.com/stream.m3u8"
                onKeyDown={(e) => e.key === "Enter" && handleSaveStreamUrl()}
                className="flex-1"
                startContent={<LinkIcon className="w-4 h-4 text-gray-400" />}
              />
              <Button
                color="primary"
                onPress={handleSaveStreamUrl}
                isLoading={streamLoading}
                isDisabled={!streamUrl.trim()}
              >
                Lưu
              </Button>
              {savedUrl && (
                <Button
                  color="danger"
                  variant="flat"
                  onPress={handleClearStreamUrl}
                  isLoading={streamLoading}
                  startContent={<Trash2 className="w-4 h-4" />}
                >
                  Xóa
                </Button>
              )}
            </div>
            {savedUrl && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-sm text-green-400">Đã lưu:</span>
                <code className="text-sm text-gray-300 bg-gray-800 px-2 py-1 rounded truncate max-w-lg">
                  {savedUrl}
                </code>
                <Button
                  size="sm"
                  variant="flat"
                  onPress={() => handleCopy(savedUrl)}
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Preview */}
        {savedUrl && (
          <Card>
            <CardBody className="p-0">
              <LivePlayer
                streamUrl={savedUrl}
                status={displayStatus}
                channelName={channelName || "Trực tiếp"}
              />
            </CardBody>
          </Card>
        )}

        {isLive && (
          <Card>
            <CardBody className="flex items-center gap-4 p-4">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-400 font-medium">On Air</span>
            </CardBody>
          </Card>
        )}
      </div>
    </AdminGuard>
  );
}
