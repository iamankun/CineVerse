# 🎬 Hệ Thống Nguồn Phim Nội Bộ CineVerse

## Tổng quan

CineVerse hỗ trợ **nguồn phim nội bộ** từ YouTube và Dailymotion, được **ưu tiên hiển thị** trước tất cả các nguồn player khác.

## Tính năng

✅ **Ưu tiên tuyệt đối**: Nguồn CineVerse luôn hiển thị đầu tiên  
✅ **Multi-provider**: Hỗ trợ YouTube và Dailymotion  
✅ **Quản lý dễ dàng**: Chỉ cần thêm file JSON  
✅ **Auto-detect**: Tự động phát hiện và load nguồn  
✅ **Metadata đầy đủ**: Quality, language, subtitles  

## Cấu trúc

```
public/sources/
├── Movie/           → Phim điện ảnh
│   ├── 27205.json   (Inception)
│   ├── 550.json     (Fight Club)
│   └── ...
├── ChuongTrinhTV/   → Chương trình TV
│   ├── 1396.json    (Breaking Bad)
│   └── ...
└── README.md        → Hướng dẫn chi tiết
```

## Thêm nguồn phim mới

### Bước 1: Tạo file JSON

**File:** `public/sources/Movie/{tmdb-id}.json`

```json
{
  "tmdbId": 27205,
  "title": "Inception",
  "sources": [
    {
      "provider": "youtube",
      "title": "YouTube HD",
      "url": "https://www.youtube.com/embed/VIDEO_ID",
      "quality": "1080p",
      "language": "en",
      "subtitles": ["vi", "en"]
    }
  ],
  "lastUpdated": "2025-10-24T00:00:00Z"
}
```

### Bước 2: Lấy TMDB ID

1. Truy cập https://www.themoviedb.org/
2. Tìm phim (ví dụ: Inception)
3. Xem URL: `themoviedb.org/movie/27205` → ID = **27205**

### Bước 3: Lấy Video ID

**YouTube:**
- URL: `youtube.com/watch?v=YoHD9XEInc0`
- Video ID: `YoHD9XEInc0`
- Embed URL: `https://www.youtube.com/embed/YoHD9XEInc0`

**Dailymotion:**
- Click "Share" → "Embed"
- Copy embed URL

### Bước 4: Deploy

```powershell
npx vercel --prod
```

## API Endpoints

```
GET /api/sources/movie/{id}
GET /api/sources/tv/{id}?season={season}&episode={episode}
```

## Hiển thị trong Player

Khi có nguồn CineVerse, danh sách player sẽ như sau:

1. **⭐ CineVerse YouTube 1080p** (Recommended, Fast, No Ads)
2. **⭐ CineVerse Dailymotion 720p** (Recommended, Fast, No Ads)
3. VidLink
4. VidLink 2
5. Embed
6. ... (các nguồn khác)

## Ví dụ

### Phim: Inception (ID: 27205)

File: `public/sources/Movie/27205.json`

Truy cập: `https://cineverse.ankun.dev/movie/27205/player`

→ Nguồn CineVerse YouTube sẽ xuất hiện đầu tiên! ✨

## Chi tiết đầy đủ

Xem file `public/sources/README.md` để biết:
- Cấu trúc JSON chi tiết cho TV shows
- Cách quản lý seasons/episodes
- Troubleshooting
- Best practices

---

**Phát triển bởi:** An Kun Studio  
**Version:** 1.2.1
