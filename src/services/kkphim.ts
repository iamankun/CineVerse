// KKPhim API Types
export interface KKPhimMovie {
  tmdb: {
    type: "movie" | "tv";
    id: string;
    episode?: string;
  };
  imdb?: {
    id: string | null;
  };
  created?: {
    time: string;
  };
  modified?: {
    time: string;
  };
  _id?: string;
  name: string;
  slug?: string;
  origin_name?: string;
  content?: string;
  type: "single" | "series" | "hoathinh" | "phimle" | "phimbo";
  status?: string;
  poster_url?: string;
  thumb_url?: string;
  is_copyright?: boolean;
  sub_docquyen?: boolean;
  chieurap?: boolean;
  trailer_url?: string;
  time?: string;
  episode_current?: string;
  episode_total?: string;
  quality?: string;
  lang?: string;
  notify?: string;
  showtimes?: string;
  year?: number;
  view?: number;
  actor?: string[];
  director?: string[];
  category?: any[];
  country?: any[];
  episodes?: KKPhimServer[];
}

export interface KKPhimEpisode {
  name: string;
  link_embed: string | null;
  link_m3u8: string | null;
}

export interface KKPhimServer {
  server_name?: string;
  server_data: KKPhimEpisode[];
}

export interface KKPhimResponse {
  status: boolean;
  msg: string;
  movie: KKPhimMovie;
  episodes: KKPhimServer[];
}

// KKPhim API Client
class KKPhimAPI {
  private readonly BASE_URL = 'https://phimapi.com';

