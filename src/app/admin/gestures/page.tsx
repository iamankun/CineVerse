'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Button, 
  Switch, 
  Input, 
  Slider,
  Divider,
  Chip,
  Select,
  SelectItem,
  addToast
} from '@heroui/react';
import { 
  IoArrowBack, 
  IoSave, 
  IoRefresh,
  IoHandRight,
  IoPlay,
  IoPause,
  IoVolumeHigh,
  IoVolumeLow,
  IoExpand,
  IoHeart,
  IoPlayForward,
  IoPlayBack,
  IoCheckmark,
  IoClose,
  IoSettings,
} from 'react-icons/io5';
import Link from 'next/link';
import AdminGuard from '@/components/AdminGuard';
import GestureDetector from '@/components/ui/gesture/GestureDetector';
import { GestureConfig, GestureName, GestureAction, GestureResult } from '@/types/gesture';

const GESTURE_ICONS: Record<GestureName, string> = {
  'None': '❓',
  'Closed_Fist': '✊',
  'Open_Palm': '🖐️',
  'Pointing_Up': '👆',
  'Thumb_Down': '👎',
  'Thumb_Up': '👍',
  'Victory': '✌️',
  'ILoveYou': '🤟',
  'Swipe_Left': '👈',
  'Swipe_Right': '👉',
};

const ACTION_OPTIONS: { key: GestureAction; label: string; icon: React.ReactNode }[] = [
  { key: 'play', label: 'Phát video', icon: <IoPlay /> },
  { key: 'pause', label: 'Tạm dừng', icon: <IoPause /> },
  { key: 'togglePlay', label: 'Phát/Dừng', icon: <IoPlay /> },
  { key: 'volumeUp', label: 'Tăng âm lượng', icon: <IoVolumeHigh /> },
  { key: 'volumeDown', label: 'Giảm âm lượng', icon: <IoVolumeLow /> },
  { key: 'forward', label: 'Tua tiến 10s', icon: <IoPlayForward /> },
  { key: 'rewind', label: 'Tua lùi 10s', icon: <IoPlayBack /> },
  { key: 'toggleFullscreen', label: 'Toàn màn hình', icon: <IoExpand /> },
  { key: 'favorite', label: 'Thêm yêu thích', icon: <IoHeart /> },
  { key: 'none', label: 'Không hành động', icon: <IoClose /> },
];

