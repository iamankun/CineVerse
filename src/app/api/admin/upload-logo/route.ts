import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('logo') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'Không có file được tải lên' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, message: 'File phải là ảnh (PNG, JPG, SVG, etc.)' },
        { status: 400 }
      );
    }

    // Create uploads directory if not exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'logos');
    await fs.mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const ext = path.extname(file.name);
    const filename = `brand-logo-${timestamp}${ext}`;
    const filepath = path.join(uploadsDir, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.writeFile(filepath, buffer);

    // Return public path
    const publicPath = `/uploads/logos/${filename}`;

    return NextResponse.json({
      success: true,
      path: publicPath,
      message: 'Upload logo thành công',
    });
  } catch (error) {
    console.error('Lỗi khi upload logo:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi upload logo' },
      { status: 500 }
    );
  }
}
