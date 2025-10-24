# 📖 Hướng Dẫn Nguồn Phim CineVerse - v1.2.2

## 🎯 Tổng quan

CineVerse hỗ trợ 2 format JSON:
- ✅ **Format Mới (v1.2.2+)**: Hỗ trợ phim nhiều phần, metadata đầy đủ
- ✅ **Format Cũ (v1.2.1)**: Backward compatible, vẫn hoạt động bình thường

---

## 📁 Cấu trúc thư mục

```
public/sources/
├── Movie/
│   ├── {id}.json              # Single part movie
│   ├── {id}.json              # Multi-part movie  
│   └── example-*.json         # Examples
└── ChuongTrinhTV/
    ├── {id}.json              # TV show seasons/episodes
    └── example-*.json         # Examples
```

---

## 🎬 Format JSON cho PHIM

### 1️⃣ Phim Đơn Giản (1 nguồn)

**File:** `Movie/27205.json` (Inception)

```json
{
  "tmdbId": 27205,
  "title": "Inception",
  "year": 2010,
  "parts": {
    "main": {
      "sources": [
        {
          "provider": "youtube",
          "title": "YouTube HD",
          "url": "https://www.youtube.com/embed/YoHD9XEInc0",
          "quality": "1080p",
          "language": "en",
          "subtitles": ["vi", "en"]
        }
      ]
    }
  },
  "metadata": {
    "duration": "148 phút",
    "genre": ["Sci-Fi", "Action"],
    "director": "Christopher Nolan"
  },
  "lastUpdated": "2025-10-24T00:00:00Z"
}
```

**Hiển thị trong player:**
- ⭐ CineVerse YouTube 1080p

---

### 2️⃣ Phim Nhiều Phần (Multi-Part)

**File:** `Movie/122.json` (LOTR)

```json
{
  "tmdbId": 122,
  "title": "The Lord of the Rings: Return of the King",
  "year": 2003,
  "parts": {
    "part1": {
      "title": "Phần 1",
      "duration": "60 phút",
      "sources": [
        {
          "provider": "youtube",
          "title": "YouTube HD",
          "url": "https://www.youtube.com/embed/PART1_ID",
          "quality": "1080p",
          "language": "en",
          "subtitles": ["vi", "en"]
        }
      ]
    },
    "part2": {
      "title": "Phần 2",
      "sources": [
        {
          "provider": "youtube",
          "url": "https://www.youtube.com/embed/PART2_ID",
          "quality": "1080p"
        }
      ]
    },
    "part3": {
      "title": "Phần 3",
      "sources": [
        {
          "provider": "dailymotion",
          "url": "https://www.dailymotion.com/embed/video/PART3_ID",
          "quality": "720p"
        }
      ]
    }
  },
  "metadata": {
    "totalDuration": "201 phút",
    "note": "Extended Edition chia làm 3 phần"
  },
  "lastUpdated": "2025-10-24T00:00:00Z"
}
```

**Hiển thị trong player:**
- ⭐ CineVerse YouTube - part1 1080p
- ⭐ CineVerse YouTube - part2 1080p
- CineVerse Dailymotion - part3 720p

---

### 3️⃣ Phim Nhiều Nguồn (Multiple Sources)

```json
{
  "tmdbId": 550,
  "title": "Fight Club",
  "parts": {
    "main": {
      "sources": [
        {
          "provider": "youtube",
          "url": "https://www.youtube.com/embed/VIDEO1",
          "quality": "1080p",
          "language": "en"
        },
        {
          "provider": "dailymotion",
          "url": "https://www.dailymotion.com/embed/video/VIDEO2",
          "quality": "720p",
          "language": "vi"
        }
      ]
    }
  }
}
```

**Hiển thị:**
- ⭐ CineVerse YouTube 1080p (Recommended)
- CineVerse Dailymotion 720p

---

## 📺 Format JSON cho TV SHOWS

**File:** `ChuongTrinhTV/1396.json` (Breaking Bad)

