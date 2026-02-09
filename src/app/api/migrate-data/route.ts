import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from 'path';

interface MovieData {
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
    audioVersion: string;
    lastUpdate: string;
    genre: string[];
    duration: number;
    status: string;
    note: string;
  };
}

interface TVSeriesData {
  tmdbId: number;
  title: string;
  year: number;
  seasons: Record<string, Record<string, {
    title: string;
    sources: Array<{
      provider: string;
      title: string;
      url: string;
      language: string;
      subtitles: string[];
    }>;
  }>>;
  metadata: {
    "movie-rating": string;
    audioVersion: string;
    lastUpdate: string;
    genre: string[];
    duration: number;
    status: string;
    note: string;
    studio?: string;
    totalEpisodes: number;
    totalSeasons: number;
  };
}

export async function POST() {
  try {
    const supabase = await createClient();
    
    console.log("🔥 [MIGRATION] Starting data migration...");

    // Step 1: Read and process Movie files
    console.log("🔥 [MIGRATION] Processing Movie files...");
    const movieDir = join(process.cwd(), 'public', 'sources', 'Movie');
    const movieFiles = await import('fs').then(fs => fs.readdirSync(movieDir).filter(f => f.endsWith('.json')));
    
    let movieSuccessCount = 0;
    let movieErrorCount = 0;

    for (const file of movieFiles) {
      try {
        const filePath = join(movieDir, file);
        const fileContent = await readFile(filePath, 'utf-8');
        const movieData: MovieData = JSON.parse(fileContent);

        // Insert into DienAnh table
        const { error } = await supabase
          .from('DienAnh')
          .upsert({
            tmdb_id: movieData.tmdbId,
            title: movieData.title,
            year: movieData.year,
            sources: movieData.sources,
            metadata: movieData.metadata
          }, {
            onConflict: 'tmdb_id'
          });

        if (error) {
          console.error(`❌ [MIGRATION] Movie ${file} error:`, error);
          movieErrorCount++;
        } else {
          movieSuccessCount++;
          console.log(`✅ [MIGRATION] Movie ${file} migrated successfully`);
        }
      } catch (error) {
        console.error(`❌ [MIGRATION] Movie ${file} parse error:`, error);
        movieErrorCount++;
      }
    }

    // Step 2: Read and process TV Series files
    console.log("🔥 [MIGRATION] Processing TV Series files...");
    const tvDir = join(process.cwd(), 'public', 'sources', 'ChuongTrinhTV');
    const tvFiles = await import('fs').then(fs => fs.readdirSync(tvDir).filter(f => f.endsWith('.json')));
    
    let tvSuccessCount = 0;
    let tvErrorCount = 0;

    for (const file of tvFiles) {
      try {
        const filePath = join(tvDir, file);
        const fileContent = await readFile(filePath, 'utf-8');
        const tvData: TVSeriesData = JSON.parse(fileContent);

        // Insert into ChuongTrinhTV table
        const { error } = await supabase
          .from('ChuongTrinhTV')
          .upsert({
            tmdb_id: tvData.tmdbId,
            title: tvData.title,
            year: tvData.year,
            seasons: tvData.seasons,
            metadata: tvData.metadata
          }, {
            onConflict: 'tmdb_id'
          });

        if (error) {
          console.error(`❌ [MIGRATION] TV Series ${file} error:`, error);
          tvErrorCount++;
        } else {
          tvSuccessCount++;
          console.log(`✅ [MIGRATION] TV Series ${file} migrated successfully`);
        }
      } catch (error) {
        console.error(`❌ [MIGRATION] TV Series ${file} parse error:`, error);
        tvErrorCount++;
      }
    }

    // Step 3: Verify migration results
    console.log("🔥 [MIGRATION] Verifying migration results...");
    
    const { count: movieCount, error: movieCountError } = await supabase
      .from('DienAnh')
      .select('*', { count: 'exact', head: true });
    
    const { count: tvCount, error: tvCountError } = await supabase
      .from('ChuongTrinhTV')
      .select('*', { count: 'exact', head: true });

    const results = {
      migration: {
        movies: {
          total: movieFiles.length,
          success: movieSuccessCount,
          errors: movieErrorCount
        },
        tvSeries: {
          total: tvFiles.length,
          success: tvSuccessCount,
          errors: tvErrorCount
        }
      },
      database: {
        dienAnhCount: movieCount || 0,
        chuongTrinhTVCount: tvCount || 0
      },
      errors: {
        movieCountError: movieCountError?.message,
        tvCountError: tvCountError?.message
      }
    };

    console.log("✅ [MIGRATION] Migration completed:", results);

    return NextResponse.json({
      message: "Data migration completed successfully",
      results
    });

  } catch (error: any) {
    console.error("❌ [MIGRATION] Migration error:", error);
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