export default function GesturesPage() {
  const [config, setConfig] = useState<GestureConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastDetectedGesture, setLastDetectedGesture] = useState<GestureResult | null>(null);
  const [gestureHistory, setGestureHistory] = useState<GestureResult[]>([]);

  // Load config
  const loadConfig = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/gesture-config');
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      } else {
        throw new Error('Failed to load config');
      }
    } catch (err) {
      console.error('Error loading config:', err);
      addToast({
        title: 'Lỗi',
        description: 'Không thể tải cấu hình cử chỉ',
        color: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save config
  const saveConfig = async () => {
    if (!config) return;
    
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/gesture-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (res.ok) {
        addToast({
          title: 'Thành công',
          description: 'Đã lưu cấu hình cử chỉ',
          color: 'success',
        });
      } else {
        throw new Error('Failed to save');
      }
    } catch (err) {
      console.error('Error saving config:', err);
      addToast({
        title: 'Lỗi',
        description: 'Không thể lưu cấu hình',
        color: 'danger',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Update config value
  const updateConfig = <K extends keyof GestureConfig>(key: K, value: GestureConfig[K]) => {
    setConfig(prev => prev ? { ...prev, [key]: value } : null);
  };

  // Update gesture config
  const updateGesture = (gestureName: string, field: string, value: any) => {
    setConfig(prev => {
      if (!prev) return null;
      return {
        ...prev,
        gestures: {
          ...prev.gestures,
          [gestureName]: {
            ...prev.gestures[gestureName],
            [field]: value,
          },
        },
      };
    });
  };

  // Handle gesture detection callback
  const handleGestureDetected = useCallback((result: GestureResult) => {
    setLastDetectedGesture(result);
    setGestureHistory(prev => [result, ...prev.slice(0, 9)]);
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  if (isLoading || !config) {
    return (
      <AdminGuard>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button isIconOnly variant="flat">
                  <IoArrowBack />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <IoHandRight className="text-primary" />
                  Điều khiển Cử chỉ Tay
                </h1>
                <p className="text-gray-400 mt-1">
                  Kiểm tra và cấu hình nhận diện cử chỉ bằng MediaPipe
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                color="default"
                variant="flat"
                startContent={<IoRefresh />}
                onPress={loadConfig}
              >
                Tải lại
              </Button>
              <Button
                color="primary"
                startContent={<IoSave />}
                onPress={saveConfig}
                isLoading={isSaving}
              >
                Lưu cấu hình
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Test Panel */}
            <div className="space-y-6">
              {/* Camera & Detection Test */}
              <Card className="bg-gray-800/50 backdrop-blur-sm">
                <CardHeader className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">🎥 Kiểm tra Nhận diện</h2>
                    <p className="text-sm text-gray-400">Đưa tay vào camera để kiểm tra</p>
                  </div>
                  <Switch
                    isSelected={config.enabled}
                    onValueChange={(val) => updateConfig('enabled', val)}
                    color="success"
                    thumbIcon={({ isSelected }) =>
                      isSelected ? <IoCheckmark className="text-green-600" /> : <IoClose className="text-gray-400" />
                    }
                  />
                </CardHeader>
                <CardBody>
                  <GestureDetector
                    enabled={config.enabled}
                    showDebugPanel={true}
                    callbacks={{
                      onGestureDetected: handleGestureDetected,
                      onPlay: () => addToast({ title: '▶️ Play', description: 'Cử chỉ phát video', color: 'success' }),
                      onPause: () => addToast({ title: '⏸️ Pause', description: 'Cử chỉ tạm dừng', color: 'warning' }),
                      onVolumeUp: () => addToast({ title: '🔊 Volume Up', description: 'Tăng âm lượng', color: 'primary' }),
                      onVolumeDown: () => addToast({ title: '🔉 Volume Down', description: 'Giảm âm lượng', color: 'primary' }),
                      onToggleFullscreen: () => addToast({ title: '🖥️ Fullscreen', description: 'Chuyển đổi toàn màn hình', color: 'secondary' }),
                      onForward: () => addToast({ title: '⏩ Forward', description: 'Tua tiến 10s', color: 'primary' }),
                      onRewind: () => addToast({ title: '⏪ Rewind', description: 'Tua lùi 10s', color: 'primary' }),
                      onFavorite: () => addToast({ title: '❤️ Favorite', description: 'Thêm vào yêu thích', color: 'danger' }),
                    }}
                  />
                </CardBody>
              </Card>

              {/* Gesture History */}
              <Card className="bg-gray-800/50 backdrop-blur-sm">
                <CardHeader>
                  <h2 className="text-xl font-semibold text-white">📜 Lịch sử Cử chỉ</h2>
                </CardHeader>
                <CardBody>
                  {gestureHistory.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">
                      Chưa có cử chỉ nào được nhận diện
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {gestureHistory.map((gesture, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{GESTURE_ICONS[gesture.gesture]}</span>
                            <div>
                              <p className="font-medium text-white">{gesture.gesture.replace('_', ' ')}</p>
                              <p className="text-xs text-gray-400">
                                {gesture.handedness === 'Left' ? 'Tay trái' : 'Tay phải'}
                              </p>
                            </div>
                          </div>
                          <Chip
                            color={gesture.confidence > 0.8 ? "success" : gesture.confidence > 0.5 ? "warning" : "danger"}
                            size="sm"
                          >
                            {Math.round(gesture.confidence * 100)}%
                          </Chip>
                        </div>
                      ))}
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>

            {/* Right Column - Settings */}
            <div className="space-y-6">
              {/* General Settings */}
              <Card className="bg-gray-800/50 backdrop-blur-sm">
                <CardHeader>
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <IoSettings /> Cài đặt Chung
                  </h2>
                </CardHeader>
                <CardBody className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">Bật điều khiển cử chỉ</p>
                      <p className="text-sm text-gray-400">Cho phép điều khiển video bằng tay</p>
                    </div>
                    <Switch
                      isSelected={config.enabled}
                      onValueChange={(val) => updateConfig('enabled', val)}
                      color="success"
                    />
                  </div>

                  <Divider className="bg-gray-700" />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">Hiển thị Debug Overlay</p>
                      <p className="text-sm text-gray-400">Hiện landmarks và thông tin debug</p>
                    </div>
                    <Switch
                      isSelected={config.showDebugOverlay}
                      onValueChange={(val) => updateConfig('showDebugOverlay', val)}
                      color="primary"
                    />
                  </div>

                  <Divider className="bg-gray-700" />

                  <div>
                    <p className="font-medium text-white mb-2">Ngưỡng độ tin cậy: {config.confidenceThreshold}</p>
                    <Slider
                      aria-label="Confidence threshold"
                      step={0.05}
                      minValue={0.3}
                      maxValue={0.95}
                      value={config.confidenceThreshold}
                      onChange={(val) => updateConfig('confidenceThreshold', val as number)}
                      className="max-w-full"
                      color="primary"
                    />
                    <p className="text-sm text-gray-400 mt-1">
                      Chỉ nhận diện cử chỉ có độ tin cậy cao hơn ngưỡng này
                    </p>
                  </div>

                  <Divider className="bg-gray-700" />

                  <div>
                    <Input
                      type="number"
                      label="Độ trễ giữa các cử chỉ (ms)"
                      description="Thời gian chờ trước khi nhận diện cử chỉ tiếp theo"
                      value={config.gestureDelay.toString()}
                      onChange={(e) => updateConfig('gestureDelay', Number(e.target.value))}
                      min={100}
                      max={2000}
                      step={100}
                    />
                  </div>
                </CardBody>
              </Card>

              {/* Gesture Mapping */}
              <Card className="bg-gray-800/50 backdrop-blur-sm">
                <CardHeader>
                  <h2 className="text-xl font-semibold text-white">🎯 Ánh xạ Cử chỉ</h2>
                </CardHeader>
                <CardBody className="space-y-4">
                  {Object.entries(config.gestures).map(([gestureName, gestureConfig]) => (
                    <div
                      key={gestureName}
                      className="p-4 bg-gray-700/50 rounded-lg space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{GESTURE_ICONS[gestureName as GestureName]}</span>
                          <div>
                            <p className="font-medium text-white">{gestureName.replace('_', ' ')}</p>
                            <p className="text-xs text-gray-400">{gestureConfig.description}</p>
                          </div>
                        </div>
                        <Switch
                          isSelected={gestureConfig.enabled}
                          onValueChange={(val) => updateGesture(gestureName, 'enabled', val)}
                          color="success"
                          size="sm"
                        />
                      </div>

                      <Select
                        label="Hành động"
                        selectedKeys={[gestureConfig.action]}
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0] as GestureAction;
                          updateGesture(gestureName, 'action', selected);
                        }}
                        isDisabled={!gestureConfig.enabled}
                        size="sm"
                      >
                        {ACTION_OPTIONS.map(option => (
                          <SelectItem key={option.key} startContent={option.icon}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>
                  ))}
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
