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
    // Fetch popular movies
    const popularMovies = await tmdb.movies.popular({ language: "vi-VN" });
    const moviePages: MetadataRoute.Sitemap = popularMovies.results.slice(0, 100).map((movie) => ({
      url: `${BASE_URL}/movie/${movie.id}`,
      lastModified: currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    // Fetch popular TV shows
    const popularTvShows = await tmdb.tvShows.popular({ language: "vi-VN" });
    const tvPages: MetadataRoute.Sitemap = popularTvShows.results.slice(0, 100).map((tv) => ({
      url: `${BASE_URL}/tv/${tv.id}`,
      lastModified: currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    // Fetch trending movies
    const trendingMovies = await tmdb.trending.trending("movie", "week", { language: "vi-VN" });
    const trendingMoviePages: MetadataRoute.Sitemap = trendingMovies.results.slice(0, 50).map((movie) => ({
      url: `${BASE_URL}/movie/${movie.id}`,
      lastModified: currentDate,
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));

    // Fetch trending TV shows
    const trendingTvShows = await tmdb.trending.trending("tv", "week", { language: "vi-VN" });
    const trendingTvPages: MetadataRoute.Sitemap = trendingTvShows.results.slice(0, 50).map((tv) => ({
      url: `${BASE_URL}/tv/${tv.id}`,
      lastModified: currentDate,
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));

    // Remove duplicates by URL
    const allPages = [...staticPages, ...moviePages, ...tvPages, ...trendingMoviePages, ...trendingTvPages];
    const uniquePages = Array.from(
      new Map(allPages.map((page) => [page.url, page])).values()
    );

    return uniquePages;
  } catch (error) {
    console.error("Error generating sitemap:", error);
    // Return at least static pages if API fails
    return staticPages;
  }
}
