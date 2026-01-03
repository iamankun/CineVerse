import { HandLandmark } from "@/types/mediapipe";

/**
 * Kiểm tra xem ngón tay có duỗi ra không dựa trên landmarks
 * @param landmarks - Mảng các điểm khớp trên tay
 * @param tipIndex - Chỉ số đầu ngón tay
 * @param pipIndex - Chỉ số khớp PIP (Proximal Interphalangeal)
 * @returns true nếu ngón tay duỗi ra, false nếu không
 */
export const isFingerExtended = (
  landmarks: HandLandmark[],
  tipIndex: number,
  pipIndex: number
): boolean => {
  return landmarks[tipIndex].y < landmarks[pipIndex].y;
};

/**
 * Kiểm tra xem ngón cái có duỗi ra không
 * @param landmarks - Mảng các điểm khớp trên tay
 * @returns true nếu ngón cái duỗi ra, false nếu không
 */
export const isThumbExtended = (landmarks: HandLandmark[]): boolean => {
  // Ngón cái: so sánh vị trí 4 (tip) với vị trí 3 (PIP) theo chiều ngang
  return landmarks[4].x < landmarks[3].x;
};

/**
 * Phát hiện cử chỉ từ landmarks tay
 * @param multiHandLandmarks - Mảng landmarks của các tay được phát hiện
 * @returns Mảng cứng các cử chỉ được phát hiện
 */
export const detectGestures = (
  multiHandLandmarks: HandLandmark[][]
): string[] => {
  const gestures: string[] = [];

  if (!multiHandLandmarks || multiHandLandmarks.length === 0) {
    return gestures;
  }

  const landmarks = multiHandLandmarks[0]; // Tay đầu tiên

  // Kiểm tra các ngón tay duỗi ra
  const thumbExtended = isThumbExtended(landmarks);
  const indexExtended = isFingerExtended(landmarks, 8, 6);
  const middleExtended = isFingerExtended(landmarks, 12, 10);
  const ringExtended = isFingerExtended(landmarks, 16, 14);
  const pinkyExtended = isFingerExtended(landmarks, 20, 18);

  // Các cử chỉ có thể phát hiện

  // Cử chỉ như coi chừng (Thumbs Up): chỉ ngón cái duỗi
  if (
    thumbExtended &&
    !indexExtended &&
    !middleExtended &&
    !ringExtended &&
    !pinkyExtended
  ) {
    gestures.push("👍 Đúng");
  }

  // Nắm tay (Closed Fist): không có ngón tay nào duỗi
  if (
    !indexExtended &&
    !middleExtended &&
    !ringExtended &&
    !pinkyExtended
  ) {
    gestures.push("✊ Nắm tay");
  }

  // Dấu hòa bình (Victory Sign): ngón trỏ và ngón giữa duỗi
  if (
    indexExtended &&
    middleExtended &&
    !ringExtended &&
    !pinkyExtended
  ) {
    gestures.push("✌️ V");
  }

  // Mở tay (Open Hand): tất cả ngón tay duỗi
  if (
    indexExtended &&
    middleExtended &&
    ringExtended &&
    pinkyExtended
  ) {
    gestures.push("🖐️ Mở tay");
  }

  // Dừng lại (Stop Hand): tất cả ngón tay và ngón cái duỗi
  if (
    thumbExtended &&
    indexExtended &&
    middleExtended &&
    ringExtended &&
    pinkyExtended
  ) {
    gestures.push("✋ Dừng lại");
  }

  // Rock: ngón trỏ và ngón út duỗi
  if (
    indexExtended &&
    !middleExtended &&
    !ringExtended &&
    pinkyExtended
  ) {
    gestures.push("🤘 Rock");
  }

  // Dấu Ok: ngón cái và ngón trỏ gần nhau
  if (thumbExtended && indexExtended && !middleExtended) {
    gestures.push("👌 Ok");
  }

  // Tình yêu/ILY: ngón trỏ, ngón giữa và ngón út duỗi
  if (indexExtended && middleExtended && !ringExtended && pinkyExtended) {
    gestures.push("🤟 Yêu");
  }

  return gestures;
};

/**
 * Vẽ landmarks tay và các kết nối trên canvas
 * @param ctx - Ngữ cảnh vẽ canvas
 * @param landmarks - Mảng các điểm khớp trên tay
 * @param handedness - Nhãn tay ("Left" hoặc "Right")
 * @param canvasWidth - Chiều rộng canvas
 * @param canvasHeight - Chiều cao canvas
 */
