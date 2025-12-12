# Hệ thống chuyển đổi Age Rating TMDB → Việt Nam

> **Phiên bản**: 1.0.0  
> **Ngày tạo**: 12/12/2025  
> **Tác giả**: CineVerse Team

---

## 📋 Tổng quan

Hệ thống tự động hiển thị cảnh báo độ tuổi cho tất cả phim/TV shows bằng cách:
1. **Ưu tiên** rating local từ JSON files
2. **Fallback** sang TMDB API khi không có rating local
3. **Chuyển đổi** certification quốc tế sang hệ thống phân loại Việt Nam

---

## 🎯 Vấn đề cần giải quyết

Trước đây, chỉ những phim có file JSON local với `metadata.movie-rating` mới hiển thị cảnh báo độ tuổi. Điều này dẫn đến:
- Phần lớn phim không có cảnh báo độ tuổi
- Người dùng không biết phim có phù hợp với độ tuổi không
- Cần thêm rating thủ công cho từng phim

**Giải pháp**: Tự động lấy certification từ TMDB và convert sang hệ thống Việt Nam.

---

## 📁 Files liên quan

| File | Mô tả |
|------|-------|
| `src/utils/rating-converter.ts` | **MỚI** - Utility chuyển đổi rating quốc tế → VN |
| `src/api/tmdb.ts` | Thêm 2 API functions lấy certification |
| `src/components/sections/Movie/Player/Player.tsx` | Tích hợp TMDB fallback cho Movie |
| `src/components/sections/TV/Player/Player.tsx` | Tích hợp TMDB fallback cho TV |

---

## 🔄 Bảng chuyển đổi Rating

### Hệ thống Việt Nam

| Rating | Mô tả | Màu sắc |
|--------|-------|---------|
| **P** | Phim dành cho mọi lứa tuổi | 🟢 Xanh lá |
| **K** | Phim dành cho trẻ em dưới 13 tuổi xem cùng phụ huynh | 🟡 Vàng |
| **T13** | Phim dành cho khán giả từ 13 tuổi trở lên | 🟠 Cam |
| **T16** | Phim dành cho khán giả từ 16 tuổi trở lên | 🟠 Cam đậm |
| **T18** | Phim dành cho khán giả từ 18 tuổi trở lên | 🔴 Đỏ |
| **C** | Phim bị cấm chiếu trên mọi nền tảng | ⚫ Đen |

### Mapping từ các quốc gia

#### 🇺🇸 US (MPAA - Motion Picture Association)
```
G       → P      (General Audiences)
PG      → K      (Parental Guidance)
PG-13   → T13    (Parents Strongly Cautioned)
R       → T18    (Restricted)
NC-17   → C      (Adults Only)
NR      → T16    (Not Rated - default)
```

#### 🇬🇧 UK (BBFC - British Board of Film Classification)
```
U       → P      (Universal)
PG      → K      (Parental Guidance)
12/12A  → T13    (Suitable for 12+)
15      → T16    (Suitable for 15+)
18      → T18    (Adults only)
R18     → C      (Restricted 18)
```

#### 🇩🇪 Đức (FSK - Freiwillige Selbstkontrolle)
```
0       → P      (FSK 0)
6       → K      (FSK 6)
12      → T13    (FSK 12)
16      → T16    (FSK 16)
18      → T18    (FSK 18)
```

#### 🇦🇺 Úc (Australian Classification Board)
```
G       → P      (General)
PG      → K      (Parental Guidance)
M       → T13    (Mature)
MA15+   → T16    (Mature Accompanied)
R18+    → T18    (Restricted)
X18+    → C      (X Rated)
```

#### 🇫🇷 Pháp
```
U       → P      (Universal)
10      → K      (10+)
12      → T13    (12+)
16      → T16    (16+)
18      → T18    (18+)
```

