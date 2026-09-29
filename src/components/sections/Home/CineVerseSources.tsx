"use client";

import { Chip, addToast } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { Movie, TV } from "tmdb-ts/dist/types";
import { useState, useEffect, useRef, useCallback, useTransition } from "react";
import { IoInformationCircleOutline, IoVolumeHighOutline, IoVolumeMuteOutline } from "react-icons/io5";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { BsBookmarkFill, BsBookmarkCheckFill } from "react-icons/bs";
import { getImageUrl } from "@/utils/movies";
import { extractYouTubeId } from "@/utils/video-helpers";
import { defaultAgeRating, getTmdbAgeRating } from "@/utils/age-rating";
import { useMovieLogo } from "@/hooks/useMovieLogo";
import Link from "next/link";
import Image from "next/image";
import { env } from "@/utils/env";
import useSupabaseUser from "@/hooks/useSupabaseUser";
import { addToWatchlist, removeFromWatchlist, checkInWatchlist } from "@/actions/library";
import { queryClient } from "@/app/providers";

interface Video {
  iso_639_1: string;
  key: string;
  site: string;
  type: string;
}

type ContentItem = (Movie | TV) & { 
  contentType: "movie" | "tv";
  videos?: { results: Video[] };
};

// Đọc tự động IDs từ Supabase database
type HeroItem = { id: number; type: "movie" | "tv"; year: number };

