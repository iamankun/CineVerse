# Tính năng Điều khiển Cử chỉ Tay - CineVerse v1.4.0

## 📋 Tổng quan

Tính năng điều khiển video bằng cử chỉ tay sử dụng công nghệ **MediaPipe Gesture Recognizer** của Google AI Edge, cho phép người dùng điều khiển trình phát video mà không cần chạm vào màn hình.

## 🎯 Các cử chỉ được hỗ trợ

| Cử chỉ | Emoji | Hành động mặc định | Mô tả |
|--------|-------|-------------------|-------|
| Open Palm | 🖐️ | Play | Mở bàn tay - Phát video |
| Closed Fist | ✊ | Pause | Nắm tay - Tạm dừng video |
| Thumb Up | 👍 | Volume Up | Ngón cái lên - Tăng âm lượng |
| Thumb Down | 👎 | Volume Down | Ngón cái xuống - Giảm âm lượng |
| Victory | ✌️ | Toggle Fullscreen | Hai ngón - Toàn màn hình |
| Pointing Up | 👆 | Forward 10s | Trỏ lên - Tua tiến 10 giây |
| ILoveYou | 🤟 | Favorite | Yêu thích - Thêm vào danh sách |

## 🔧 Cài đặt

### Yêu cầu
- Thiết bị có webcam/camera
- Quyền truy cập camera từ trình duyệt
- Trình duyệt hỗ trợ WebGL (Chrome, Firefox, Edge, Safari)

### Các tệp đã thêm
```
src/
├── app/
│   ├── admin/
│   │   ├── gesture-config.json     # Cấu hình cử chỉ
│   │   └── gestures/
│   │       └── page.tsx            # Trang quản lý cử chỉ
│   └── api/
│       └── admin/
│           └── gesture-config/
│               └── route.ts        # API route
├── components/
│   └── ui/
│       └── gesture/
│           └── GestureDetector.tsx # Component nhận diện
├── hooks/
│   └── useGestureControl.ts        # Hook xử lý cử chỉ
└── types/
    └── gesture.ts                  # TypeScript types
```

## 💻 Sử dụng

### Trong Video Player

1. **Bật tính năng**: Nhấn vào nút 👋 ở góc phải màn hình player
2. **Cấp quyền camera**: Cho phép trình duyệt truy cập webcam
3. **Sử dụng cử chỉ**: Đưa tay vào camera và thực hiện cử chỉ

### Trong Admin Dashboard

1. Truy cập `/admin/gestures`
2. Bật/tắt tính năng điều khiển cử chỉ
3. Cấu hình:
   - Ngưỡng độ tin cậy (0.3 - 0.95)
   - Độ trễ giữa các cử chỉ (100 - 2000ms)
   - Bật/tắt từng cử chỉ riêng biệt
   - Thay đổi hành động cho mỗi cử chỉ

## ⚙️ Cấu hình (gesture-config.json)

```json
{
  "enabled": false,
  "showDebugOverlay": true,
  "confidenceThreshold": 0.7,
  "gestureDelay": 500,
  "gestures": {
    "Open_Palm": {
      "enabled": true,
      "action": "play",
      "description": "Mở bàn tay - Phát video"
    }
    // ...
  }
}
```

### Các tùy chọn cấu hình

| Thuộc tính | Mô tả | Giá trị |
|------------|-------|---------|
| `enabled` | Bật/tắt tính năng | `true/false` |
| `showDebugOverlay` | Hiển thị landmarks debug | `true/false` |
| `confidenceThreshold` | Ngưỡng độ tin cậy | `0.0 - 1.0` |
| `gestureDelay` | Độ trễ giữa cử chỉ (ms) | `100 - 2000` |

## 🎬 Các hành động hỗ trợ

- `play` - Phát video
- `pause` - Tạm dừng
- `togglePlay` - Phát/Dừng
- `volumeUp` - Tăng âm lượng
- `volumeDown` - Giảm âm lượng
- `forward` - Tua tiến 10s
- `rewind` - Tua lùi 10s
- `toggleFullscreen` - Chuyển đổi toàn màn hình
- `favorite` - Thêm vào yêu thích
- `none` - Không làm gì

## 📦 Dependencies

```json
{
  "@mediapipe/tasks-vision": "^latest"
}
```

## 🔒 Bảo mật

- Camera chỉ hoạt động khi người dùng chủ động bật
- Video từ camera không được gửi đi đâu, chỉ xử lý local
- Tất cả nhận diện chạy trên thiết bị của người dùng (on-device AI)

## 🐛 Xử lý lỗi

### Camera không hoạt động
- Kiểm tra quyền camera trong trình duyệt
- Đảm bảo không có ứng dụng khác đang sử dụng camera
- Thử refresh trang và cấp quyền lại

### Nhận diện không chính xác
- Đảm bảo đủ ánh sáng
- Đặt tay cách camera 30-60cm
- Giữ tay ổn định khi thực hiện cử chỉ
- Tăng `confidenceThreshold` để giảm false positive

## 📱 Tương thích

| Nền tảng | Hỗ trợ |
|----------|--------|
| Chrome Desktop | ✅ |
| Firefox Desktop | ✅ |
| Safari Desktop | ✅ |
| Edge Desktop | ✅ |
| Chrome Mobile | ⚠️ (có thể chậm) |
| Safari iOS | ⚠️ (có thể chậm) |

## 🚀 Roadmap

- [ ] Hỗ trợ custom gestures training
- [ ] Gesture shortcuts cho từng phim
- [ ] Voice + Gesture combo commands
- [ ] Gesture recording & playback
