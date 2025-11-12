"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Select,
  SelectItem,
  Textarea,
  Switch,
  Chip,
  Divider,
  Spinner,
} from "@heroui/react";
import { IoAdd, IoSave, IoTrash, IoCheckmarkCircle, IoLogOut, IoArrowBack } from "react-icons/io5";
import AdminGuard from "@/components/AdminGuard";

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

export default function NotificationAdminPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Form state
  const [type, setType] = useState<NotificationType>("movie");
  const [tmdbId, setTmdbId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [action, setAction] = useState("watch");
  const [active, setActive] = useState(true);
  const [priority, setPriority] = useState<NotificationPriority>("medium");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/admin/notifications");
      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!title || !message) {
      alert("Vui lòng điền đầy đủ Tiêu đề và Nội dung");
      return;
    }

    if ((type === "movie" || type === "tv") && !tmdbId) {
      alert("Vui lòng điền TMDB ID cho Movie/TV");
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage("");

    try {
      const data: any = {
        type,
        title,
        message,
        action,
        active,
        priority,
      };

      if (type === "movie" || type === "tv") {
        data.tmdbId = parseInt(tmdbId);
      }

      const response = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage(`✅ Tạo thành công: ${result.filePath}`);
        fetchNotifications();
        // Reset form
        setTimeout(() => {
          setType("movie");
          setTmdbId("");
          setTitle("");
          setMessage("");
          setAction("watch");
          setActive(true);
          setPriority("medium");
          setSuccessMessage("");
        }, 2000);
      } else {
        alert(`❌ Lỗi: ${result.message}`);
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("❌ Có lỗi xảy ra khi tạo thông báo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <AdminGuard>
        <div className="flex items-center justify-center min-h-screen">
          <Spinner size="lg" />
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <Card>
          <CardHeader className="flex flex-row justify-between items-center gap-2">
            <div className="flex items-center gap-3">
              <Button
                isIconOnly
                variant="light"
                onPress={() => router.push("/admin")}
              >
                <IoArrowBack size={24} />
              </Button>
              <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-warning">Quản lý Thông báo</h1>
                <p className="text-foreground-500">Tạo thông báo toàn trang cho người dùng</p>
              </div>
            </div>
            <Button
              color="danger"
              variant="flat"
              startContent={<IoLogOut />}
              onPress={handleLogout}
            >
              Logout
            </Button>
          </CardHeader>

          <CardBody className="gap-6">
            {successMessage && (
              <div className="rounded-lg bg-success-50 p-4 text-success">
                <div className="flex items-center gap-2">
                  <IoCheckmarkCircle size={24} />
                  <span>{successMessage}</span>
                </div>
              </div>
            )}

            {/* Notification List */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Thông báo hiện có ({notifications.length})</h2>
              <div className="grid gap-3">
                {notifications.map((notification) => (
                  <Card key={notification.id} shadow="sm" className="border-2">
                    <CardBody className="gap-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Chip
                              size="sm"
                              color={
                                notification.type === "movie"
                                  ? "primary"
                                  : notification.type === "tv"
                                  ? "warning"
                                  : "default"
                              }
                            >
                              {notification.type.toUpperCase()}
                            </Chip>
                            <Chip
                              size="sm"
                              color={
                                notification.priority === "high"
                                  ? "danger"
                                  : notification.priority === "medium"
                                  ? "warning"
                                  : "default"
                              }
                            >
                              {notification.priority}
                            </Chip>
                            {notification.active && (
                              <Chip size="sm" color="success">
                                Active
                              </Chip>
                            )}
                          </div>
                          <h3 className="font-bold">{notification.title}</h3>
                          <p className="text-sm text-foreground-500">{notification.message}</p>
                          {notification.tmdbId && (
                            <p className="text-xs text-foreground-400 mt-1">
                              TMDB ID: {notification.tmdbId}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-foreground-400">
                          #{notification.id}
                        </span>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>

            <Divider />

            {/* Create New Notification */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Tạo thông báo mới</h2>

              <Select
                label="Loại thông báo"
                selectedKeys={[type]}
                onChange={(e) => setType(e.target.value as NotificationType)}
              >
                <SelectItem key="movie">Movie - Phim điện ảnh</SelectItem>
                <SelectItem key="tv">TV - Chương trình truyền hình</SelectItem>
                <SelectItem key="app">App - Cài đặt ứng dụng</SelectItem>
                <SelectItem key="announcement">Announcement - Thông báo chung</SelectItem>
              </Select>

              {(type === "movie" || type === "tv") && (
                <Input
                  label="TMDB ID"
                  placeholder="Nhập TMDB ID"
                  value={tmdbId}
                  onChange={(e) => setTmdbId(e.target.value)}
                  type="number"
                  isRequired
                />
              )}

              <Input
                label="Tiêu đề"
                placeholder="Nhập tiêu đề thông báo"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                isRequired
              />

              <Textarea
                label="Nội dung"
                placeholder="Nhập nội dung thông báo"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                minRows={3}
                isRequired
              />

              <Input
                label="Action"
                placeholder="watch, install, dismiss"
                value={action}
                onChange={(e) => setAction(e.target.value)}
              />

              <Select
                label="Độ ưu tiên"
                selectedKeys={[priority]}
                onChange={(e) => setPriority(e.target.value as NotificationPriority)}
              >
                <SelectItem key="low">Low - Thấp</SelectItem>
                <SelectItem key="medium">Medium - Trung bình</SelectItem>
                <SelectItem key="high">High - Cao</SelectItem>
              </Select>

              <Switch isSelected={active} onValueChange={setActive}>
                Kích hoạt ngay
              </Switch>

              <Button
                color="warning"
                size="lg"
                startContent={<IoSave />}
                onPress={handleSubmit}
                isLoading={isSubmitting}
                className="w-full font-bold"
              >
                {isSubmitting ? "Đang tạo..." : "Tạo Thông báo"}
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </AdminGuard>
  );
}
