# 🔧 Troubleshooting - YouTube Player

## ❌ Vấn đề: Loading liên tục không chạy video

### Nguyên nhân có thể:

#### 0. ✅ **Hydration Error (Next.js SSR)**
**Triệu chứng:** Console error "A tree hydrated but some attributes of the server rendered HTML didn't match"

**Giải pháp:**
- ✅ **ĐÃ FIX** - Sử dụng `useId()` hook thay vì `Math.random()`
- Player ID giờ đây ổn định giữa server và client render
- Không còn lỗi hydration mismatch

**Nếu vẫn gặp:**
```tsx
// Thêm suppressHydrationWarning (chỉ khi thực sự cần)
<div id={playerId} suppressHydrationWarning />
```

#### 1. ✅ **Video ID không hợp lệ**
**Triệu chứng:** Loading spinner quay mãi, sau 10s hiện error

**Giải pháp:**
- Kiểm tra Video ID có đúng không
- Copy từ URL YouTube: `youtube.com/watch?v=VIDEO_ID_Ở_ĐÂY`
- Test với video ID mẫu: `M7lc1UVf-VE` (đã biết hoạt động)

```tsx
// ❌ SAI
<YouTubePlayer videoId="https://youtube.com/watch?v=M7lc1UVf-VE" />

// ✅ ĐÚNG
<YouTubePlayer videoId="M7lc1UVf-VE" />
```

#### 2. ✅ **Video bị giới hạn vùng hoặc nhúng (Embedding restricted)**
**Triệu chứng:** Loading xong nhưng hiện error, không phát được

**Giải pháp:**
- Một số video không cho phép nhúng (embed)
- Kiểm tra bằng cách thử video khác
- Xem console log để biết error code cụ thể

**Error Codes:**
- `2` - Video ID không hợp lệ
- `5` - HTML5 player error
- `100` - Video không tìm thấy hoặc bị private
- `101` - Video chủ không cho phép embed
- `150` - Same as 101

#### 3. ✅ **Chưa import CSS**
**Triệu chứng:** Player hiển thị nhưng controls trông lỗi

**Giải pháp:**
```tsx
// Thêm vào đầu file component
import '@/styles/youtube-player.css';
```

#### 4. ✅ **Element ID trùng lặp**
**Triệu chứng:** Nhiều player trên cùng trang, chỉ 1 player hoạt động

**Giải pháp:** 
- Đã được fix với random ID
- Nếu vẫn gặp vấn đề, truyền unique `key` prop

```tsx
<YouTubePlayer 
  key={`player-${index}`}
  videoId={videoId} 
/>
```

#### 5. ✅ **Internet chậm hoặc YouTube API bị block**
**Triệu chứng:** Loading lâu, timeout sau 10s

**Giải pháp:**
- Kiểm tra kết nối internet
- Kiểm tra firewall/proxy có block `youtube.com` không
- Mở Console (F12) xem có lỗi network không

#### 6. ✅ **Browser không hỗ trợ autoplay**
**Triệu chứng:** Player ready nhưng không tự động phát

**Giải pháp:**
- Hầu hết browser chặn autoplay với sound
- Cần user interaction (click) trước khi autoplay
- Hoặc mute video trước khi autoplay

```tsx
// Workaround cho autoplay
const handleUserInteraction = () => {
  setCanAutoplay(true);
};

<button onClick={handleUserInteraction}>
  Cho phép autoplay
</button>

{canAutoplay && (
  <YouTubePlayer videoId="..." autoplay={true} />
)}
```

---

## 🔍 Debug Steps

### Bước 1: Kiểm tra Console Log
Mở Developer Tools (F12) → Console tab

**Tìm các message:**
```
Element with id "youtube-player-xxx" not found
YouTube Player Error: [error code]
Error initializing YouTube Player: [error details]
YouTube Player timeout - taking too long to load
```

### Bước 2: Kiểm tra Network Tab
F12 → Network → Filter "youtube"

**Phải thấy:**
- ✅ `iframe_api` - Status 200
- ✅ `www-embed-player` - Status 200

**Nếu thấy:**
- ❌ Status 0 hoặc CORS error → Bị block bởi firewall/extension
- ❌ Status 404 → Vấn đề kết nối

### Bước 3: Test với Video ID đơn giản

