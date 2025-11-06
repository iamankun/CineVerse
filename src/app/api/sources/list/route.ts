import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

type SourceInfo = {
  tmdbId: number;
  title: string;
  year: number;
  type: "movie" | "tv";
  mtime: Date;
  // Metadata
  metadata?: {
    "movie-rating"?: string;
    audioVersion?: string;
    lastUpdate?: string;
  };
  // TV-specific
  totalSeasons?: number;
  totalEpisodes?: number;
  // Movie-specific
  sourcesCount?: number;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // Filter by type if provided
    
    const sourcesPath = path.join(process.cwd(), "public", "sources");
    const allSources: SourceInfo[] = [];
    
    // Đọc thư mục Movie
    if (!type || type === "movie") {
      const moviePath = path.join(sourcesPath, "Movie");
      try {
        const movieFiles = await fs.readdir(moviePath);
        for (const file of movieFiles) {
          if (file.endsWith('.json')) {
            const id = parseInt(file.replace('.json', ''));
            if (!isNaN(id)) {
              try {
                const filePath = path.join(moviePath, file);
                const stats = await fs.stat(filePath);
                
                // Đọc nội dung file để lấy thông tin
                const content = await fs.readFile(filePath, "utf-8");
                const data = JSON.parse(content);
                
                allSources.push({
                  tmdbId: data.tmdbId || id,
                  title: data.title || "Unknown",
                  year: data.year || 0,
                  type: "movie",
                  mtime: stats.mtime,
                  sourcesCount: data.sources?.length || 0,
                  metadata: data.metadata ? {
                    "movie-rating": data.metadata["movie-rating"],
                    audioVersion: data.metadata.audioVersion,
                    lastUpdate: data.metadata.lastUpdate,
                  } : undefined,
                });
              } catch (fileError) {
                console.error(`Error parsing movie file ${file}:`, fileError);
                // Skip invalid JSON files and continue
              }
            }
          }
        }
      } catch (error) {
        console.error('Error reading Movie directory:', error);
      }
    }
    
    // Đọc thư mục ChuongTrinhTV
    if (!type || type === "tv") {
      const tvPath = path.join(sourcesPath, "ChuongTrinhTV");
      try {
        const tvFiles = await fs.readdir(tvPath);
        for (const file of tvFiles) {
          if (file.endsWith('.json')) {
            const id = parseInt(file.replace('.json', ''));
            if (!isNaN(id)) {
              try {
                const filePath = path.join(tvPath, file);
                const stats = await fs.stat(filePath);
                
                // Đọc nội dung file để lấy thông tin
                const content = await fs.readFile(filePath, "utf-8");
                const data = JSON.parse(content);
                
                // Tính tổng số episodes và sources
                let totalEpisodes = 0;
                let totalSources = 0;
                if (data.seasons) {
                  Object.values(data.seasons).forEach((season: any) => {
                    totalEpisodes += Object.keys(season).length;
                    // Count sources for each episode
                    Object.values(season).forEach((episode: any) => {
                      if (episode.sources && Array.isArray(episode.sources)) {
                        totalSources += episode.sources.length;
                      }
                    });
                  });
                }
                
                allSources.push({
                  tmdbId: data.tmdbId || id,
                  title: data.title || "Unknown",
                  year: data.year || 0,
                  type: "tv",
                  mtime: stats.mtime,
                  totalSeasons: data.seasons ? Object.keys(data.seasons).length : 0,
                  totalEpisodes: totalEpisodes,
                  sourcesCount: totalSources,
                  metadata: data.metadata ? {
                    "movie-rating": data.metadata["movie-rating"],
                    audioVersion: data.metadata.audioVersion,
                    lastUpdate: data.metadata.lastUpdate,
                  } : undefined,
                });
              } catch (fileError) {
                console.error(`Error parsing TV file ${file}:`, fileError);
                // Skip invalid JSON files and continue
              }
            }
          }
        }
      } catch (error) {
        console.error('Error reading ChuongTrinhTV directory:', error);
      }
    }
    
    // Sắp xếp theo thời gian mới nhất
    const sortedSources = allSources.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
    
    // Tách ra movieIds và tvIds để hỗ trợ CineVerseSources component
    const movieIds = sortedSources.filter(s => s.type === "movie").map(s => s.tmdbId);
    const tvIds = sortedSources.filter(s => s.type === "tv").map(s => s.tmdbId);
    
    return NextResponse.json({
      sources: sortedSources,
      total: sortedSources.length,
      movieIds: movieIds,
      tvIds: tvIds
    });
  } catch (error) {
    console.error('Error listing sources:', error);
    return NextResponse.json(
      { error: 'Failed to list sources' },
      { status: 500 }
    );
  }
}
