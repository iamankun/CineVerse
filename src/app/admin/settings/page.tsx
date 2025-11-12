"use client";

import { Card, CardBody, CardHeader } from "@heroui/react";
import { Button } from "@heroui/react";
import { Input } from "@heroui/react";
import { Tabs, Tab } from "@heroui/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";

interface OverlayConfig {
  ageRating: {
    initialDelay: number;
    expandDuration: number;
    repeatInterval: number;
    description: string;
  };
  watchingWithBrand: {
    initialDelay: number;
    showDuration: number;
    repeatInterval: number;
    animationDuration: number;
    description: string;
  };
  brandLogo: {
    alwaysVisible: boolean;
    logoPath: string | null;
    scale: number;
    description: string;
  };
  descriptions: {
    initialDelay: string;
    showDuration: string;
    expandDuration: string;
    repeatInterval: string;
    animationDuration: string;
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const [config, setConfig] = useState<OverlayConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"player" | "development">("player");
  const [uploading, setUploading] = useState(false);

  // Load config
  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/admin/overlay-config');
      const result = await response.json();
      
      if (result.success) {
        // Use movie config (same as tv)
        setConfig(result.data.movie);
      } else {
        alert('Không thể tải cấu hình');
      }
    } catch (error) {
      console.error('Lỗi khi tải cấu hình:', error);
      alert('Lỗi khi tải cấu hình');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    
    setSaving(true);
    try {
      const response = await fetch('/api/admin/overlay-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert('✅ Đã lưu cấu hình! Vui lòng restart dev server để áp dụng.');
      } else {
        alert('❌ Không thể lưu cấu hình');
      }
    } catch (error) {
      console.error('Lỗi khi lưu cấu hình:', error);
      alert('❌ Lỗi khi lưu cấu hình');
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (section: keyof OverlayConfig, field: string, value: any) => {
    if (!config) return;
    
    setConfig({
      ...config,
      [section]: {
        ...config[section],
        [field]: value,
      },
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('❌ Vui lòng chọn file ảnh (PNG, JPG, SVG, etc.)');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('❌ File quá lớn! Vui lòng chọn file nhỏ hơn 2MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await fetch('/api/admin/upload-logo', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        updateConfig('brandLogo', 'logoPath', result.path);
        alert('✅ Tải lên logo thành công!');
      } else {
        alert('❌ Tải lên thất bại: ' + result.message);
      }
    } catch (error) {
      console.error('Lỗi khi upload logo:', error);
      alert('❌ Lỗi khi upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    if (confirm('Bạn có chắc muốn xóa logo tùy chỉnh và sử dụng logo mặc định?')) {
      updateConfig('brandLogo', 'logoPath', null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Đang tải...</div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg text-red-500">Không thể tải cấu hình</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl p-4">
      <div className="flex items-center gap-3 mb-6">
        <Button
          isIconOnly
          variant="light"
          onPress={() => router.push("/admin")}
        >
          <IoArrowBack size={24} />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Cài đặt Hệ thống</h1>
          <p className="mt-2 text-foreground/60">
            Quản lý cấu hình overlay và các thiết lập khác
          </p>
        </div>
      </div>

      <Tabs
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(key as "player" | "development")}
        className="mb-6"
      >
        <Tab key="player" title="Cài đặt Player" />
        <Tab key="development" title="Đang phát triển" />
      </Tabs>

      {activeTab === "player" ? (
        <div className="space-y-6">
          {/* Age Rating */}
          <Card>
            <CardHeader>
              <div>
                <h3 className="text-xl font-semibold">Độ tuổi</h3>
                <p className="text-sm text-foreground/60">{config.ageRating.description}</p>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <Input
                type="number"
                label="Initial Delay (ms)"
                description="Thời gian chờ trước khi hiển thị lần đầu"
                value={config.ageRating.initialDelay.toString()}
                onChange={(e) => updateConfig('ageRating', 'initialDelay', Number(e.target.value))}
              />
              <Input
                type="number"
                label="Expand Duration (ms)"
                description="Thời gian hiển thị trạng thái mở rộng"
                value={config.ageRating.expandDuration.toString()}
                onChange={(e) => updateConfig('ageRating', 'expandDuration', Number(e.target.value))}
              />
              <Input
                type="number"
                label="Repeat Interval (ms)"
                description="Khoảng thời gian giữa các lần hiển thị (0 = hiển thị liên tục)"
                value={config.ageRating.repeatInterval.toString()}
                onChange={(e) => updateConfig('ageRating', 'repeatInterval', Number(e.target.value))}
              />
            </CardBody>
          </Card>

          {/* Watching With Brand */}
          <Card>
            <CardHeader>
              <div>
                <h3 className="text-xl font-semibold">Watching With Brand (Logo Movie)</h3>
                <p className="text-sm text-foreground/60">{config.watchingWithBrand.description}</p>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <Input
                type="number"
                label="Initial Delay (ms)"
                description="Thời gian chờ trước khi hiển thị lần đầu"
                value={config.watchingWithBrand.initialDelay.toString()}
                onChange={(e) => updateConfig('watchingWithBrand', 'initialDelay', Number(e.target.value))}
              />
              <Input
                type="number"
                label="Show Duration (ms)"
                description="Thời gian hiển thị"
                value={config.watchingWithBrand.showDuration.toString()}
                onChange={(e) => updateConfig('watchingWithBrand', 'showDuration', Number(e.target.value))}
              />
              <Input
                type="number"
                label="Repeat Interval (ms)"
                description="Khoảng thời gian giữa các lần hiển thị (0 = hiển thị liên tục)"
                value={config.watchingWithBrand.repeatInterval.toString()}
                onChange={(e) => updateConfig('watchingWithBrand', 'repeatInterval', Number(e.target.value))}
              />
              <Input
                type="number"
                label="Animation Duration (ms)"
                description="Thời gian chuyển đổi animation"
                value={config.watchingWithBrand.animationDuration.toString()}
                onChange={(e) => updateConfig('watchingWithBrand', 'animationDuration', Number(e.target.value))}
              />
            </CardBody>
          </Card>

          {/* Brand Logo */}
          <Card>
            <CardHeader>
              <div>
                <h3 className="text-xl font-semibold">Brand Logo (CineVerse Logo)</h3>
                <p className="text-sm text-foreground/60">{config.brandLogo.description}</p>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <Input
                type="number"
                label="Scale"
                description="Tỷ lệ phóng to/thu nhỏ (1.0 = 100%)"
                step="0.1"
                value={config.brandLogo.scale.toString()}
                onChange={(e) => updateConfig('brandLogo', 'scale', Number(e.target.value))}
              />
              
              {/* Logo Upload/Preview Section */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Custom Logo</label>
                
                {/* Preview current logo */}
                {config.brandLogo.logoPath ? (
                  <div className="flex items-center gap-4 rounded-lg border-2 border-dashed border-foreground/20 bg-foreground/5 p-4">
                    <div className="flex-shrink-0">
                      <img 
                        src={config.brandLogo.logoPath} 
                        alt="Brand Logo" 
                        className="h-16 w-auto object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Logo hiện tại</p>
                      <p className="text-xs text-foreground/60 break-all">{config.brandLogo.logoPath}</p>
                    </div>
                    <Button
                      color="danger"
                      variant="flat"
                      size="sm"
                      onClick={handleRemoveLogo}
                    >
                      🗑️ Xóa
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-lg border-2 border-dashed border-foreground/20 bg-foreground/5 p-4 text-center">
                    <p className="text-sm text-foreground/60">Đang sử dụng logo mặc định</p>
                  </div>
                )}

                {/* Upload button */}
                <div className="flex gap-2">
                  <Button
                    color="primary"
                    variant="flat"
                    as="label"
                    htmlFor="logo-upload"
                    isLoading={uploading}
                    className="cursor-pointer"
                  >
                 {config.brandLogo.logoPath ? 'Thay đổi Logo' : 'Tải lên Logo'}
                  </Button>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                  <p className="flex items-center text-xs text-foreground/60">
                    PNG, JPG, SVG (Max 2MB)
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Save Button */}
          <div className="flex gap-4">
            <Button
              color="primary"
              size="lg"
              onClick={handleSave}
              isLoading={saving}
              className="w-full"
            >
              💾 Lưu cấu hình
            </Button>
            <Button
              color="default"
              size="lg"
              variant="bordered"
              onClick={fetchConfig}
              className="w-full"
            >
              🔄 Tải lại
            </Button>
          </div>

          {/* Warning */}
          <Card className="border-warning bg-warning/10">
            <CardBody>
              <p className="text-sm">
                ⚠️ <strong>Lưu ý:</strong> Sau khi lưu cấu hình, bạn cần <strong>restart dev server</strong> để áp dụng thay đổi.
                <br />
                💡 <strong>Gợi ý:</strong> Đặt repeatInterval = 0 để hiển thị liên tục (dùng cho test).
              </p>
            </CardBody>
          </Card>
        </div>
      ) : (
        <Card>
          <CardBody className="py-10 text-center">
            <div className="mx-auto max-w-md space-y-4">
              <div className="text-6xl">🚧</div>
              <h3 className="text-2xl font-bold">Đang phát triển</h3>
              <p className="text-foreground/60">
                Tính năng này đang được phát triển và sẽ sớm có mặt trong phiên bản tiếp theo.
              </p>
              <p className="text-sm text-foreground/40">
                Hãy quay lại sau để khám phá các tính năng mới!
              </p>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
