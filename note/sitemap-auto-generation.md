# 🗺️ Sitemap Tự Động (Auto-Generated Sitemap)

## Tổng quan

File `src/app/sitemap.ts` tự động tạo sitemap.xml với nội dung động từ TMDB API.

## Tính năng

### 📄 Các trang tĩnh (Static Pages)

- `/` - Trang chủ (Priority: 1.0, Daily)
- `/discover` - Khám phá (Priority: 0.9, Daily)
- `/search` - Tìm kiếm (Priority: 0.8, Daily)
- `/library` - Thư viện (Priority: 0.7, Weekly)
- `/about` - Giới thiệu (Priority: 0.5, Monthly)

### 🎬 Nội dung động (Dynamic Content)

#### Phim (Movies)

1. **Popular Movies** - 100 phim phổ biến (Priority: 0.7, Weekly)
2. **Trending Movies** - 50 phim trending (Priority: 0.9, Daily)
3. **Top Rated Movies** - 50 phim đánh giá cao (Priority: 0.8, Monthly)
4. **Upcoming Movies** - 30 phim sắp ra (Priority: 0.85, Daily)
5. **Now Playing Movies** - 30 phim đang chiếu (Priority: 0.85, Daily)

#### TV Shows

1. **Popular TV Shows** - 100 TV show phổ biến (Priority: 0.7, Weekly)
2. **Trending TV Shows** - 50 TV show trending (Priority: 0.9, Daily)
3. **Top Rated TV Shows** - 50 TV show đánh giá cao (Priority: 0.8, Monthly)

### 🎯 Tổng số trang: ~500 URLs

## Priority (Độ ưu tiên)

| Priority | Loại trang | Change Frequency |
|----------|------------|------------------|
| 1.0 | Trang chủ | Daily |
| 0.9 | Discover, Trending | Daily |
| 0.85 | Upcoming, Now Playing | Daily |
| 0.8 | Search, Top Rated | Daily/Monthly |
| 0.7 | Library, Popular | Weekly |
| 0.5 | About | Monthly |

## Xử lý trùng lặp

- Nếu một phim/TV show xuất hiện trong nhiều danh sách (ví dụ: vừa Popular vừa Trending)
- Hệ thống sẽ **giữ URL với priority cao nhất**
- Ví dụ: Phim vừa Popular (0.7) vừa Trending (0.9) → Giữ Trending (0.9)

## Logging

Khi build hoặc truy cập `/sitemap.xml`, console sẽ hiển thị:

```
🗺️ Đang tạo sitemap tự động...
📽️ Đang tải phim phổ biến...
✅ Đã thêm 100 phim phổ biến
📺 Đang tải TV show phổ biến...
✅ Đã thêm 100 TV show phổ biến
🔥 Đang tải phim trending...
✅ Đã thêm 50 phim trending
🔥 Đang tải TV show trending...
✅ Đã thêm 50 TV show trending
⭐ Đang tải phim top rated...
✅ Đã thêm 50 phim top rated
⭐ Đang tải TV show top rated...
✅ Đã thêm 50 TV show top rated
🎬 Đang tải phim sắp ra...
✅ Đã thêm 30 phim sắp ra
🎥 Đang tải phim đang chiếu...
✅ Đã thêm 30 phim đang chiếu

✨ Hoàn thành tạo sitemap!
📊 Tổng số trang: 485
⏱️ Thời gian: 3.45s
🔗 URL: https://cineverse.vercel.app/sitemap.xml
```

## Fallback xử lý lỗi

Nếu TMDB API gặp lỗi:

- ❌ Không thể tải dữ liệu động
- ✅ Vẫn trả về các trang tĩnh (5 trang)
- 📝 Log lỗi chi tiết trong console

## Cách test

### Local Development

```bash
# 1. Chạy dev server
npm run dev

# 2. Truy cập sitemap
http://localhost:3000/sitemap.xml

# 3. Kiểm tra console logs
```

### Production Build

```bash
# 1. Build project
npm run build

# 2. Chạy production
npm start

# 3. Truy cập sitemap
http://localhost:3000/sitemap.xml
```

### Test với curl

```bash
curl http://localhost:3000/sitemap.xml
```

## SEO Benefits

### ✅ Lợi ích

1. **Google Search Console**: Dễ dàng index tất cả các trang
2. **Dynamic Content**: Tự động cập nhật khi có phim/TV show mới
3. **Priority-based**: Google biết trang nào quan trọng hơn
4. **Change Frequency**: Google biết bao lâu nên crawl lại
5. **Large Coverage**: ~500 URLs được index

### 📈 Tối ưu SEO

- Trending pages có priority cao (0.9) → Google ưu tiên index
- Popular pages cập nhật hàng tuần → Nội dung luôn fresh
- Static pages có priority phù hợp → Cân bằng crawl budget

## Submit to Search Engines

### Google Search Console

1. Truy cập: <https://search.google.com/search-console>
2. Add property: `cineverse.vercel.app`
3. Submit sitemap: `https://cineverse.vercel.app/sitemap.xml`

### Bing Webmaster Tools

1. Truy cập: <https://www.bing.com/webmasters>
2. Add site: `cineverse.vercel.app`
3. Submit sitemap: `https://cineverse.vercel.app/sitemap.xml`

## Robots.txt

Đảm bảo `robots.txt` cho phép crawl:

```txt
User-agent: *
Allow: /

Sitemap: https://cineverse.vercel.app/sitemap.xml
```

## Cập nhật định kỳ

Sitemap tự động cập nhật khi:

- ✅ Build mới (npm run build)
- ✅ Request đến `/sitemap.xml` (ISR - Incremental Static Regeneration)
- ✅ Next.js tự động regenerate theo cache rules

## Monitoring

Kiểm tra sitemap status:

- Google Search Console → Sitemaps
- Xem số URLs discovered
- Xem số URLs indexed
- Theo dõi errors (nếu có)

## Troubleshooting

### Lỗi: Sitemap rỗng

- Kiểm tra TMDB API key
- Kiểm tra network connection
- Xem console logs

### Lỗi: Không có log

- Dev mode có thể cache
- Clear `.next` folder
- Restart dev server

### Lỗi: URLs không index

- Kiểm tra robots.txt
- Submit lại sitemap
- Đợi 1-2 tuần cho Google crawl

## Performance

- ⚡ Generation time: ~3-5s
- 📦 Total URLs: ~500
- 💾 File size: ~50KB
- 🔄 Update frequency: Build time hoặc ISR

## Version History

- **v1.0**: Basic sitemap với Popular + Trending
- **v1.1**: Thêm Top Rated, Upcoming, Now Playing
- **v1.2**: Thêm logging chi tiết
- **v1.3**: Xử lý trùng lặp với priority cao nhất
- **v1.4**: Thêm error handling và fallback

---

**Tạo bởi**: CineVerse Team  
**Cập nhật**: 12/11/2025  
**Status**: ✅ Production Ready
