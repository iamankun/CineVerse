import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const id = searchParams.get('id');
  const slug = searchParams.get('slug');

  console.log(`🔍 KKPhim API Route called:`, { type, id, slug });
  console.log(`🔍 NEW SIMPLE API ROUTE - Version 2.0`);
  console.log(`🔍 Request URL: ${request.url}`);

  try {
    let data;

    if (slug) {
      // Search by slug
      console.log(`🔍 Searching slug: ${slug}`);
      const response = await fetch(`https://phimapi.com/phim/${slug}`);
      
      if (!response.ok) {
        console.log(`❌ Slug API failed: ${response.status}`);
        return NextResponse.json(
          { 
            status: false, 
            msg: `Không tìm thấy nội dung với slug: ${slug}` 
          },
          { status: 404 }
        );
      }
      
      data = await response.json();
      
      if (!data.status) {
        console.log(`❌ Slug API returned false status:`, data.msg);
        return NextResponse.json(
          { 
            status: false, 
            msg: `API error: ${data.msg || 'Unknown error'}` 
          },
          { status: 400 }
        );
      }
    } else if (id) {
      // Search by TMDB ID - auto-detect type
      console.log(`🔍 Searching TMDB ID: ${id}`);
      
      let tmdbData = null;
      
      // Try TV endpoint first (many movies are stored as TV in KKPhim)
      console.log(`🔄 Trying TV endpoint: /tmdb/tv/${id}`);
      try {
        const tvResponse = await fetch(`https://phimapi.com/tmdb/tv/${id}`);
        console.log(`📡 TV Response status: ${tvResponse.status}`);
        
        if (tvResponse.ok) {
          const tvResult = await tvResponse.json();
          console.log(`📊 TV endpoint response:`, tvResult);
          
          if (tvResult.status && tvResult.movie && tvResult.movie.slug) {
            tmdbData = tvResult;
            console.log(`✅ Found via TV endpoint: ${tvResult.movie.slug}`);
          } else {
            console.log(`❌ TV endpoint missing slug. Status: ${tvResult.status}, Has movie: ${!!tvResult.movie}, Slug: ${tvResult.movie?.slug}`);
          }
        } else {
          console.log(`❌ TV endpoint failed with status: ${tvResponse.status}`);
        }
      } catch (error) {
        console.log(`❌ TV endpoint error:`, error);
      }
      
      // If TV failed, try movie endpoint
      if (!tmdbData) {
        console.log(`🔄 Trying movie endpoint: /tmdb/movie/${id}`);
        try {
          const movieResponse = await fetch(`https://phimapi.com/tmdb/movie/${id}`);
          console.log(`📡 Movie Response status: ${movieResponse.status}`);
          
          if (movieResponse.ok) {
            const movieResult = await movieResponse.json();
            console.log(`📊 Movie endpoint response:`, movieResult);
            
            if (movieResult.status && movieResult.movie && movieResult.movie.slug) {
              tmdbData = movieResult;
              console.log(`✅ Found via movie endpoint: ${movieResult.movie.slug}`);
            } else {
              console.log(`❌ Movie endpoint missing slug. Status: ${movieResult.status}, Has movie: ${!!movieResult.movie}, Slug: ${movieResult.movie?.slug}`);
            }
          } else {
            console.log(`❌ Movie endpoint failed with status: ${movieResponse.status}`);
          }
        } catch (error) {
          console.log(`❌ Movie endpoint error:`, error);
        }
      }
      
      if (!tmdbData) {
        console.log(`❌ No data found for TMDB ID: ${id}`);
        return NextResponse.json(
          { 
            status: false, 
            msg: `Không tìm thấy nội dung với TMDB ID: ${id}. KKPhim có thể không hỗ trợ ID này.` 
          },
          { status: 404 }
        );
      }
      
      // Normalize the type to match expected format
      if (tmdbData.movie) {
        // Map KKPhim types to standard types
        if (tmdbData.movie.type === "hoathinh" || tmdbData.movie.type === "single" || tmdbData.movie.type === "phimle") {
          tmdbData.movie.type = "single";
        } else if (tmdbData.movie.type === "series" || tmdbData.movie.type === "phimbo") {
          tmdbData.movie.type = "series";
        }
        console.log(`🔄 Normalized movie type to: ${tmdbData.movie.type}`);
      }
      
      // Get full movie details using slug
      console.log(`🔄 Fetching full details from slug: ${tmdbData.movie.slug}`);
      try {
        const fullMovieResponse = await fetch(`https://phimapi.com/phim/${tmdbData.movie.slug}`);
        console.log(`📡 Full movie response status: ${fullMovieResponse.status}`);
        
        if (!fullMovieResponse.ok) {
          console.log(`❌ Full movie request failed: ${fullMovieResponse.status}`);
          console.log(`🔄 Returning TMDB endpoint data instead since slug not found`);
          // Return the data we got from TMDB endpoint instead of failing
          console.log(`✅ Returning TMDB data: ${tmdbData.movie.name}`);
          return NextResponse.json(tmdbData, { status: 200 });
        }
        
        data = await fullMovieResponse.json();
        console.log(`📊 Full movie response:`, data);
        
        if (!data.status) {
          console.log(`❌ Full movie data returned false status:`, data.msg);
          console.log(`🔄 Returning TMDB endpoint data instead since full data failed`);
          // Return the data we got from TMDB endpoint instead of failing
          console.log(`✅ Returning TMDB data: ${tmdbData.movie.name}`);
          return NextResponse.json(tmdbData, { status: 200 });
        }
      } catch (error) {
        console.log(`❌ Full movie request error:`, error);
        console.log(`🔄 Returning TMDB endpoint data instead since request failed`);
        // Return the data we got from TMDB endpoint instead of failing
        console.log(`✅ Returning TMDB data: ${tmdbData.movie.name}`);
        return NextResponse.json(tmdbData, { status: 200 });
      }
    } else {
      console.log(`❌ Missing parameters: id or slug required`);
      return NextResponse.json(
        { 
          status: false, 
          msg: 'Vui lòng cung cấp id hoặc slug' 
        },
        { status: 400 }
      );
    }

    console.log(`✅ KKPhim API success, returning data`);
    return NextResponse.json(data, { status: 200 });
    
  } catch (error) {
    console.error('❌ KKPhim API Error:', error);
    return NextResponse.json(
      { 
        status: false, 
        msg: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      },
      { status: 500 }
    );
  }
}
