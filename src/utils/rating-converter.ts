/**
 * Utility để convert các hệ thống phân loại độ tuổi quốc tế sang hệ thống Việt Nam
 * 
 * Hệ thống Việt Nam:
 * - P: Phim dành cho mọi lứa tuổi (≈ G)
 * - K: Phim dành cho trẻ em dưới 13 tuổi xem cùng phụ huynh (≈ PG)
 * - T13: Phim dành cho khán giả từ 13 tuổi trở lên (≈ PG-13)
 * - T16: Phim dành cho khán giả từ 16 tuổi trở lên (≈ PG-13/R light)
 * - T18: Phim dành cho khán giả từ 18 tuổi trở lên (≈ R)
 * - C: Phim bị cấm chiếu trên mọi nền tảng (≈ NC-17)
 */

export type VietnamRating = 'P' | 'K' | 'T13' | 'T16' | 'T18' | 'C';

export interface RatingInfo {
  rating: VietnamRating;
  description: string;
}

// Mô tả cho các rating Việt Nam
export const vietnamRatingDescriptions: Record<VietnamRating, string> = {
  'P': 'Phim dành cho mọi lứa tuổi',
  'K': 'Phim dành cho trẻ em dưới 13 tuổi xem cùng phụ huynh',
  'T13': 'Phim dành cho khán giả từ 13 tuổi trở lên',
  'T16': 'Phim dành cho khán giả từ 16 tuổi trở lên',
  'T18': 'Phim dành cho khán giả từ 18 tuổi trở lên',
  'C': 'Phim bị cấm chiếu trên mọi nền tảng',
};

/**
 * Bảng mapping US MPAA ratings sang Vietnam ratings
 * https://en.wikipedia.org/wiki/Motion_Picture_Association_film_rating_system
 */
const usMPAAMapping: Record<string, VietnamRating> = {
  'G': 'P',           // General Audiences → Phổ biến
  'PG': 'K',          // Parental Guidance → Khán giả nhỏ (cần phụ huynh)
  'PG-13': 'T13',     // Parents Strongly Cautioned → 13+
  'R': 'T18',         // Restricted → 18+
  'NC-17': 'C',       // Adults Only → Cấm
  'NR': 'T16',        // Not Rated → Default T16 (an toàn)
  'Unrated': 'T16',   // Unrated → Default T16
};

/**
 * Bảng mapping UK BBFC ratings sang Vietnam ratings
 * https://en.wikipedia.org/wiki/British_Board_of_Film_Classification
 */
const ukBBFCMapping: Record<string, VietnamRating> = {
  'U': 'P',           // Universal → Phổ biến
  'PG': 'K',          // Parental Guidance → Khán giả nhỏ
  '12': 'T13',        // Suitable for 12+ → 13+
  '12A': 'T13',       // 12A (with adult) → 13+
  '15': 'T16',        // Suitable for 15+ → 16+
  '18': 'T18',        // Adults only → 18+
  'R18': 'C',         // Restricted 18 → Cấm
};

/**
 * Bảng mapping Đức FSK ratings sang Vietnam ratings
 * https://en.wikipedia.org/wiki/Freiwillige_Selbstkontrolle_der_Filmwirtschaft
 */
const deFSKMapping: Record<string, VietnamRating> = {
  '0': 'P',           // FSK 0 → Phổ biến
  '6': 'K',           // FSK 6 → Khán giả nhỏ
  '12': 'T13',        // FSK 12 → 13+
  '16': 'T16',        // FSK 16 → 16+
  '18': 'T18',        // FSK 18 → 18+
};

/**
 * Bảng mapping Úc ratings sang Vietnam ratings
 */
const auMapping: Record<string, VietnamRating> = {
  'G': 'P',           // General → Phổ biến
  'PG': 'K',          // Parental Guidance → Khán giả nhỏ
  'M': 'T13',         // Mature → 13+
  'MA15+': 'T16',     // Mature Accompanied → 16+
  'R18+': 'T18',      // Restricted → 18+
  'X18+': 'C',        // X Rated → Cấm
};

