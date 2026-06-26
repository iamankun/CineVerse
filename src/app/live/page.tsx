"use client";

import { useState, useEffect } from "react";
import { Card, CardBody } from "@heroui/react";
import { RadioTower } from "lucide-react";
import SectionTitle from "@/components/ui/other/SectionTitle";
import LivePlayer from "@/components/LivePlayer";
import { LiveChannel } from "@/types/live";

export default function LivePage() {
  const [channel, setChannel] = useState<LiveChannel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const res = await fetch("/api/live/channels");
        const data = await res.json();
        const list: LiveChannel[] = data.channels ?? [];
        if (list.length > 0) {
          setChannel(list[0]);
        } else {
          setChannel(null);
        }
      } catch {
        setChannel(null);
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
    const interval = setInterval(fetchChannels, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 pt-4 md:pt-8 pb-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RadioTower className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pt-4 md:pt-8 pb-8">
      <SectionTitle
        color="danger"
        className="text-2xl md:text-3xl"
        classNames={{
          title:
            "bg-[linear-gradient(90deg,#ef4444,#f97316,#ef4444,#f97316)] bg-[length:200%] animate-gradient bg-clip-text text-transparent",
        }}
      >
        <span className="flex items-center gap-2">
          <RadioTower className="text-red-500" />
          {channel?.name || "Trực tiếp"}
        </span>
      </SectionTitle>

      {channel ? (
        <Card>
          <CardBody className="p-0">
            <LivePlayer
              streamUrl={channel.flvUrl}
              status={channel.status}
              channelName={channel.name}
            />
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody className="p-8 text-center">
            <RadioTower className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-300 mb-2">Chưa có kênh nào đang phát</h3>
            <p className="text-gray-500">Hiện tại không có kênh trực tiếp nào. Hãy quay lại sau!</p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
