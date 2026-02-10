import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { writeFile, readFile } from 'fs/promises';
import path from 'path';

interface TiviChannel {
  id?: number;
  channel_id: string;
  name: string;
  logo: string;
  url: string;
  type: string;
  category: string;
  country: string;
  quality: string;
}

// GET all TV channels from ChuongTrinhTV table
export async function GET() {
  try {
    const supabase = await createClient();
    
    // For now, return empty array since ChuongTrinhTV is for TV series, not channels
    // TODO: Create proper TV channels management or use existing structure
    return NextResponse.json([]);

  } catch (error: any) {
    console.error(' [TIVI-GET] Unexpected error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST new TV channel -暂时保留JSON方式直到确定需求
export async function POST(request: NextRequest) {
  try {
    const { channels } = await request.json();
    
    if (!Array.isArray(channels)) {
      return NextResponse.json(
        { error: 'Invalid channels data' },
        { status: 400 }
      );
    }

    // TODO: Determine if we need to store TV channels in Supabase
    // For now, keep existing JSON file approach
    const filePath = path.join(process.cwd(), 'src/app/admin/tivi/tivi.json');
    const jsonContent = JSON.stringify(channels, null, 2);
    
    await writeFile(filePath, jsonContent, 'utf-8');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Channels saved successfully',
      count: channels.length 
    });
  } catch (error) {
    console.error('Error saving channels:', error);
    return NextResponse.json(
      { error: 'Failed to save channels' },
      { status: 500 }
    );
  }
}
