import type { Movie, TV } from "tmdb-ts";

/**
 * Generate SEO-optimized title for movie/TV
 */
export function generateSEOTitle(item: Movie | TV, includeYear: boolean = true): string {
  const title = "title" in item ? item.title : item.name;
  const releaseDate = "release_date" in item ? item.release_date : "first_air_date" in item ? item.first_air_date : null;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;

  let seoTitle = `${title}`;
  
  if (includeYear && year) {
    seoTitle += ` (${year})`;
  }

  // Add type
  const type = "title" in item ? "Phim" : "TV Show";
  seoTitle += ` - ${type}`;

  // Add platform
  seoTitle += ` | CineVerse`;

  // Keep under 60 characters if possible
  if (seoTitle.length > 60) {
    seoTitle = `${title} | CineVerse`;
  }

  return seoTitle;
}

/**
 * Generate SEO-optimized description for movie/TV
 */
export function generateSEODescription(item: Movie | TV): string {
  const title = "title" in item ? item.title : item.name;
  const overview = item.overview || "";
  const type = "title" in item ? "phim" : "chương trình TV";
  const releaseDate = "release_date" in item ? item.release_date : "first_air_date" in item ? item.first_air_date : null;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;

  // Build description
  let description = `Xem ${type} ${title}`;
  
  if (year) {
    description += ` (${year})`;
  }

  if (overview) {
    // Add overview, truncate if too long
    const truncatedOverview = overview.length > 100 
      ? overview.substring(0, 100) + "..."
      : overview;
    description += ` - ${truncatedOverview}`;
  }

  description += ` | Vũ Trụ Điện Ảnh - Dành cho bạn với tất cả nội dung hàng đầu.`;

  // Keep between 120-155 characters
  if (description.length > 155) {
    description = description.substring(0, 152) + "...";
  }

  return description;
}

/**
 * Generate SEO-optimized keywords for movie/TV
 */
export function generateSEOKeywords(item: Movie | TV): string[] {
  const title = "title" in item ? item.title : item.name;
  const type = "title" in item ? "phim" : "tv show";
  const releaseDate = "release_date" in item ? item.release_date : "first_air_date" in item ? item.first_air_date : null;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;

  const keywords: string[] = [
    title,
    `xem ${type} ${title}`,
    `${title} vietsub`,
    `${title} phụ đề việt`,
    `${title} online`,
  ];

  if (year) {
    keywords.push(`${title} ${year}`);
  }

  // Add genres if available
  if (item.genre_ids && item.genre_ids.length > 0) {
    // Map genre IDs to names (simplified, should use proper mapping)
    keywords.push(`${type} ${getGenreName(item.genre_ids[0])}`);
  }

  // Add general keywords
  keywords.push(
    "Vũ Trụ Điện Ảnh",
    "Phim Điện Ảnh trên CineVerse",
    "CineVerse by An Kun Studio",
    "CineVerse - Vũ Trụ Điện Ảnh",
    "Phim Lồng Tiếng trên CineVerse",
    "Phim Vietsub trên CineVerse",
    "Phim Mới Nhất tại CineVerse",
    "CineVerse"
  );

  return keywords;
}

/**
 * Generate focus keyphrase for SEO analysis
 */
export function generateFocusKeyphrase(item: Movie | TV): string {
  const title = "title" in item ? item.title : item.name;
  const type = "title" in item ? "phim" : "tv show";
  
  return `xem ${type} ${title}`;
}

/**
 * Generate SEO-friendly URL slug
 */
export function generateSEOSlug(item: Movie | TV): string {
  const title = "title" in item ? item.title : item.name;
  const releaseDate = "release_date" in item ? item.release_date : "first_air_date" in item ? item.first_air_date : null;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;

  // Convert to lowercase, remove special chars, replace spaces with hyphens
  let slug = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Replace multiple hyphens with single

  if (year) {
    slug += `-${year}`;
  }

  // Remove stop words
  const stopWords = ["the", "a", "an", "and", "or", "but", "in", "on", "at"];
  const parts = slug.split("-");
  const filtered = parts.filter((part: string) => !stopWords.includes(part));
  slug = filtered.join("-");

  return slug;
}

/**
 * Generate structured data (JSON-LD) for movie/TV
 */
