import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export const dynamic = 'force-dynamic';

interface MovieSource {
  tmdbId: number;
  title: string;
  year: number;
  sources: Array<{
    provider: string;
    title: string;
    url: string;
    language: string;
    subtitles: string[];
  }>;
  metadata: {
    "movie-rating": string;
    genre: string[];
    duration: number;
    status: string;
    note?: string;
  };
  lastUpdated: string;
}

interface TVSource {
  tmdbId: number;
  title: string;
  year: number;
  seasons: {
    [seasonNumber: string]: {
      [episodeNumber: string]: {
        title: string;
        sources: Array<{
          provider: string;
          title: string;
          url: string;
          language: string;
          subtitles: string[];
        }>;
      };
    };
  };
  metadata: {
    "movie-rating": string;
    studio?: string;
    genre: string[];
    totalEpisodes: number;
    totalSeasons: number;
    status: string;
    note?: string;
  };
  lastUpdated: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body as { type: "movie" | "tv", data: MovieSource | TVSource };

    if (!type || !data) {
      return NextResponse.json(
        { success: false, message: "Missing type or data" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!data.tmdbId || !data.title) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: tmdbId, title" },
        { status: 400 }
      );
    }

    // Determine folder and filename
    const folder = type === "movie" ? "Movie" : "ChuongTrinhTV";
    const dirPath = join(process.cwd(), "public", "sources", folder);
    const filePath = join(dirPath, `${data.tmdbId}.json`);

    // Check if file already exists
    if (existsSync(filePath)) {
      return NextResponse.json(
        { success: false, message: `File ${data.tmdbId}.json already exists` },
        { status: 409 }
      );
    }

    // Create directory if it doesn't exist
    if (!existsSync(dirPath)) {
      await mkdir(dirPath, { recursive: true });
    }

    // Add lastUpdated timestamp
    const dataWithTimestamp = {
      ...data,
      lastUpdated: new Date().toISOString(),
    };

    // Write file with pretty formatting
    await writeFile(
      filePath,
      JSON.stringify(dataWithTimestamp, null, 2),
      "utf-8"
    );

    return NextResponse.json({
      success: true,
      message: `File created successfully: ${folder}/${data.tmdbId}.json`,
      filePath: `public/sources/${folder}/${data.tmdbId}.json`,
    });

  } catch (error) {
    console.error("Error creating source file:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create source file",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
