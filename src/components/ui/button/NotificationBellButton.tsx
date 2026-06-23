"use client";

import { useState, useEffect } from "react";
import IconButton from "./IconButton";
import { IoNotificationsOutline, IoNotifications } from "react-icons/io5";
import NotificationPanel from "../notification/NotificationPanel";
import { useQuery } from "@tanstack/react-query";

interface NotificationCount {
  admin: number;
  replies: number;
  total: number;
}

const NotificationBellButton: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const { data: notificationCounts, refetch } = useQuery({
    queryKey: ["notification-counts"],
    queryFn: async () => {
      const [adminResponse, repliesResponse] = await Promise.all([
        fetch("/api/notifications"),
        fetch("/api/notifications/replies"),
      ]);
      const adminData = await adminResponse.json();
      const repliesData = await repliesResponse.json();
      const adminCount = adminData.notifications?.filter((n: any) => n.active).length || 0;
      const repliesCount = repliesData.count || 0;
      const total = adminCount + repliesCount;
      return { admin: adminCount, replies: repliesCount, total };
    },
    staleTime: 30000,
  });

  const notifications = notificationCounts ?? { admin: 0, replies: 0, total: 0 };
  const hasNotifications = notifications.total > 0;

  useEffect(() => {
    const interval = setInterval(refetch, 30000);
    return () => clearInterval(interval);
  }, [refetch]);

  const icon = hasNotifications ? (
    <IoNotifications className="size-full text-warning" />
  ) : (
    <IoNotificationsOutline className="size-full" />
  );

  const tooltip = hasNotifications 
    ? `Bạn có ${notifications.total} thông báo mới` 
    : "Không có thông báo mới";

  return (
    <>
      <div className="relative">
        <IconButton
          tooltip={tooltip}
          tooltipProps={{ placement: "left" }}
          className="p-2 relative"
          icon={icon}
          onPress={() => setIsPanelOpen(true)}
          variant="light"
        />
        
        {/* Notification badge */}
        {hasNotifications && (
          <span className="absolute -top-1 -right-1 bg-warning text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {notifications.total > 99 ? "99+" : notifications.total}
          </span>
        )}
      </div>

      <NotificationPanel 
        isOpen={isPanelOpen} 
        onClose={() => setIsPanelOpen(false)} 
      />
    </>
  );
};

export default NotificationBellButton;