/**
 * Bảng mapping Pháp ratings sang Vietnam ratings
 */
const frMapping: Record<string, VietnamRating> = {
  'U': 'P',           // Universal → Phổ biến
  '10': 'K',          // 10+ → Khán giả nhỏ
  '12': 'T13',        // 12+ → 13+
  '16': 'T16',        // 16+ → 16+
  '18': 'T18',        // 18+ → 18+
};

/**
 * Bảng mapping Nhật Bản ratings sang Vietnam ratings
 */
const jpMapping: Record<string, VietnamRating> = {
  'G': 'P',           // General → Phổ biến
  'PG12': 'T13',      // PG-12 → 13+
  'R15+': 'T16',      // R15+ → 16+
  'R18+': 'T18',      // R18+ → 18+
};

/**
 * Bảng mapping Hàn Quốc ratings sang Vietnam ratings
 */
const krMapping: Record<string, VietnamRating> = {
  'ALL': 'P',         // All → Phổ biến
  '전체관람가': 'P',   // All ages → Phổ biến
  '12': 'T13',        // 12+ → 13+
  '12세이상관람가': 'T13',
  '15': 'T16',        // 15+ → 16+
  '15세이상관람가': 'T16',
  '18': 'T18',        // 18+ → 18+
  '청소년관람불가': 'T18',
  'R': 'C',           // Restricted → Cấm
};

/**
 * Bảng mapping Brazil ratings sang Vietnam ratings
 */
const brMapping: Record<string, VietnamRating> = {
  'L': 'P',           // Livre (Free) → Phổ biến
  '10': 'K',          // 10+ → Khán giả nhỏ
  '12': 'T13',        // 12+ → 13+
  '14': 'T16',        // 14+ → 16+
  '16': 'T16',        // 16+ → 16+
  '18': 'T18',        // 18+ → 18+
};

/**
 * Bảng mapping tổng hợp theo quốc gia
 */
const countryMappings: Record<string, Record<string, VietnamRating>> = {
  'US': usMPAAMapping,
  'GB': ukBBFCMapping,
  'DE': deFSKMapping,
  'AU': auMapping,
  'FR': frMapping,
  'JP': jpMapping,
  'KR': krMapping,
  'BR': brMapping,
};

/**
 * Thứ tự ưu tiên quốc gia khi tìm rating
 * (US được ưu tiên cao nhất vì phổ biến nhất)
 */
const countryPriority = ['US', 'GB', 'AU', 'DE', 'FR', 'BR', 'JP', 'KR'];

/**
 * Interface cho release_dates từ TMDB API
 */
export interface TMDBReleaseDates {
  results: Array<{
    iso_3166_1: string;
    release_dates: Array<{
      certification: string;
      type: number;
      release_date: string;
    }>;
  }>;
}

/**
 * Interface cho content_ratings từ TMDB API (TV Shows)
 */
export interface TMDBContentRatings {
  results: Array<{
    iso_3166_1: string;
    rating: string;
  }>;
}

/**
 * Convert TMDB certification sang Vietnam rating
 * @param certification - Certification string từ TMDB (e.g., "PG-13", "R", "15")
 * @param country - Country code (e.g., "US", "GB", "DE")
 * @returns VietnamRating hoặc null nếu không mapping được
 */
export function convertCertificationToVietnam(
  certification: string,
  country: string
): VietnamRating | null {
  if (!certification || certification.trim() === '') {
    return null;
  }

  const countryMapping = countryMappings[country];
  if (countryMapping) {
    const rating = countryMapping[certification];
    if (rating) {
      return rating;
    }
  }

  // Fallback: thử parse số để ước lượng
  const numericMatch = certification.match(/(\d+)/);
  if (numericMatch) {
    const age = parseInt(numericMatch[1], 10);
    if (age <= 6) return 'P';
    if (age <= 12) return 'K';
    if (age <= 14) return 'T13';
    if (age <= 17) return 'T16';
    return 'T18';
  }

  return null;
}