export function generateStructuredData(item: Movie | TV, url: string) {
  const title = "title" in item ? item.title : item.name;
  const type = "title" in item ? "Movie" : "TVSeries";
  const releaseDate = "release_date" in item ? item.release_date : "first_air_date" in item ? item.first_air_date : null;
  const datePublished = releaseDate;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": type,
    name: title,
    description: item.overview,
    url: url,
    image: item.poster_path
      ? `https://image.tmdb.org/t/p/original${item.poster_path}`
      : undefined,
    datePublished: datePublished,
    aggregateRating: item.vote_average
      ? {
          "@type": "AggregateRating",
          ratingValue: item.vote_average,
          ratingCount: item.vote_count,
          bestRating: 10,
          worstRating: 0,
        }
      : undefined,
    genre: item.genre_ids?.map((id: number) => getGenreName(id)).filter(Boolean),
  };

  return structuredData;
}

/**
 * Extract images for SEO analysis
 */
export function extractImagesForSEO(item: Movie | TV): Array<{ src: string; alt: string }> {
  const images: Array<{ src: string; alt: string }> = [];
  const title = "title" in item ? item.title : item.name;

  // Poster
  if (item.poster_path) {
    images.push({
      src: `https://image.tmdb.org/t/p/original${item.poster_path}`,
      alt: `Poster ${title}`,
    });
  }

  // Backdrop
  if (item.backdrop_path) {
    images.push({
      src: `https://image.tmdb.org/t/p/original${item.backdrop_path}`,
      alt: `Hình nền ${title}`,
    });
  }

  return images;
}

/**
 * Generate SEO-optimized content for movie/TV page
 */
export function generateSEOContent(item: Movie | TV): string {
  const title = "title" in item ? item.title : item.name;
  const type = "title" in item ? "phim" : "chương trình TV";
  const overview = item.overview || "";
  const releaseDate = "release_date" in item ? item.release_date : "first_air_date" in item ? item.first_air_date : null;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;

  let content = `<h1>Xem ${type} ${title}`;
  if (year) {
    content += ` (${year})`;
  }
  content += ` Vietsub</h1>\n\n`;

  content += `<h2>Giới thiệu về ${title}</h2>\n\n`;
  content += `<p>${overview}</p>\n\n`;

  content += `<h2>Thông tin ${type}</h2>\n\n`;
  content += `<p>Tên ${type}: ${title}</p>\n`;
  
  if (year) {
    content += `<p>Năm phát hành: ${year}</p>\n`;
  }

  if (item.vote_average) {
    content += `<p>Đánh giá: ${item.vote_average}/10 (${item.vote_count} lượt)</p>\n`;
  }

  content += `\n<h2>Xem ${title} tại CineVerse</h2>\n\n`;
  content += `<p>Truy cập CineVerse để xem ${type} ${title} với chất lượng cao, lồng tiếng và phụ đề tiếng Việt đầy đủ. `;
  content += `Trải nghiệm xem phim online mượt mà cùng với giao diện hoàn toàn thân thiện và dễ sử dụng.</p>\n\n`;

  return content;
}

/**
 * Helper: Get genre name by ID (simplified mapping)
 */
function getGenreName(genreId: number): string {
  const genreMap: Record<number, string> = {
    28: "Hành động",
    12: "Phiêu lưu",
    16: "Hoạt hình",
    35: "Hài",
    80: "Hình sự",
    99: "Tài liệu",
    18: "Chính kịch",
    10751: "Gia đình",
    14: "Giả tưởng",
    36: "Lịch sử",
    27: "Kinh dị",
    10402: "Nhạc",
    9648: "Bí ẩn",
    10749: "Lãng mạn",
    878: "Khoa học viễn tưởng",
    10770: "Phim truyền hình",
    53: "Gây cấn",
    10752: "Chiến tranh",
    37: "Miền Viễn Tây",
  };

  return genreMap[genreId] || "";
}

/**
 * Complete SEO package for movie/TV page
 */
export function generateCompleteSEO(item: Movie | TV, pathname: string) {
  const url = `https://cineverse.ankun.dev${pathname}`;

  return {
    title: generateSEOTitle(item),
    description: generateSEODescription(item),
    keywords: generateSEOKeywords(item),
    focusKeyphrase: generateFocusKeyphrase(item),
    url: url,
    slug: generateSEOSlug(item),
    content: generateSEOContent(item),
    images: extractImagesForSEO(item),
    structuredData: generateStructuredData(item, url),
  };
}
