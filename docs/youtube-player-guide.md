# YouTube Player với Custom Controls

## 🎯 Giới thiệu

Component YouTube Player tùy chỉnh cho CineVerse, cho phép bạn kiểm soát hoàn toàn giao diện và hành vi của trình phát video YouTube.

## ✨ Tính năng

- ✅ **Custom Controls**: Giao diện controls hoàn toàn tùy chỉnh
- ✅ **Ẩn UI YouTube**: Loại bỏ controls mặc định của YouTube
- ✅ **Play/Pause**: Điều khiển phát và tạm dừng
- ✅ **Volume Control**: Điều chỉnh âm lượng và tắt tiếng
- ✅ **Progress Bar**: Thanh tiến trình tương tác
- ✅ **Skip Forward/Backward**: Tua nhanh 10 giây
- ✅ **Fullscreen**: Chế độ toàn màn hình
- ✅ **Responsive**: Tương thích mọi thiết bị
- ✅ **TypeScript**: Type-safe với TypeScript
- ✅ **Loading State**: Hiển thị trạng thái đang tải
- ✅ **Error Handling**: Xử lý lỗi tốt

## 📦 Cài đặt

Component đã được tích hợp sẵn trong CineVerse. Không cần cài đặt thêm.

## 🚀 Sử dụng cơ bản

### 1. Import component

```tsx
import YouTubePlayer from '@/components/ui/YouTubePlayer';
import '@/styles/youtube-player.css';
```

### 2. Sử dụng trong component

```tsx
export default function MyPage() {
  return (
    <YouTubePlayer
      videoId="M7lc1UVf-VE"
      autoplay={false}
      showControls={true}
    />
  );
}
```

### 3. Với các callback events

```tsx
<YouTubePlayer
  videoId="M7lc1UVf-VE"
  autoplay={false}
  showControls={true}
  onReady={() => console.log('Player sẵn sàng!')}
  onStateChange={(state) => console.log('Trạng thái:', state)}
  onError={(error) => console.error('Lỗi:', error)}
/>
```

## 📋 Props

| Prop | Type | Mặc định | Mô tả |
|------|------|----------|-------|
| `videoId` | `string` | **Required** | YouTube Video ID (phần sau "v=" trong URL) |
| `autoplay` | `boolean` | `false` | Tự động phát khi load |
| `showControls` | `boolean` | `true` | Hiển thị custom controls |
| `className` | `string` | `''` | CSS class tùy chỉnh |
| `onReady` | `() => void` | - | Callback khi player sẵn sàng |
| `onStateChange` | `(state: number) => void` | - | Callback khi trạng thái thay đổi |
| `onError` | `(error: number) => void` | - | Callback khi có lỗi |

## 🎮 Player States

```typescript
enum PlayerState {
  UNSTARTED = -1,  // Chưa bắt đầu
  ENDED = 0,       // Kết thúc
  PLAYING = 1,     // Đang phát
  PAUSED = 2,      // Tạm dừng
  BUFFERING = 3,   // Đang tải
  CUED = 5,        // Đã sẵn sàng
}
```

## 🔧 Hook useYouTubePlayer

Nếu bạn muốn tạo UI controls riêng, có thể sử dụng hook `useYouTubePlayer`:

```tsx
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer';

function MyCustomPlayer() {
  const {
    isReady,
    playerState,
    currentTime,
    duration,
    play,
    pause,
    seekTo,
    setVolume,
  } = useYouTubePlayer('my-player-id', {
    videoId: 'M7lc1UVf-VE',
    autoplay: false,
  });

  return (
    <div>
      <div id="my-player-id"></div>
      <button onClick={play}>Play</button>
      <button onClick={pause}>Pause</button>
    </div>
  );
}
```

### Hook API

| Method/Property | Type | Mô tả |
|----------------|------|-------|
| `isReady` | `boolean` | Player đã sẵn sàng chưa |
| `playerState` | `number` | Trạng thái hiện tại |
| `currentTime` | `number` | Thời gian hiện tại (giây) |
| `duration` | `number` | Tổng thời lượng (giây) |
| `volume` | `number` | Âm lượng (0-100) |
| `isMuted` | `boolean` | Đang tắt tiếng |
| `play()` | `function` | Phát video |
| `pause()` | `function` | Tạm dừng |
| `stop()` | `function` | Dừng hẳn |
| `seekTo(seconds)` | `function` | Tua đến vị trí |
| `setVolume(volume)` | `function` | Đặt âm lượng |
| `toggleMute()` | `function` | Bật/tắt tiếng |
| `togglePlayPause()` | `function` | Chuyển play/pause |

## 🎨 Tùy chỉnh Styling

### Sử dụng className

```tsx
<YouTubePlayer
  videoId="M7lc1UVf-VE"
  className="max-w-4xl mx-auto shadow-2xl rounded-xl"
/>
```

### Override CSS

Tạo file CSS riêng và override:

```css
/* my-custom-player.css */
.youtube-player-controls {
  background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
  padding: 2rem;
}

.slider-thumb::-webkit-slider-thumb {
  background: #your-brand-color;
}
```

## 📱 Responsive Design

Component tự động responsive và tối ưu cho:

- 📱 Mobile (< 640px)
- 💻 Tablet (640px - 1024px)
- 🖥️ Desktop (> 1024px)

## 🎭 Demo Page

Truy cập trang demo để xem các ví dụ:

```
http://localhost:3000/youtube-demo
```

Hoặc chạy development server:

```bash
npm run dev
```

## 🔑 Lấy YouTube Video ID

Video ID là phần sau `v=` trong URL YouTube:

```
https://www.youtube.com/watch?v=M7lc1UVf-VE
                                 ↑
                         Video ID ở đây
```

## ⚙️ Advanced Usage

### Tạo Playlist

```tsx
function PlaylistPlayer() {
  const [videos, setVideos] = useState([
    { id: 'video1', title: 'Song 1' },
    { id: 'video2', title: 'Song 2' },
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div>
      <YouTubePlayer
        videoId={videos[currentIndex].id}
        onStateChange={(state) => {
          if (state === 0) { // Ended
            setCurrentIndex((prev) => (prev + 1) % videos.length);
          }
        }}
      />
      {/* Playlist UI */}
    </div>
  );
}
```

### Sync với External State

```tsx
function SyncedPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <YouTubePlayer
      videoId="M7lc1UVf-VE"
      onStateChange={(state) => {
        setIsPlaying(state === 1); // 1 = PLAYING
      }}
    />
  );
}
```

## 🐛 Troubleshooting

### Player không hiển thị

- Kiểm tra Video ID có đúng không
- Kiểm tra kết nối internet
- Xem console log để kiểm tra lỗi

### Controls không hoạt động

- Đảm bảo `showControls={true}`
- Kiểm tra CSS đã được import
- Xem player state trong dev mode

### Video không tự động phát

- Một số trình duyệt chặn autoplay
- Cần user interaction trước khi autoplay
- Thử tắt `autoplay` và dùng button play

## 📄 License

MIT License - Sử dụng tự do trong dự án CineVerse

## 🤝 Đóng góp

Nếu bạn tìm thấy bug hoặc muốn đề xuất tính năng mới, vui lòng tạo issue hoặc pull request.

## 📞 Hỗ trợ

Liên hệ team CineVerse để được hỗ trợ kỹ thuật.

---

Made with ❤️ for **CineVerse** by An Kun Studio
