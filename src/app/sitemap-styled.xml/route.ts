import { NextResponse } from "next/server";
import { tmdb } from "@/api/tmdb";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://cineverse.ankun.dev";

export async function GET() {
  const currentDate = new Date().toISOString();

  try {
    console.log("🗺️ Đang tạo sitemap với stylesheet...");

    // Fetch all data (simplified version)
    const [popularMovies, popularTvShows, trendingMovies, trendingTvShows] = await Promise.all([
      tmdb.movies.popular({ language: "vi-VN" }),
      tmdb.tvShows.popular({ language: "vi-VN" }),
      tmdb.trending.trending("movie", "week", { language: "vi-VN" }),
      tmdb.trending.trending("tv", "week", { language: "vi-VN" }),
    ]);

    // Build URLs array
    const urls = [
      // Static pages
      { loc: BASE_URL, priority: "1.0", changefreq: "daily", lastmod: currentDate },
      { loc: `${BASE_URL}/discover`, priority: "0.9", changefreq: "daily", lastmod: currentDate },
      { loc: `${BASE_URL}/search`, priority: "0.8", changefreq: "daily", lastmod: currentDate },
      { loc: `${BASE_URL}/library`, priority: "0.7", changefreq: "weekly", lastmod: currentDate },
      { loc: `${BASE_URL}/about`, priority: "0.5", changefreq: "monthly", lastmod: currentDate },
      
      // Movies
      ...popularMovies.results.slice(0, 100).map((movie) => ({
        loc: `${BASE_URL}/movie/${movie.id}`,
        priority: "0.7",
        changefreq: "weekly",
        lastmod: currentDate,
      })),
      
      // TV Shows
      ...popularTvShows.results.slice(0, 100).map((tv) => ({
        loc: `${BASE_URL}/tv/${tv.id}`,
        priority: "0.7",
        changefreq: "weekly",
        lastmod: currentDate,
      })),
      
      // Trending
      ...trendingMovies.results.slice(0, 50).map((movie) => ({
        loc: `${BASE_URL}/movie/${movie.id}`,
        priority: "0.9",
        changefreq: "daily",
        lastmod: currentDate,
      })),
      
      ...trendingTvShows.results.slice(0, 50).map((tv) => ({
        loc: `${BASE_URL}/tv/${tv.id}`,
        priority: "0.9",
        changefreq: "daily",
        lastmod: currentDate,
      })),
      
      // Genre pages
      ...Array.from([28, 12, 16, 35, 80, 99, 18, 10751, 14, 36, 27, 10402, 9648, 10749, 878, 53, 10752, 37]).map((id) => ({
        loc: `${BASE_URL}/discover?genre=${id}`,
        priority: "0.75",
        changefreq: "weekly",
        lastmod: currentDate,
      })),
      
      // Year pages
      ...Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => ({
        loc: `${BASE_URL}/discover?year=${year}`,
        priority: "0.7",
        changefreq: "monthly",
        lastmod: currentDate,
      })),
    ];

    // Remove duplicates, keeping highest priority
    const uniqueUrls = Array.from(
      new Map(
        urls.map((url) => [
          url.loc,
          urls
            .filter((u) => u.loc === url.loc)
            .reduce((prev, current) => 
              (parseFloat(current.priority) > parseFloat(prev.priority) ? current : prev)
            ),
        ])
      ).values()
    );

    // Generate XML with stylesheet reference
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueUrls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

    console.log(`✅ Đã tạo sitemap với ${uniqueUrls.length} URLs`);

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("❌ Lỗi khi tạo sitemap:", error);
    
    // Fallback minimal sitemap
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml",
      },
    });
  }
}
