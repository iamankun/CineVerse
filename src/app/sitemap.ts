import { MetadataRoute } from "next";
import { tmdb } from "@/api/tmdb";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://cineverse.vercel.app";

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
    const popularMovies = await tmdb.movies.popular({ language: "vi-VN" });
    const moviePages: MetadataRoute.Sitemap = popularMovies.results.slice(0, 100).map((movie) => ({
      url: `${BASE_URL}/movie/${movie.id}`,
      lastModified: currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
    console.log(`✅ Đã thêm ${moviePages.length} phim phổ biến`);

    // 2. Fetch TV show phổ biến (Popular TV Shows)
    console.log("📺 Đang tải TV show phổ biến...");
    const popularTvShows = await tmdb.tvShows.popular({ language: "vi-VN" });
    const tvPages: MetadataRoute.Sitemap = popularTvShows.results.slice(0, 100).map((tv) => ({
      url: `${BASE_URL}/tv/${tv.id}`,
      lastModified: currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
    console.log(`✅ Đã thêm ${tvPages.length} TV show phổ biến`);

    // 3. Fetch phim trending (Trending Movies)
    console.log("🔥 Đang tải phim trending...");
    const trendingMovies = await tmdb.trending.trending("movie", "week", { language: "vi-VN" });
    const trendingMoviePages: MetadataRoute.Sitemap = trendingMovies.results.slice(0, 50).map((movie) => ({
      url: `${BASE_URL}/movie/${movie.id}`,
      lastModified: currentDate,
      changeFrequency: "daily" as const,
      priority: 0.9, // Cao hơn vì trending
    }));
    console.log(`✅ Đã thêm ${trendingMoviePages.length} phim trending`);

    // 4. Fetch TV show trending (Trending TV Shows)
    console.log("🔥 Đang tải TV show trending...");
    const trendingTvShows = await tmdb.trending.trending("tv", "week", { language: "vi-VN" });
    const trendingTvPages: MetadataRoute.Sitemap = trendingTvShows.results.slice(0, 50).map((tv) => ({
      url: `${BASE_URL}/tv/${tv.id}`,
      lastModified: currentDate,
      changeFrequency: "daily" as const,
      priority: 0.9, // Cao hơn vì trending
    }));
    console.log(`✅ Đã thêm ${trendingTvPages.length} TV show trending`);

    // 5. Fetch phim top rated (Top Rated Movies)
    console.log("⭐ Đang tải phim top rated...");
    const topRatedMovies = await tmdb.movies.topRated({ language: "vi-VN" });
    const topRatedMoviePages: MetadataRoute.Sitemap = topRatedMovies.results.slice(0, 50).map((movie) => ({
      url: `${BASE_URL}/movie/${movie.id}`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));
    console.log(`✅ Đã thêm ${topRatedMoviePages.length} phim top rated`);

    // 6. Fetch TV show top rated (Top Rated TV Shows)
    console.log("⭐ Đang tải TV show top rated...");
    const topRatedTvShows = await tmdb.tvShows.topRated({ language: "vi-VN" });
    const topRatedTvPages: MetadataRoute.Sitemap = topRatedTvShows.results.slice(0, 50).map((tv) => ({
      url: `${BASE_URL}/tv/${tv.id}`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));
    console.log(`✅ Đã thêm ${topRatedTvPages.length} TV show top rated`);

    // 7. Fetch phim sắp ra (Upcoming Movies)
    console.log("🎬 Đang tải phim sắp ra...");
    const upcomingMovies = await tmdb.movies.upcoming({ language: "vi-VN" });
    const upcomingMoviePages: MetadataRoute.Sitemap = upcomingMovies.results.slice(0, 30).map((movie) => ({
      url: `${BASE_URL}/movie/${movie.id}`,
      lastModified: currentDate,
      changeFrequency: "daily" as const,
      priority: 0.85,
    }));
    console.log(`✅ Đã thêm ${upcomingMoviePages.length} phim sắp ra`);

    // 8. Fetch phim đang chiếu (Now Playing Movies)
    console.log("🎥 Đang tải phim đang chiếu...");
    const nowPlayingMovies = await tmdb.movies.nowPlaying({ language: "vi-VN" });
    const nowPlayingMoviePages: MetadataRoute.Sitemap = nowPlayingMovies.results.slice(0, 30).map((movie) => ({
      url: `${BASE_URL}/movie/${movie.id}`,
      lastModified: currentDate,
      changeFrequency: "daily" as const,
      priority: 0.85,
    }));
    console.log(`✅ Đã thêm ${nowPlayingMoviePages.length} phim đang chiếu`);

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
    ];

    // Loại bỏ trùng lặp theo URL, giữ lại priority cao nhất
    const uniquePages = Array.from(
      new Map(
        allPages.map((page) => [
          page.url,
          // Nếu trùng URL, giữ page có priority cao hơn
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
