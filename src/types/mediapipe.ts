// Định nghĩa kiểu dữ liệu MediaPipe Hand Detection
declare global {
  interface Window {
    Hands: any;
    HAND_CONNECTIONS: Array<[number, number]>;
    drawingUtils: any;
  }
}

/**
 * Giao diện cho một điểm khớp trên tay
 */
export interface HandLandmark {
  x: number; // Tọa độ X (0-1)
  y: number; // Tọa độ Y (0-1)
  z: number; // Tọa độ Z (độ sâu)
  visibility?: number; // Điểm số độ tin cậy
}

/**
 * Giao diện cho kết quả phát hiện tay
 */
export interface HandDetectionResult {
  multiHandLandmarks?: HandLandmark[][];
  multiHandedness?: Array<{
    label: "Left" | "Right";
    score: number;
  }>;
  image?: any;
}

/**
 * Giao diện cho thống kê phát hiện cử chỉ
 */
export interface GestureDetectionStats {
  fps: number; // Khung hình mỗi giây
  detectedHands: number; // Số tay được phát hiện
  landmarks: number; // Số điểm khớp
  gestures: string[]; // Danh sách cử chỉ được phát hiện
}

export {};
