"use client";

import { useState, useEffect } from "react";
import IconButton from "./IconButton";
import { IoNotificationsOutline, IoNotifications } from "react-icons/io5";
import NotificationPanel from "../notification/NotificationPanel";

interface NotificationCount {
  admin: number;
  replies: number;
  total: number;
}

const NotificationBellButton: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationCount>({
    admin: 0,
    replies: 0,
    total: 0
  });
  const [hasNotifications, setHasNotifications] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    fetchNotificationCounts();
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchNotificationCounts, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const fetchNotificationCounts = async () => {
    try {
      // Fetch admin notifications
      const adminResponse = await fetch("/api/notifications");
      const adminData = await adminResponse.json();
      const adminCount = adminData.notifications?.filter((n: any) => n.active).length || 0;

      // Fetch reply notifications
      const repliesResponse = await fetch("/api/notifications/replies");
      const repliesData = await repliesResponse.json();
      const repliesCount = repliesData.count || 0;

      const total = adminCount + repliesCount;
      
      setNotifications({
        admin: adminCount,
        replies: repliesCount,
        total
      });
      
      setHasNotifications(total > 0);
    } catch (error) {
      console.error("Error fetching notification counts:", error);
    }
  };

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