#### 🇯🇵 Nhật Bản (Eirin)
```
G       → P      (General)
PG12    → T13    (Parental Guidance 12)
R15+    → T16    (Restricted 15+)
R18+    → T18    (Restricted 18+)
```

#### 🇰🇷 Hàn Quốc (KMRB)
```
ALL/전체관람가      → P      (All ages)
12/12세이상관람가   → T13    (12+)
15/15세이상관람가   → T16    (15+)
18/청소년관람불가   → T18    (18+)
R                   → C      (Restricted)
```

#### 🇧🇷 Brazil (DJCTQ)
```
L       → P      (Livre - Free)
10      → K      (10+)
12      → T13    (12+)
14/16   → T16    (14+/16+)
18      → T18    (18+)
```

---

## ⚙️ Logic hoạt động

```
┌─────────────────────────────────────────────────────────┐
│                    Khi phát video                        │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
        ┌─────────────────────────────────────┐
        │  Kiểm tra local JSON có rating?     │
        │  Movie: /sources/Movie/{id}.json    │
        │  TV: /sources/ChuongTrinhTV/{id}.json│
        └─────────────────────────────────────┘
                    │           │
                   CÓ         KHÔNG
                    │           │
                    ▼           ▼
         ┌──────────────┐  ┌──────────────────────┐
         │ Dùng rating  │  │ Gọi TMDB API:        │
         │ local        │  │ • Movie: release_dates│
         └──────────────┘  │ • TV: content_ratings │
                           └──────────────────────┘
                                      │
                                      ▼
                           ┌──────────────────────┐
                           │ Tìm certification    │
                           │ theo thứ tự ưu tiên: │
                           │ US → GB → AU → DE →  │
                           │ FR → BR → JP → KR    │
                           └──────────────────────┘
                                      │
                                      ▼
                           ┌──────────────────────┐
                           │ Convert sang VN:     │
                           │ P/K/T13/T16/T18/C    │
                           └──────────────────────┘
                                      │
                                      ▼
                           ┌──────────────────────┐
                           │ Hiển thị AgeRating   │
                           │ overlay trong Player │
                           └──────────────────────┘
```

---

## 🚀 API Functions

### `getMovieReleaseDates(movieId: number)`

Lấy danh sách release dates và certification cho Movie từ TMDB.

```typescript
// Ví dụ response
{
  "results": [
    {
      "iso_3166_1": "US",
      "release_dates": [
        {
          "certification": "PG-13",
          "type": 3, // Theatrical
          "release_date": "2024-03-15"
        }
      ]
    }
  ]
}
```

### `getTvContentRatings(tvId: number)`

Lấy danh sách content ratings cho TV Show từ TMDB.

```typescript
// Ví dụ response
{
  "results": [
    {
      "iso_3166_1": "US",
      "rating": "TV-14"
    },
    {
      "iso_3166_1": "GB",
      "rating": "15"
    }
  ]
}
```

### `getVietnamRatingFromReleaseDates(releaseDates)`

Chuyển đổi TMDB release_dates sang Vietnam rating.

```typescript
import { getVietnamRatingFromReleaseDates } from "@/utils/rating-converter";

const releaseDates = await getMovieReleaseDates(movieId);
const vnRating = getVietnamRatingFromReleaseDates(releaseDates);
// { rating: "T13", description: "Phim dành cho khán giả từ 13 tuổi trở lên" }
```

### `getVietnamRatingFromContentRatings(contentRatings)`

Chuyển đổi TMDB content_ratings sang Vietnam rating.

```typescript
import { getVietnamRatingFromContentRatings } from "@/utils/rating-converter";

const contentRatings = await getTvContentRatings(tvId);
const vnRating = getVietnamRatingFromContentRatings(contentRatings);
// { rating: "T16", description: "Phim dành cho khán giả từ 16 tuổi trở lên" }
```

---

## 📊 Caching Strategy

