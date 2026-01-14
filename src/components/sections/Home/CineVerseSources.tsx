"use client";

import { tmdb } from "@/api/tmdb";
import { Button, Chip } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { Movie, TV } from "tmdb-ts/dist/types";
import { useState, useEffect, useRef, useCallback } from "react";
import { IoPlayOutline, IoInformationCircleOutline, IoVolumeHighOutline, IoVolumeMuteOutline } from "react-icons/io5";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { getImageUrl } from "@/utils/movies";
import { useMovieLogo } from "@/hooks/useMovieLogo";
import Link from "next/link";
import Image from "next/image";
import { env } from "@/utils/env";

type ContentItem = (Movie | TV) & { contentType: "movie" | "tv" };

// Đọc tự động IDs từ API - đã được sắp xếp theo năm phát hành
type HeroItem = { id: number; type: "movie" | "tv"; year: number };

const getSourceIds = async (): Promise<{ heroIds: HeroItem[] }> => {
  try {
    const response = await fetch('/api/sources/list');
    if (!response.ok) {
      throw new Error('Failed to fetch source list');
    }
    const data = await response.json();
    return {
      heroIds: data.heroIds || [] // 20 mục mới nhất theo năm phát hành
    };
  } catch (error) {
    console.error('Error fetching source IDs:', error);
    return { heroIds: [] };
  }
};

