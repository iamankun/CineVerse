// Base configuration for Vietnamese language
const VI_CONFIG = {
  language: 'vi-VN',
  region: 'VN'
};

// Base TMDB API URL
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Helper function to make TMDB API requests
export const tmdbFetch = async (url: string, params: any = {}) => {
  try {
    const queryParams = new URLSearchParams({
      ...VI_CONFIG,
      ...params
    }).toString();
    
    const response = await fetch(
      `${TMDB_BASE_URL}${url}?${queryParams}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN}`,
          'accept': 'application/json'
        }
      }
    );
    return await response.json();
  } catch (error) {
    console.error('Lỗi khi tải dữ liệu từ TMDB:', error);
    throw error;
  }
};

// Wrapper functions for movies
export const getMovieDetailsInVietnamese = async (movieId: number, append_to_response?: string[]) => {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}?language=vi-VN&region=VN${
        append_to_response ? `&append_to_response=${append_to_response.join(',')}` : ''
      }`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN}`,
          'accept': 'application/json'
        }
      }
    );
    return await response.json();
  } catch (error) {
    console.error('Lỗi khi tải chi tiết phim:', error);
    throw error;
  }
};