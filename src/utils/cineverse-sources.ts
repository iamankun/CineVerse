import { CineVerseMovieData, CineVerseTvData, PlayersProps } from "@/types";

/**
 * Converts YouTube watch URLs to embed URLs
 * Supports formats:
 * - youtube.com/watch?v=VIDEO_ID
 * - m.youtube.com/watch?v=VIDEO_ID
 * - youtu.be/VIDEO_ID
 * - youtube.com/v/VIDEO_ID
 */
function convertYouTubeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    
    // Handle youtube.com/watch?v=... and m.youtube.com/watch?v=...
    if ((urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('m.youtube.com')) && urlObj.pathname === '/watch') {
      const videoId = urlObj.searchParams.get('v');
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&enablejsapi=1`;
      }
    }
    
    // Handle youtu.be/...
    if (urlObj.hostname === 'youtu.be') {
      const videoId = urlObj.pathname.slice(1); // Remove leading /
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&enablejsapi=1`;
      }
    }
    
    // Handle youtube.com/v/... and m.youtube.com/v/...
    if ((urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('m.youtube.com')) && urlObj.pathname.startsWith('/v/')) {
      const videoId = urlObj.pathname.split('/v/')[1];
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&enablejsapi=1`;
      }
    }
    
    // Already an embed URL or not a YouTube URL
    return url;
  } catch (error) {
    console.warn('Failed to parse YouTube URL:', url, error);
    return url;
  }
}

/**
 * Converts Dailymotion URLs to embed URLs with API enabled
 * Supports formats:
 * - dailymotion.com/video/VIDEO_ID
 * - dai.ly/VIDEO_ID
 */
function convertDailymotionUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    
    // Handle dailymotion.com/video/...
    if (urlObj.hostname.includes('dailymotion.com') && urlObj.pathname.startsWith('/video/')) {
      const videoId = urlObj.pathname.split('/video/')[1]?.split('?')[0];
      if (videoId) {
        return `https://www.dailymotion.com/embed/video/${videoId}?autoplay=1&api=postMessage`;
      }
    }
    
    // Handle dai.ly/...
    if (urlObj.hostname === 'dai.ly') {
      const videoId = urlObj.pathname.slice(1); // Remove leading /
      if (videoId) {
        return `https://www.dailymotion.com/embed/video/${videoId}?autoplay=1&api=postMessage`;
      }
    }
    
    // Already an embed URL or not a Dailymotion URL
    return url;
  } catch (error) {
    console.warn('Failed to parse Dailymotion URL:', url, error);
    return url;
  }
}

/**
 * Processes source URL based on provider type
 */
function processSourceUrl(provider: string, url: string): string {
  if (provider.toLowerCase() === 'youtube') {
    return convertYouTubeUrl(url);
  }
  if (provider.toLowerCase() === 'dailymotion') {
    return convertDailymotionUrl(url);
  }
  return url;
}

/**
 * Fetches CineVerse internal movie sources from JSON files
 * @param id - TMDB movie ID
 * @returns Array of player sources or null if not available
 */
export const fetchCineVerseMovieSources = async (
  id: string | number
): Promise<PlayersProps[] | null> => {
  try {
    const response = await fetch(`/api/sources/movie/${id}`, {
      cache: "no-store",
    });

    if (!response.ok) return null;

    const { success, data } = await response.json();
    if (!success || !data) return null;

    // Support both old format (sources array) and new format (parts object)
    let sources: any[] = [];
    
    if (data.sources) {
      // Old format: { sources: [...] }
      sources = data.sources;
    } else if (data.parts) {
      // New format: { parts: { main: { sources: [...] }, part1: {...}, ... } }
      // Flatten all parts into single sources array
      Object.keys(data.parts).forEach((partKey) => {
        const partSources = data.parts[partKey].sources || [];
        sources.push(...partSources.map((s: any) => ({ ...s, part: partKey })));
      });
    }

    if (sources.length === 0) return null;

    return sources.map((source, index) => {
      const partLabel = source.part && source.part !== "main" ? ` ${source.part}` : "";
      
      return {
        title: `CineVerse${partLabel}`.trim(),
        source: processSourceUrl(source.provider, source.url) as `https://${string}`,
        recommended: index === 0, // Đánh dấu nguồn đầu tiên là recommended
        fast: true,
        ads: false,
        isCineVerseSource: true,
        provider: source.provider,
      };
    });
  } catch (error) {
    console.error("Error fetching CineVerse movie sources:", error);
    return null;
  }
};

/**
 * Fetches CineVerse internal TV show sources from JSON files
 * @param id - TMDB TV show ID
 * @param season - Season number
 * @param episode - Episode number
 * @returns Array of player sources or null if not available
 */
export const fetchCineVerseTvSources = async (
  id: string | number,
  season: number,
  episode: number
): Promise<PlayersProps[] | null> => {
  try {
    const response = await fetch(
      `/api/sources/tv/${id}?season=${season}&episode=${episode}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) return null;

    const { success, data } = await response.json();
    if (!success || !data?.sources) return null;

    return data.sources.map((source: any, index: number) => {
      return {
        title: `CineVerse`,
        source: processSourceUrl(source.provider, source.url) as `https://${string}`,
        recommended: index === 0,
        fast: true,
        ads: false,
        isCineVerseSource: true,
        provider: source.provider,
      };
    });
  } catch (error) {
    console.error("Error fetching CineVerse TV sources:", error);
    return null;
  }
};