export const drawHandLandmarks = (
  ctx: CanvasRenderingContext2D,
  landmarks: HandLandmark[],
  handedness: "Left" | "Right",
  canvasWidth: number,
  canvasHeight: number
): void => {
  // Định nghĩa các kết nối giữa landmarks (xương)
  const connections = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4], // Ngón cái
    [0, 5],
    [5, 6],
    [6, 7],
    [7, 8], // Ngón trỏ
    [0, 9],
    [9, 10],
    [10, 11],
    [11, 12], // Ngón giữa
    [0, 13],
    [13, 14],
    [14, 15],
    [15, 16], // Ngón tay áp lực
    [0, 17],
    [17, 18],
    [18, 19],
    [19, 20], // Ngón út
  ];

  // Vẽ các kết nối
  ctx.strokeStyle = handedness === "Left" ? "#00FF00" : "#0000FF";
  ctx.lineWidth = 2;

  connections.forEach(([start, end]) => {
    const startX = landmarks[start].x * canvasWidth;
    const startY = landmarks[start].y * canvasHeight;
    const endX = landmarks[end].x * canvasWidth;
    const endY = landmarks[end].y * canvasHeight;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  });

  // Vẽ các landmarks (khớp)
  landmarks.forEach((landmark, index) => {
    const x = landmark.x * canvasWidth;
    const y = landmark.y * canvasHeight;

    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fillStyle =
      index === 0 ? "#FF0000" : handedness === "Left" ? "#00FF00" : "#0000FF";
    ctx.fill();

    // Vẽ nhãn
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "10px Arial";
    ctx.fillText(index.toString(), x + 8, y + 8);
  });
};

/**
 * Tải mô hình MediaPipe Hand Landmarker (phiên bản mới)
 * @returns Promise giải quyết khi mô hình được tải
 */
export const loadMediaPipeHands = async (): Promise<any> => {
  return new Promise((resolve, reject) => {
    try {
      console.log("📦 Bắt đầu tải MediaPipe Hands...");

      // Kiểm tra nếu Hands đã tồn tại
      const existingHands = (window as any).Hands;
      if (existingHands) {
        console.log("✓ Hands đã tồn tại, khởi tạo...");
        const hands = new existingHands({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@latest/${file}`;
          },
        });

        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        console.log("✓ Hands khởi tạo thành công");
        resolve(hands);
        return;
      }

      // Tải DrawingUtils trước
      const drawingScript = document.createElement("script");
      drawingScript.src = "https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils@latest/drawing_utils.js";
      drawingScript.async = true;
      drawingScript.crossOrigin = "anonymous";

      drawingScript.onload = () => {
        console.log("✓ DrawingUtils tải thành công");

        // Tải Hands script
        const handsScript = document.createElement("script");
        handsScript.src = "https://cdn.jsdelivr.net/npm/@mediapipe/hands@latest/hands.js";
        handsScript.async = true;
        handsScript.crossOrigin = "anonymous";

        handsScript.onload = () => {
          console.log("✓ Hands tải thành công");

          try {
            const { Hands } = window as any;
            if (!Hands) {
              throw new Error("Không tìm thấy đối tượng Hands sau khi tải");
            }

            const hands = new Hands({
              locateFile: (file: string) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@latest/${file}`;
              },
            });

            hands.setOptions({
              maxNumHands: 2,
              modelComplexity: 1,
              minDetectionConfidence: 0.5,
              minTrackingConfidence: 0.5,
            });

            console.log("✓ Hands khởi tạo thành công");
            resolve(hands);
          } catch (err) {
            const errorMsg = `Lỗi khởi tạo Hands: ${err instanceof Error ? err.message : String(err)}`;
            console.error(errorMsg);
            reject(new Error(errorMsg));
          }
        };

        handsScript.onerror = () => {
          const errorMsg = "Lỗi tải Hands từ CDN - Kiểm tra kết nối mạng";
          console.error(errorMsg);
          reject(new Error(errorMsg));
        };

        document.body.appendChild(handsScript);
      };

      drawingScript.onerror = () => {
        const errorMsg = "Lỗi tải DrawingUtils từ CDN - Kiểm tra kết nối mạng";
        console.error(errorMsg);
        reject(new Error(errorMsg));
      };

      console.log("📝 Tải DrawingUtils...");
      document.body.appendChild(drawingScript);

    } catch (err) {
      const errorMsg = `Lỗi không mong muốn: ${err instanceof Error ? err.message : String(err)}`;
      console.error(errorMsg);
      reject(new Error(errorMsg));
    }
  });
};

/**
 * Tính toán FPS từ số khung hình và thời gian
 * @param frameCount - Số khung hình đã xử lý
 * @param elapsedMs - Thời gian trôi qua tính bằng mili giây
 * @returns Giá trị FPS
 */
export const calculateFPS = (frameCount: number, elapsedMs: number): number => {
  if (elapsedMs === 0) return 0;
  return Math.round((frameCount * 1000) / elapsedMs);
};
