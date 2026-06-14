import { env } from "@/utils/env";
import { isEmpty } from "@/utils/helpers";
import { TMDB } from "tmdb-ts";

const token = env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN;

if (isEmpty(token)) {
  throw new Error("TMDB chưa được cài token API");
}

// Khởi tạo TMDB client với cấu hình ngôn ngữ mặc định
// Ưu tiên: Việt Nam -> Nhật -> Anh -> khác
const tmdbClient = new TMDB(token, {
  fetch: (...args) => fetch(...args),
});

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

function buildDetailUrl(
  mediaType: 'movie' | 'tv',
  id: number,
  language: string,
  appendToResponse: string[],
  includeImages: boolean,
) {
  const params = new URLSearchParams({ language });

  if (appendToResponse.length > 0) {
    params.append('append_to_response', appendToResponse.join(','));
  }

  if (includeImages || appendToResponse.includes('images')) {
    params.append('include_image_language', 'vi,ja,en,null');
  }

  if (appendToResponse.includes('videos')) {
    params.append('include_video_language', 'vi,ja,en,null');
  }

  const path = mediaType === 'movie' ? `movie/${id}` : `tv/${id}`;
  const tagName = mediaType === 'movie' ? 'movies' : 'tv-shows';

  return {
    url: `https://api.themoviedb.org/3/${path}?${params.toString()}`,
    tags: ['tmdb', tagName, `${mediaType}-${id}`, 'images', 'videos', 'trailers', 'logos'],
  };
}

async function fetchDetailWithFallbackBuilt(
  mediaType: 'movie' | 'tv',
  id: number,
  appendToResponse: string[],
  includeImages: boolean,
) {
  const viConfig = buildDetailUrl(mediaType, id, 'vi-VN', appendToResponse, includeImages);
  const enConfig = buildDetailUrl(mediaType, id, 'en-US', appendToResponse, includeImages);

  const options: RequestInit = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'accept': 'application/json',
    },
    cache: 'force-cache',
    next: { revalidate: 86400, tags: viConfig.tags } as any,
  };

  const [vi, en] = await Promise.all([
    fetchWithRetry(viConfig.url, options).then(r => r.json()),
    fetchWithRetry(enConfig.url, options).then(r => r.json()),
  ]);

  const viTitle = vi.title ?? vi.name ?? '';
  const enTitle = en.title ?? en.name ?? '';

  // Có bản dịch tiếng Việt
  if (viTitle && viTitle !== enTitle) return vi;

  // Không có → dùng tiếng Anh
  if (enTitle) {
    return {
      ...vi,
      title: enTitle,
      name: enTitle,
      overview: en.overview ?? vi.overview,
      tagline: en.tagline ?? vi.tagline,
    };
  }

  return vi;
}

/**
 * Lấy movie details với support cho include_image_language và include_video_language
 * Để lấy logo/images/videos đa ngôn ngữ (vi, en, null), kèm fallback tiếng Việt → tiếng Anh.
 */
export async function getMovieDetails(
  movieId: number,
  appendToResponse: string[] = [],
  includeImages: boolean = false
) {
  return fetchDetailWithFallbackBuilt('movie', movieId, appendToResponse, includeImages);
}

/**
 * Lấy TV show details với support cho include_image_language và include_video_language
 * Kèm fallback tiếng Việt → tiếng Anh.
 */
export async function getTvShowDetails(
  tvId: number,
  appendToResponse: string[] = [],
  includeImages: boolean = false
) {
  return fetchDetailWithFallbackBuilt('tv', tvId, appendToResponse, includeImages);
}

/**
 * Lấy TV season details với support cho include_image_language, kèm fallback tiếng Việt → tiếng Anh.
 */
