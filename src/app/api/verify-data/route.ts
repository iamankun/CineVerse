import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    console.log("🔥 [VERIFY] Verifying data integrity...");

    // Check table existence and structure
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['DienAnh', 'ChuongTrinhTV']);

    // Get table counts
    const { count: movieCount, error: movieCountError } = await supabase
      .from('DienAnh')
      .select('*', { count: 'exact', head: true });
    
    const { count: tvCount, error: tvCountError } = await supabase
      .from('ChuongTrinhTV')
      .select('*', { count: 'exact', head: true });

    // Sample data verification
    const { data: movieSample, error: movieSampleError } = await supabase
      .from('DienAnh')
      .select('*')
      .limit(3);
    
    const { data: tvSample, error: tvSampleError } = await supabase
      .from('ChuongTrinhTV')
      .select('*')
      .limit(3);

    // Check JSON structure validity
    let movieJsonValid = true;
    let tvJsonValid = true;

    if (movieSample) {
      for (const movie of movieSample) {
        try {
          JSON.parse(JSON.stringify(movie.sources));
          JSON.parse(JSON.stringify(movie.metadata));
        } catch (e) {
          movieJsonValid = false;
          break;
        }
      }
    }

    if (tvSample) {
      for (const tv of tvSample) {
        try {
          JSON.parse(JSON.stringify(tv.seasons));
          JSON.parse(JSON.stringify(tv.metadata));
        } catch (e) {
          tvJsonValid = false;
          break;
        }
      }
    }

    const verification = {
      tables: {
        DienAnh: tables?.some(t => t.table_name === 'DienAnh') || false,
        ChuongTrinhTV: tables?.some(t => t.table_name === 'ChuongTrinhTV') || false
      },
      counts: {
        DienAnh: movieCount || 0,
        ChuongTrinhTV: tvCount || 0
      },
      samples: {
        movies: movieSample?.length || 0,
        tvSeries: tvSample?.length || 0
      },
      jsonValidation: {
        movies: movieJsonValid,
        tvSeries: tvJsonValid
      },
      errors: {
        tablesError: tablesError?.message,
        movieCountError: movieCountError?.message,
        tvCountError: tvCountError?.message,
        movieSampleError: movieSampleError?.message,
        tvSampleError: tvSampleError?.message
      }
    };

    console.log("✅ [VERIFY] Verification completed:", verification);

    return NextResponse.json({
      message: "Data verification completed",
      verification
    });

  } catch (error: any) {
    console.error("❌ [VERIFY] Verification error:", error);
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
