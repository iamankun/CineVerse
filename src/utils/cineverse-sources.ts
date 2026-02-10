import { PlayersProps } from "@/types";

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
    
    // Handle youtube.com/embed/... (already embed URL, add autoplay if missing)
    if ((urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('m.youtube.com')) && urlObj.pathname.startsWith('/embed/')) {
      const videoId = urlObj.pathname.split('/embed/')[1]?.split('?')[0];
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&enablejsapi=1`;
      }
    }
    
    // Not a YouTube URL
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
        return `https://www.dailymotion.com/embed/video/${videoId}?autoplay=1&mute=0&api=postMessage`;
      }
    }
    
    // Handle dai.ly/...
    if (urlObj.hostname === 'dai.ly') {
      const videoId = urlObj.pathname.slice(1); // Remove leading /
      if (videoId) {
        return `https://www.dailymotion.com/embed/video/${videoId}?autoplay=1&mute=0&api=postMessage`;
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
 * Fetches CineVerse internal movie sources from Supabase
 * @param id - TMDB movie ID
 * @returns Array of player sources or null if not available
 */
export const fetchCineVerseMovieSources = async (
  id: string | number
): Promise<PlayersProps[] | null> => {
  try {
    // Fetch from Supabase instead of JSON
    const response = await fetch(`/api/admin/dienanh`);
    if (!response.ok) return null;

    const result = await response.json();
    const movies = result.movies || [];
    
    // Find the movie by tmdb_id
    const movie = movies.find((item: any) => item.tmdb_id === parseInt(id.toString()));
    if (!movie || !movie.sources || movie.sources.length === 0) return null;

    return movie.sources.map((source: any, index: number) => {
      const partLabel = source.part && source.part !== "main" ? ` ${source.part}` : "";
      
      return {
        title: `An Kun Studio${partLabel}`.trim(),
        source: processSourceUrl(source.provider, source.url) as `https://${string}`,
        recommended: index === 0,
        fast: true,
        ads: false,
        isCineVerseSource: true,
        provider: source.provider,
        ...(source.intro && { intro: source.intro }),
        ...(source.outro && { outro: source.outro }),
      };
    });
  } catch (error) {
    console.error("Error fetching movie sources from Supabase:", error);
    return null;
  }
};

/**
 * Fetches CineVerse internal TV show sources from Supabase
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
    // Fetch from Supabase instead of JSON
    const response = await fetch(`/api/admin/chuongtrinhtv`);
    if (!response.ok) return null;

    const result = await response.json();
    const tvShows = result.tvSeries || [];
    
    // Find the TV show by tmdb_id
    const tvShow = tvShows.find((item: any) => item.tmdb_id === parseInt(id.toString()));
    if (!tvShow || !tvShow.seasons) return null;

    // Get the specific season
    const seasonData = tvShow.seasons[season.toString()];
    if (!seasonData) return null;

    // Get the specific episode
    const episodeData = seasonData[episode.toString()];
    if (!episodeData || !episodeData.sources || episodeData.sources.length === 0) return null;

    return episodeData.sources.map((source: any, index: number) => {
      return {
        title: `An Kun Studio`,
        source: processSourceUrl(source.provider, source.url) as `https://${string}`,
        recommended: index === 0,
        fast: true,
        ads: false,
        isCineVerseSource: true,
        provider: source.provider,
        ...(source.intro && { intro: source.intro }),
        ...(source.outro && { outro: source.outro }),
      };
    });
  } catch (error) {
    console.error("Error fetching TV sources from Supabase:", error);
    return null;
  }
};
