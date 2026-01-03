import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'src/app/admin/gesture-config.json');

// GET: Read current config
export async function GET() {
  try {
    const content = await fs.readFile(CONFIG_PATH, 'utf-8');
    const config = JSON.parse(content);
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error reading gesture config:', error);
    return NextResponse.json(
      { error: 'Failed to read gesture config' },
      { status: 500 }
    );
  }
}

// POST: Update config
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (typeof body.enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid config: enabled must be a boolean' },
        { status: 400 }
      );
    }

    if (typeof body.confidenceThreshold !== 'number' || 
        body.confidenceThreshold < 0 || 
        body.confidenceThreshold > 1) {
      return NextResponse.json(
        { error: 'Invalid config: confidenceThreshold must be between 0 and 1' },
        { status: 400 }
      );
    }

    if (typeof body.gestureDelay !== 'number' || body.gestureDelay < 0) {
      return NextResponse.json(
        { error: 'Invalid config: gestureDelay must be a positive number' },
        { status: 400 }
      );
    }

    // Validate gestures
    if (!body.gestures || typeof body.gestures !== 'object') {
      return NextResponse.json(
        { error: 'Invalid config: gestures must be an object' },
        { status: 400 }
      );
    }

    // Write config
    await fs.writeFile(CONFIG_PATH, JSON.stringify(body, null, 2), 'utf-8');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Gesture config updated successfully' 
    });
  } catch (error) {
    console.error('Error updating gesture config:', error);
    return NextResponse.json(
      { error: 'Failed to update gesture config' },
      { status: 500 }
    );
  }
}
