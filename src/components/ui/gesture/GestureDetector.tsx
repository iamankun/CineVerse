'use client';

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Card, CardBody, Chip, Switch, Button, Tooltip } from '@heroui/react';
import { IoHandRight, IoVideocam, IoClose, IoCheckmark, IoWarning } from 'react-icons/io5';
import { useGestureControl } from '@/hooks/useGestureControl';
import { GestureCallbacks, GestureName } from '@/types/gesture';
import { cn } from '@/utils/helpers';

interface GestureDetectorProps {
  enabled?: boolean;
  showDebugPanel?: boolean;
  showMiniView?: boolean;
  className?: string;
  callbacks?: GestureCallbacks;
  onEnabledChange?: (enabled: boolean) => void;
}

export interface GestureDetectorRef {
  start: () => Promise<void>;
  stop: () => void;
  isActive: boolean;
}

const GESTURE_EMOJIS: Record<GestureName, string> = {
  'None': '❓',
  'Closed_Fist': '✊',
  'Open_Palm': '🖐️',
  'Pointing_Up': '👆',
  'Thumb_Down': '👎',
  'Thumb_Up': '👍',
  'Victory': '✌️',
  'ILoveYou': '🤟',
};

const GESTURE_ACTIONS: Record<string, string> = {
  'play': 'Phát video',
  'pause': 'Tạm dừng',
  'togglePlay': 'Phát/Dừng',
  'volumeUp': 'Tăng âm lượng',
  'volumeDown': 'Giảm âm lượng',
  'forward': 'Tua tiến 10s',
  'rewind': 'Tua lùi 10s',
  'toggleFullscreen': 'Toàn màn hình',
  'favorite': 'Yêu thích',
  'mute': 'Tắt tiếng',
  'unmute': 'Bật tiếng',
};

