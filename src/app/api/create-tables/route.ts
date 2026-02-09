import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabase = await createClient();
    
    console.log("🔥 [CREATE-TABLES] Creating database tables...");

    // Create DienAnh table using direct SQL
    const createDienAnhSQL = `
      CREATE TABLE IF NOT EXISTS public."DienAnh" (
        id SERIAL PRIMARY KEY,
        tmdb_id INTEGER NOT NULL UNIQUE,
        title VARCHAR(500) NOT NULL,
        year INTEGER NOT NULL,
        sources JSONB NOT NULL DEFAULT '[]'::jsonb,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    const createDienAnhIndexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_dienanh_tmdb_id ON public."DienAnh"(tmdb_id);
      CREATE INDEX IF NOT EXISTS idx_dienanh_title ON public."DienAnh"(title);
      CREATE INDEX IF NOT EXISTS idx_dienanh_year ON public."DienAnh"(year);
    `;

    // Create ChuongTrinhTV table using direct SQL
    const createChuongTrinhTVSQL = `
      CREATE TABLE IF NOT EXISTS public."ChuongTrinhTV" (
        id SERIAL PRIMARY KEY,
        tmdb_id INTEGER NOT NULL UNIQUE,
        title VARCHAR(500) NOT NULL,
        year INTEGER NOT NULL,
        seasons JSONB NOT NULL DEFAULT '{}'::jsonb,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    const createChuongTrinhTVIndexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_chuongtrinhtv_tmdb_id ON public."ChuongTrinhTV"(tmdb_id);
      CREATE INDEX IF NOT EXISTS idx_chuongtrinhtv_title ON public."ChuongTrinhTV"(title);
      CREATE INDEX IF NOT EXISTS idx_chuongtrinhtv_year ON public."ChuongTrinhTV"(year);
    `;

    // Execute table creation using direct SQL
    try {
      await supabase.rpc('exec_sql', { sql: createDienAnhSQL });
      console.log("✅ [CREATE-TABLES] DienAnh table created");
    } catch (error: any) {
      console.error("❌ [CREATE-TABLES] DienAnh table error:", error);
      // Try direct SQL execution
      const { error: directError } = await supabase.from('DienAnh').select('count');
      if (directError && !directError.message.includes('does not exist')) {
        return NextResponse.json({ error: "Failed to create DienAnh table", details: error.message }, { status: 500 });
      }
    }

    try {
      await supabase.rpc('exec_sql', { sql: createDienAnhIndexesSQL });
      console.log("✅ [CREATE-TABLES] DienAnh indexes created");
    } catch (error: any) {
      console.error("❌ [CREATE-TABLES] DienAnh indexes error:", error);
    }

    try {
      await supabase.rpc('exec_sql', { sql: createChuongTrinhTVSQL });
      console.log("✅ [CREATE-TABLES] ChuongTrinhTV table created");
    } catch (error: any) {
      console.error("❌ [CREATE-TABLES] ChuongTrinhTV table error:", error);
      // Try direct SQL execution
      const { error: directError } = await supabase.from('ChuongTrinhTV').select('count');
      if (directError && !directError.message.includes('does not exist')) {
        return NextResponse.json({ error: "Failed to create ChuongTrinhTV table", details: error.message }, { status: 500 });
      }
    }

    try {
      await supabase.rpc('exec_sql', { sql: createChuongTrinhTVIndexesSQL });
      console.log("✅ [CREATE-TABLES] ChuongTrinhTV indexes created");
    } catch (error: any) {
      console.error("❌ [CREATE-TABLES] ChuongTrinhTV indexes error:", error);
    }

    // Verify tables exist
    const { data: dienAnhCheck, error: dienAnhCheckError } = await supabase
      .from('DienAnh')
      .select('count')
      .limit(1);
    
    const { data: chuongTrinhTVCheck, error: chuongTrinhTVCheckError } = await supabase
      .from('ChuongTrinhTV')
      .select('count')
      .limit(1);

    console.log("✅ [CREATE-TABLES] Tables created successfully");

    return NextResponse.json({
      message: "Database tables created successfully",
      tables: {
        DienAnh: !dienAnhCheckError,
        ChuongTrinhTV: !chuongTrinhTVCheckError
      },
      nextStep: "Ready for data migration"
    });

  } catch (error: any) {
    console.error("❌ [CREATE-TABLES] Error:", error);
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
