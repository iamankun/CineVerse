"use client";

import { tmdb } from "@/api/tmdb";
import { Button, Chip } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { Movie, TV } from "tmdb-ts/dist/types";
import { useState } from "react";
import { IoPlayOutline, IoInformationCircleOutline, IoVolumeHighOutline, IoVolumeMuteOutline } from "react-icons/io5";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { getImageUrl } from "@/utils/movies";
import { useMovieLogo } from "@/hooks/useMovieLogo";
import Link from "next/link";
import Image from "next/image";
import { env } from "@/utils/env";

type ContentItem = (Movie | TV) & { contentType: "movie" | "tv" };

// Đọc tự động tất cả IDs từ API
const getSourceIds = async (): Promise<{ movieIds: number[], tvIds: number[] }> => {
  try {
    const response = await fetch('/api/sources/list');
    if (!response.ok) {
      throw new Error('Failed to fetch source list');
    }
    const data = await response.json();
    return {
      movieIds: data.movieIds || [],
      tvIds: data.tvIds || []
    };
  } catch (error) {
    console.error('Error fetching source IDs:', error);
    return { movieIds: [], tvIds: [] };
  }
};

const fetchCineVerseContent = async () => {
  const { movieIds, tvIds } = await getSourceIds();
  
  // Nếu không có sources nào, return empty
  if (movieIds.length === 0 && tvIds.length === 0) {
    return [];
  }

  const token = env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN;

  // Helper function để fetch với fallback languages
  const fetchWithLanguageFallback = async (url: string, type: 'movie' | 'tv') => {
    const languages = ['vi-VN', 'en-US', '']; // '' = original language
    
    for (const lang of languages) {
      try {
        const langParam = lang ? `?language=${lang}` : '';
        // Thêm include_video_language để lấy videos từ nhiều ngôn ngữ
        const response = await fetch(
          `${url}${langParam}&append_to_response=videos&include_video_language=vi,en,ja,ko,null`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        
        if (!response.ok) continue;
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
        console.error(`Error fetching ${type} with language ${lang}:`, error);
        continue;
      }
    }
    
    return null;
  };

  // Fetch movies với language fallback
  const moviePromises = movieIds.map((id) =>
    fetchWithLanguageFallback(`https://api.themoviedb.org/3/movie/${id}`, 'movie')
  );

  // Fetch TV shows với language fallback
  const tvPromises = tvIds.map((id) =>
    fetchWithLanguageFallback(`https://api.themoviedb.org/3/tv/${id}`, 'tv')
  );

  const [movies, tvShows] = await Promise.all([
    Promise.all(moviePromises),
    Promise.all(tvPromises),
  ]);

  const allContent: ContentItem[] = [
    ...movies.filter((m): m is Movie => m !== null).map(m => ({ ...m, contentType: "movie" as const })),
    ...tvShows.filter((tv): tv is TV => tv !== null).map(tv => ({ ...tv, contentType: "tv" as const })),
  ];

  return allContent;
};

const CineVerseHero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  const { data: content, isPending } = useQuery({
    queryKey: ["cineverse-sources", "vi-VN"],
    queryFn: fetchCineVerseContent,
    staleTime: 1000 * 60 * 60,
  });

  // Get current item first for hooks
  const currentItem = content?.[currentIndex];
  const currentContentType = currentItem?.contentType || "movie";
  const currentId = currentItem?.id || 0;
  
  // Call hooks unconditionally at top level
  const logoPath = useMovieLogo(currentId, currentContentType);

  if (isPending || !content || content.length === 0) {
    return null;
  }

  const title = "title" in currentItem ? currentItem.title : currentItem.name;
  const backdropUrl = getImageUrl(currentItem.backdrop_path, "original");
  const releaseYear = "release_date" in currentItem 
    ? new Date(currentItem.release_date).getFullYear()
    : "first_air_date" in currentItem 
    ? new Date(currentItem.first_air_date).getFullYear()
    : "";

  // Lấy trailer/video từ TMDB videos với ưu tiên ngôn ngữ
  const videos = (currentItem as any).videos?.results || [];
  
  // Ưu tiên: vi → en → ja/ko → bất kỳ ngôn ngữ nào
  const trailer = 
    videos.find((v: any) => v.type === "Trailer" && v.site === "YouTube" && v.iso_639_1 === "vi") ||
    videos.find((v: any) => v.type === "Trailer" && v.site === "YouTube" && v.iso_639_1 === "en") ||
    videos.find((v: any) => v.type === "Trailer" && v.site === "YouTube") ||
    videos.find((v: any) => v.site === "YouTube");
  
  // Debug log
  console.log(`Slide ${currentIndex + 1} (${title}):`, {
    hasVideos: videos.length > 0,
    videoCount: videos.length,
    videos: videos.map((v: any) => ({ type: v.type, site: v.site, key: v.key, lang: v.iso_639_1 })),
    trailerFound: !!trailer,
    trailerKey: trailer?.key,
    trailerLang: trailer?.iso_639_1
  });
  
  const trailerUrl = trailer ? `https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&loop=1&playlist=${trailer.key}&playsinline=1&modestbranding=1&rel=0&showinfo=0` : null;

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? content.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === content.length - 1 ? 0 : prev + 1));
  };

  const detailUrl = currentItem.contentType === "movie" 
    ? `/movie/${currentItem.id}` 
    : `/tv/${currentItem.id}`;

  return (
    <div className="relative h-[600px] w-full overflow-hidden rounded-xl md:h-[700px]">
      {/* Background - Trailer Video hoặc Backdrop Image */}
      <div className="absolute inset-0 z-0">
        {trailerUrl ? (
          <>
            <div className="absolute inset-0 overflow-hidden">
              <iframe
                key={`trailer-${currentIndex}`}
                src={trailerUrl}
                className="absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.77vh] min-w-full -translate-x-1/2 -translate-y-1/2"
                allow="autoplay; encrypted-media"
                allowFullScreen
                style={{ border: 'none', pointerEvents: 'none' }}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
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
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
          </>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-center px-6 md:px-12 lg:px-16">
        <div className="max-w-2xl space-y-4">
          {/* Badge */}
          <Chip color="warning" variant="flat" size="sm" className="uppercase">
            CineVerse Original
          </Chip>

          {/* Title - Logo or Text */}
          {logoPath ? (
            <div className="relative h-24 w-full max-w-md md:h-32 lg:h-40">
              <Image
                src={getImageUrl(logoPath, "original")}
                alt={title}
                fill
                className="object-contain object-left"
                priority
              />
            </div>
          ) : (
            <h1 className="text-4xl font-bold text-white md:text-6xl lg:text-7xl">
              {title}
            </h1>
          )}

          {/* Description */}
          <p className="line-clamp-3 text-base text-gray-200 md:text-lg">
            {currentItem.overview || "Nội dung đang được cập nhật..."}
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              as={Link}
              href={detailUrl}
              size="lg"
              color="default"
              variant="solid"
              startContent={<IoPlayOutline className="text-2xl" />}
              className="bg-white font-semibold text-black hover:bg-white/90"
            >
              Xem ngay
            </Button>
            <Button
              as={Link}
              href={detailUrl}
              size="lg"
              color="default"
              variant="flat"
              startContent={<IoInformationCircleOutline className="text-2xl" />}
              className="bg-white/20 font-semibold text-white backdrop-blur-sm hover:bg-white/30"
            >
              Chi tiết
            </Button>
          </div>

          {/* Rating Badge */}
          {"vote_average" in currentItem && currentItem.vote_average > 0 && (
            <div className="flex items-center gap-2">
              <Chip color="success" variant="flat" size="lg">
                ⭐ {currentItem.vote_average.toFixed(1)}
              </Chip>
              {releaseYear && (
                <Chip variant="flat" size="lg">
                  {releaseYear}
                </Chip>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Controls - Chỉ hiển thị nút mute khi có trailer */}
      {trailerUrl && (
        <div className="absolute bottom-6 right-6 z-20 flex items-center gap-3">
          {/* Mute Toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/50 bg-black/30 text-white backdrop-blur-sm transition-all hover:bg-black/50"
          >
            {isMuted ? (
              <IoVolumeMuteOutline className="text-xl" />
            ) : (
              <IoVolumeHighOutline className="text-xl" />
            )}
          </button>
        </div>
      )}

      {/* Navigation Arrows */}
      {content.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-all hover:bg-black/50"
          >
            <IoIosArrowBack className="text-2xl" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-all hover:bg-black/50"
          >
            <IoIosArrowForward className="text-2xl" />
          </button>
        </>
      )}

      {/* Carousel Dots */}
      {content.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {content.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1 rounded-full transition-all ${
                index === currentIndex ? "w-8 bg-white" : "w-2 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CineVerseHero;
