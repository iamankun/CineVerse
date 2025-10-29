# Hệ Thống Làm Mới Cache - CineVerse

## 📋 Tổng Quan

Hệ thống làm mới cache toàn diện cho CineVerse, cho phép xóa tất cả các loại cache từ client đến server.

## 🎯 Cách Sử Dụng

### **Click vào Logo CineVerse ở Footer**

Người dùng chỉ cần **bấm vào logo CineVerse** ở phần footer (cuối trang) để làm mới toàn bộ cache.

### Những Gì Được Làm Mới:

1. **Service Worker Cache (PWA)**
   - Tất cả các cache được tạo bởi Workbox
   - Static assets (JS, CSS, images)
   - API responses

2. **Browser Cache**
   - CacheStorage API
   - localStorage
   - sessionStorage

3. **Server-Side Cache (Next.js)**
   - Page cache
   - Layout cache
   - API route cache

4. **Tagged Cache Data:**
   - ✅ **TMDB** - Dữ liệu từ The Movie Database
   - ✅ **Movies** - Thông tin phim
   - ✅ **TV Shows** - Thông tin chương trình TV
   - ✅ **Videos** - Video content
   - ✅ **Trailers** - Trailer videos
   - ✅ **Images** - Hình ảnh (posters, backdrops, logos)
   - ✅ **Logos** - Logo patches
   - ✅ **Backdrops** - Background images
   - ✅ **Posters** - Movie/TV posters
   - ✅ **Intro** - Intro videos
   - ✅ **Player** - Player data
   - ✅ **Sources** - Video sources (CineVerse)
   - ✅ **Discover** - Discover page data
   - ✅ **Search** - Search results
   - ✅ **Library** - User library
   - ✅ **Watchlist** - User watchlist
   - ✅ **Histories** - Watch histories

## 🔧 API Endpoint

### `POST /api/cache/clear`

Endpoint để clear cache từ server-side.

**Response:**
```json
{
  "success": true,
  "message": "Cache đã được làm mới thành công",
  "timestamp": "2025-10-29T...",
  "cleared": {
    "paths": 7,
    "tags": 19
  }
}
```

## 📝 Implementation Details

### Files Changed:

1. **`src/components/ui/layout/Footer.tsx`**
   - Thêm button với onClick handler
   - Hiệu ứng hover scale
   - Disabled state khi đang xử lý

2. **`src/utils/cache.ts`**
   - `clearAllCache()` - Main function
   - `clearServiceWorkerCache()` - PWA cache
   - `clearBrowserStorage()` - localStorage/sessionStorage
   - `reloadAfterCacheClear()` - Auto reload

3. **`src/app/api/cache/clear/route.ts`**
   - Server-side cache clearing
   - Path revalidation
   - Tag revalidation

4. **`src/api/tmdb.ts`**
   - Thêm tags vào fetch options
   - `movie-${movieId}`, `tv-${tvId}`, etc.

5. **`src/app/api/sources/[movie|tv]/[id]/route.ts`**
   - Thêm Cache-Control headers
   - Dynamic export config

## ⚙️ Configuration

### Cache Duration:
- **TMDB API**: 1 hour (3600s)
- **Sources API**: 1 hour with stale-while-revalidate 24h
- **Static Assets**: Configured by Workbox

### Tags System:
Tags được sử dụng để invalidate cache theo nhóm:
- `tmdb` - Tất cả dữ liệu TMDB
- `movie-${id}` - Cache của phim cụ thể
- `tv-${id}` - Cache của TV show cụ thể
- `season-${number}` - Cache của season cụ thể

## 🚀 User Flow

1. User bấm vào logo CineVerse ở footer
2. System bắt đầu clear cache:
   - Service Worker unregister
   - CacheStorage clear
   - localStorage/sessionStorage clear
   - Server cache revalidate
3. Console log chi tiết quá trình
4. Trang tự động reload sau 1 giây
5. Cache mới được tạo khi user browse

## 🎨 UI/UX Features

- ✅ Cursor pointer khi hover
- ✅ Scale animation (hover: 105%, active: 95%)
- ✅ Disabled state với opacity 50%
- ✅ Tooltip: "Click để làm mới toàn bộ cache"
- ✅ Text color transition khi hover
- ✅ Console logs cho debugging

## 🐛 Debugging

Mở Console (F12) để xem:
```
✅ Cache đã được làm mới thành công!
Chi tiết:
  ✓ Đã xóa cache: start-url
  ✓ Đã xóa cache: google-fonts-webfonts
  ✓ Đã gỡ đăng ký Service Worker
  ✓ Đã làm mới cache server
  ✓ Đã xóa dữ liệu local storage
```

## 📌 Notes

- Chức năng tự động reload trang sau khi clear cache
- Service Worker sẽ được đăng ký lại ở lần load tiếp theo
- Cache mới sẽ được tạo dần khi user sử dụng app
- Không ảnh hưởng đến user authentication (Supabase session)

## 🔐 Security

- Endpoint `/api/cache/clear` không yêu cầu authentication
- Chỉ clear cache, không xóa user data
- Supabase session vẫn được giữ nguyên

## 🎯 Use Cases

1. **Content Update**: Khi TMDB có dữ liệu mới
2. **Bug Fix**: Sau khi deploy code mới
3. **Performance**: Khi cache bị corrupt
4. **Testing**: Developer testing features
5. **User Request**: Khi user thấy data cũ

---

**Last Updated**: October 29, 2025
**Version**: 1.2.3