| API Endpoint | Cache Duration | Tags |
|--------------|----------------|------|
| `/movie/{id}/release_dates` | 7 ngày | `tmdb`, `movies`, `movie-{id}`, `release-dates`, `certification` |
| `/tv/{id}/content_ratings` | 7 ngày | `tmdb`, `tv-shows`, `tv-{id}`, `content-ratings`, `certification` |

**Lý do cache 7 ngày**: Certification/rating của phim rất ít khi thay đổi sau khi đã được phân loại.

---

## 🔧 Cách sử dụng

### Thêm rating local (ưu tiên cao nhất)

Tạo/sửa file JSON:

**Movie**: `/public/sources/Movie/{tmdb_id}.json`
```json
{
  "metadata": {
    "movie-rating": "T16"
  }
}
```

**TV**: `/public/sources/ChuongTrinhTV/{tmdb_id}.json`
```json
{
  "metadata": {
    "movie-rating": "T13"
  }
}
```

### Để TMDB tự động (fallback)

Không cần làm gì - hệ thống sẽ tự động:
1. Kiểm tra local JSON
2. Nếu không có → gọi TMDB API
3. Convert certification → Vietnam rating
4. Hiển thị AgeRating overlay

---

## 📝 Ví dụ thực tế

### Movie: "Avengers: Endgame" (ID: 299534)

```
1. Check /sources/Movie/299534.json → Không có
2. Gọi TMDB: /movie/299534/release_dates
3. Tìm US certification: "PG-13"
4. Convert: PG-13 → T13
5. Hiển thị: "I T13 - Phim dành cho khán giả từ 13 tuổi trở lên"
```

### TV: "Breaking Bad" (ID: 1396)

```
1. Check /sources/ChuongTrinhTV/1396.json → Không có
2. Gọi TMDB: /tv/1396/content_ratings
3. Tìm US rating: "TV-MA"
4. Convert: TV-MA → T18
5. Hiển thị: "I T18 - Phim dành cho khán giả từ 18 tuổi trở lên"
```

---

## ✅ Checklist hoàn thành

- [x] Tạo `rating-converter.ts` với mapping đầy đủ
- [x] Thêm API `getMovieReleaseDates()` trong `tmdb.ts`
- [x] Thêm API `getTvContentRatings()` trong `tmdb.ts`
- [x] Tích hợp fallback trong Movie Player
- [x] Tích hợp fallback trong TV Player
- [x] Cache 7 ngày cho performance
- [x] Support 8 hệ thống rating quốc tế
- [x] Fallback logic khi không tìm thấy rating

---

## 🐛 Troubleshooting

### Rating không hiển thị

1. Kiểm tra console log:
   - `🌐 Đang lấy rating từ TMDB...` - API đang được gọi
   - `✅ TMDB Rating converted:` - Đã convert thành công
   - `⚠️ Không tìm thấy rating phù hợp` - Phim không có certification trên TMDB

2. Kiểm tra TMDB có certification không:
   - Vào https://www.themoviedb.org/movie/{id}
   - Xem phần "Release Dates" hoặc "Content Rating"

### Rating sai

1. Thêm rating local để override:
   ```json
   {
     "metadata": {
       "movie-rating": "T18"
     }
   }
   ```

2. Local rating luôn được ưu tiên hơn TMDB

---

## 📚 Tài liệu tham khảo

- [TMDB API - Movie Release Dates](https://developer.themoviedb.org/reference/movie-release-dates)
- [TMDB API - TV Content Ratings](https://developer.themoviedb.org/reference/tv-series-content-ratings)
- [Wikipedia - MPAA Film Rating System](https://en.wikipedia.org/wiki/Motion_Picture_Association_film_rating_system)
- [Wikipedia - BBFC](https://en.wikipedia.org/wiki/British_Board_of_Film_Classification)
- [Thông tư 05/2023/TT-BVHTTDL - Phân loại phim Việt Nam](https://thuvienphapluat.vn/)
