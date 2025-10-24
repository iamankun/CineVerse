import { CineVerseMovieData, CineVerseTvData, PlayersProps } from "@/types";

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
        source: source.url as `https://${string}`,
        recommended: index === 0, // Đánh dấu nguồn đầu tiên là recommended
        fast: true,
        ads: false,
        isCineVerseSource: true,
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
        source: source.url as `https://${string}`,
        recommended: index === 0,
        fast: true,
        ads: false,
        isCineVerseSource: true,
      };
    });
  } catch (error) {
    console.error("Error fetching CineVerse TV sources:", error);
    return null;
  }
};
