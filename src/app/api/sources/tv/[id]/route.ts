import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

export const dynamic = 'force-dynamic';

// Helper function to convert Movie parts format to TV seasons format
function convertPartsToSeasons(movieData: any) {
  if (!movieData.parts) return null;
  
  const seasons: any = { "1": {} };
  const parts = Object.entries(movieData.parts);
  
  parts.forEach(([partKey, partValue]: [string, any], index) => {
    seasons["1"][String(index + 1)] = {
      title: partValue.title || `Tập ${index + 1}`,
      sources: partValue.sources || []
    };
  });
  
  return {
    tmdbId: movieData.tmdbId,
    title: movieData.title,
    year: movieData.year,
    seasons,
    metadata: {
      ...movieData.metadata,
      totalSeasons: 1,
      convertedFromParts: true
    },
    lastUpdated: movieData.lastUpdated
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const season = searchParams.get("season");
    const episode = searchParams.get("episode");
    
    let data;
    let isConverted = false;
    
    // Try ChuongTrinhTV first
    try {
      const tvFilePath = join(process.cwd(), "public", "sources", "ChuongTrinhTV", `${id}.json`);
      const tvFileContent = await readFile(tvFilePath, "utf-8");
      data = JSON.parse(tvFileContent);
    } catch (tvError) {
      // Fallback to Movie folder
      try {
        const movieFilePath = join(process.cwd(), "public", "sources", "Movie", `${id}.json`);
        const movieFileContent = await readFile(movieFilePath, "utf-8");
        const movieData = JSON.parse(movieFileContent);
        
        // Convert parts to seasons format
        const converted = convertPartsToSeasons(movieData);
        if (converted) {
          data = converted;
          isConverted = true;
        } else {
          throw new Error("Unable to convert movie format");
        }
      } catch (movieError) {
        throw tvError; // Throw original error if both fail
      }
    }
    
    // Nếu có season và episode, trả về nguồn cụ thể cho tập đó
    if (season && episode && data.seasons?.[season]?.[episode]) {
      return NextResponse.json(
        { 
          success: true, 
          data: {
            tmdbId: data.tmdbId,
            title: data.title,
            season: parseInt(season),
            episode: parseInt(episode),
            sources: data.seasons[season][episode].sources,
            isConverted
          }
        },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800', // Cache 1 ngày, stale 2 ngày
          }
        }
      );
    }
    
    // Nếu không có season/episode, trả về toàn bộ dữ liệu
    return NextResponse.json(
      { success: true, data, isConverted },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800', // Cache 1 ngày, stale 2 ngày
        }
      }
    );
  } catch (error) {
    // File không tồn tại hoặc lỗi đọc file
    return NextResponse.json(
      { success: false, message: "Nguồn không có sẵn" },
      { status: 404 }
    );
  }
}
