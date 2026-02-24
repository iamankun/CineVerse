# TrinhDieuKhien - Trình Điều Khiển Mới

## Overview

`TrinhDieuKhien` là một component điều khiển mới được thiết kế để đặt ở góc trên bên phải của player. Nó có các tính năng sau:

- **Vị trí**: Góc trên bên phải của trang (fixed positioning)
- **Chế độ ẩn/hiện**: Tự động ẩn sau 4 giây không tương tác
- **Motion Design**: Hiệu ứng chuyển động mượt mà và microinteractions
- **Responsive**: Tương thích với cả desktop và mobile

## Features

### Các nút điều khiển có sẵn:
1. **Nguồn phát** - Mở lựa chọn nguồn phát
2. **Âm thanh** - Bật/tắt âm thanh với icon thay đổi theo trạng thái
3. **Cài đặt** - Mở menu cài đặt
4. **Toàn màn hình** - Bật/tắt chế độ fullscreen
5. **Làm mới** - Reload player

### Motion Design & Microinteractions:
- **Hover effects**: Scale, rotate, và glow effects
- **Smooth transitions**: Các animation mượt mà khi mở/đóng
- **Staggered animations**: Các nút xuất hiện lần lượt với độ trễ
- **Pulsing ring effect**: Hiệu ứng vòng xoáy xung quanh nút chính
- **Gradient backgrounds**: Nền gradient động thay đổi theo hover
- **Tooltips**: Hiển thị tên chức năng khi hover

## Installation

Component đã được tạo tại: `src/components/ui/other/TrinhDieuKhien.tsx`

## Usage

### Basic Usage

```tsx
import TrinhDieuKhien from '@/components/ui/other/TrinhDieuKhien';

function MyPlayer() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={playerContainerRef} className="relative w-full h-screen">
      {/* Player content */}
      
      <TrinhDieuKhien
        onOpenSource={() => console.log('Open source')}
        onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
        onReload={() => console.log('Reload')}
        onToggleSound={() => setIsMuted(!isMuted)}
        onSettings={() => console.log('Settings')}
        isFullscreen={isFullscreen}
        isMuted={isMuted}
        playerContainerRef={playerContainerRef}
      />
    </div>
  );
}
```

### Integration with existing Player

Để tích hợp vào Movie Player hiện tại:

```tsx
// Trong file Player.tsx
import TrinhDieuKhien from '@/components/ui/other/TrinhDieuKhien';

// Thêm vào component return
<TrinhDieuKhien
  onOpenSource={handlers.open}
  onToggleFullscreen={gestureCallbacks.onToggleFullscreen}
  onReload={gestureCallbacks.onReload}
  onToggleSound={yourSoundToggleHandler}
  onSettings={yourSettingsHandler}
  isFullscreen={isFullscreen}
  isMuted={isMuted}
  playerContainerRef={playerContainerRef}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onOpenSource` | `() => void` | `undefined` | Handler cho nút nguồn phát |
| `onToggleFullscreen` | `() => void` | `undefined` | Handler cho nút fullscreen |
| `onReload` | `() => void` | `undefined` | Handler cho nút reload |
| `onToggleSound` | `() => void` | `undefined` | Handler cho nút âm thanh |
| `onSettings` | `() => void` | `undefined` | Handler cho nút cài đặt |
| `isFullscreen` | `boolean` | `false` | Trạng thái fullscreen |
| `isMuted` | `boolean` | `false` | Trạng thái âm thanh |
| `playerContainerRef` | `RefObject<HTMLDivElement>` | `undefined` | Ref đến container của player |

## Customization

### Colors
Mỗi nút có màu gradient riêng:
- **Nguồn phát**: Blue gradient
- **Âm thanh**: Green/Red gradient (tùy trạng thái)
- **Cài đặt**: Purple gradient
- **Toàn màn hình**: Amber gradient
- **Làm mới**: Orange gradient
- **Nút chính**: Indigo-Purple-Pink gradient

### Animations
- **Duration**: 300ms cho chính, 250ms cho các nút con
- **Easing**: easeOut, backOut
- **Delays**: 50ms stagger cho các nút con

## Dependencies

Component yêu cầu các packages sau:
- `framer-motion` - Cho animations
- `react-icons` - Cho icons
- Các hooks từ project: `useBreakpoints`, `useGestureContext`

## Notes

- Component tự động ẩn sau 4 giây không tương tác
- Khi mở rộng menu, component sẽ không tự ẩn
- Tương thích với gesture context của project
- Sử dụng backdrop-blur cho hiệu ứng glassmorphism
- Fixed positioning để luôn hiển thị trên cùng
