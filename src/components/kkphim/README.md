# KKPhim API Integration

## Tổng quan

KKPhim API đã được tích hợp hoàn chỉnh vào CineVerse với các tính năng sau:

- ✅ **Full API Coverage** - Hỗ trợ tất cả endpoints của KKPhim API
- ✅ **React Hooks** - Custom hooks cho dễ sử dụng
- ✅ **TypeScript Support** - Full type safety
- ✅ **Player Integration** - Tự động phát video từ nhiều nguồn
- ✅ **Image Optimization** - Tự động chuyển đổi ảnh sang WEBP
- ✅ **URL Normalization** - Tự động xử lý YouTube URLs
- ✅ **Responsive Design** - Tương thích mọi thiết bị

## Files đã tạo

### 📁 Services
- `src/services/kkphim-api.ts` - API client với đầy đủ methods
- `src/utils/video-helpers.ts` - Video URL utilities

### 📁 Components
- `src/components/kkphim/KKPhimMovieCard.tsx` - Movie card component
- `src/components/kkphim/KKPhimPlayer.tsx` - Full player component

### 📁 Hooks
- `src/hooks/useKKPhim.ts` - React hooks cho API calls

### 📁 Pages
- `src/app/kkphim-demo/page.tsx` - Demo page với đầy đủ tính năng
- `src/app/kkphim/[slug]/page.tsx` - Movie player route
- `src/app/kkphim/[slug]/player/page.tsx` - TV player route

## API Methods

### 🎬 Movies & TV Shows
```typescript
// Phim mới cập nhật
KKPhimAPI.getNewMovies(page, version) // v1 | v2 | v3

// Chi tiết phim
KKPhimAPI.getMovieDetails(slug)

// TMDB lookup
KKPhimAPI.getByTMDBId(type, id) // movie | tv
```

### 📋 Lists & Search
```typescript
// Danh sách theo loại
KKPhimAPI.getMovieList({
  type_list: 'phim-bo' | 'phim-le' | 'tv-shows' | 'hoat-hinh' | 'phim-vietsub' | 'phim-thuyet-minh' | 'phim-long-tieng',
  page, sort_field, sort_type, sort_lang, category, country, year, limit
})

// Tìm kiếm
KKPhimAPI.searchMovies({
  keyword, page, sort_field, sort_type, sort_lang, category, country, year, limit
})
```

### 🏷️ Categories & Countries
```typescript
// Thể loại
KKPhimAPI.getGenres()
KKPhimAPI.getMoviesByGenre({ type_list, ...params })

// Quốc gia
KKPhimAPI.getCountries()
KKPhimAPI.getMoviesByCountry({ type_list, ...params })

// Theo năm
KKPhimAPI.getMoviesByYear({ type_list: 2024, ...params })
```

### 🖼️ Image Processing
```typescript
// Chuyển đổi sang WEBP
KKPhimAPI.convertImageToWebp(imageUrl)
```

## React Hooks

### 🎬 Basic Usage
```typescript
import { useKKPhimNewMovies, useKKPhimSearch } from '@/hooks/useKKPhim';

// Phim mới
const { movies, loading, error, pagination, refetch } = useKKPhimNewMovies('v1');

// Tìm kiếm
const { movies, loading, error, search } = useKKPhimSearch('keyword');

// Chi tiết phim
const { movie, loading, error } = useKKPhimMovieDetails('slug');
```

### 📺 Advanced Usage
```typescript
// Danh sách phim lẻ
const { movies } = useKKPhimMovieList('phim-le', {
  category: 'hanh-dong',
  country: 'trung-quoc',
  year: 2024,
  sort_lang: 'vietsub'
});

// TMDB lookup
const { movie } = useKKPhimTMDB('movie', 280945);
```

## Component Usage

### 🎬 Movie Card
```typescript
import { KKPhimMovieCard } from '@/components/kkphim/KKPhimMovieCard';

<KKPhimMovieCard
  movie={movie}
  showType={true}
  showYear={true}
  showCountry={true}
  showCategory={true}
/>
```

