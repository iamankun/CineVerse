# Custom YouTube Player - Tổng quan tính năng

## 📁 Cấu trúc Files đã tạo

```
src/
├── hooks/
│   └── useYouTubePlayer.ts          # Hook quản lý YouTube IFrame API
├── components/
│   └── ui/
│       ├── YouTubePlayer.tsx         # Component player cơ bản
│       └── YouTubePlaylistPlayer.tsx # Component playlist player
├── styles/
│   └── youtube-player.css           # CSS tùy chỉnh cho player
└── app/
    ├── youtube-demo/
    │   └── page.tsx                 # Demo trang player cơ bản
    └── playlist-demo/
        └── page.tsx                 # Demo trang playlist player

docs/
└── youtube-player-guide.md          # Hướng dẫn chi tiết
```

## ✨ Tính năng chính

### 1. 🎮 Custom YouTube Player (`YouTubePlayer.tsx`)

**Tính năng:**
- ✅ Play/Pause với nút custom
- ✅ Volume control với slider
- ✅ Mute/Unmute
- ✅ Progress bar tương tác
- ✅ Skip backward/forward (10s)
- ✅ Fullscreen mode
- ✅ Loading state
- ✅ Error handling
- ✅ Time display (current/total)
- ✅ Ẩn hoàn toàn controls của YouTube

**Props:**
```typescript
interface YouTubePlayerProps {
  videoId: string;           // Required - YouTube Video ID
  autoplay?: boolean;        // Tự động phát
  showControls?: boolean;    // Hiển thị custom controls
  className?: string;        // CSS class
  onReady?: () => void;      // Callback khi sẵn sàng
  onStateChange?: (state: number) => void;
  onError?: (error: number) => void;
}
```

**Cách dùng:**
```tsx
import YouTubePlayer from '@/components/ui/YouTubePlayer';

<YouTubePlayer
  videoId="M7lc1UVf-VE"
  autoplay={false}
  showControls={true}
  onReady={() => console.log('Ready!')}
/>
```

### 2. 🎵 Playlist Player (`YouTubePlaylistPlayer.tsx`)

**Tính năng:**
- ✅ Quản lý danh sách nhiều video
- ✅ Auto-next khi video kết thúc
- ✅ Loop playlist
- ✅ Sidebar với danh sách video
- ✅ Click vào video để chuyển
- ✅ Hiển thị video đang phát
- ✅ Navigation controls (Next/Previous)
- ✅ Responsive design

**Props:**
```typescript
interface YouTubePlaylistPlayerProps {
  videos: VideoItem[];       // Danh sách video
  autoplay?: boolean;        // Tự động phát
  loop?: boolean;            // Lặp lại playlist
  className?: string;
  onVideoChange?: (video: VideoItem, index: number) => void;
}

interface VideoItem {
  id: string;                // YouTube Video ID
  title: string;             // Tiêu đề
  artist?: string;           // Nghệ sĩ
  thumbnail?: string;        // Ảnh thumbnail
  duration?: string;         // Thời lượng
}
```

**Cách dùng:**
```tsx
import YouTubePlaylistPlayer from '@/components/ui/YouTubePlaylistPlayer';

const videos = [
  { id: 'video1', title: 'Song 1', artist: 'Artist A' },
  { id: 'video2', title: 'Song 2', artist: 'Artist B' },
];

<YouTubePlaylistPlayer
  videos={videos}
  loop={true}
  onVideoChange={(video) => console.log(video.title)}
/>
```

### 3. 🎣 Custom Hook (`useYouTubePlayer.ts`)

**API Methods:**
```typescript
const {
  isReady,           // boolean - Player sẵn sàng
  playerState,       // number - Trạng thái hiện tại
  currentTime,       // number - Thời gian hiện tại (s)
  duration,          // number - Tổng thời lượng (s)
  volume,            // number - Âm lượng (0-100)
  isMuted,           // boolean - Đang mute
  play,              // () => void
  pause,             // () => void
  stop,              // () => void
  seekTo,            // (seconds: number) => void
  setVolume,         // (volume: number) => void
  toggleMute,        // () => void
  togglePlayPause,   // () => void
} = useYouTubePlayer('player-id', options);
```

**Player States:**
```typescript
enum PlayerState {
  UNSTARTED = -1,
  ENDED = 0,
  PLAYING = 1,
  PAUSED = 2,
  BUFFERING = 3,
  CUED = 5,
}
```