const getSourceIds = async (): Promise<{ heroIds: HeroItem[] }> => {
  try {
    // Fetch movies from Supabase
    const moviesResponse = await fetch('/api/admin/dienanh');
    const moviesResult = moviesResponse.ok ? await moviesResponse.json() : {};
    const movies = moviesResult.movies || [];

    // Fetch TV shows from Supabase
    const tvResponse = await fetch('/api/admin/chuongtrinhtv');
    const tvResult = tvResponse.ok ? await tvResponse.json() : {};
    const tvShows = tvResult.tvSeries || [];

    // Combine and sort by year (newest first)
    const allItems = [
      ...movies.map((item: any) => ({ 
        id: item.tmdb_id, 
        type: "movie" as const, 
        year: item.year 
      })),
      ...tvShows.map((item: any) => ({ 
        id: item.tmdb_id, 
        type: "tv" as const, 
        year: item.year 
      }))
    ];

    // Sort by year descending (newest first)
    allItems.sort((a, b) => b.year - a.year);

    return {
      heroIds: allItems.slice(0, 20) // 20 mục mới nhất theo năm phát hành
    };
  } catch (error) {
    console.error('Error fetching source IDs from Supabase:', error);
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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { data: user } = useSupabaseUser();
  const [isBookmarkPending, startTransition] = useTransition();
  const [isSaved, setIsSaved] = useState(false);

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

  // Fetch metadata từ Supabase để lấy movie-rating
  const { data: sourceMetadata } = useQuery({
    queryKey: ["source-metadata", currentId, currentContentType],
    queryFn: async () => {
      try {
        const endpoint = currentContentType === "movie" 
          ? `/api/admin/dienanh` 
          : `/api/admin/chuongtrinhtv`;
        const response = await fetch(endpoint);
        if (!response.ok) return null;
        const result = await response.json();
        const data = currentContentType === "movie" ? result.movies : result.tvSeries;
        // So sánh linh hoạt string/number vì Supabase có thể trả tmdb_id dạng string
        const item = data?.find(
          (item: any) =>
            String(item?.tmdb_id) === String(currentId) ||
            Number(item?.tmdb_id) === currentId
        );
        return item || null;
      } catch (error) {
        console.error("Error fetching source metadata from Supabase:", error);
        return null;
      }
    },
    enabled: !!currentId,
    staleTime: 1000 * 60 * 60,
  });

  // Fetch movie-rating definitions (miêu tả từng mức, kể cả mã quốc tế)
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

  // Rating từ database (giống admin). Nếu database không có → fallback TMDB
  const dbRatingCode = sourceMetadata?.metadata?.["movie-rating"];
  const dbRatingDescription = dbRatingCode && movieRatings ? movieRatings[dbRatingCode] : null;

  const { data: tmdbRatingInfo } = useQuery({
    queryKey: ["tmdb-age-rating-fallback", currentId, currentContentType],
    queryFn: () => getTmdbAgeRating(currentContentType, currentId),
    enabled: !!currentId && sourceMetadata !== undefined && !dbRatingCode,
    staleTime: 1000 * 60 * 60,
  });

  // Chỉ hiện badge khi đã xác định xong rating (DB resolve, nếu thiếu thì chờ TMDB)
  const ratingResolved =
    sourceMetadata !== undefined &&
    (dbRatingCode ? true : tmdbRatingInfo !== undefined);

  const ratingInfo = ratingResolved
    ? dbRatingCode
      ? {
          rating: dbRatingCode,
          description: dbRatingDescription || "Phân loại độ tuổi",
        }
      : tmdbRatingInfo ?? defaultAgeRating(currentContentType)
    : null;

  // Calculate all values before early return
  const item = currentItem as NonNullable<typeof currentItem>;
  const title = item && ("title" in item ? item.title : "name" in item ? item.name : "");
  const backdropUrl = item ? getImageUrl(item.backdrop_path, "backdrop", true) : "";
  const releaseYear = item && "release_date" in item 
    ? new Date(item.release_date).getFullYear()
    : item && "first_air_date" in item 
    ? new Date(item.first_air_date).getFullYear()
    : "";

  // Ưu tiên hiện rating database, chỉ dùng TMDB khi database không có rating
  const ratingDisplay = ratingInfo
    ? `${ratingInfo.rating} - ${ratingInfo.description}`
    : null;

  // Lấy trailer/video từ TMDB videos với ưu tiên ngôn ngữ
  const videos: Video[] = item?.videos?.results || [];
  
  // Ưu tiên: vi → en → ja/ko → bất kỳ ngôn ngữ nào
  const trailer = 
    videos.find((v: Video) => v.type === "Trailer" && v.site === "YouTube" && v.iso_639_1 === "vi") ||
    videos.find((v: Video) => v.type === "Trailer" && v.site === "YouTube" && v.iso_639_1 === "en") ||
    videos.find((v: Video) => v.type === "Trailer" && v.site === "YouTube") ||
    videos.find((v: Video) => v.site === "YouTube");
  
  // Ưu tiên "Video Giới thiệu" lưu trong database, không có thì fallback về trailer TMDB
  const introVideoKey = sourceMetadata?.metadata?.["introductory-video"]
    ? extractYouTubeId(sourceMetadata.metadata["introductory-video"])
    : "";
  const heroVideoKey = introVideoKey || trailer?.key || "";

  // Debug log
  if (item) {
    console.log(`Slide ${currentIndex + 1} (${title}):`, {
      hasVideos: videos.length > 0,
      videoCount: videos.length,
      videos: videos.map((v: Video) => ({ type: v.type, site: v.site, key: v.key, lang: v.iso_639_1 })),
      trailerFound: !!trailer,
      trailerKey: trailer?.key,
      trailerLang: trailer?.iso_639_1,
      introVideoKey,
      usingIntroVideo: !!introVideoKey,
      heroVideoKey
    });
  }

  // Sử dụng youtube-nocookie.com để tránh third-party cookies
  const trailerUrl = heroVideoKey ? `https://www.youtube-nocookie.com/embed/${heroVideoKey}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&loop=1&playlist=${heroVideoKey}&playsinline=1&modestbranding=1&rel=0&showinfo=0` : null;

  // Auto-advance to next trailer after video duration - MUST be before any return
  useEffect(() => {
    if (!content || content.length === 0 || !heroVideoKey) return;

    // Tự động chuyển trailer sau 2 phút (120 giây)
    const autoAdvanceTimer = setTimeout(() => {
      console.log('Auto-advancing to next trailer after 2 minutes');
      handleNext();
    }, 120000); // 120 seconds = 2 minutes

    return () => {
      clearTimeout(autoAdvanceTimer);
    };
  }, [content, handleNext, currentIndex, heroVideoKey]);

  // Check watchlist status when currentIndex changes
  useEffect(() => {
    if (!user || !currentItem) {
      setIsSaved(false);
      return;
    }
    const check = async () => {
      try {
        const result = await checkInWatchlist(currentItem.id, currentItem.contentType);
        if (result?.success) setIsSaved(result.isInWatchlist);
      } catch {}
    };
    check();
  }, [user, currentItem]);

  const handleBookmark = () => {
    if (!user) {
      addToast({ title: "Đăng nhập để lưu danh sách", color: "warning" });
      return;
    }
    if (!currentItem) return;
    startTransition(async () => {
      try {
        const watchlistItem = {
          id: currentItem.id,
          type: currentItem.contentType,
          adult: "adult" in currentItem ? !!currentItem.adult : false,
          backdrop_path: currentItem.backdrop_path || "",
          poster_path: "poster_path" in currentItem ? (currentItem.poster_path as string) || null : null,
          release_date: "release_date" in currentItem ? (currentItem.release_date as string) : "first_air_date" in currentItem ? (currentItem.first_air_date as string) : "",
          title: title,
          vote_average: "vote_average" in currentItem ? (currentItem.vote_average as number) : 0,
        };
        if (isSaved) {
          const result = await removeFromWatchlist(currentItem.id, currentItem.contentType);
          if (result.success) {
            setIsSaved(false);
            addToast({ title: `Đã xóa khỏi danh sách`, color: "danger" });
          }
        } else {
          const result = await addToWatchlist(watchlistItem);
          if (result.success) {
            setIsSaved(true);
            addToast({ title: `Đã lưu vào danh sách`, color: "success" });
          }
        }
      } catch {}
    });
  };

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
                key={`trailer-${currentIndex}-${heroVideoKey}`}
                src={trailerUrl}
                className="absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.77vh] min-w-full -translate-x-1/2 -translate-y-1/2 scale-120"
                allow="autoplay; encrypted-media"
                allowFullScreen
                style={{ border: 'none', pointerEvents: 'none' }}
              />
            </div>
            <div className="absolute inset-0 bg-linear-to-r from-white/95 via-white/60 to-transparent dark:from-black/90 dark:via-black/50 dark:to-transparent" />
            <div className="absolute inset-0 bg-linear-to-b from-white/80 via-transparent to-white/95 dark:from-black/70 dark:via-transparent dark:to-black/90" />
          </>
        ) : (
          <>
            <Image
              src={backdropUrl}
              alt={title}
              fill
              sizes="100vw"
              className="object-cover"
              priority
              quality={90}
            />
            <div className="absolute inset-0 bg-linear-to-r from-white/95 via-white/60 to-transparent dark:from-black/90 dark:via-black/50 dark:to-transparent" />
            <div className="absolute inset-0 bg-linear-to-b from-white/80 via-transparent to-white/95 dark:from-black/70 dark:via-transparent dark:to-black/90" />
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
                <div className="relative shrink-0 h-16 w-32 md:h-20 md:w-40 lg:h-24 lg:w-48">
                  <Image
                    src={getImageUrl(logoPath, "title", true)}
                    alt={title}
                    fill
                    sizes="(min-width: 1024px) 192px, (min-width: 768px) 160px, 128px"
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

          {/* Buttons - Space Theme */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {/* Xem ngay - Play Button with rotating ring */}
            <Link
              href={playerUrl}
              className="group relative flex h-14 w-14 items-center justify-center"
            >
              {/* Rotating ring */}
              <svg
                className="absolute inset-0 h-full w-full -rotate-90 transition-transform duration-700 ease-out group-hover:rotate-[270deg]"
                viewBox="0 0 56 56"
                fill="none"
              >
                <circle
                  cx="28"
                  cy="28"
                  r="26"
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="26"
                  stroke="url(#playGradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                  style={{
                    strokeDasharray: "163.36",
                    strokeDashoffset: "163.36",
                  }}
                />
                <defs>
                  <linearGradient id="playGradient" x1="0" y1="0" x2="56" y2="56">
                    <stop offset="0%" stopColor="#a78bfa" />
                    <stop offset="50%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Inner glow on hover */}
              <span
                className="absolute inset-1 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background: "radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)",
                }}
              />
              {/* Play icon */}
              <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-white transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_12px_rgba(167,139,250,0.6)]">
                <svg width="20" height="22" viewBox="0 0 20 22" fill="currentColor">
                  <path d="M18.2 9.1L2.8 0.7C1.9 0.2 0.9 0.8 0.9 1.8V20.2C0.9 21.2 1.9 21.8 2.8 21.3L18.2 12.9C19.1 12.4 19.1 9.6 18.2 9.1Z" />
                </svg>
              </span>
            </Link>

            {/* Lưu danh sách - Bookmark */}
            <button
              onClick={handleBookmark}
              disabled={isBookmarkPending}
              className={`group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full px-5 py-2.5 font-semibold backdrop-blur-md transition-all duration-300 hover:scale-105 ${
                isSaved
                  ? "text-amber-300"
                  : "text-white"
              }`}
              style={{
                background: isSaved
                  ? "linear-gradient(135deg, rgba(245,158,11,0.3) 0%, rgba(251,191,36,0.2) 100%)"
                  : "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.05) 100%)",
                border: isSaved
                  ? "1px solid rgba(245,158,11,0.4)"
                  : "1px solid rgba(255,255,255,0.15)",
                boxShadow: isSaved
                  ? "0 0 20px rgba(245,158,11,0.2), inset 0 1px 0 rgba(255,255,255,0.1)"
                  : "0 0 15px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.08)",
              }}
            >
              <span
                className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background: isSaved
                    ? "linear-gradient(135deg, rgba(245,158,11,0.4) 0%, rgba(251,191,36,0.3) 100%)"
                    : "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.08) 100%)",
                  boxShadow: isSaved
                    ? "0 0 30px rgba(245,158,11,0.3), inset 0 1px 0 rgba(255,255,255,0.15)"
                    : "0 0 20px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.1)",
                }}
              />
              {isSaved ? (
                <BsBookmarkCheckFill className="relative z-10 text-lg transition-transform duration-300 group-hover:scale-110" />
              ) : (
                <BsBookmarkFill className="relative z-10 text-lg transition-transform duration-300 group-hover:scale-110" />
              )}
              <span className="relative z-10 text-sm">{isSaved ? "Đã lưu" : "Lưu"}</span>
            </button>

            {/* Chi tiết - Info */}
            <Link
              href={detailUrl}
              className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full px-5 py-2.5 font-semibold text-white backdrop-blur-md transition-all duration-300 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, rgba(6,182,212,0.25) 0%, rgba(34,211,238,0.15) 100%)",
                border: "1px solid rgba(255,255,255,0.15)",
                boxShadow: "0 0 15px rgba(6,182,212,0.15), inset 0 1px 0 rgba(255,255,255,0.08)",
              }}
            >
              <span
                className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background: "linear-gradient(135deg, rgba(6,182,212,0.4) 0%, rgba(34,211,238,0.3) 100%)",
                  boxShadow: "0 0 25px rgba(6,182,212,0.3), inset 0 1px 0 rgba(255,255,255,0.12)",
                }}
              />
              <IoInformationCircleOutline className="relative z-10 text-lg transition-transform duration-300 group-hover:rotate-12" />
              <span className="relative z-10 text-sm">Chi tiết</span>
            </Link>

            {/* Mute toggle */}
            {trailerUrl && (
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="group relative ml-1 flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  boxShadow: "0 0 12px rgba(255,255,255,0.05)",
                }}
                title={isMuted ? "Bật tiếng" : "Tắt tiếng"}
              >
                <span
                  className="absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)",
                    boxShadow: "0 0 20px rgba(255,255,255,0.1)",
                  }}
                />
                {isMuted ? (
                  <IoVolumeMuteOutline className="relative z-10 text-xl text-gray-300 transition-colors group-hover:text-white" />
                ) : (
                  <IoVolumeHighOutline className="relative z-10 text-xl text-gray-300 transition-colors group-hover:text-white" />
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