const fetchCineVerseContent = async () => {
  const { heroIds } = await getSourceIds();
  
  // Nếu không có sources nào, return empty
  if (heroIds.length === 0) {
    return [];
  }

  // heroIds đã được sắp xếp theo năm phát hành mới nhất và giới hạn 20 mục
  const token = env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN;

  // Helper function để fetch với fallback languages
  const fetchWithLanguageFallback = async (url: string, type: 'movie' | 'tv') => {
    const languages = ['vi-VN', 'en-US', '']; // '' = original language

    for (const lang of languages) {
      // Xây dựng query string an toàn, tránh lỗi ?& hoặc &&
      const urlWithParams =
        url +
        (url.includes('?')
          ? (lang ? `&language=${lang}` : '')
          : (lang ? `?language=${lang}` : '')) +
        `&append_to_response=videos&include_video_language=vi,en,ja,ko,null`;
      try {
        const response = await fetch(
          urlWithParams,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        if (!response.ok) {
          console.error(`Fetch failed: ${response.status} ${response.statusText} - ${urlWithParams}`);
          continue;
        }
        const data = await response.json();
        // Kiểm tra xem có overview không, nếu có thì return
        if (data.overview && data.overview.trim() !== '') {
          return data;
        }
        // Nếu không có overview với ngôn ngữ này, thử ngôn ngữ tiếp theo
        // Nhưng lưu lại data để dùng nếu không tìm thấy overview nào
        if (lang === languages[languages.length - 1]) {
          return data;
        }
      } catch (error) {
        console.error(`Error fetching ${type} with language ${lang}:`, error, urlWithParams);
        continue;
      }
    }
    return null;
  };

  // Fetch tất cả items từ heroIds (đã sắp xếp theo năm phát hành)
  // Giới hạn số lượng hiển thị hero section là 15 thay vì 20
  const limitedHeroIds = heroIds.slice(0, 15);
  const contentPromises = limitedHeroIds.map((item) =>
    fetchWithLanguageFallback(
      `https://api.themoviedb.org/3/${item.type === "movie" ? "movie" : "tv"}/${item.id}`,
      item.type
    ).then(data => data ? { ...data, contentType: item.type } : null)
  );

  const results = await Promise.all(contentPromises);

  // Lọc bỏ null và giữ nguyên thứ tự (đã sắp xếp theo năm)
  const allContent: ContentItem[] = results.filter((item): item is ContentItem => item !== null);

  return allContent;
};

const CineVerseHero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const playerRef = useRef<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const { data: content, isPending } = useQuery({
    queryKey: ["cineverse-sources", "vi-VN"],
    queryFn: fetchCineVerseContent,
    staleTime: 1000 * 60 * 60,
  });

  // Navigation handlers - Define early so they can be used in useEffect
  const handleNext = useCallback(() => {
    if (!content) return;
    setCurrentIndex((prev) => (prev === content.length - 1 ? 0 : prev + 1));
  }, [content]);

  const handlePrevious = useCallback(() => {
    if (!content) return;
    setCurrentIndex((prev) => (prev === 0 ? content.length - 1 : prev - 1));
  }, [content]);

  // Get current item first for hooks
  const currentItem = content?.[currentIndex];
  const currentContentType = currentItem?.contentType || "movie";
  const currentId = currentItem?.id || 0;
  const originalLanguage = currentItem ? ("original_language" in currentItem ? currentItem.original_language : undefined) : undefined;
  
  // Call hooks unconditionally at top level
  const logoPath = useMovieLogo(currentId, currentContentType, originalLanguage);

  // Fetch metadata từ sources API để lấy movie-rating
  const { data: sourceMetadata } = useQuery({
    queryKey: ["source-metadata", currentId, currentContentType],
    queryFn: async () => {
      try {
        const endpoint = currentContentType === "movie" 
          ? `/api/sources/movie/${currentId}` 
          : `/api/sources/tv/${currentId}`;
        const response = await fetch(endpoint);
        if (!response.ok) return null;
        const result = await response.json();
        return result.success ? result.data : null;
      } catch (error) {
        console.error("Error fetching source metadata:", error);
        return null;
      }
    },
    enabled: !!currentId,
    staleTime: 1000 * 60 * 60,
  });

  // Fetch movie-rating definitions
  const { data: movieRatings } = useQuery({
    queryKey: ["movie-ratings"],
    queryFn: async () => {
      try {
        const response = await fetch('/sources/movie-rating.json');
        if (!response.ok) return null;
        const data = await response.json();
        return data["Movie-Rating"] || null;
      } catch (error) {
        console.error("Error fetching movie ratings:", error);
        return null;
      }
    },
    staleTime: Infinity, // Cache forever since ratings don't change
  });

  // Calculate all values before early return
  const item = currentItem as NonNullable<typeof currentItem>;
  const title = item && ("title" in item ? item.title : "name" in item ? item.name : "");
  const backdropUrl = item ? getImageUrl(item.backdrop_path, "backdrop", true) : "";
  const releaseYear = item && "release_date" in item 
    ? new Date(item.release_date).getFullYear()
    : item && "first_air_date" in item 
    ? new Date(item.first_air_date).getFullYear()
    : "";

  // Get movie rating info
  const ratingCode = sourceMetadata?.metadata?.["movie-rating"];
  const ratingDescription = ratingCode && movieRatings ? movieRatings[ratingCode] : null;
  const ratingDisplay = ratingCode && ratingDescription 
    ? `${ratingCode} - ${ratingDescription}` 
    : ratingCode || null;

  // Lấy trailer/video từ TMDB videos với ưu tiên ngôn ngữ
  const videos = item ? ((item as any).videos?.results || []) : [];
  
  // Ưu tiên: vi → en → ja/ko → bất kỳ ngôn ngữ nào
  const trailer = 
    videos.find((v: any) => v.type === "Trailer" && v.site === "YouTube" && v.iso_639_1 === "vi") ||
    videos.find((v: any) => v.type === "Trailer" && v.site === "YouTube" && v.iso_639_1 === "en") ||
    videos.find((v: any) => v.type === "Trailer" && v.site === "YouTube") ||
    videos.find((v: any) => v.site === "YouTube");
  
  // Debug log
  if (item) {
    console.log(`Slide ${currentIndex + 1} (${title}):`, {
      hasVideos: videos.length > 0,
      videoCount: videos.length,
      videos: videos.map((v: any) => ({ type: v.type, site: v.site, key: v.key, lang: v.iso_639_1 })),
      trailerFound: !!trailer,
      trailerKey: trailer?.key,
      trailerLang: trailer?.iso_639_1
    });
  }
  
  const trailerUrl = trailer ? `https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&loop=1&playlist=${trailer.key}&playsinline=1&modestbranding=1&rel=0&showinfo=0` : null;

  // Auto-advance to next trailer after video duration - MUST be before any return
  useEffect(() => {
    if (!content || content.length === 0 || !trailer) return;

    // Tự động chuyển trailer sau 2 phút (120 giây)
    const autoAdvanceTimer = setTimeout(() => {
      console.log('Auto-advancing to next trailer after 2 minutes');
      handleNext();
    }, 120000); // 120 seconds = 2 minutes

    return () => {
      clearTimeout(autoAdvanceTimer);
    };
  }, [content, handleNext, currentIndex, trailer]);

  const detailUrl = item && item.contentType === "movie" 
    ? `/movie/${item.id}` 
    : item ? `/tv/${item.id}` : "/";

  const playerUrl = item && item.contentType === "movie"
    ? `/movie/${item.id}/player`
    : item && "seasons" in item && item.seasons && Array.isArray(item.seasons) && item.seasons.length > 0
    ? `/tv/${item.id}/${item.seasons[0].season_number}/${item.seasons[0].episode_count > 0 ? 1 : 0}/player`
    : detailUrl;

  // Early return AFTER all hooks
  if (isPending || !content || content.length === 0 || !currentItem || !item) {
    return null;
  }

  return (
    <div className="relative h-[600px] w-screen overflow-hidden md:h-[800px] [@media(max-width:500px)_and_(orientation:landscape)]:h-[60vw]">
      {/* Background - Trailer Video hoặc Backdrop Image */}
      <div className="absolute inset-0 z-0">
        {trailerUrl ? (
          <>
            <div className="absolute inset-0 overflow-hidden">
              <iframe
                ref={iframeRef}
                key={`trailer-${currentIndex}`}
                src={trailerUrl}
                className="absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.77vh] min-w-full -translate-x-1/2 -translate-y-1/2 scale-120"
                allow="autoplay; encrypted-media"
                allowFullScreen
                style={{ border: 'none', pointerEvents: 'none' }}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/60 to-transparent dark:from-black/90 dark:via-black/50 dark:to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-transparent to-white/95 dark:from-black/70 dark:via-transparent dark:to-black/90" />
          </>
        ) : (
          <>
            <Image
              src={backdropUrl}
              alt={title}
              fill
              className="object-cover"
              priority
              quality={90}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/60 to-transparent dark:from-black/90 dark:via-black/50 dark:to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-transparent to-white/95 dark:from-black/70 dark:via-transparent dark:to-black/90" />
          </>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-end pb-24 px-6 md:px-12 lg:px-16 md:pb-28 lg:pb-32">
        <div className="max-w-2xl space-y-2 md:space-y-3 lg:space-y-4">
          {/* Audio Version Logo (đã chuyển vào logo movie) */}

          {/* Title - Logo or Text */}
          <div className="flex items-center gap-2 md:gap-3 md:ml-0 ml-0">
            {logoPath ? (
              <div className="inline-flex flex-col items-center relative group">
                <div className="relative flex-shrink-0 h-16 w-32 md:h-20 md:w-40 lg:h-24 lg:w-48">
                  <Image
                    src={getImageUrl(logoPath, "title", true)}
                    alt={title}
                    fill
                    className="object-contain object-left transition-transform duration-500 ease-in-out group-hover:scale-110 group-hover:translate-x-4 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:opacity-90"
                    priority
                  />
                </div>
                {(sourceMetadata?.audioVersion === "Lồng tiếng" || sourceMetadata?.metadata?.audioVersion === "LongTieng") && (
                  <div className="w-full flex justify-start mt-2">
                    <span className="inline-flex items-center gap-2 align-top">
                      <span className="text-xs md:text-sm bg-white/20 text-white rounded-full px-3 py-1 shadow border border-white/30 backdrop-blur-md" style={{fontFamily: 'sans-serif', fontWeight: 400}}>Phiên bản</span>
                      <Image
                        src="/longtieng.png"
                        alt="Lồng tiếng"
                        width={40}
                        height={40}
                        className="object-contain"
                      />
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-4xl lg:text-5xl">
                {title}
              </h1>
            )}
          </div>

          {/* Description */}
          <p className="line-clamp-2 text-sm text-gray-700 dark:text-gray-200 md:text-base">
            {item.overview || "Nội dung đang được cập nhật..."}
          </p>

          {/* Rating Badge - TMDB, Year, AgeRating */}
          <div className="flex items-center gap-2 flex-wrap">
            {"vote_average" in item && item.vote_average > 0 && (
              <Chip color="success" variant="flat" size="sm" className="font-semibold">
                <span className="text-cyan-500">TMDB</span>{" "}
                <span className="text-warning-500">{item.vote_average.toFixed(1)}</span>
              </Chip>
            )}
            {releaseYear && (
              <Chip variant="flat" size="sm">
                {releaseYear}
              </Chip>
            )}
            {ratingDisplay && (
              <Chip color="warning" variant="flat" size="sm" className="max-w-fit">
                {ratingDisplay}
              </Chip>
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              as={Link}
              href={playerUrl}
              size="md"
              color="default"
              variant="flat"
              startContent={<IoPlayOutline className="text-xl" />}
              className="bg-white/20 font-semibold text-white backdrop-blur-md border border-white/30 hover:bg-white/30"
            >
              Xem ngay
            </Button>
            <Button
              as={Link}
              href={detailUrl}
              size="md"
              color="default"
              variant="flat"
              startContent={<IoInformationCircleOutline className="text-xl" />}
              className="bg-white/20 font-semibold text-white backdrop-blur-md border border-white/30 hover:bg-white/30"
            >
              Chi tiết

            </Button>
            {/* Nút mute chuyển lên cùng hàng */}
            {trailerUrl && (
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="ml-2 flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-500/50 dark:border-white/50 bg-white/30 dark:bg-black/30 text-gray-900 dark:text-white backdrop-blur-sm transition-all hover:bg-white/50 dark:hover:bg-black/50"
                title={isMuted ? 'Bật tiếng' : 'Tắt tiếng'}
              >
                {isMuted ? (
                  <IoVolumeMuteOutline className="text-xl" />
                ) : (
                  <IoVolumeHighOutline className="text-xl" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Carousel Dots + Navigation Arrows cùng dòng */}
      {content.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3">
          <button
            onClick={handlePrevious}
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-500/50 dark:border-white/50 bg-white/30 dark:bg-black/30 text-gray-900 dark:text-white backdrop-blur-sm transition-all hover:bg-white/50 dark:hover:bg-black/50"
          >
            <IoIosArrowBack className="text-2xl" />
          </button>
          <div className="flex gap-2">
            {content.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1 rounded-full transition-all ${
                  index === currentIndex ? "w-8 bg-gray-900 dark:bg-white" : "w-2 bg-gray-500/50 dark:bg-white/50"
                }`}
              />
            ))}
          </div>
          <button
            onClick={handleNext}
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-500/50 dark:border-white/50 bg-white/30 dark:bg-black/30 text-gray-900 dark:text-white backdrop-blur-sm transition-all hover:bg-white/50 dark:hover:bg-black/50"
          >
            <IoIosArrowForward className="text-2xl" />
          </button>
        </div>
      )}
    </div>
  );
};

export default CineVerseHero;