## 🎨 Design Features

### Colors
- Primary: `#ef4444` (Red)
- Background: Gradient black
- Text: White với các mức opacity

### Animations
- Smooth transitions (0.3s)
- Hover effects trên buttons
- Loading spinner
- Progress bar animation

### Responsive
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 🚀 Demo Pages

### 1. Basic Player Demo
**URL:** `/youtube-demo`

Tính năng:
- Player cơ bản với full controls
- Danh sách video demo
- Input custom Video ID
- Hướng dẫn sử dụng
- Code examples

### 2. Playlist Demo
**URL:** `/playlist-demo`

Tính năng:
- Playlist với 5 video mẫu
- Auto-next và loop
- Sidebar với danh sách
- Use cases cho An Kun Studio

## 📋 Use Cases cho An Kun Studio

### 1. Album Release
```tsx
const albumSongs = [
  { id: 'video1', title: 'Track 1', artist: 'Artist Name' },
  { id: 'video2', title: 'Track 2', artist: 'Artist Name' },
  // ...
];

<YouTubePlaylistPlayer videos={albumSongs} loop={true} />
```

### 2. Top Hits Collection
```tsx
const topHits = await fetchTopHits(); // API call
<YouTubePlaylistPlayer videos={topHits} autoplay={true} />
```

### 3. Artist Showcase
```tsx
const artistVideos = await fetchArtistVideos(artistId);
<YouTubePlaylistPlayer 
  videos={artistVideos}
  onVideoChange={(video) => trackAnalytics(video)}
/>
```

### 4. Livestream Background
```tsx
<YouTubePlaylistPlayer
  videos={backgroundMusic}
  autoplay={true}
  loop={true}
  showControls={false}
/>
```

## 🎯 Ưu điểm so với iframe tĩnh

| Tính năng | iframe tĩnh | Custom Player |
|-----------|-------------|---------------|
| Custom UI | ❌ | ✅ |
| Branding | ❌ | ✅ |
| Analytics | ❌ | ✅ |
| Playlist | ❌ | ✅ |
| Controls tùy chỉnh | ❌ | ✅ |
| Responsive | ⚠️ | ✅ |
| Auto-next | ❌ | ✅ |
| Volume control | ⚠️ | ✅ |
| Fullscreen | ✅ | ✅ |

## 🔧 Tùy chỉnh nâng cao

### Custom Styling
```tsx
<YouTubePlayer
  videoId="..."
  className="custom-player shadow-2xl rounded-xl"
/>
```

### Custom Controls
```tsx
const { play, pause, currentTime } = useYouTubePlayer('my-player', {...});

return (
  <div>
    <div id="my-player" />
    <MyCustomControls 
      onPlay={play}
      onPause={pause}
      currentTime={currentTime}
    />
  </div>
);
```

### Analytics Integration
```tsx
<YouTubePlayer
  videoId="..."
  onStateChange={(state) => {
    if (state === 1) analytics.track('video_played');
    if (state === 0) analytics.track('video_completed');
  }}
/>
```

## 📦 Dependencies

Tất cả dependencies đã có sẵn trong CineVerse:
- ✅ React 18+
- ✅ Next.js 14+
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ lucide-react (icons)

**Không cần cài thêm package!**

## 🐛 Troubleshooting

### Video không phát
- Kiểm tra Video ID
- Kiểm tra kết nối internet
- Video có thể bị chặn ở quốc gia của bạn

### Controls không hiển thị
```tsx
// Đảm bảo import CSS
import '@/styles/youtube-player.css';
```

### Autoplay không hoạt động
```tsx
// Cần user interaction trước
<button onClick={() => setAutoplay(true)}>
  Start Playing
</button>
```

## 📞 Support

- 📖 Docs: `/docs/youtube-player-guide.md`
- 🎮 Demo Basic: `/youtube-demo`
- 🎵 Demo Playlist: `/playlist-demo`

## 🎉 Hoàn thành!

Bạn đã có:
1. ✅ Custom YouTube Player component
2. ✅ Playlist Player component
3. ✅ Custom Hook để tạo UI riêng
4. ✅ 2 trang demo đầy đủ
5. ✅ CSS styling tùy chỉnh
6. ✅ TypeScript types
7. ✅ Responsive design
8. ✅ Documentation đầy đủ

**Ready to use! 🚀**

---

Made with ❤️ for **An Kun Studio** & **CineVerse**
