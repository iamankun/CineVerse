import { NextRequest, NextResponse } from 'next/server';

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const id = searchParams.get('id');
  const slug = searchParams.get('slug');

  try {
    let data;

    if (slug) {
      const response = await fetch(`https://phimapi.com/phim/${slug}`);
      if (!response.ok) {
        return NextResponse.json(
          { status: false, msg: `Không tìm thấy nội dung với slug: ${slug}` },
          { status: 404 }
        );
      }
      data = await response.json();
      if (!data.status) {
        return NextResponse.json(
          { status: false, msg: `API error: ${data.msg || 'Unknown error'}` },
          { status: 400 }
        );
      }
    } else if (id) {
      let tmdbData = null;

      // Try TV endpoint first
      try {
        const tvResponse = await fetch(`https://phimapi.com/tmdb/tv/${id}`);
        if (tvResponse.ok) {
          const tvResult = await tvResponse.json();
          if (tvResult.status && tvResult.movie?.slug) {
            tmdbData = tvResult;
          }
        }
      } catch {}

      // Fallback to movie endpoint
      if (!tmdbData) {
        try {
          const movieResponse = await fetch(`https://phimapi.com/tmdb/movie/${id}`);
          if (movieResponse.ok) {
            const movieResult = await movieResponse.json();
            if (movieResult.status && movieResult.movie?.slug) {
              tmdbData = movieResult;
            }
          }
        } catch {}
      }

      if (!tmdbData) {
        return NextResponse.json(
          { status: false, msg: `Không tìm thấy nội dung với TMDB ID: ${id}.` },
          { status: 404 }
        );
      }

      // Normalize type
      if (tmdbData.movie) {
        const t = tmdbData.movie.type;
        tmdbData.movie.type = (t === 'series' || t === 'phimbo') ? 'series' : 'single';
      }

      // Get full details via slug
      try {
        const fullMovieResponse = await fetch(`https://phimapi.com/phim/${tmdbData.movie.slug}`);
        if (!fullMovieResponse.ok) {
          return NextResponse.json(tmdbData, { status: 200, headers: CACHE_HEADERS });
        }
        data = await fullMovieResponse.json();
        if (!data.status) {
          return NextResponse.json(tmdbData, { status: 200, headers: CACHE_HEADERS });
        }
      } catch {
        return NextResponse.json(tmdbData, { status: 200, headers: CACHE_HEADERS });
      }
    } else {
      return NextResponse.json(
        { status: false, msg: 'Vui lòng cung cấp id hoặc slug' },
        { status: 400 }
      );
    }

    return NextResponse.json(data, { status: 200, headers: CACHE_HEADERS });

  } catch (error) {
    console.error('KKPhim API Error:', error);
    return NextResponse.json(
      { status: false, msg: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
