"use client";

import { env } from "@/utils/env";
import { isEmpty } from "@/utils/helpers";
import { TMDB } from "tmdb-ts";

const token = env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN;

if (isEmpty(token)) {
  throw new Error("TMDB chưa được cài token API");
}

// Khởi tạo TMDB client với cấu hình ngôn ngữ mặc định
// Sử dụng đúng format ngôn ngữ theo yêu cầu của thư viện
const defaultConfig = {
  language: "vi-VN" as const, // Type assertion để phù hợp với yêu cầu của thư viện
};

// Cấu hình cho videos/trailers (giữ nguyên tiếng Anh)
const videoConfig = {
  language: "en-US" as const,
};

export const tmdb = new TMDB(token);

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
  if (includeImages || appendToResponse.includes('images')) {
    params.append('include_image_language', 'vi,en,null');
  }

  // Thêm include_video_language nếu có videos trong append_to_response
  // Để lấy trailers đa ngôn ngữ (vi, en, và các ngôn ngữ khác)
  if (appendToResponse.includes('videos')) {
    params.append('include_video_language', 'vi,en,null');
  }

  const response = await fetch(
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
    }
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
  if (includeImages || appendToResponse.includes('images')) {
    params.append('include_image_language', 'vi,en,null');
  }

  // Thêm include_video_language nếu có videos trong append_to_response
  if (appendToResponse.includes('videos')) {
    params.append('include_video_language', 'vi,en,null');
  }

  const response = await fetch(
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
    }
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
  if (includeImages) {
    params.append('include_image_language', 'vi,en,null');
  }

  const response = await fetch(
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
    }
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