```json
{
  "tmdbId": 1396,
  "title": "Breaking Bad",
  "seasons": {
    "1": {
      "1": {
        "title": "Pilot",
        "sources": [
          {
            "provider": "youtube",
            "url": "https://www.youtube.com/embed/S1_EP1_ID",
            "quality": "1080p"
          }
        ]
      },
      "2": {
        "title": "Cat's in the Bag...",
        "sources": [
          {
            "provider": "dailymotion",
            "url": "https://www.dailymotion.com/embed/video/S1_EP2_ID",
            "quality": "720p"
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

**Cấu trúc:** `seasons[season_number][episode_number]`

---

## 📋 Bảng Trường Dữ Liệu

### Bắt buộc (Required)

| Trường | Type | Mô tả |
|--------|------|-------|
| `tmdbId` | number | ID từ TMDB |
| `title` | string | Tên phim/show |
| `parts` (movie) | object | Chứa các phần phim |
| `seasons` (TV) | object | Chứa seasons/episodes |
| `sources` | array | Mảng các nguồn video |
| `provider` | string | "youtube" hoặc "dailymotion" |
| `url` | string | URL embed đầy đủ |

### Tùy chọn (Optional)

| Trường | Type | Mô tả |
|--------|------|-------|
| `year` | number | Năm phát hành |
| `quality` | string | 720p, 1080p, 4K... |
| `language` | string | en, vi, ja, ko... |
| `subtitles` | array | Danh sách ngôn ngữ phụ đề |
| `duration` | string | Thời lượng |
| `metadata` | object | Thông tin bổ sung |
| `note` | string | Ghi chú |

---

## 🔗 Lấy Link Embed

### YouTube
```
Watch URL:  https://www.youtube.com/watch?v=YoHD9XEInc0
            ↓
Embed URL:  https://www.youtube.com/embed/YoHD9XEInc0
```

### Dailymotion
1. Click "Share" trên video
2. Chọn tab "Embed"
3. Copy URL: `https://www.dailymotion.com/embed/video/x8abc123`

---

## ⚡ Priority trong Player

```
1. ⭐ CineVerse YouTube - part1 1080p  (Recommended, Fast, No Ads)
2. ⭐ CineVerse YouTube - part2 1080p  (Recommended, Fast, No Ads)
3. CineVerse Dailymotion 720p         (Fast, No Ads)
─────────────────────────────────────
4. VidLink
5. VidLink 2
6. <Embed>
7. SuperEmbed
8. ... (15+ external sources)
```

---

## 🔄 Backward Compatibility

### Format Cũ (vẫn hoạt động)

```json
{
  "tmdbId": 550,
  "title": "Fight Club",
  "sources": [
    {
      "provider": "youtube",
      "url": "https://www.youtube.com/embed/VIDEO_ID"
    }
  ]
}
```

Hệ thống tự động chuyển đổi sang format mới.

---

## 📝 Ví dụ hoàn chỉnh

Xem các file mẫu:
- `Movie/example-550.json` - Phim đơn
- `Movie/example-122-multipart.json` - Phim nhiều phần
- `Movie/27205.json` - Inception (thực tế)
- `ChuongTrinhTV/example-1396.json` - TV show

---

## ✅ Checklist Thêm Phim

- [ ] Tìm TMDB ID (vd: `themoviedb.org/movie/27205`)
- [ ] Lấy YouTube/Dailymotion embed URL
- [ ] Tạo file `{id}.json` trong `Movie/`
- [ ] Copy template và điền thông tin
- [ ] Validate JSON syntax ([JSONLint](https://jsonlint.com/))
- [ ] Test local: `/movie/{id}/player`
- [ ] Deploy: `npx vercel --prod`
- [ ] Verify production

---

## 🐛 Troubleshooting

**Lỗi: "Đang tải nguồn phim..." không tắt**
- ✅ Kiểm tra file JSON có tồn tại
- ✅ Kiểm tra tên file khớp với TMDB ID
- ✅ Validate JSON syntax

**Nguồn CineVerse không hiển thị**
- ✅ Clear browser cache
- ✅ Kiểm tra `parts.main.sources` hoặc `sources` có dữ liệu
- ✅ Kiểm tra `provider` đúng: "youtube" hoặc "dailymotion"

**Video không play**
- ✅ Kiểm tra URL là embed URL (không phải watch URL)
- ✅ Test URL trực tiếp trong browser
- ✅ Kiểm tra video không bị xóa/private

---

**Version:** 1.2.2  
**Last Updated:** 2025-10-24  
**Maintained by:** An Kun Studio
