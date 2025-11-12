import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { logoPath } = await request.json();

    if (!logoPath) {
      return NextResponse.json(
        { success: false, message: 'Không có đường dẫn logo' },
        { status: 400 }
      );
    }

    // Only delete if it's a custom uploaded logo
    if (!logoPath.startsWith('/uploads/logos/')) {
      return NextResponse.json({
        success: true,
        message: 'Logo mặc định, không cần xóa file',
      });
    }

    try {
      const filepath = path.join(process.cwd(), 'public', logoPath);
      await fs.unlink(filepath);
      console.log('✅ Deleted logo:', filepath);
      
      return NextResponse.json({
        success: true,
        message: 'Xóa logo thành công',
      });
    } catch (error: any) {
      // If file doesn't exist, that's fine
      if (error.code === 'ENOENT') {
        console.log('⚠️ Logo file already deleted or not found');
        return NextResponse.json({
          success: true,
          message: 'Logo đã được xóa trước đó',
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('❌ Lỗi khi xóa logo:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi xóa logo' },
      { status: 500 }
    );
  }
}
