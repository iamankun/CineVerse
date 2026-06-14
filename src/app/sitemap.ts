import { MetadataRoute } from "next";
import { tmdb, fetchWithFallback } from "@/api/tmdb";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://cineverse.ankun.dev";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date();

  // Static pages với mô tả rõ ràng
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/discover`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/library`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  console.log("🗺️ Đang tạo sitemap tự động...");
  const startTime = Date.now();

  try {
    // 1. Fetch phim phổ biến (Popular Movies)
    console.log("📽️ Đang tải phim phổ biến...");
    const popularMovies = await fetchWithFallback(
      () => tmdb.movies.popular({ language: "vi-VN" }),
      () => tmdb.movies.popular({ language: "en-US" }),
    );
    const moviePages: MetadataRoute.Sitemap = popularMovies.results.slice(0, 100).map((movie) => ({
      url: `${BASE_URL}/movie/${movie.id}`,
      lastModified: currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
    console.log(`✅ Đã thêm ${moviePages.length} phim phổ biến`);

    // 2. Fetch TV show phổ biến (Popular TV Shows)
    console.log("📺 Đang tải TV show phổ biến...");
    const popularTvShows = await fetchWithFallback(
      () => tmdb.tvShows.popular({ language: "vi-VN" }),
      () => tmdb.tvShows.popular({ language: "en-US" }),
    );
    const tvPages: MetadataRoute.Sitemap = popularTvShows.results.slice(0, 100).map((tv) => ({
      url: `${BASE_URL}/tv/${tv.id}`,
      lastModified: currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
    console.log(`✅ Đã thêm ${tvPages.length} TV show phổ biến`);

    // 3. Fetch phim trending (Trending Movies)
    console.log("🔥 Đang tải phim trending...");
    const trendingMovies = await fetchWithFallback(
      () => tmdb.trending.trending("movie", "week", { language: "vi-VN" }),
      () => tmdb.trending.trending("movie", "week", { language: "en-US" }),
    );
    const trendingMoviePages: MetadataRoute.Sitemap = trendingMovies.results.slice(0, 50).map((movie) => ({
      url: `${BASE_URL}/movie/${movie.id}`,
      lastModified: currentDate,
      changeFrequency: "daily" as const,
      priority: 0.9,
    }));
    console.log(`✅ Đã thêm ${trendingMoviePages.length} phim trending`);

    // 4. Fetch TV show trending (Trending TV Shows)
    console.log("🔥 Đang tải TV show trending...");
    const trendingTvShows = await fetchWithFallback(
      () => tmdb.trending.trending("tv", "week", { language: "vi-VN" }),
      () => tmdb.trending.trending("tv", "week", { language: "en-US" }),
    );
    const trendingTvPages: MetadataRoute.Sitemap = trendingTvShows.results.slice(0, 50).map((tv) => ({
      url: `${BASE_URL}/tv/${tv.id}`,
      lastModified: currentDate,
      changeFrequency: "daily" as const,
      priority: 0.9,
    }));
    console.log(`✅ Đã thêm ${trendingTvPages.length} TV show trending`);

    // 5. Fetch phim top rated (Top Rated Movies)
    console.log("⭐ Đang tải phim đánh giá cao...");
    const topRatedMovies = await fetchWithFallback(
      () => tmdb.movies.topRated({ language: "vi-VN" }),
      () => tmdb.movies.topRated({ language: "en-US" }),
    );
    const topRatedMoviePages: MetadataRoute.Sitemap = topRatedMovies.results.slice(0, 50).map((movie) => ({
      url: `${BASE_URL}/movie/${movie.id}`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));
    console.log(`✅ Đã thêm ${topRatedMoviePages.length} phim top rated`);

    // 6. Fetch TV show top rated (Top Rated TV Shows)
    console.log("⭐ Đang tải Chương trình TV được đánh giá cao...");
    const topRatedTvShows = await fetchWithFallback(
      () => tmdb.tvShows.topRated({ language: "vi-VN" }),
      () => tmdb.tvShows.topRated({ language: "en-US" }),
    );
    const topRatedTvPages: MetadataRoute.Sitemap = topRatedTvShows.results.slice(0, 50).map((tv) => ({
      url: `${BASE_URL}/tv/${tv.id}`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));
    console.log(`✅ Đã thêm ${topRatedTvPages.length} TV show top rated`);

    // 7. Fetch phim sắp ra (Upcoming Movies)
    console.log("🎬 Đang tải phim sắp ra...");
    const upcomingMovies = await fetchWithFallback(
      () => tmdb.movies.upcoming({ language: "vi-VN" }),
      () => tmdb.movies.upcoming({ language: "en-US" }),
    );
    const upcomingMoviePages: MetadataRoute.Sitemap = upcomingMovies.results.slice(0, 30).map((movie) => ({
      url: `${BASE_URL}/movie/${movie.id}`,
      lastModified: currentDate,
      changeFrequency: "daily" as const,
      priority: 0.85,
    }));
    console.log(`✅ Đã thêm ${upcomingMoviePages.length} phim sắp ra`);

    // 8. Fetch phim đang chiếu (Now Playing Movies)
    console.log("🎥 Đang tải phim đang chiếu...");
    const nowPlayingMovies = await fetchWithFallback(
      () => tmdb.movies.nowPlaying({ language: "vi-VN" }),
      () => tmdb.movies.nowPlaying({ language: "en-US" }),
    );
    const nowPlayingMoviePages: MetadataRoute.Sitemap = nowPlayingMovies.results.slice(0, 30).map((movie) => ({
      url: `${BASE_URL}/movie/${movie.id}`,
      lastModified: currentDate,
      changeFrequency: "daily" as const,
      priority: 0.85,
    }));
    console.log(`✅ Đã thêm ${nowPlayingMoviePages.length} phim đang chiếu`);

    // 9. Tạo trang player cho phim trending (chỉ những phim hot)
    console.log("🎮 Đang tạo trang player cho phim trending...");
    const trendingMoviePlayerPages: MetadataRoute.Sitemap = trendingMovies.results
      .slice(0, 20) // Chỉ lấy top 20 phim hot nhất
      .map((movie) => ({
        url: `${BASE_URL}/movie/${movie.id}/player`,
        lastModified: currentDate,
        changeFrequency: "weekly" as const,
        priority: 0.6, // Thấp hơn trang chi tiết
      }));
    console.log(`✅ Đã thêm ${trendingMoviePlayerPages.length} trang player phim`);

    // 10. Tạo trang player cho TV show trending (Season 1, Episode 1)
    console.log("🎮 Đang tạo trang player cho TV show trending...");
    const trendingTvPlayerPages: MetadataRoute.Sitemap = trendingTvShows.results
      .slice(0, 20) // Chỉ lấy top 20 TV show hot nhất
      .map((tv) => ({
        url: `${BASE_URL}/tv/${tv.id}/1/1/player`, // Thêm season/episode (1/1)
        lastModified: currentDate,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
    console.log(`✅ Đã thêm ${trendingTvPlayerPages.length} trang player TV show (S01E01)`);

    // 11. Thêm các trang discover theo thể loại (genre pages)
    console.log("🎭 Đang tạo trang discover theo thể loại...");
    const genrePages: MetadataRoute.Sitemap = [
      { name: "action", id: 28 },
      { name: "adventure", id: 12 },
      { name: "animation", id: 16 },
      { name: "comedy", id: 35 },
      { name: "crime", id: 80 },
      { name: "documentary", id: 99 },
      { name: "drama", id: 18 },
      { name: "family", id: 10751 },
      { name: "fantasy", id: 14 },
      { name: "history", id: 36 },
      { name: "horror", id: 27 },
      { name: "music", id: 10402 },
      { name: "mystery", id: 9648 },
      { name: "romance", id: 10749 },
      { name: "science-fiction", id: 878 },
      { name: "thriller", id: 53 },
      { name: "war", id: 10752 },
      { name: "western", id: 37 },
    ].map((genre) => ({
      url: `${BASE_URL}/discover?genre=${genre.id}`,
      lastModified: currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    }));
    console.log(`✅ Đã thêm ${genrePages.length} trang thể loại`);

    // 12. Thêm trang discover theo năm (recent years)
    console.log("📅 Đang tạo trang discover theo năm...");
    const currentYear = new Date().getFullYear();
    const yearPages: MetadataRoute.Sitemap = Array.from({ length: 5 }, (_, i) => currentYear - i)
      .map((year) => ({
        url: `${BASE_URL}/discover?year=${year}`,
        lastModified: currentDate,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }));
    console.log(`✅ Đã thêm ${yearPages.length} trang năm phát hành`);

    // 13. Thêm trang discover theo media type
    console.log("🎯 Đang tạo trang discover theo loại...");
    const mediaTypePages: MetadataRoute.Sitemap = [
      {
        url: `${BASE_URL}/discover?type=movie`,
        lastModified: currentDate,
        changeFrequency: "daily" as const,
        priority: 0.85,
      },
      {
        url: `${BASE_URL}/discover?type=tv`,
        lastModified: currentDate,
        changeFrequency: "daily" as const,
        priority: 0.85,
      },
    ];
    console.log(`✅ Đã thêm ${mediaTypePages.length} trang media type`);

    // Gộp tất cả các trang lại
    const allPages = [
      ...staticPages,
      ...moviePages,
      ...tvPages,
      ...trendingMoviePages,
      ...trendingTvPages,
      ...topRatedMoviePages,
      ...topRatedTvPages,
      ...upcomingMoviePages,
      ...nowPlayingMoviePages,
      ...trendingMoviePlayerPages,
      ...trendingTvPlayerPages,
      ...genrePages,
      ...yearPages,
      ...mediaTypePages,
    ];

    // Loại bỏ trùng lặp theo URL, giữ lại trang ưu tiên nhất
    const uniquePages = Array.from(
      new Map(
        allPages.map((page) => [
          page.url,
          // Nếu trùng URL, giữ lại trang có ưu tiên nhất
          allPages
            .filter((p) => p.url === page.url)
            .reduce((prev, current) => 
              ((current.priority || 0) > (prev.priority || 0) ? current : prev)
            ),
        ])
      ).values()
    );

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log(`\n✨ Hoàn thành tạo sitemap!`);
    console.log(`📊 Tổng số trang: ${uniquePages.length}`);
    console.log(`⏱️ Thời gian: ${duration}s`);
    console.log(`🔗 URL: ${BASE_URL}/sitemap.xml\n`);

    return uniquePages;
  } catch (error) {
    console.error("❌ Lỗi khi tạo sitemap:", error);
    console.log("⚠️ Fallback: Chỉ trả về các trang tĩnh");
    // Return at least static pages if API fails
    return staticPages;
  }
}
