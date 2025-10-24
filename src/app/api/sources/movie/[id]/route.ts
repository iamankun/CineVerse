import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const filePath = join(process.cwd(), "public", "sources", "Movie", `${id}.json`);
    
    const fileContent = await readFile(filePath, "utf-8");
    const data = JSON.parse(fileContent);
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    // File không tồn tại hoặc lỗi đọc file
    return NextResponse.json(
      { success: false, message: "Nguồn không có sẵn" },
      { status: 404 }
    );
  }
}
