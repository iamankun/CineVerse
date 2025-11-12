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
    const body = await request.json();
    console.log('📥 Received body:', body);
    
    const { config } = body;
    
    if (!config) {
      console.error('❌ Missing config in request body');
      return NextResponse.json(
        { success: false, message: 'Thiếu cấu hình' },
        { status: 400 }
      );
    }

    console.log('📝 Config to save:', config);
    console.log('📂 Config path:', CONFIG_PATH);

    // Check if file exists and is writable
    try {
      await fs.access(CONFIG_PATH, fs.constants.W_OK);
      console.log('✅ File is writable');
    } catch (accessError) {
      console.error('❌ File is not writable:', accessError);
      return NextResponse.json(
        { success: false, message: 'Không có quyền ghi file cấu hình' },
        { status: 500 }
      );
    }

    const formattedConfig = JSON.stringify(config, null, 2);
    console.log('📄 Formatted config:', formattedConfig);
    
    await fs.writeFile(CONFIG_PATH, formattedConfig, 'utf-8');
    console.log('✅ File written successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Cập nhật cấu hình thành công',
    });
  } catch (error) {
    console.error('❌ Lỗi cập nhật cấu hình:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, message: `Không thể lưu cấu hình: ${errorMessage}` },
      { status: 500 }
    );
  }
}
