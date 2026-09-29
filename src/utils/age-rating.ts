/**
 * Lấy phân loại độ tuổi (age rating) theo ưu tiên:
 * 1. Rating lưu trong database (metadata["movie-rating"]) — giống admin
 * 2. Fallback: convert từ TMDB (release_dates cho Movie, content_ratings cho TV)
 */
import type { VietnamRating } from "@/utils/rating-converter";
import {
  getVietnamRatingFromContentRatings,
  getVietnamRatingFromReleaseDates,
  isValidVietnamRating,
  vietnamRatingDienAnh,
  vietnamRatingTV,
} from "@/utils/rating-converter";
import { getMovieReleaseDates, getTvContentRatings } from "@/api/tmdb";
import type { RatingInfo } from "@/utils/rating-converter";

export type AgeRatingType = "movie" | "tv";

interface DBRatingItem {
  tmdb_id: number | string;
  metadata?: {
    "movie-rating"?: string;
  } | null;
}

/**
 * Build RatingInfo từ code rating lưu trong database
 */
export function dbAgeRatingInfo(
  type: AgeRatingType,
  ratingCode: string | null | undefined
): RatingInfo | null {
  if (!ratingCode || !isValidVietnamRating(ratingCode)) return null;

  const descriptions = type === "movie" ? vietnamRatingDienAnh : vietnamRatingTV;
  return { rating: ratingCode, description: descriptions[ratingCode] };
}

async function fetchDbAgeRating(
  type: AgeRatingType,
  id: number
): Promise<RatingInfo | null> {
  const endpoint =
    type === "movie" ? "/api/admin/dienanh" : "/api/admin/chuongtrinhtv";
  const dataKey = type === "movie" ? "movies" : "tvSeries";

  try {
    const response = await fetch(endpoint);
    if (!response.ok) return null;
    const result = await response.json();
    const items = result?.[dataKey];
    if (!Array.isArray(items)) return null;

    const item = items.find(
      (it: DBRatingItem) =>
        String(it.tmdb_id) === String(id) || Number(it.tmdb_id) === id
    );

    return dbAgeRatingInfo(type, item?.metadata?.["movie-rating"]);
  } catch {
    return null;
  }
}

/**
 * Lấy rating trực tiếp từ TMDB (không qua database)
 */
export async function getTmdbAgeRating(
  type: AgeRatingType,
  id: number
): Promise<RatingInfo | null> {
  if (type === "movie") {
    const releaseDates = await getMovieReleaseDates(id);
    return getVietnamRatingFromReleaseDates(releaseDates);
  }

  const contentRatings = await getTvContentRatings(id);
  const rating = getVietnamRatingFromContentRatings(contentRatings);
  if (!rating) return null;

  return {
    rating: rating.rating,
    description: vietnamRatingTV[rating.rating as VietnamRating],
  };
}

/**
 * Rating mặc định "K" giống admin hiển thị khi trong database không có rating
 */
export function defaultAgeRating(type: AgeRatingType): RatingInfo {
  const descriptions = type === "movie" ? vietnamRatingDienAnh : vietnamRatingTV;
  return { rating: "K", description: descriptions["K"] };
}

/**
 * Lấy age rating theo ưu tiên: database trước, TMDB fallback, cuối cùng mặc định "K"
 */
export async function getAgeRating(
  type: AgeRatingType,
  id: number
): Promise<RatingInfo> {
  const dbRating = await fetchDbAgeRating(type, id);
  if (dbRating) return dbRating;
  const tmdbRating = await getTmdbAgeRating(type, id);
  if (tmdbRating) return tmdbRating;
  return defaultAgeRating(type);
}