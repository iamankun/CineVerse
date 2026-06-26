"use client";

import { useState, useEffect } from "react";
import AdminGuard from "@/components/AdminGuard";
import { useBroadcaster } from "@/hooks/useBroadcaster";
import { useLiveStatus } from "@/hooks/useLiveStatus";
import LivePlayer from "@/components/LivePlayer";
import { Card, CardBody, Button, Input, Chip, Tooltip } from "@heroui/react";
import { RadioTower, Copy, Square, AlertCircle, Check, Power, PowerOff } from "lucide-react";
import { LiveStatus } from "@/types/live";
import { getLiveCookie, setLiveCookie, clearLiveCookie } from "@/lib/live/cookie";

export default function AdminLivePage() {
  const { channelId, ingestUrl, streamKey, channelName, setChannelName, status, loading, error, prepare, start, stop } = useBroadcaster();
  const { status: liveStatus, previewAvailable, previewFlvUrl } = useLiveStatus(channelId);
  const [nameInput, setNameInput] = useState(() => getLiveCookie()?.channelName ?? "");
  const [copied, setCopied] = useState<string | null>(null);
  const [msRunning, setMsRunning] = useState(false);
  const [msLoading, setMsLoading] = useState(false);
  const [msMessage, setMsMessage] = useState("");

  const displayStatus: LiveStatus =
    liveStatus !== "offline" ? liveStatus : status;
  const isLive = displayStatus === "live" || displayStatus === "starting";
  const hasConfig = channelId && ingestUrl && streamKey;

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/live/media-server");
        const data = await res.json();
        setMsRunning(data.running);
      } catch {}
    })();
  }, []);

  // Restore from cookie
  useEffect(() => {
    const cookie = getLiveCookie();
    if (cookie) {
      prepare(cookie.channelName, "other");
    }
  }, [prepare]);

  const handlePrepare = () => {
    if (!nameInput.trim()) return;
    prepare(nameInput.trim(), "other");
  };

  const handleStart = async () => {
    start();
  };

  const handleStop = () => {
    clearLiveCookie();
    stop();
  };

  useEffect(() => {
    if (channelId && streamKey && ingestUrl && channelName) {
      setLiveCookie({ channelId, channelName, streamKey, ingestUrl });
    }
  }, [channelId, streamKey, ingestUrl, channelName]);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch {}
  };

  const handleMediaServer = async () => {
    if (msRunning) {
      setMsLoading(true);
      try {
        const res = await fetch("/api/live/media-server", { method: "DELETE" });
        const data = await res.json();
        setMsRunning(data.running);
        setMsMessage("Máy chủ phương tiện đã tắt");
        setTimeout(() => setMsMessage(""), 3000);
      } catch {
        setMsMessage("Lỗi kết nối");
      } finally {
        setMsLoading(false);
      }
    } else {
      setMsLoading(true);
      setMsMessage("");
      try {
        const res = await fetch("/api/live/media-server", { method: "POST" });
        const data = await res.json();
        setMsRunning(data.running);
        setMsMessage(data.message);
        if (data.running && !hasConfig) {
          const cookie = getLiveCookie();
          const name = cookie?.channelName || nameInput.trim() || "Kênh chính";
          setNameInput(name);
          await prepare(name, "other");
        }
        setTimeout(() => setMsMessage(""), 3000);
      } catch {
        setMsMessage("Lỗi kết nối");
      } finally {
        setMsLoading(false);
      }
    }
  };

  const [editingName, setEditingName] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  const handleRename = async () => {
    if (!channelId || !renameValue.trim()) return;
    setEditingName(false);
    try {
      const res = await fetch("/api/live/info", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelId, name: renameValue.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Đổi tên thất bại");
      setChannelName(data.name);
    } catch (e: any) {
      console.error(e.message);
    }
  };

  return (
    <AdminGuard>
      <div className="flex flex-col gap-6 pt-4 md:pt-8 pb-8 max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RadioTower className="w-7 h-7 text-red-500" />
            <h1 className="text-2xl md:text-3xl font-bold text-white">Phát trực tiếp</h1>
          </div>
          <div className="flex items-center gap-3">
            <Chip
              color={msRunning ? "success" : "default"}
              size="sm"
              variant="flat"
              startContent={
                <span className={`w-2 h-2 rounded-full ${msRunning ? "bg-green-500" : "bg-gray-500"}`} />
              }
            >
              {msRunning ? "Máy chủ phương tiện | On" : "Máy chủ phương tiện | Off"}
            </Chip>
            <Tooltip content={msRunning ? "Tắt máy chủ phương tiện" : "Khởi động máy chủ phương tiện"}>
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                onPress={handleMediaServer}
                isLoading={msLoading}
              >
                {msRunning ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
              </Button>
            </Tooltip>
          </div>
        </div>

        {msMessage && (
          <p className="text-sm text-green-400 -mt-4">{msMessage}</p>
        )}

        {/* Step 1: Set channel name */}
        {!hasConfig && !loading && (
          <Card>
            <CardBody className="p-6">
              <h2 className="text-lg font-semibold mb-2">Nhập tên kênh</h2>
              <p className="text-sm text-gray-400 mb-4">
                Nhập tên kênh để tạo cấu hình phát trực tiếp.
              </p>
              <div className="flex gap-3">
                <Input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Nhập tên kênh..."
                  onKeyDown={(e) => e.key === "Enter" && handlePrepare()}
                  className="flex-1"
                />
                <Button
                  color="primary"
                  onPress={handlePrepare}
                  isLoading={loading}
                  isDisabled={!nameInput.trim()}
                >
                  Tạo cấu hình
                </Button>
              </div>
              {error && (
                <div className="mt-3 flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {loading && !hasConfig && (
          <Card>
            <CardBody className="p-6 text-center">
              <p className="text-gray-400">Đang tạo cấu hình...</p>
            </CardBody>
          </Card>
        )}

        {/* Step 2: Show stream config */}
        {hasConfig && (
          <Card>
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {editingName ? (
                    <div className="flex gap-2">
                      <Input
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleRename()}
                        className="w-48"
                        autoFocus
                        size="sm"
                      />
                      <Button size="sm" color="primary" onPress={handleRename}>Lưu</Button>
                      <Button size="sm" variant="flat" onPress={() => setEditingName(false)}>Hủy</Button>
                    </div>
                  ) : (
                    <h2
                      className="text-lg font-semibold cursor-pointer hover:text-red-400 transition-colors"
                      onClick={() => {
                        setRenameValue(channelName);
                        setEditingName(true);
                      }}
                      title="Nhấp để đổi tên"
                    >
                      {channelName}
                    </h2>
                  )}
                  <Chip
                    color={displayStatus === "offline" ? "default" : isLive ? "danger" : "warning"}
                    size="sm"
                    variant="flat"
                    startContent={
                      <span className={`w-2 h-2 rounded-full ${displayStatus === "live" ? "bg-red-500 animate-pulse" : displayStatus === "starting" ? "bg-yellow-500 animate-pulse" : "bg-gray-500"}`} />
                    }
                  >
                    {displayStatus === "live" ? "Đang phát" : displayStatus === "starting" ? "Đang khởi tạo..." : "Chưa phát"}
                  </Chip>
                </div>
                <div className="flex gap-2">
                  {displayStatus === "offline" && (
                    <Button
                      color="danger"
                      startContent={<RadioTower className="w-4 h-4" />}
                      onPress={handleStart}
                      isLoading={loading}
                    >
                      On Air
                    </Button>
                  )}
                  {isLive && (
                    <Button
                      color="warning"
                      variant="solid"
                      startContent={<Square className="w-4 h-4" />}
                      onPress={handleStop}
                      isLoading={loading}
                    >
                      Kết thúc
                    </Button>
                  )}
                </div>
              </div>

              <LivePlayer
                streamUrl={previewFlvUrl}
                status={previewAvailable ? "live" : displayStatus}
                channelName={channelName}
              />

              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">URL máy chủ RTMP</label>
                  <div className="flex gap-2">
                    <Input value={ingestUrl!} readOnly className="flex-1 font-mono text-sm" />
                    <Button
                      isIconOnly
                      variant="flat"
                      onPress={() => copyToClipboard(ingestUrl!, "ingest")}
                    >
                      {copied === "ingest" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Khóa phát trực tiếp</label>
                  <div className="flex gap-2">
                    <Input value={streamKey!} readOnly className="flex-1 font-mono text-sm" />
                    <Button
                      isIconOnly
                      variant="flat"
                      onPress={() => copyToClipboard(streamKey!, "key")}
                    >
                      {copied === "key" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Cấu hình Vmix, OBS Studio với thông tin trên, sau đó bấm <strong>On Air</strong> để bắt đầu.
                </p>
              </div>
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
