import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'src/app/admin/chuyendong.json');

// GET: Read current config
export async function GET() {
  try {
    const configData = await fs.readFile(CONFIG_PATH, 'utf-8');
    const config = JSON.parse(configData);
    
    return NextResponse.json({
      success: true,
      data: {
        movie: config,
        tv: config, // Same config for both
      },
    });
  } catch (error) {
    console.error('Lỗi đọc tệp cấu hình:', error);
    return NextResponse.json(
      { success: false, message: 'Không thể đọc tệp cấu hình' },
      { status: 500 }
    );
  }
}

// POST: Update config
export async function POST(request: NextRequest) {
  try {
    const { config } = await request.json();
    
    if (!config) {
      return NextResponse.json(
        { success: false, message: 'Thiếu cấu hình' },
        { status: 400 }
      );
    }

    const formattedConfig = JSON.stringify(config, null, 2);
    
    await fs.writeFile(CONFIG_PATH, formattedConfig, 'utf-8');
    
    return NextResponse.json({
      success: true,
      message: 'Cập nhật cấu hình thành công',
    });
  } catch (error) {
    console.error('Lỗi cập nhật cấu hình:', error);
    return NextResponse.json(
      { success: false, message: 'Không thể cập nhật tệp cấu hình' },
      { status: 500 }
    );
  }
}
