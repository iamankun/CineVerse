import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// GET all movies
export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: movies, error } = await supabase
      .from('DienAnh')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("❌ [DIENANH-GET] Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ movies });

  } catch (error: any) {
    console.error("❌ [DIENANH-GET] Unexpected error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST new movie
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { tmdb_id, title, year, sources, metadata } = body;

    if (!tmdb_id || !title || !year) {
      return NextResponse.json({ 
        error: "Missing required fields: tmdb_id, title, year" 
      }, { status: 400 });
    }

    const { data: movie, error } = await supabase
      .from('DienAnh')
      .upsert({
        tmdb_id,
        title,
        year,
        sources: sources || [],
        metadata: metadata || {}
      })
      .select()
      .single();

    if (error) {
      console.error("❌ [DIENANH-POST] Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ movie });

  } catch (error: any) {
    console.error("❌ [DIENANH-POST] Unexpected error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT update movie
export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { id, tmdb_id, title, year, sources, metadata } = body;

    if (!id) {
      return NextResponse.json({ 
        error: "Missing required field: id" 
      }, { status: 400 });
    }

    const { data: movie, error } = await supabase
      .from('DienAnh')
      .update({
        tmdb_id,
        title,
        year,
        sources,
        metadata,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("❌ [DIENANH-PUT] Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ movie });

  } catch (error: any) {
    console.error("❌ [DIENANH-PUT] Unexpected error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE movie
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
      .from('DienAnh')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("❌ [DIENANH-DELETE] Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Movie deleted successfully" });

  } catch (error: any) {
    console.error("❌ [DIENANH-DELETE] Unexpected error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
