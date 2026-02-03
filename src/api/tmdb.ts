import { env } from "@/utils/env";
import { isEmpty } from "@/utils/helpers";
import { TMDB } from "tmdb-ts";

const token = env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN;

if (isEmpty(token)) {
  throw new Error("TMDB chưa được cài token API");
}

// Khởi tạo TMDB client với cấu hình ngôn ngữ mặc định
// Ưu tiên: Việt Nam -> Nhật -> Anh -> khác
const tmdbClient = new TMDB(token);

export const tmdb = tmdbClient;

// Helper function to get proxied TMDB image URL
export function getTmdbImageUrl(originalPath: string | null, size: string = 'w500'): string | null {
  if (!originalPath) return null;
  
  // Remove leading slash if present and encode
  const cleanPath = originalPath.startsWith('/') ? originalPath.slice(1) : originalPath;
  const encodedPath = encodeURIComponent(cleanPath);
  
  return `/api/proxy/tmdb-image?path=${size}/${encodedPath}`;
}

// Helper function for retry logic
async function fetchWithRetry(
  url: string, 
  options: RequestInit, 
  maxRetries: number = 3,
  timeout: number = 10000
): Promise<Response> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        return response;
      }
      
      // If response is not ok, throw error to trigger retry
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      
    } catch (error: any) {
      lastError = error;
      
      // Log retry attempt
      if (attempt < maxRetries) {
        console.warn(`TMDB API retry ${attempt}/${maxRetries} for ${url}:`, error.message);
        // Exponential backoff: wait longer between retries
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
  
  throw lastError!;
}

// =======================
// Helper functions với include_image_language
// =======================

/**
 * Lấy movie details với support cho include_image_language và include_video_language
 * Để lấy logo/images/videos đa ngôn ngữ (vi, en, null)
 */
export async function getMovieDetails(
  movieId: number,
  appendToResponse: string[] = [],
  includeImages: boolean = false
) {
  const params = new URLSearchParams({
    language: 'vi-VN',
  });

  if (appendToResponse.length > 0) {
    params.append('append_to_response', appendToResponse.join(','));
  }

  // Thêm include_image_language nếu có images trong append_to_response
  // Ưu tiên: Việt -> Nhật -> Anh -> khác
  if (includeImages || appendToResponse.includes('images')) {
    params.append('include_image_language', 'vi,ja,en,null');
  }

  // Thêm include_video_language nếu có videos trong append_to_response
  // Ưu tiên: Việt -> Nhật -> Anh -> khác
  if (appendToResponse.includes('videos')) {
    params.append('include_video_language', 'vi,ja,en,null');
  }

  const response = await fetchWithRetry(
    `https://api.themoviedb.org/3/movie/${movieId}?${params.toString()}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': 'application/json'
      },
      cache: 'force-cache',
      next: { 
        revalidate: 86400, // Cache 24 hours (1 ngày) - Tăng từ 1h lên 1 ngày cho xem liên tục
        tags: ['tmdb', 'movies', `movie-${movieId}`, 'images', 'videos', 'trailers', 'logos']
      }
    } as any
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch movie details: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Lấy TV show details với support cho include_image_language và include_video_language
 */
export async function getTvShowDetails(
  tvId: number,
  appendToResponse: string[] = [],
  includeImages: boolean = false
) {
  const params = new URLSearchParams({
    language: 'vi-VN',
  });

  if (appendToResponse.length > 0) {
    params.append('append_to_response', appendToResponse.join(','));
  }

  // Thêm include_image_language nếu có images trong append_to_response
  // Ưu tiên: Việt -> Nhật -> Anh -> khác
  if (includeImages || appendToResponse.includes('images')) {
    params.append('include_image_language', 'vi,ja,en,null');
  }

  // Thêm include_video_language nếu có videos trong append_to_response
  // Ưu tiên: Việt -> Nhật -> Anh -> khác
  if (appendToResponse.includes('videos')) {
    params.append('include_video_language', 'vi,ja,en,null');
  }

  const response = await fetchWithRetry(
    `https://api.themoviedb.org/3/tv/${tvId}?${params.toString()}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': 'application/json'
      },
      cache: 'force-cache',
      next: { 
        revalidate: 86400, // Cache 24 hours (1 ngày)
        tags: ['tmdb', 'tv-shows', `tv-${tvId}`, 'images', 'videos', 'trailers', 'logos']
      }
    } as any
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch TV show details: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Lấy TV season details với support cho include_image_language
 */
export async function getTvSeasonDetails(
  tvId: number,
  seasonNumber: number,
  includeImages: boolean = false
) {
  const params = new URLSearchParams({
    language: 'vi-VN',
  });

  // Thêm include_image_language nếu cần
  // Ưu tiên: Việt -> Nhật -> Anh -> khác
  if (includeImages) {
    params.append('include_image_language', 'vi,ja,en,null');
  }

  const response = await fetchWithRetry(
    `https://api.themoviedb.org/3/tv/${tvId}/season/${seasonNumber}?${params.toString()}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': 'application/json'
      },
      cache: 'force-cache',
      next: { 
        revalidate: 86400, // Cache 24 hours (1 ngày)
        tags: ['tmdb', 'tv-shows', `tv-${tvId}`, `season-${seasonNumber}`, 'images', 'posters']
      }
    } as any
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch TV season details: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Lấy TV season details với merge CineVerse sources
 * Ưu tiên: TMDB metadata + CineVerse episodes (bổ sung thiếu)
 */
export async function getTvSeasonDetailsWithCineVerse(
  tvId: number,
  seasonNumber: number
) {
  // Fetch both TMDB and CineVerse data in parallel
  const [tmdbData, cineVerseResponse] = await Promise.all([
    getTvSeasonDetails(tvId, seasonNumber).catch(() => null),
    fetch(`/api/sources/tv/${tvId}`).then(r => r.ok ? r.json() : null).catch(() => null)
  ]);

  // If no CineVerse data, return TMDB only
  if (!cineVerseResponse?.success || !cineVerseResponse.data?.seasons?.[seasonNumber]) {
    return tmdbData;
  }

  const cineVerseEpisodes = cineVerseResponse.data.seasons[seasonNumber];
  const cineVerseEpisodeNumbers = Object.keys(cineVerseEpisodes).map(Number);
  
  // Start with TMDB episodes (if available)
  const episodes = tmdbData?.episodes ? [...tmdbData.episodes] : [];
  const existingEpisodeNumbers = episodes.map((ep: any) => ep.episode_number);

  // Add missing episodes from CineVerse
  cineVerseEpisodeNumbers.forEach((episodeNum) => {
    if (!existingEpisodeNumbers.includes(episodeNum)) {
      const ep = cineVerseEpisodes[episodeNum];
      episodes.push({
        id: tvId * 1000 + seasonNumber * 100 + episodeNum, // Generate unique ID
        episode_number: episodeNum,
        name: ep.title || `Tập ${episodeNum}`,
        overview: ep.sources?.[0]?.title || 'CineVerse - Nguồn nội bộ',
        still_path: null,
        air_date: new Date().toISOString().split('T')[0],
        runtime: 24, // Default runtime
        season_number: seasonNumber,
        hasCineVerseSource: true,
        cineVerseOnly: true // Flag to indicate this episode is from CineVerse only
      });
    } else {
      // Mark TMDB episodes that also have CineVerse sources
      const index = episodes.findIndex((ep: any) => ep.episode_number === episodeNum);
      if (index !== -1) {
        episodes[index].hasCineVerseSource = true;
      }
    }
  });

  // Sort episodes by episode_number
  episodes.sort((a: any, b: any) => a.episode_number - b.episode_number);

  return {
    ...tmdbData,
    id: tvId,
    season_number: seasonNumber,
    episodes,
    name: tmdbData?.name || `Mùa ${seasonNumber}`,
    overview: tmdbData?.overview || '',
    poster_path: tmdbData?.poster_path || null,
    air_date: tmdbData?.air_date || new Date().toISOString().split('T')[0],
  };
}

// =======================
// Các hàm search tiện ích
// =======================

// Tìm kiếm phim
export async function searchMovies(query: string, page = 1) {
  if (!query.trim()) return [];
  try {
    const results = await tmdb.search.movies({
      query,
      page,
      include_adult: false,
      language: "vi-VN",
    });
    return results.results;
  } catch (error) {
    console.error("Lỗi khi tìm kiếm phim:", error);
    return [];
  }
}

// Tìm kiếm TV series
export async function searchTV(query: string, page = 1) {
  if (!query.trim()) return [];
  try {
    const results = await tmdb.search.tvShows({ query, page, language: "vi-VN" });
    return results.results;
  } catch (error) {
    console.error("Lỗi khi tìm kiếm TV:", error);
    return [];
  }
}

// Tìm kiếm diễn viên/người nổi tiếng
export async function searchPeople(query: string, page = 1) {
  if (!query.trim()) return [];
  try {
    const results = await tmdb.search.people({ query, page });
    return results.results;
  } catch (error) {
    console.error("Lỗi khi tìm kiếm People:", error);
    return [];
  }
}

// Hàm search tổng hợp (movie | tv | person)
export async function search(
  query: string,
  type: "movie" | "tv" | "person",
  page = 1
) {
  if (type === "movie") return searchMovies(query, page);
  if (type === "tv") return searchTV(query, page);
  if (type === "person") return searchPeople(query, page);
  return [];
}

// =======================
// Các hàm lấy Age Rating / Certification
// =======================

/**
 * Lấy release_dates cho Movie (chứa certification/age rating)
 * https://developer.themoviedb.org/reference/movie-release-dates
 */
export async function getMovieReleaseDates(movieId: number) {
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${movieId}/release_dates`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': 'application/json'
      },
      cache: 'force-cache',
      next: { 
        revalidate: 86400 * 7, // Cache 7 ngày (certification ít thay đổi)
        tags: ['tmdb', 'movies', `movie-${movieId}`, 'release-dates', 'certification']
      }
    } as any
  );

  if (!response.ok) {
    console.warn(`Failed to fetch movie release dates: ${response.statusText}`);
    return null;
  }

  return response.json();
}

/**
 * Lấy content_ratings cho TV Show (chứa age rating)
 * https://developer.themoviedb.org/reference/tv-series-content-ratings
 */
export async function getTvContentRatings(tvId: number) {
  const response = await fetch(
    `https://api.themoviedb.org/3/tv/${tvId}/content_ratings`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': 'application/json'
      },
      cache: 'force-cache',
      next: { 
        revalidate: 86400 * 7, // Cache 7 ngày
        tags: ['tmdb', 'tv-shows', `tv-${tvId}`, 'content-ratings', 'certification']
      }
    } as any
  );

  if (!response.ok) {
    console.warn(`Failed to fetch TV content ratings: ${response.statusText}`);
    return null;
  }

  return response.json();
}