const GestureDetector = forwardRef<GestureDetectorRef, GestureDetectorProps>(({
  enabled = true,
  showDebugPanel = true,
  showMiniView = false,
  className,
  callbacks,
  onEnabledChange,
}, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {
    isInitialized,
    isLoading,
    error,
    currentGesture,
    confidence,
    handDetected,
    cameraActive,
    config,
    startDetection,
    stopDetection,
  } = useGestureControl({ enabled, callbacks });

  useImperativeHandle(ref, () => ({
    start: async () => {
      if (videoRef.current && canvasRef.current) {
        await startDetection(videoRef.current, canvasRef.current);
      }
    },
    stop: () => {
      stopDetection();
    },
    isActive: cameraActive,
  }));

  // Auto-start if enabled
  const handleToggle = async (isEnabled: boolean) => {
    onEnabledChange?.(isEnabled);
    
    if (isEnabled && videoRef.current && canvasRef.current) {
      await startDetection(videoRef.current, canvasRef.current);
    } else {
      stopDetection();
    }
  };

  // Get current gesture config
  const currentGestureConfig = config.gestures[currentGesture];

  if (showMiniView) {
    // Compact mini view for video player
    return (
      <div className={cn("relative", className)}>
        <Tooltip content={cameraActive ? "Đang nhận diện cử chỉ" : "Bật điều khiển cử chỉ"}>
          <Button
            isIconOnly
            size="sm"
            variant={cameraActive ? "solid" : "flat"}
            color={cameraActive ? "success" : "default"}
            className="relative overflow-hidden"
            onPress={() => handleToggle(!cameraActive)}
          >
            <IoHandRight className="text-lg" />
            {cameraActive && handDetected && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            )}
          </Button>
        </Tooltip>

        {/* Hidden video for camera feed */}
        <video
          ref={videoRef}
          className="hidden"
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          className="hidden"
          width={640}
          height={480}
        />

        {/* Mini gesture indicator */}
        {cameraActive && handDetected && currentGesture !== 'None' && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 px-3 py-1 rounded-full flex items-center gap-2 animate-fade-in">
            <span className="text-xl">{GESTURE_EMOJIS[currentGesture]}</span>
            <span className="text-xs text-white">
              {currentGestureConfig?.action ? GESTURE_ACTIONS[currentGestureConfig.action] : currentGesture}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Full debug panel view
  return (
    <Card className={cn("w-full max-w-2xl", className)}>
      <CardBody className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              cameraActive ? "bg-green-500/20 text-green-500" : "bg-gray-500/20 text-gray-500"
            )}>
              <IoHandRight className="text-2xl" />
            </div>
            <div>
              <h3 className="font-semibold">Điều khiển cử chỉ tay</h3>
              <p className="text-sm text-foreground/60">
                {cameraActive ? "Đang hoạt động" : "Chưa kích hoạt"}
              </p>
            </div>
          </div>
          
          <Switch
            isSelected={cameraActive}
            onValueChange={handleToggle}
            size="lg"
            color="success"
            thumbIcon={({ isSelected }) => 
              isSelected ? <IoCheckmark className="text-green-600" /> : <IoClose className="text-gray-400" />
            }
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-danger/20 text-danger rounded-lg">
            <IoWarning className="text-xl" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Camera preview */}
        {showDebugPanel && (
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
              playsInline
              muted
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
              width={640}
              height={480}
            />

            {/* Overlay when loading */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                <div className="text-center">
                  <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3" />
                  <p className="text-white">Đang khởi tạo MediaPipe...</p>
                </div>
              </div>
            )}

            {/* Overlay when inactive */}
            {!cameraActive && !isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                <div className="text-center">
                  <IoVideocam className="text-5xl text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400 mb-4">Bật công tắc để bắt đầu nhận diện cử chỉ</p>
                </div>
              </div>
            )}

            {/* Camera indicator */}
            {cameraActive && (
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-white text-sm font-medium">LIVE</span>
              </div>
            )}

            {/* Current gesture display */}
            {cameraActive && (
              <div className="absolute bottom-3 left-3 right-3">
                <div className="flex items-center justify-between bg-black/60 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{GESTURE_EMOJIS[currentGesture]}</span>
                    <div>
                      <p className="text-white font-semibold">
                        {currentGesture === 'None' ? 'Không nhận diện' : currentGesture.replace('_', ' ')}
                      </p>
                      {currentGestureConfig && currentGesture !== 'None' && (
                        <p className="text-sm text-gray-300">
                          {GESTURE_ACTIONS[currentGestureConfig.action] || currentGestureConfig.action}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {handDetected && (
                    <Chip
                      color={confidence > 0.8 ? "success" : confidence > 0.5 ? "warning" : "danger"}
                      variant="flat"
                    >
                      {Math.round(confidence * 100)}%
                    </Chip>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Gesture Legend */}
        {showDebugPanel && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(config.gestures).map(([name, gestureConfig]) => (
              <div
                key={name}
                className={cn(
                  "p-2 rounded-lg border text-center transition-all",
                  currentGesture === name
                    ? "border-primary bg-primary/20"
                    : "border-default-200 bg-default-50",
                  !gestureConfig.enabled && "opacity-50"
                )}
              >
                <span className="text-2xl block mb-1">{GESTURE_EMOJIS[name as GestureName]}</span>
                <span className="text-xs font-medium block truncate">
                  {GESTURE_ACTIONS[gestureConfig.action] || gestureConfig.action}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Status info */}
        <div className="flex flex-wrap gap-2">
          <Chip
            startContent={<IoVideocam className="text-sm" />}
            color={cameraActive ? "success" : "default"}
            variant="flat"
            size="sm"
          >
            Camera: {cameraActive ? "Bật" : "Tắt"}
          </Chip>
          <Chip
            startContent={<IoHandRight className="text-sm" />}
            color={handDetected ? "success" : "default"}
            variant="flat"
            size="sm"
          >
            Tay: {handDetected ? "Phát hiện" : "Không"}
          </Chip>
          <Chip
            color={isInitialized ? "success" : "warning"}
            variant="flat"
            size="sm"
          >
            MediaPipe: {isInitialized ? "Sẵn sàng" : "Chưa tải"}
          </Chip>
        </div>
      </CardBody>
    </Card>
  );
});

GestureDetector.displayName = 'GestureDetector';

export default GestureDetector;
