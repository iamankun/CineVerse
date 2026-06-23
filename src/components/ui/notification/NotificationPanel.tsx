"use client";

import { useState } from "react";
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  Button,
  Divider,
  Chip,
  Avatar,
  Spinner
} from "@heroui/react";
import { 
  IoNotificationsOutline, 
  IoPersonOutline,
  IoChatbubbleOutline,
  IoClose,
  IoCheckmark
} from "react-icons/io5";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

interface NotificationItem {
  id: string | number;
  type: 'admin' | 'reply';
  title: string;
  message: string;
  user?: {
    username: string;
    avatar_url?: string;
    role?: string;
    verify?: string;
  };
  createdAt: string;
  movieId?: number;
  tvId?: number;
  read: boolean;
  action?: string;
  tmdbId?: number;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const router = useRouter();

  const { data: notifications = [], isFetching: loading } = useQuery({
    queryKey: ["notification-panel"],
    queryFn: async () => {
      const [adminResponse, repliesResponse] = await Promise.all([
        fetch("/api/notifications"),
        fetch("/api/notifications/replies"),
      ]);
      const adminData = await adminResponse.json();
      const repliesData = await repliesResponse.json();

      const adminNotifications = (adminData.notifications || []).map((n: any) => ({
        ...n,
        type: 'admin' as const,
        read: false,
      }));

      const replyNotifications = (repliesData.replies || []).map((r: any) => ({
        ...r,
        read: false,
      }));

      const allNotifications = [...adminNotifications, ...replyNotifications]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return allNotifications as NotificationItem[];
    },
    enabled: isOpen,
    staleTime: 30000,
  });

  const handleNotificationClick = (notification: NotificationItem) => {
    // Mark as read (we'll implement this later)
    
    // Navigate based on type
    if (notification.type === 'reply') {
      if (notification.movieId) {
        router.push(`/movie/${notification.movieId}`);
      } else if (notification.tvId) {
        router.push(`/tv/${notification.tvId}`);
      }
    } else if (notification.type === 'admin' && notification.action === 'watch' && notification.tmdbId) {
      if (notification.movieId) {
        router.push(`/movie/${notification.tmdbId}`);
      } else if (notification.tvId) {
        router.push(`/tv/${notification.tmdbId}`);
      }
    }
    
    onClose();
  };

  const markAllAsRead = async () => {
    // We'll implement this later
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'admin':
        return <IoNotificationsOutline className="text-warning" />;
      case 'reply':
        return <IoChatbubbleOutline className="text-primary" />;
      default:
        return <IoNotificationsOutline />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'admin':
        return 'warning';
      case 'reply':
        return 'primary';
      default:
        return 'default';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      placement="top"
      backdrop="blur"
      scrollBehavior="inside"
      classNames={{
        backdrop: "bg-black/50",
        base: "max-h-[80vh]",
        wrapper: "top-16 right-4"
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <IoNotificationsOutline className="text-xl" />
            <h2 className="text-lg font-semibold">Thông báo</h2>
            <Chip size="sm" color="primary" variant="flat">
              {notifications.length}
            </Chip>
          </div>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <Button
                size="sm"
                variant="light"
                color="primary"
                startContent={<IoCheckmark />}
                onPress={markAllAsRead}
              >
                Đánh dấu đã đọc
              </Button>
            )}
            <Button
              size="sm"
              variant="light"
              isIconOnly
              onPress={onClose}
            >
              <IoClose />
            </Button>
          </div>
        </ModalHeader>
        
        <ModalBody className="p-0">
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <IoNotificationsOutline className="text-4xl mx-auto mb-2 opacity-50" />
              <p>Không có thông báo mới</p>
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto">
              {notifications.map((notification, index) => (
                <div key={notification.id}>
                  <div
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {notification.type === 'reply' && notification.user ? (
                          <Avatar
                            src={notification.user.avatar_url}
                            size="sm"
                            fallback={<IoPersonOutline />}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            {getNotificationIcon(notification.type)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Chip size="sm" color={getTypeColor(notification.type)} variant="flat">
                            {notification.type === 'admin' ? 'Admin' : 'Phản hồi'}
                          </Chip>
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          )}
                        </div>
                        
                        <h4 className="font-medium text-sm mb-1">
                          {notification.title}
                        </h4>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {notification.message}
                        </p>
                        
                        {notification.user && (
                          <p className="text-xs text-gray-500 mt-1">
                            bởi {notification.user.username}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {index < notifications.length - 1 && <Divider />}
                </div>
              ))}
            </div>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
