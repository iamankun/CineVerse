# Hướng dẫn: Nguồn Phim Nội Bộ CineVerse

## 📁 Cấu trúc thư mục

```
public/sources/
├── Movie/           # Chứa JSON files cho phim
│   └── {tmdb-id}.json
└── ChuongTrinhTV/   # Chứa JSON files cho chương trình TV
    └── {tmdb-id}.json
```

## 🎬 Cấu trúc JSON cho Phim

**File:** `public/sources/Movie/{tmdb-id}.json`

```json
{
  "tmdbId": 550,
  "title": "Fight Club",
  "sources": [
    {
      "provider": "youtube",
      "title": "YouTube HD",
      "url": "https://www.youtube.com/embed/VIDEO_ID_HERE",
      "quality": "1080p",
      "language": "en",
      "subtitles": ["vi", "en"]
    },
    {
      "provider": "dailymotion",
      "title": "Dailymotion",
      "url": "https://www.dailymotion.com/embed/video/VIDEO_ID_HERE",
      "quality": "720p",
      "language": "en",
      "subtitles": ["vi"]
    }
  ],
  "lastUpdated": "2025-10-24T00:00:00Z"
}
```

### Các trường bắt buộc:
- `tmdbId` (number): ID của phim từ TMDB
- `title` (string): Tên phim
- `sources` (array): Danh sách nguồn phim
  - `provider` (string): "youtube" hoặc "dailymotion"
  - `title` (string): Tiêu đề hiển thị
  - `url` (string): Link embed đầy đủ
  - `quality` (string, optional): Chất lượng video
  - `language` (string, optional): Ngôn ngữ
  - `subtitles` (array, optional): Danh sách phụ đề có sẵn

## 📺 Cấu trúc JSON cho Chương Trình TV

**File:** `public/sources/ChuongTrinhTV/{tmdb-id}.json`

```json
{
  "tmdbId": 1396,
  "title": "Breaking Bad",
  "seasons": {
    "1": {
      "1": {
        "sources": [
          {
            "provider": "youtube",
            "title": "YouTube HD",
            "url": "https://www.youtube.com/embed/EPISODE_VIDEO_ID",
            "quality": "1080p",
            "language": "en",
            "subtitles": ["vi", "en"]
          }
        ]
      },
      "2": {
        "sources": [
          {
            "provider": "dailymotion",
            "title": "Dailymotion",
            "url": "https://www.dailymotion.com/embed/video/EPISODE_VIDEO_ID",
            "quality": "720p",
            "language": "en",
            "subtitles": ["vi"]
          }
        ]
      }
    },
    "2": {
      "1": {
        "sources": [...]
      }
    }
  },
  "lastUpdated": "2025-10-24T00:00:00Z"
}
```

### Cấu trúc seasons:
```
seasons → {season_number} → {episode_number} → sources[]
```

## 🔗 Lấy Link Embed

### YouTube:
1. Tìm video trên YouTube
2. Lấy VIDEO_ID từ URL (ví dụ: `https://youtube.com/watch?v=VIDEO_ID`)
3. Tạo embed URL: `https://www.youtube.com/embed/VIDEO_ID`

### Dailymotion:
1. Tìm video trên Dailymotion
2. Click "Share" → "Embed"
3. Sao chép URL embed (dạng: `https://www.dailymotion.com/embed/video/VIDEO_ID`)

## ⚡ Ưu tiên nguồn

Hệ thống sẽ **ưu tiên hiển thị nguồn CineVerse** trước các nguồn khác:

1. **CineVerse YouTube** (nếu có) - Recommended ⭐
2. **CineVerse Dailymotion** (nếu có) - Recommended ⭐
3. VidLink
4. Embed
5. SuperEmbed
6. ... (các nguồn khác)

## 📝 Cách thêm phim mới

1. Tìm TMDB ID của phim (ví dụ: Fight Club = 550)
2. Tạo file `550.json` trong thư mục `Movie/`
3. Điền thông tin theo template trên
4. Upload lên thư mục `public/sources/Movie/`
5. Restart server hoặc deploy lên Vercel

## 🔄 API Routes

### Lấy nguồn phim:
```
GET /api/sources/movie/{tmdb-id}
```

### Lấy nguồn chương trình TV:
```
GET /api/sources/tv/{tmdb-id}?season={season}&episode={episode}
```

## ✅ Kiểm tra

Sau khi thêm file JSON, truy cập:
- Phim: `http://localhost:3000/movie/{tmdb-id}/player`
- TV: `http://localhost:3000/tv/{tmdb-id}/{season}/{episode}/player`

Nguồn CineVerse sẽ xuất hiện đầu tiên trong danh sách player!

## 🎯 Lưu ý

- File JSON phải có cú pháp đúng (dùng [JSONLint](https://jsonlint.com/) để kiểm tra)
- URL phải bắt đầu bằng `https://`
- Provider chỉ chấp nhận: `"youtube"` hoặc `"dailymotion"`
- TMDB ID phải khớp với file name

## 📋 Ví dụ hoàn chỉnh

Xem file mẫu:
- `public/sources/Movie/example-550.json`
- `public/sources/ChuongTrinhTV/example-1396.json`