### 🎮 Player Component
```typescript
import KKPhimPlayer from '@/components/kkphim/KKPhimPlayer';

// Movie player
<KKPhimPlayer slug="movie-slug" type="movie" />

// TV player
<KKPhimPlayer 
  slug="tv-slug" 
  type="tv" 
  seasonNumber={1}
  episodeNumber={1}
/>
```

## Routes

### 🎬 Demo Page
- **URL**: `/kkphim-demo`
- **Features**: Full demo với search, filters, pagination

### 🎥 Movie Player
- **URL**: `/kkphim/[slug]`
- **Example**: `/kkphim/ngoi-truong-xac-song`

### 📺 TV Player
- **URL**: `/kkphim/[slug]/player`
- **Example**: `/kkphim/one-piece/player?season=1&episode=1`

## Features

### 🎯 Auto Source Detection
- YouTube → Embed player
- Dailymotion → Embed player  
- Direct MP4 → HTML5 video
- VidSrc → Iframe embed

### 🖼️ Image Optimization
- Tự động chuyển đổi sang WEBP
- Fallback cho broken images
- Lazy loading với Next.js Image

### 🔍 Smart Search
- Real-time search
- Multiple filters (genre, country, year, language)
- Pagination support

### 📱 Responsive Design
- Mobile-first approach
- Touch-friendly controls
- Adaptive grid layouts

## Integration với CineVerse

### 🔄 Admin Dashboard
API đã được tích hợp vào admin dashboard với:
- Auto-normalize YouTube URLs on paste
- Support cho KKPhim sources
- TMDB ID lookup

### 🎮 Player Controls
KKPhim player tương thích với:
- `TrinhDieuKhien` controls
- Gesture controls
- Fullscreen support
- Source switching

## Testing

### 🧪 Demo Routes
1. **Demo Page**: `http://localhost:3000/kkphim-demo`
2. **Movie Player**: `http://localhost:3000/kkphim/[slug]`
3. **TV Player**: `http://localhost:3000/kkphim/[slug]/player`

### 🔧 API Testing
```bash
# Test API endpoints
curl "https://phimapi.com/danh-sach/phim-moi-cap-nhat?page=1"
curl "https://phimapi.com/v1/api/tim-kiem?keyword=Thước"
```

## Configuration

### ⚙️ Environment Variables
Không cần cấu hình thêm - API là public.

### 🔧 Customization
- Modify `KKPhimAPI.BASE_URL` nếu cần
- Custom hooks cho specific use cases
- Extend components cho additional features

## Performance

### ⚡ Optimizations
- React.memo cho components
- useCallback cho API calls
- Image optimization với WEBP
- Lazy loading cho movie lists

### 📊 Caching
- React Query caching (nếu cần)
- Browser cache cho images
- API response caching (nếu cần)

## Troubleshooting

### 🐛 Common Issues
1. **CORS errors** - API có CORS headers
2. **Rate limiting** - Giới hạn requests/phút
3. **Broken images** - Fallback placeholders
4. **Slow loading** - Preload data

### 🔧 Solutions
- Check API status
- Verify image URLs
- Monitor network requests
- Use React DevTools

## Future Enhancements

### 🚀 Planned Features
- [ ] React Query integration
- [ ] Offline support
- [ ] Download functionality
- [ ] Subtitle support
- [ ] Watch history
- [ ] Favorites system

### 🎨 UI/UX Improvements
- [ ] Skeleton loading
- [ ] Infinite scroll
- [ ] Advanced filters
- [ ] Watch party features

---

## 🎉 Hoàn thành!

KKPhim API đã được tích hợp hoàn chỉnh vào CineVerse với đầy đủ tính năng:

✅ **Full API Coverage** - Tất cả endpoints  
✅ **Type Safety** - Full TypeScript support  
✅ **Modern React** - Hooks và components  
✅ **Responsive Design** - Mobile-first  
✅ **Performance** - Optimized rendering  
✅ **Easy Integration** - Ready to use  

**Demo**: `http://localhost:3000/kkphim-demo` 🚀
