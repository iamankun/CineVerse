import { tmdb } from "@/api/tmdb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Check environment variables
    const envCheck = {
      tmdbToken: !!process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN,
      tmdbTokenLength: process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN?.length,
      nodeEnv: process.env.NODE_ENV,
    };

    // Test basic TMDB API call
    console.log("🔍 Testing TMDB API...");
    
    const testMovieId = 27205; // Inception
    const movieData = await tmdb.movies.details(testMovieId, ['images', 'videos']);

    // Test search
    const searchResults = await tmdb.search.movies({
      query: 'Inception',
      page: 1
    });

    return NextResponse.json({
      success: true,
      env: envCheck,
      tests: {
        movieDetails: {
          success: !!movieData,
          title: movieData?.title,
          poster: movieData?.poster_path,
          backdrop: movieData?.backdrop_path,
          images: movieData?.images?.posters?.length || 0,
        },
        search: {
          success: !!searchResults,
          results: searchResults?.results?.length || 0,
          firstResult: searchResults?.results?.[0] ? {
            title: searchResults.results[0].title,
            poster: searchResults.results[0].poster_path
          } : null
        }
      }
    });

  } catch (error: any) {
    console.error("🔍 TMDB Debug Error:", error);
    
    return NextResponse.json({
      success: false,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      env: {
        tmdbToken: !!process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN,
        tmdbTokenLength: process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN?.length,
        nodeEnv: process.env.NODE_ENV,
      }
    }, { status: 500 });
  }
}
