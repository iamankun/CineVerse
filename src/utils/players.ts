import { PlayersProps } from "@/types";
import { fetchCineVerseMovieSources, fetchCineVerseTvSources } from "./cineverse-sources";

/**
 * Generates a list of movie players with their respective titles and source URLs.
 * Prioritizes CineVerse internal sources (YouTube/Dailymotion) if available.
 *
 * @param {string | number} id - The ID of the movie to be embedded in the player URLs.
 * @returns {Promise<PlayersProps[]>} - An array of objects, each containing
 * the title of the player and the corresponding source URL.
 */
export const getMoviePlayers = async (
  id: string | number
): Promise<PlayersProps[]> => {
  // Try to fetch CineVerse sources first
  const cineVerseSources = await fetchCineVerseMovieSources(id);

  const externalSources: PlayersProps[] = [
    {
      title: "VidSrc",
      source: `https://vidsrc-embed.ru/embed/movie?tmdb=${id}&ds_lang=vi&autoplay=1`,
      recommended: true,
      fast: true,
      ads: false,
    },
    {
      title: "VidSrc (Fixed Caption)",
      source: `https://vidsrc-embed.ru/embed/movie?tmdb=${id}&ds_lang=vi&autoplay=1&sub_url=https://raw.githubusercontent.com/cineverse/subtitles/main/movie/${id}_vi_fixed.vtt`,
      recommended: false,
      fast: true,
      ads: false,
    },
    {
      title: "VidSrc 1",
      source: `https://vidsrc.xyz/embed/movie/${id}?ds_lang=vi&autoplay=1`,
      ads: false,
    },
    {
      title: "VidSrc 2",
      source: `https://vidsrc.to/embed/movie/${id}?ds_lang=vi&autoplay=1`,
      ads: false,
    },
    {
      title: "VidSrc 3",
      source: `https://vidsrc.icu/embed/movie/${id}?ds_lang=vi&autoplay=1`,
      ads: false,
    },
    {
      title: "VidSrc 4",
      source: `https://vidsrc.cc/v2/embed/movie/${id}?autoPlay=true&ds_lang=vi`,
      ads: false,
    },
    {
      title: "VidSrc 5",
      source: `https://vidsrc.cc/v3/embed/movie/${id}?autoPlay=true&ds_lang=vi`,
      recommended: false,
      fast: true,
      ads: false,
    },
  ];

  // Return CineVerse sources first (prioritized), then external sources
  return cineVerseSources ? [...cineVerseSources, ...externalSources] : externalSources;
};

/**
 * Generates a list of TV show players with their respective titles and source URLs.
 * Prioritizes CineVerse internal sources (YouTube/Dailymotion) if available.
 *
 * @param {string | number} id - The ID of the TV show to be embedded in the player URLs.
 * @param {string | number} season - The season number of the TV show episode to be embedded.
 * @param {string | number} episode - The episode number of the TV show episode to be embedded.
 * @returns {Promise<PlayersProps[]>} - An array of objects, each containing
 * the title of the player and the corresponding source URL.
 */
export const getTvShowPlayers = async (
  id: string | number,
  season: number,
  episode: number
): Promise<PlayersProps[]> => {
  // Try to fetch CineVerse sources first
  const cineVerseSources = await fetchCineVerseTvSources(id, season, episode);

  const externalSources: PlayersProps[] = [
    {
      title: "VidSrc",
      source: `https://vidsrc-embed.ru/embed/tv?tmdb=${id}&season=${season}&episode=${episode}&ds_lang=vi&autoplay=1`,
      recommended: true,
      fast: true,
      ads: false,
    },
    {
      title: "VidSrc (Fixed Caption)",
      source: `https://vidsrc-embed.ru/embed/tv?tmdb=${id}&season=${season}&episode=${episode}&ds_lang=vi&autoplay=1&sub_url=https://raw.githubusercontent.com/cineverse/subtitles/main/tv/${id}_s${season}_e${episode}_vi_fixed.vtt`,
      recommended: false,
      fast: true,
      ads: false,
    },
    {
      title: "VidSrc 1",
      source: `https://vidsrc.xyz/embed/tv/${id}/${season}/${episode}?ds_lang=vi&autoplay=1`,
      ads: false,
    },
    {
      title: "VidSrc 2",
      source: `https://vidsrc.to/embed/tv/${id}/${season}/${episode}?ds_lang=vi&autoplay=1`,
      ads: false,
    },
    {
      title: "VidSrc 3",
      source: `https://vidsrc.icu/embed/tv/${id}/${season}/${episode}?ds_lang=vi&autoplay=1`,
      ads: false,
    },
    {
      title: "VidSrc 4",
      source: `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}?autoPlay=true&ds_lang=vi`,
      ads: false,
    },
    {
      title: "VidSrc 5",
      source: `https://vidsrc.cc/v3/embed/tv/${id}/${season}/${episode}?autoPlay=true&ds_lang=vi`,
      recommended: false,
      fast: true,
      ads: false,
    },
  ];

  // Return CineVerse sources first (prioritized), then external sources
  return cineVerseSources ? [...cineVerseSources, ...externalSources] : externalSources;
};
