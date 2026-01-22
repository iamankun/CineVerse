import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import path from 'path';

interface TiviChannel {
  id: string;
  name: string;
  logo: string;
  url: string;
  type: string;
  category: string;
  country: string;
  quality: string;
}

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'src/app/admin/tivi/tivi.json');
    const fileContent = await readFile(filePath, 'utf-8');
    const channels = JSON.parse(fileContent);
    
    return NextResponse.json(channels);
  } catch (error) {
    console.error('Error reading tivi.json:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { channels } = await request.json();
    
    if (!Array.isArray(channels)) {
      return NextResponse.json(
        { error: 'Invalid channels data' },
        { status: 400 }
      );
    }

    const filePath = path.join(process.cwd(), 'src/app/admin/tivi/tivi.json');
    const jsonContent = JSON.stringify(channels, null, 2);
    
    await writeFile(filePath, jsonContent, 'utf-8');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Channels saved successfully',
      count: channels.length 
    });
  } catch (error) {
    console.error('Error saving tivi.json:', error);
    return NextResponse.json(
      { error: 'Failed to save channels' },
      { status: 500 }
    );
  }
}
