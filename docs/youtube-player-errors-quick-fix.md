# 🚨 YouTube Player - Common Errors Quick Fix

## ❌ Hydration Error

```
Console Error

A tree hydrated but some attributes of the server rendered HTML 
didn't match the client properties.
```

### ✅ **FIX: Đã được sửa trong v1.0.1**

**Nguyên nhân:** 
- Sử dụng `Math.random()` để tạo player ID
- Server render ra ID khác với client render

**Giải pháp:**
- ✅ Update lên version mới nhất
- ✅ Component đã dùng `useId()` hook

**Nếu tự build:**
```tsx
// ❌ CŨNG - Gây hydration error
const playerId = `player-${Math.random()}`;

// ✅ MỚI - Ổn định
import { useId } from 'react';
const uniqueId = useId();
const playerId = `player-${uniqueId}`;
```

---

## ❌ Loading Mãi Không Dừng

```
Hiện tượng: Spinner quay mãi, video không load
```

### ✅ **Các bước fix:**

**1. Kiểm tra Video ID**
```tsx
// ❌ SAI
<YouTubePlayer videoId="https://youtube.com/watch?v=abc123" />

// ✅ ĐÚNG
<YouTubePlayer videoId="abc123" />
```

**2. Kiểm tra Console (F12)**
Tìm:
- `Element with id "..." not found` → DOM chưa sẵn sàng
- `YouTube Player Error: 101` → Video không cho embed
- `YouTube Player timeout` → Internet/firewall issue

**3. Test với video mẫu**
```tsx
<YouTubePlayer videoId="jNQXAC9IVRw" />
```

**4. Kiểm tra Network**
- F12 → Network → Filter "youtube"
- Phải thấy `iframe_api` status 200
- Nếu blocked → Tắt Ad Blocker

---

## ❌ Video Error 101/150

```
Error: Video không cho phép embed
```

### ✅ **Giải pháp:**

**Option 1: Tìm video khác**
```tsx
// Video này allow embed
<YouTubePlayer videoId="jNQXAC9IVRw" />
```

**Option 2: Fallback to link**
```tsx
<YouTubePlayer
  videoId={videoId}
  onError={(code) => {
    if (code === 101 || code === 150) {
      window.open(`https://youtube.com/watch?v=${videoId}`, '_blank');
    }
  }}
/>
```

**Option 3: Show message**
```tsx
const [embedError, setEmbedError] = useState(false);

{embedError && (
  <div>
    Video không thể nhúng. 
    <a href={`https://youtube.com/watch?v=${videoId}`}>
      Xem trên YouTube →
    </a>
  </div>
)}
```

---

## ❌ Controls Không Hiển Thị

```
Player hiển thị nhưng không có nút điều khiển
```

### ✅ **Fix:**

**1. Import CSS**
```tsx
import '@/styles/youtube-player.css';
```

**2. Enable controls**
```tsx
<YouTubePlayer 
  videoId="..."
  showControls={true}  // ← Đảm bảo = true
/>
```

**3. Check CSS loaded**
```tsx
// Trong browser DevTools:
// Elements → Search for "youtube-player.css"
```

---

## ❌ Multiple Players - Chỉ 1 hoạt động

```
Nhiều player trên trang, chỉ player cuối hoạt động
```

### ✅ **Fix: Đã được sửa với useId()**

**Nếu vẫn gặp, thêm key:**
```tsx
{videos.map((video, index) => (
  <YouTubePlayer
    key={`player-${video.id}-${index}`}
    videoId={video.id}
  />
))}
```

---

## ❌ Autoplay Không Hoạt Động

```
Player ready nhưng không tự động phát
```

### ✅ **Lý do & Fix:**

**Browser chặn autoplay with sound**
```tsx
// Option 1: Cần user interaction
const [canPlay, setCanPlay] = useState(false);

<button onClick={() => setCanPlay(true)}>
  Start Playing
</button>

{canPlay && <YouTubePlayer autoplay={true} />}
```

```tsx
// Option 2: Mute trước khi autoplay (không khuyến khích)
<YouTubePlayer 
  videoId="..."
  autoplay={true}
  // Cần implement mute trong playerVars
/>
```

---

## 🔍 Debug Checklist

Khi gặp lỗi, check theo thứ tự:

- [ ] **Console** - F12 → Console → Tìm error messages
- [ ] **Network** - F12 → Network → Filter "youtube"  
- [ ] **Video ID** - Đúng format? Test với `jNQXAC9IVRw`
- [ ] **CSS** - Đã import `@/styles/youtube-player.css`?
- [ ] **Ad Blocker** - Thử tắt hoặc Incognito mode
- [ ] **Internet** - Kết nối ổn định?
- [ ] **Browser** - Latest Chrome/Firefox/Safari?

---

## 📞 Still Need Help?

### 1. Check full docs
- [Troubleshooting Guide](./youtube-player-troubleshooting.md)
- [Full Guide](./youtube-player-guide.md)
- [Changelog](../Ghichu/youtube-player-changelog.md)

### 2. Test demo pages
```bash
npm run dev
```
- http://localhost:3000/youtube-demo
- http://localhost:3000/playlist-demo

### 3. Report issue with:
- Video ID causing problem
- Console error screenshot
- Browser & version
- Steps to reproduce

---

**Last updated:** January 7, 2026 - v1.0.1

Made with ❤️ for CineVerse
