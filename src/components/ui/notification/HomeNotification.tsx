"use client";

import { useEffect, useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Chip } from "@heroui/react";
import { useRouter } from "next/navigation";
import { IoClose, IoPlayCircle, IoInformationCircle, IoDownload } from "react-icons/io5";
import { usePWAInstall } from "@/hooks/usePWAInstall";

type NotificationType = "movie" | "tv" | "app" | "announcement";
type NotificationPriority = "low" | "medium" | "high";

type Notification = {
  id: number;
  type: NotificationType;
  tmdbId?: number;
  title: string;
  message: string;
  action: string;
  active: boolean;
  priority: NotificationPriority;
  createdAt: string;
};

const DISMISSED_KEY = "cineverse_dismissed_notifications";

export default function HomeNotification() {
  const router = useRouter();
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<number[]>([]);

  useEffect(() => {
    // Load dismissed notifications from localStorage
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed) {
      setDismissedIds(JSON.parse(dismissed));
    }

    // Fetch active notifications
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications");
      if (!response.ok) {
        console.warn("Failed to fetch notifications:", response.status);
        return;
      }
      const data = await response.json();
      
      // Filter out dismissed notifications
      const dismissed = localStorage.getItem(DISMISSED_KEY);
      const dismissedList = dismissed ? JSON.parse(dismissed) : [];
      
      const filteredNotifications = data.notifications.filter(
        (n: Notification) => !dismissedList.includes(n.id)
      );

      if (filteredNotifications.length > 0) {
        setNotifications(filteredNotifications);
        setIsOpen(true);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const currentNotification = notifications[currentIndex];

  const handleDismiss = () => {
    if (!currentNotification) return;

    // Add to dismissed list
    const newDismissedIds = [...dismissedIds, currentNotification.id];
    setDismissedIds(newDismissedIds);
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(newDismissedIds));

    // Show next notification or close
    if (currentIndex < notifications.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsOpen(false);
    }
  };

  const handleAction = async () => {
    if (!currentNotification) return;

    const { type, tmdbId, action } = currentNotification;

    // Dismiss current notification
    const newDismissedIds = [...dismissedIds, currentNotification.id];
    setDismissedIds(newDismissedIds);
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(newDismissedIds));

    // Navigate based on type and action
    if (action === "watch" && tmdbId) {
      if (type === "movie") {
        router.push(`/movie/${tmdbId}`);
      } else if (type === "tv") {
        router.push(`/tv/${tmdbId}`);
      }
    } else if (action === "install" || action === "Install") {
      // Check if PWA is installable
      if (isInstalled) {
        alert("✅ App đã được cài đặt!");
      } else if (isInstallable) {
        // Show PWA install prompt
        const result = await promptInstall();
        if (result.outcome === 'accepted') {
          alert("✅ Cảm ơn bạn đã cài đặt CineVerse!");
        } else if ('message' in result && result.message) {
          alert(`ℹ️ ${result.message}`);
        }
      } else {
        // Fallback instructions for browsers that don't support PWA install
        alert(
          "📱 Để cài đặt CineVerse:\n\n" +
          "🖥️ Desktop:\n" +
          "• Chrome/Edge: Click biểu tượng ➕ trên thanh địa chỉ\n" +
          "• Safari: Chia sẻ > Thêm vào Dock\n\n" +
          "📱 Mobile:\n" +
          "• Android: Menu (⋮) > Thêm vào màn hình chính\n" +
          "• iOS: Chia sẻ (↑) > Thêm vào màn hình chính"
        );
      }
    }

    // Close modal or show next
    if (currentIndex < notifications.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsOpen(false);
    }
  };

  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case "high": return "danger";
      case "medium": return "warning";
      case "low": return "default";
    }
  };

  const getTypeColor = (type: NotificationType) => {
    switch (type) {
      case "movie": return "primary";
      case "tv": return "secondary";
      case "app": return "success";
      case "announcement": return "warning";
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case "watch": return <IoPlayCircle size={20} />;
      case "install": return <IoDownload size={20} />;
      default: return <IoInformationCircle size={20} />;
    }
  };

  const getActionText = (action: string) => {
    switch (action.toLowerCase()) {
      case "watch": return "Xem ngay";
      case "install": return isInstalled ? "Đã cài đặt" : isInstallable ? "Cài đặt ngay" : "Hướng dẫn cài đặt";
      default: return "Xem chi tiết";
    }
  };

  if (!currentNotification) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleDismiss}
      size="lg"
      backdrop="blur"
      placement="center"
      classNames={{
        backdrop: "bg-black/80",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Chip size="sm" color={getTypeColor(currentNotification.type)} variant="flat">
              {currentNotification.type.toUpperCase()}
            </Chip>
            <Chip size="sm" color={getPriorityColor(currentNotification.priority)} variant="flat">
              {currentNotification.priority}
            </Chip>
          </div>
          <h2 className="text-xl font-bold">{currentNotification.title}</h2>
        </ModalHeader>
        <ModalBody>
          <p className="text-foreground-600">{currentNotification.message}</p>
          
          {notifications.length > 1 && (
            <div className="mt-4 text-sm text-foreground-400">
              Thông báo {currentIndex + 1} / {notifications.length}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            color="default"
            variant="light"
            onPress={handleDismiss}
            startContent={<IoClose size={20} />}
          >
            Đóng
          </Button>
          <Button
            color={getTypeColor(currentNotification.type)}
            onPress={handleAction}
            startContent={getActionIcon(currentNotification.action)}
          >
            {getActionText(currentNotification.action)}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