```tsx
// Video test đã biết hoạt động
<YouTubePlayer videoId="jNQXAC9IVRw" /> // "Me at the zoo" - video đầu tiên của YouTube
```

### Bước 4: Kiểm tra Ad Blocker / Extensions

**Triệu chứng:** 
- Player không load
- Console có lỗi về scripts bị block

**Giải pháp:**
- Tạm tắt Ad Blocker
- Tắt extensions liên quan đến video/privacy
- Test ở Incognito/Private mode

---

## 🛠️ Quick Fixes

### Fix 1: Force Reload API

```tsx
// Thêm vào useEffect
useEffect(() => {
  // Xóa cache API cũ
  delete window.YT;
  delete window.onYouTubeIframeAPIReady;
  
  // Xóa script cũ
  const oldScript = document.querySelector('script[src*="youtube.com/iframe_api"]');
  if (oldScript) {
    oldScript.remove();
  }
}, []);
```

### Fix 2: Add Fallback UI

```tsx
const [retryCount, setRetryCount] = useState(0);

<YouTubePlayer
  videoId={videoId}
  onError={() => {
    if (retryCount < 3) {
      setTimeout(() => setRetryCount(c => c + 1), 1000);
    }
  }}
/>

{retryCount >= 3 && (
  <div className="error-message">
    Video không thể tải. <a href={`https://youtube.com/watch?v=${videoId}`}>
      Xem trên YouTube
    </a>
  </div>
)}
```

### Fix 3: Preload YouTube API

Thêm vào `app/layout.tsx`:

```tsx
export default function RootLayout() {
  useEffect(() => {
    // Preload YouTube API
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    document.head.appendChild(script);
  }, []);

  return (
    // ... rest of layout
  );
}
```

---

## 📊 Error Codes Reference

| Code | Ý nghĩa | Giải pháp |
|------|---------|-----------|
| 2 | Invalid video ID | Kiểm tra lại Video ID |
| 5 | HTML5 Player error | Thử browser khác |
| 100 | Video không tồn tại | Đổi video khác |
| 101 | Không cho phép embed | Tìm video khác hoặc liên hệ chủ video |
| 150 | Giống 101 | Không thể nhúng video này |

---

## ✅ Checklist trước khi report bug

- [ ] Đã import CSS: `import '@/styles/youtube-player.css'`
- [ ] Video ID đúng format (không có URL đầy đủ)
- [ ] Đã test với video ID mẫu: `M7lc1UVf-VE`
- [ ] Đã kiểm tra Console log
- [ ] Đã kiểm tra Network tab
- [ ] Đã tắt Ad Blocker
- [ ] Đã test ở Incognito mode
- [ ] Internet đang hoạt động bình thường

---

## 🆘 Vẫn không được?

### Option 1: Sử dụng fallback iframe

```tsx
{hasError && (
  <iframe
    src={`https://www.youtube.com/embed/${videoId}`}
    className="w-full aspect-video"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen
  />
)}
```

### Option 2: Link ra YouTube

```tsx
{hasError && (
  <div className="text-center p-8">
    <p className="mb-4">Không thể tải video</p>
    <a 
      href={`https://youtube.com/watch?v=${videoId}`}
      target="_blank"
      className="text-primary hover:underline"
    >
      Xem trên YouTube →
    </a>
  </div>
)}
```

### Option 3: Report Issue

Nếu vấn đề vẫn tiếp diễn, cung cấp:
1. Video ID đang gặp vấn đề
2. Screenshot console log
3. Browser và version
4. Error message cụ thể

---

## 💡 Best Practices

1. **Always handle errors:**
```tsx
<YouTubePlayer
  videoId={videoId}
  onError={(error) => {
    console.error('Player error:', error);
    // Show user-friendly message
  }}
/>
```

2. **Provide loading feedback:**
```tsx
{!isPlayerReady && <LoadingSpinner />}
```

3. **Validate Video ID:**
```tsx
const isValidYouTubeId = (id: string) => {
  return /^[a-zA-Z0-9_-]{11}$/.test(id);
};

if (!isValidYouTubeId(videoId)) {
  return <div>Video ID không hợp lệ</div>;
}
```

4. **Test with multiple videos:**
```tsx
const testVideoIds = [
  'M7lc1UVf-VE',
  'jNQXAC9IVRw',
  'dQw4w9WgXcQ'
];
```

---

**Last updated:** January 7, 2026

Made with ❤️ for CineVerse
