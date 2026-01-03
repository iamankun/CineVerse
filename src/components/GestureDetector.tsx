"use client";

import React, { useRef, useEffect, useState } from "react";
import { Spinner, Button, Chip } from "@heroui/react";
import { IoPlay, IoStop, IoRefresh } from "react-icons/io5";
import {
  detectGestures,
  drawHandLandmarks,
  loadMediaPipeHands,
  calculateFPS,
} from "@/utils/gesture";
import { HandLandmark, GestureDetectionStats } from "@/types/mediapipe";

/**
 * Component phát hiện cử chỉ tay bằng MediaPipe Hands
 */
export default function GestureDetector() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<GestureDetectionStats>({
    fps: 0,
    detectedHands: 0,
    landmarks: 0,
    gestures: [],
  });

  const handDetectorRef = useRef<any>(null);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(Date.now());

  // Tải mô hình MediaPipe
  useEffect(() => {
    const loadModel = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const hands = await loadMediaPipeHands();
        hands.onResults(onResults);
        handDetectorRef.current = hands;

        setIsLoading(false);
        setError(null);
      } catch (err: any) {
        console.error("Lỗi tải MediaPipe:", err);
        setError(
          `Lỗi tải MediaPipe: ${err.message || "Không xác định được lỗi"}`
        );
        setIsLoading(false);
      }
    };

    loadModel();

    return () => {
      // Dọn dẹp
      if (handDetectorRef.current) {
        try {
          handDetectorRef.current.close();
        } catch (err) {
          console.warn("Lỗi khi đóng Hands detector:", err);
        }
      }
    };
  }, []);

  // Khởi tạo camera
  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsRunning(true);
        setError(null);
      }
    } catch (err: any) {
      setError(`Lỗi truy cập camera: ${err.message}`);
      setIsRunning(false);
    }
  };

  // Dừng camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      setIsRunning(false);
    }
  };

  // Xử lý kết quả phát hiện
  const onResults = (results: any) => {
    if (!canvasRef.current || !videoRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;

    // Đảm bảo canvas có kích thước đúng
    if (video.videoWidth > 0 && video.videoHeight > 0) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    // Vẽ video frame vào canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Tính toán FPS
    frameCountRef.current++;
    const now = Date.now();
    const elapsed = now - lastTimeRef.current;

    if (elapsed >= 1000) {
      const fps = calculateFPS(frameCountRef.current, elapsed);
      frameCountRef.current = 0;
      lastTimeRef.current = now;

      setStats((prev) => ({
        ...prev,
        fps,
      }));
    }

    // Vẽ landmarks
    if (
      results.multiHandLandmarks &&
      Array.isArray(results.multiHandLandmarks) &&
      results.multiHandLandmarks.length > 0
    ) {
      const detectedGestures: string[] = [];

      results.multiHandLandmarks.forEach(
        (landmarks: HandLandmark[], handIndex: number) => {
          const handedness = results.multiHandedness?.[handIndex];

          // Vẽ landmarks tay
          drawHandLandmarks(
            ctx,
            landmarks,
            handedness.label,
            canvas.width,
            canvas.height
          );

          // Phát hiện cử chỉ
          const handGestures = detectGestures(results.multiHandLandmarks);
          detectedGestures.push(...handGestures);

          // Vẽ nhãn tay
          ctx.fillStyle =
            handedness.label === "Left" ? "#00FF00" : "#0000FF";
          ctx.font = "bold 20px Arial";
          ctx.fillText(
            `${handedness.label} Hand (${(handedness.score * 100).toFixed(1)}%)`,
            20,
            handIndex * 40 + 40
          );
        }
      );

      setStats((prev) => ({
        ...prev,
        detectedHands: results.multiHandLandmarks.length,
        landmarks: results.multiHandLandmarks[0]?.length || 0,
        gestures: detectedGestures,
      }));
    } else {
      setStats((prev) => ({
        ...prev,
        detectedHands: 0,
        landmarks: 0,
        gestures: [],
      }));
    }
  };

  // Xử lý khung hình video (cho HandLandmarker)
  useEffect(() => {
    if (!isRunning || !handDetectorRef.current || !videoRef.current) return;

    let frameId: number;
    let lastTimestamp = 0;

    const processFrame = async (timestamp: number) => {
      try {
        // Giới hạn FPS ở ~30fps để tránh quá tải
        if (timestamp - lastTimestamp < 33) {
          frameId = requestAnimationFrame(processFrame);
          return;
        }
        lastTimestamp = timestamp;

        if (!handDetectorRef.current) {
          frameId = requestAnimationFrame(processFrame);
          return;
        }

        const result = await handDetectorRef.current.detectForVideo(
          videoRef.current,
          timestamp
        );

        // Gọi onResults với format tương thích
        onResults({
          multiHandLandmarks: result?.landmarks || [],
          multiHandedness: result?.handedness || [],
        });
      } catch (err) {
        console.error("Lỗi xử lý khung hình:", err);
        setError(
          `Lỗi phát hiện cử chỉ: ${err instanceof Error ? err.message : String(err)}`
        );
      }

      frameId = requestAnimationFrame(processFrame);
    };

    frameId = requestAnimationFrame(processFrame);

    return () => cancelAnimationFrame(frameId);
  }, [isRunning]);

  return (
    <div ref={containerRef} className="w-full space-y-4">
      {/* Thông báo lỗi */}
      {error && (
        <div className="space-y-3 rounded-lg bg-red-900/30 p-4 text-red-300 border border-red-700">
          <p className="font-semibold">❌ Lỗi: {error}</p>
          <div className="text-sm space-y-1">
            <p>💡 Kiểm tra:</p>
            <ul className="list-disc list-inside">
              <li>Kết nối internet có bình thường không?</li>
              <li>CDN jsdelivr.net có thể truy cập không?</li>
              <li>Thử làm mới trang (F5)</li>
              <li>Xóa cache trình duyệt và thử lại</li>
            </ul>
          </div>
        </div>
      )}

      {/* Trạng thái tải */}
      {isLoading && (
        <div className="flex items-center justify-center gap-3 rounded-lg bg-gray-700/50 py-8">
          <Spinner size="lg" color="current" />
          <span className="text-gray-300">Đang tải MediaPipe Hands...</span>
        </div>
      )}

      {/* Hiển thị video */}
      {!isLoading && (
        <div className="relative w-full overflow-hidden rounded-lg border-2 border-gray-700 bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-auto object-contain"
          />
          <canvas
            ref={canvasRef}
            width={1280}
            height={720}
            className="absolute top-0 left-0 w-full"
            style={{ background: "transparent" }}
          />

          {/* Overlay trạng thái */}
          {isRunning && (
            <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-lg bg-green-900/80 px-3 py-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
              <span className="text-sm font-semibold text-green-300">
                Đang phát hiện ({stats.fps} FPS)
              </span>
            </div>
          )}
        </div>
      )}

      {/* Nút điều khiển */}
      <div className="flex gap-3">
        {!isRunning ? (
          <Button
            color="success"
            startContent={<IoPlay />}
            onClick={initializeCamera}
            disabled={isLoading}
          >
            Bắt Đầu Camera
          </Button>
        ) : (
          <Button color="danger" startContent={<IoStop />} onClick={stopCamera}>
            Dừng Camera
          </Button>
        )}
        <Button
          variant="bordered"
          startContent={<IoRefresh />}
          onClick={() => {
            stopCamera();
            setStats({
              fps: 0,
              detectedHands: 0,
              landmarks: 0,
              gestures: [],
            });
          }}
        >
          Khôi Phục
        </Button>
      </div>

      {/* Thống kê */}
      {!isLoading && (
        <div className="space-y-4 rounded-lg bg-gray-700/30 p-4">
          {/* Thống kê hiệu suất */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg bg-gray-700/50 p-3 text-center">
              <p className="text-xs text-gray-400">FPS</p>
              <p className="text-2xl font-bold text-cyan-400">
                {stats.fps}
              </p>
            </div>
            <div className="rounded-lg bg-gray-700/50 p-3 text-center">
              <p className="text-xs text-gray-400">Tay Được Phát Hiện</p>
              <p className="text-2xl font-bold text-green-400">
                {stats.detectedHands}
              </p>
            </div>
            <div className="rounded-lg bg-gray-700/50 p-3 text-center">
              <p className="text-xs text-gray-400">Điểm Khớp</p>
              <p className="text-2xl font-bold text-purple-400">
                {stats.landmarks}
              </p>
            </div>
            <div className="rounded-lg bg-gray-700/50 p-3 text-center">
              <p className="text-xs text-gray-400">Trạng Thái</p>
              <p className="text-lg font-bold text-yellow-400">
                {isRunning ? "Chạy" : "Dừng"}
              </p>
            </div>
          </div>

          {/* Cử chỉ được phát hiện */}
          {stats.gestures.length > 0 && (
            <div className="rounded-lg bg-gradient-to-r from-cyan-900/30 to-blue-900/30 p-4">
              <p className="mb-2 text-sm font-semibold text-cyan-400">
                Cử Chỉ Được Phát Hiện:
              </p>
              <div className="flex flex-wrap gap-2">
                {stats.gestures.map((gesture, idx) => (
                  <Chip
                    key={idx}
                    color="secondary"
                    variant="flat"
                    className="text-sm font-semibold"
                  >
                    {gesture}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {/* Thông tin Landmarks */}
          {stats.landmarks > 0 && (
            <div className="rounded-lg border border-purple-700/50 bg-purple-900/20 p-3">
              <p className="text-sm text-purple-300">
                <span className="font-semibold">Landmarks Được Phát Hiện:</span>{" "}
                {stats.landmarks} điểm khớp trên mỗi tay{" "}
                <span className="text-xs text-purple-400">
                  (Đỏ = Gốc, Xanh = Tay phải, Xanh lá = Tay trái)
                </span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Hộp thông tin */}
      <div className="rounded-lg border border-blue-700/50 bg-blue-900/20 p-4 text-sm text-blue-300">
        <p>
          💡 <span className="font-semibold">Ghi chú:</span> Hệ thống sẽ phát
          hiện và theo dõi tối đa 2 tay cùng lúc. Mỗi tay bao gồm 21 điểm
          khớp. Cho phép truy cập camera để bắt đầu.
        </p>
      </div>
    </div>
  );
}