export async function getTvSeasonDetails(
  tvId: number,
  seasonNumber: number,
  includeImages: boolean = false
) {
  const buildUrl = (language: string) => {
    const params = new URLSearchParams({ language });
    if (includeImages) {
      params.append('include_image_language', 'vi,ja,en,null');
    }
    return `https://api.themoviedb.org/3/tv/${tvId}/season/${seasonNumber}?${params.toString()}`;
  };

  const options: RequestInit = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'accept': 'application/json',
    },
    cache: 'force-cache',
    next: { revalidate: 86400, tags: ['tmdb', 'tv-shows', `tv-${tvId}`, `season-${seasonNumber}`, 'images', 'posters'] } as any,
  };

  const [vi, en] = await Promise.all([
    fetchWithRetry(buildUrl('vi-VN'), options).then(r => r.json()),
    fetchWithRetry(buildUrl('en-US'), options).then(r => r.json()),
  ]);

  if (!vi.name || vi.name !== vi.original_name) {
    return vi;
  }

  if (en.name && en.name !== en.original_name) {
    return { ...vi, name: en.name, overview: en.overview ?? vi.overview };
  }

  return vi;
}

/**
 * Lấy TV season details với merge CineVerse sources
 * Ưu tiên: TMDB metadata + CineVerse episodes (bổ sung thiếu)
 */
export async function getTvSeasonDetailsWithCineVerse(
  tvId: number,
  seasonNumber: number
) {
  // Fetch TMDB data only (local files removed)
  const tmdbData = await getTvSeasonDetails(tvId, seasonNumber).catch(() => null);

  // If no TMDB data, return empty
  if (!tmdbData) {
    return null;
  }

  return tmdbData;
}

// =======================
// Các hàm search tiện ích
// =======================

// Tìm kiếm phim
export async function searchMovies(query: string, page = 1) {
  if (!query.trim()) return [];
  try {
    const results = await fetchWithFallback(
      () => tmdb.search.movies({ query, page, include_adult: false, language: "vi-VN" }),
      () => tmdb.search.movies({ query, page, include_adult: false, language: "en-US" }),
    );
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
    const results = await fetchWithFallback(
      () => tmdb.search.tvShows({ query, page, language: "vi-VN" }),
      () => tmdb.search.tvShows({ query, page, language: "en-US" }),
    );
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

// =======================
// Language fallback helper
// =======================

type ListResult<T> = {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
};

/**
 * Fetch list with language fallback: vi-VN → en-US → original.
 * Nếu không có bản dịch tiếng Việt, dùng tiếng Anh.
 * Nếu không có bản dịch tiếng Anh, giữ nguyên gốc.
 */
export async function fetchWithFallback<T extends { id: number; original_title?: string; original_name?: string; title?: string; name?: string; original_language?: string }>(
  fetchVi: () => Promise<ListResult<T>>,
  fetchEn: () => Promise<ListResult<T>>,
): Promise<ListResult<T>> {
  const [vi, en] = await Promise.all([fetchVi(), fetchEn()]);
  const enById = new Map(en.results.map(r => [r.id, r]));

  return {
    ...vi,
    results: vi.results.map(item => {
      const viTitle = item.title ?? item.name ?? '';
      const enItem = enById.get(item.id);
      const enTitle = enItem?.title ?? enItem?.name ?? '';

      // Có bản dịch tiếng Việt (title khác với title tiếng Anh)
      if (viTitle && viTitle !== enTitle) return item;

      // Không có bản dịch tiếng Việt → dùng tiếng Anh
      if (enTitle) {
        return { ...item, title: enTitle, name: enTitle };
      }

      // Giữ nguyên gốc
      return item;
    }),
  };
}

type DetailWithFallback<T> = T & { title?: string; name?: string };

/**
 * Fetch single item with language fallback: vi-VN → en-US → original.
 * Dùng cho các API details (tmdb.movies.details, tmdb.tvShows.details).
 */
export async function fetchDetailWithFallback<T extends { id: number; title?: string; name?: string }>(
  fetchVi: () => Promise<T>,
  fetchEn: () => Promise<T>,
): Promise<DetailWithFallback<T>> {
  const [vi, en] = await Promise.all([fetchVi(), fetchEn()]);
  const viTitle = vi.title ?? vi.name ?? '';
  const enTitle = en.title ?? en.name ?? '';

  // Có bản dịch tiếng Việt
  if (viTitle && viTitle !== enTitle) return vi;

  // Không có → dùng tiếng Anh
  if (enTitle) {
    return { ...vi, title: enTitle, name: enTitle };
  }

  return vi;
}