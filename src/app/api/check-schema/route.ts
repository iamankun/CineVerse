import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Check actual schema of profiles table
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .limit(1);
    
    if (error) {
      return NextResponse.json({ 
        error: "Failed to query profiles", 
        details: error 
      }, { status: 500 });
    }
    
    // Get column information
    const { data: columns, error: columnError } = await supabase
      .rpc('get_table_columns', { table_name: 'profiles' });
    
    if (columnError) {
      // Fallback: try to describe table
      return NextResponse.json({ 
        message: "Sample profile data",
        sampleData: data,
        columns: data && data.length > 0 ? Object.keys(data[0]) : [],
        error: columnError?.message
      });
    }
    
    return NextResponse.json({ 
      message: "Profiles schema",
      columns: columns,
      sampleData: data,
      availableColumns: data && data.length > 0 ? Object.keys(data[0]) : []
    });
    
  } catch (error) {
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error 
    }, { status: 500 });
  }
}
