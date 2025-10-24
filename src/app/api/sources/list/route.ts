import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const MAX_ITEMS = 20;

type FileInfo = {
  id: number;
  type: "movie" | "tv";
  mtime: Date;
};

export async function GET() {
  try {
    const sourcesPath = path.join(process.cwd(), "public", "sources");
    const allFiles: FileInfo[] = [];
    
    // Đọc thư mục Movie với thời gian modified
    const moviePath = path.join(sourcesPath, "Movie");
    try {
      const movieFiles = await fs.readdir(moviePath);
      for (const file of movieFiles) {
        if (file.endsWith('.json')) {
          const id = parseInt(file.replace('.json', ''));
          if (!isNaN(id)) {
            const filePath = path.join(moviePath, file);
            const stats = await fs.stat(filePath);
            allFiles.push({
              id,
              type: "movie",
              mtime: stats.mtime
            });
          }
        }
      }
    } catch (error) {
      console.error('Error reading Movie directory:', error);
    }
    
    // Đọc thư mục ChuongTrinhTV với thời gian modified
    const tvPath = path.join(sourcesPath, "ChuongTrinhTV");
    try {
      const tvFiles = await fs.readdir(tvPath);
      for (const file of tvFiles) {
        if (file.endsWith('.json')) {
          const id = parseInt(file.replace('.json', ''));
          if (!isNaN(id)) {
            const filePath = path.join(tvPath, file);
            const stats = await fs.stat(filePath);
            allFiles.push({
              id,
              type: "tv",
              mtime: stats.mtime
            });
          }
        }
      }
    } catch (error) {
      console.error('Error reading ChuongTrinhTV directory:', error);
    }
    
    // Sắp xếp theo thời gian mới nhất và giới hạn 20 items
    const sortedFiles = allFiles
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())
      .slice(0, MAX_ITEMS);
    
    // Tách thành movieIds và tvIds
    const movieIds = sortedFiles
      .filter(f => f.type === "movie")
      .map(f => f.id);
    
    const tvIds = sortedFiles
      .filter(f => f.type === "tv")
      .map(f => f.id);
    
    return NextResponse.json({
      movieIds,
      tvIds,
      total: sortedFiles.length
    });
  } catch (error) {
    console.error('Error listing sources:', error);
    return NextResponse.json(
      { error: 'Failed to list sources' },
      { status: 500 }
    );
  }
}
