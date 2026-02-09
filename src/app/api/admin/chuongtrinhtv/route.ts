import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// GET all TV series
export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: tvSeries, error } = await supabase
      .from('ChuongTrinhTV')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("❌ [CHUONGTRINHTV-GET] Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tvSeries });

  } catch (error: any) {
    console.error("❌ [CHUONGTRINHTV-GET] Unexpected error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST new TV series
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { tmdb_id, title, year, seasons, metadata } = body;

    if (!tmdb_id || !title || !year) {
      return NextResponse.json({ 
        error: "Missing required fields: tmdb_id, title, year" 
      }, { status: 400 });
    }

    const { data: tvSeries, error } = await supabase
      .from('ChuongTrinhTV')
      .upsert({
        tmdb_id,
        title,
        year,
        seasons: seasons || {},
        metadata: metadata || {}
      })
      .select()
      .single();

    if (error) {
      console.error("❌ [CHUONGTRINHTV-POST] Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tvSeries });

  } catch (error: any) {
    console.error("❌ [CHUONGTRINHTV-POST] Unexpected error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT update TV series
export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { id, tmdb_id, title, year, seasons, metadata } = body;

    if (!id) {
      return NextResponse.json({ 
        error: "Missing required field: id" 
      }, { status: 400 });
    }

    const { data: tvSeries, error } = await supabase
      .from('ChuongTrinhTV')
      .update({
        tmdb_id,
        title,
        year,
        seasons,
        metadata,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("❌ [CHUONGTRINHTV-PUT] Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tvSeries });

  } catch (error: any) {
    console.error("❌ [CHUONGTRINHTV-PUT] Unexpected error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE TV series
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ 
        error: "Missing required query parameter: id" 
      }, { status: 400 });
    }

    const { error } = await supabase
      .from('ChuongTrinhTV')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("❌ [CHUONGTRINHTV-DELETE] Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "TV series deleted successfully" });

  } catch (error: any) {
    console.error("❌ [CHUONGTRINHTV-DELETE] Unexpected error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
