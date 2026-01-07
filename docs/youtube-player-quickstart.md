# 🚀 Quick Start - Custom YouTube Player

## 30 giây để bắt đầu!

### 1️⃣ Import Component

```tsx
import YouTubePlayer from '@/components/ui/YouTubePlayer';
import '@/styles/youtube-player.css';
```

### 2️⃣ Sử dụng ngay

```tsx
export default function MyPage() {
  return (
    <YouTubePlayer videoId="M7lc1UVf-VE" />
  );
}
```

### ✅ Xong! Đơn giản vậy thôi!

---

## 🎵 Muốn dùng Playlist?

### 1️⃣ Import

```tsx
import YouTubePlaylistPlayer from '@/components/ui/YouTubePlaylistPlayer';
import '@/styles/youtube-player.css';
```

### 2️⃣ Chuẩn bị danh sách

```tsx
const videos = [
  { id: 'M7lc1UVf-VE', title: 'Bài 1', artist: 'Artist A' },
  { id: 'dQw4w9WgXcQ', title: 'Bài 2', artist: 'Artist B' },
];
```

### 3️⃣ Sử dụng

```tsx
export default function MyPage() {
  return (
    <YouTubePlaylistPlayer videos={videos} loop={true} />
  );
}
```

---

## 🎮 Demo Pages

**Xem live demo:**
- Basic Player: http://localhost:3000/youtube-demo
- Playlist: http://localhost:3000/playlist-demo

**Chạy dev server:**
```bash
npm run dev
```

---

## 📖 Tài liệu đầy đủ

- **Chi tiết:** `/docs/youtube-player-guide.md`
- **Tổng quan:** `/docs/youtube-player-overview.md`
- **Changelog:** `/Ghichu/youtube-player-changelog.md`

---

## 💡 Tips

### Lấy Video ID từ URL YouTube

```
https://www.youtube.com/watch?v=M7lc1UVf-VE
                                 ↑
                         Copy phần này!
```

### Custom Props

```tsx
<YouTubePlayer
  videoId="M7lc1UVf-VE"
  autoplay={true}           // Tự động phát
  showControls={false}      // Ẩn controls
  className="rounded-xl"    // Custom CSS
  onReady={() => console.log('Ready!')}
/>
```

---

## 🆘 Cần giúp?

1. Xem `/docs/youtube-player-guide.md`
2. Check demo pages
3. Đọc code examples

---

**Made with ❤️ for An Kun Studio & CineVerse**