  /**
   * Get movie details by TMDB ID - 2-step process
   * Step 1: GET https://phimapi.com/tmdb/{type}/{id} → Get slug
   * Step 2: GET https://phimapi.com/phim/{slug} → Get episodes with link_embed
   */
  async getMovieDetails(tmdbId: string | number): Promise<KKPhimResponse> {
    console.log(`🔄 KKPhimAPI.getMovieDetails called for TMDB ID: ${tmdbId}`);
    
    try {
      // Step 1: Get slug from TMDB ID
      let slug: string | undefined;
      let movieType: string;
      
      // Try TV endpoint first (phim bộ)
      console.log(`🔄 Step 1: Getting slug from TMDB TV endpoint for: ${tmdbId}`);
      const tvResponse = await fetch(`${this.BASE_URL}/tmdb/tv/${tmdbId}`);
      
      if (tvResponse.ok) {
        const tvData = await tvResponse.json();
        if (tvData.status && tvData.slug) {
          slug = tvData.slug;
          movieType = 'tv';
          console.log(`✅ Found slug from TV endpoint: ${slug}`);
        }
      }
      
      // If TV failed, try movie endpoint (phim lẻ)
      if (!slug) {
        console.log(`🔄 Step 1: Getting slug from TMDB movie endpoint for: ${tmdbId}`);
        const movieResponse = await fetch(`${this.BASE_URL}/tmdb/movie/${tmdbId}`);
        
        if (movieResponse.ok) {
          const movieData = await movieResponse.json();
          if (movieData.status && movieData.slug) {
            slug = movieData.slug;
            movieType = 'movie';
            console.log(`✅ Found slug from movie endpoint: ${slug}`);
          }
        }
      }
      
      if (!slug) {
        console.log(`❌ No slug found for TMDB ID: ${tmdbId}`);
        // Return empty response instead of throwing error
        return {
          status: false,
          msg: `TMDB ID ${tmdbId} not found in KKPhim API`,
          movie: {} as KKPhimMovie,
          episodes: []
        };
      }
      
      // Step 2: Get episodes using slug
      console.log(`🔄 Step 2: Getting episodes from slug: ${slug}`);
      const phimResponse = await fetch(`${this.BASE_URL}/phim/${slug}`);
      
      if (!phimResponse.ok) {
        throw new Error(`Failed to fetch episodes: HTTP error! status: ${phimResponse.status}`);
      }
      
      const phimData: KKPhimResponse = await phimResponse.json();
      console.log(`📊 KKPhim phim API response:`, phimData);
      
      if (!phimData.status) {
        console.log(`❌ Phim API returned false status: ${phimData.msg}`);
        throw new Error(phimData.msg || "Phim API returned false status");
      }
      
      console.log(`✅ Successfully fetched data from KKPhim for: ${phimData.movie.name}`);
      return phimData;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ KKPhim Error fetching movie ${tmdbId}:`, error);
      throw error;
    }
  }

  /**
   * Try to find KKPhim content by TMDB ID using official API patterns
   */
  async findKKPhimByTMDB(tmdbId: string | number): Promise<KKPhimResponse | null> {
    console.log(`🔍 Searching KKPhim content for TMDB ID: ${tmdbId}`);
    
    try {
      // Approach 1: Try TV endpoint first (phim bộ) - many movies are stored as TV in KKPhim
      console.log(`🔄 Trying KKPhim TV endpoint: /tmdb/tv/${tmdbId}`);
      const tvResponse = await fetch(`${this.BASE_URL}/tmdb/tv/${tmdbId}`);
      
      console.log(`📡 TV Response status: ${tvResponse.status}`);
      
      if (tvResponse.ok) {
        const tvData = await tvResponse.json();
        console.log(`📊 TV endpoint response:`, tvData);
        
        if (tvData.status && tvData.slug) {
          console.log(`✅ Found via TV endpoint: ${tvData.slug}`);
          
          // Get full movie details using slug
          const movieResponse = await fetch(`${this.BASE_URL}/phim/${tvData.slug}`);
          console.log(`📡 TV slug response status: ${movieResponse.status}`);
          
          if (movieResponse.ok) {
            const movieData = await movieResponse.json();
            console.log(`📊 TV slug response:`, movieData);
            
            if (movieData.status) {
              console.log(`✅ Returning TV data: ${movieData.movie.name}`);
              return movieData;
            }
          }
        } else {
          console.log(`❌ TV endpoint returned false status or no slug`);
        }
      } else {
        console.log(`❌ TV endpoint failed with status: ${tvResponse.status}`);
      }
    } catch (error) {
      console.log(`❌ TV endpoint failed:`, error);
    }
    
    try {
      // Approach 2: Try movie endpoint (phim lẻ) - only if TV failed
      console.log(`🔄 Trying KKPhim movie endpoint: /tmdb/movie/${tmdbId}`);
      const movieResponse = await fetch(`${this.BASE_URL}/tmdb/movie/${tmdbId}`);
      
      console.log(`📡 Movie Response status: ${movieResponse.status}`);
      
      if (movieResponse.ok) {
        const movieData = await movieResponse.json();
        console.log(`📊 Movie endpoint response:`, movieData);
        
        if (movieData.status && movieData.slug) {
          console.log(`✅ Found via movie endpoint: ${movieData.slug}`);
          
          // Get full movie details using slug
          const fullMovieResponse = await fetch(`${this.BASE_URL}/phim/${movieData.slug}`);
          console.log(`📡 Movie slug response status: ${fullMovieResponse.status}`);
          
          if (fullMovieResponse.ok) {
            const fullMovieData = await fullMovieResponse.json();
            console.log(`📊 Movie slug response:`, fullMovieData);
            
            if (fullMovieData.status) {
              console.log(`✅ Returning movie data: ${fullMovieData.movie.name}`);
              return fullMovieData;
            } else {
              console.log(`❌ Movie slug returned false status: ${fullMovieData.msg}`);
            }
          } else {
            console.log(`❌ Movie slug request failed: ${fullMovieResponse.status}`);
          }
        } else {
          console.log(`❌ Movie endpoint returned false status or no slug`);
        }
      } else {
        console.log(`❌ Movie endpoint failed with status: ${movieResponse.status}`);
      }
    } catch (error) {
      console.log(`❌ Movie endpoint failed:`, error);
    }
    
    console.log(`❌ No KKPhim content found for TMDB ID: ${tmdbId}`);
    return null;
  }

  /**
   * Get players for a movie
   */
  async getMoviePlayers(tmdbId: string | number): Promise<any[]> {
    console.log(`🔄 KKPhimAPI.getMoviePlayers called for TMDB ID: ${tmdbId}`);
    
    try {
      console.log(`📞 Calling getMovieDetails from getMoviePlayers...`);
      const movieData = await this.getMovieDetails(tmdbId);
      console.log(`✅ getMovieDetails returned successfully in getMoviePlayers`);
      
      console.log(`📊 Movie type: ${movieData.movie.type} for TMDB ID: ${tmdbId}`);
      
      // Check if movie data exists and has type
      if (!movieData.movie || !movieData.movie.type) {
        console.log(`📺 TMDB ID ${tmdbId} has no valid movie data`);
        // Return empty array instead of throwing error
        return [];
      }
      
      // Movies must have "single" type
      if (movieData.movie.type !== "single") {
        console.log(`📺 TMDB ID ${tmdbId} is a TV show, not a movie`);
        throw new Error("This is not a movie - Movies must have single type");
      }
      
      console.log(`🎬 Getting players for movie: ${movieData.movie.name}`);
      
      // Get first server and first episode
      if (!movieData.episodes || movieData.episodes.length === 0) {
        console.log(`❌ No episodes found for movie: ${movieData.movie.name}`);
        return [];
      }
      
      const firstServer = movieData.episodes[0];
      if (!firstServer.server_data || firstServer.server_data.length === 0) {
        console.log(`❌ No server data found for movie: ${movieData.movie.name}`);
        return [];
      }
      
      const movieEpisode = firstServer.server_data[0];
      const players = this.convertEpisodeToPlayers(movieEpisode);
      
      console.log(`✅ getMoviePlayers returning ${players.length} players for movie: ${movieData.movie.name}`);
      return players;
      
    } catch (error) {
      console.error(`❌ KKPhim Error in getMoviePlayers for ${tmdbId}:`, error);
      throw error;
    }
  }

  /**
   * Get players for a TV show
   */
  async getTVShowPlayers(tmdbId: string | number, season: number, episode: number): Promise<any[]> {
    console.log(`🔄 KKPhimAPI.getTVShowPlayers called for TMDB ID: ${tmdbId}, Season: ${season}, Episode: ${episode}`);
    
    try {
      const movieData = await this.getMovieDetails(tmdbId);
      console.log(`✅ getMovieDetails returned successfully in getTVShowPlayers`);
      
      // Check if movie data exists and has type
      if (!movieData.movie || !movieData.movie.type) {
        console.log(`📺 TMDB ID ${tmdbId} has no valid movie data`);
        return [];
      }
      
      // TV shows must have "series" type
      if (movieData.movie.type !== "series") {
        console.log(`📺 TMDB ID ${tmdbId} is a movie, not a TV show`);
        throw new Error("This is not a TV show");
      }
      
      console.log(`🎬 Getting players for TV show: ${movieData.movie.name}`);
      
      // Find the specific episode
      if (!movieData.episodes || movieData.episodes.length === 0) {
        console.log(`❌ No episodes found for TV show: ${movieData.movie.name}`);
        return [];
      }
      
      let targetEpisode: KKPhimEpisode | null = null;
      for (const server of movieData.episodes) {
        const foundEpisode = server.server_data.find(ep => ep.name === `Tập ${episode.toString().padStart(2, '0')}`);
        if (foundEpisode) {
          targetEpisode = foundEpisode;
          break;
        }
      }
      
      if (!targetEpisode) {
        console.log(`❌ Episode ${episode} not found in TV show: ${movieData.movie.name}`);
        return [];
      }
      
      const players = this.convertEpisodeToPlayers(targetEpisode);
      console.log(`✅ getTVShowPlayers returning ${players.length} players for TV show: ${movieData.movie.name}`);
      return players;
      
    } catch (error) {
      console.error(`❌ KKPhim Error in getTVShowPlayers for ${tmdbId}:`, error);
      throw error;
    }
  }

  /**
   * Convert episode to player sources
   */
  convertEpisodeToPlayers(episode: KKPhimEpisode): any[] {
    const sources: any[] = [];
    
    console.log(`🎬 Processing episode: ${episode.name}`);
    console.log(`🔗 Link Embed: ${episode.link_embed}`);

    // Add embed source only
    if (episode.link_embed) {
      // Check if it's an embed player URL or direct video link
      const isEmbedPlayer = episode.link_embed.includes('player.phimapi.com') ||
                           episode.link_embed.includes('player.') ||
                           episode.link_embed.includes('embed');
      
      // Use the original embed URL, don't extract direct URL
      let videoUrl = episode.link_embed;
      let title = "KKPhim Player";
      
      // For embed players, keep the full embed URL
      if (isEmbedPlayer) {
        console.log(`🎬 Using embed player URL: ${videoUrl}`);
      }
      
      const isDirectLink = videoUrl.includes('.m3u8') || 
                         videoUrl.includes('.mp4');
      
      sources.push({
        title: title,
        source: videoUrl,
        recommended: true,
        fast: false, // Embed players are not as fast as direct links
        ads: true, // Embed players usually have ads
        provider: isEmbedPlayer ? "kkphim-embed" : "kkphim",
      });
      console.log(`✅ Added ${isEmbedPlayer ? 'Embed' : 'Direct'} source: ${videoUrl}`);
    }

    console.log(`🎯 Total sources for ${episode.name}: ${sources.length}`);
    return sources;
  }
}

// Export singleton instance
export const kkphim = new KKPhimAPI();