/**
 * Lấy Vietnam rating từ TMDB release_dates (cho Movies)
 * @param releaseDates - Data từ TMDB API release_dates endpoint
 * @returns RatingInfo hoặc null nếu không có rating phù hợp
 */
export function getVietnamRatingFromReleaseDates(
  releaseDates: TMDBReleaseDates | null | undefined
): RatingInfo | null {
  if (!releaseDates?.results || releaseDates.results.length === 0) {
    return null;
  }

  // Tạo map để lookup nhanh
  const countryMap = new Map<string, string>();
  for (const result of releaseDates.results) {
    // Tìm certification từ theatrical release (type 3) hoặc digital (type 4)
    // Type: 1=Premiere, 2=Theatrical (limited), 3=Theatrical, 4=Digital, 5=Physical, 6=TV
    const theatricalRelease = result.release_dates.find(
      rd => rd.certification && (rd.type === 3 || rd.type === 4 || rd.type === 2)
    );
    if (theatricalRelease?.certification) {
      countryMap.set(result.iso_3166_1, theatricalRelease.certification);
    }
  }

  // Duyệt theo thứ tự ưu tiên quốc gia
  for (const country of countryPriority) {
    const certification = countryMap.get(country);
    if (certification) {
      const vietnamRating = convertCertificationToVietnam(certification, country);
      if (vietnamRating) {
        return {
          rating: vietnamRating,
          description: vietnamRatingDescriptions[vietnamRating],
        };
      }
    }
  }

  // Fallback: lấy bất kỳ certification nào có thể convert
  for (const result of releaseDates.results) {
    const release = result.release_dates.find(rd => rd.certification);
    if (release?.certification) {
      const vietnamRating = convertCertificationToVietnam(
        release.certification,
        result.iso_3166_1
      );
      if (vietnamRating) {
        return {
          rating: vietnamRating,
          description: vietnamRatingDescriptions[vietnamRating],
        };
      }
    }
  }

  return null;
}

/**
 * Lấy Vietnam rating từ TMDB content_ratings (cho TV Shows)
 * @param contentRatings - Data từ TMDB API content_ratings endpoint
 * @returns RatingInfo hoặc null nếu không có rating phù hợp
 */
export function getVietnamRatingFromContentRatings(
  contentRatings: TMDBContentRatings | null | undefined
): RatingInfo | null {
  if (!contentRatings?.results || contentRatings.results.length === 0) {
    return null;
  }

  // Tạo map để lookup nhanh
  const countryMap = new Map<string, string>();
  for (const result of contentRatings.results) {
    if (result.rating) {
      countryMap.set(result.iso_3166_1, result.rating);
    }
  }

  // Duyệt theo thứ tự ưu tiên quốc gia
  for (const country of countryPriority) {
    const rating = countryMap.get(country);
    if (rating) {
      const vietnamRating = convertCertificationToVietnam(rating, country);
      if (vietnamRating) {
        return {
          rating: vietnamRating,
          description: vietnamRatingDescriptions[vietnamRating],
        };
      }
    }
  }

  // Fallback: lấy bất kỳ rating nào có thể convert
  for (const result of contentRatings.results) {
    if (result.rating) {
      const vietnamRating = convertCertificationToVietnam(
        result.rating,
        result.iso_3166_1
      );
      if (vietnamRating) {
        return {
          rating: vietnamRating,
          description: vietnamRatingDescriptions[vietnamRating],
        };
      }
    }
  }

  return null;
}

/**
 * Kiểm tra xem một rating có phải là rating Việt Nam hợp lệ không
 */
export function isValidVietnamRating(rating: string): rating is VietnamRating {
  return ['P', 'K', 'T13', 'T16', 'T18', 'C'].includes(rating);
}

/**
 * Lấy thông tin rating Việt Nam từ code
 */
export function getRatingInfo(rating: VietnamRating): RatingInfo {
  return {
    rating,
    description: vietnamRatingDescriptions[rating],
  };
}
