import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const notificationsDir = path.join(process.cwd(), "src", "app", "admin", "notifications");
    
    // Check if directory exists
    try {
      await fs.access(notificationsDir);
    } catch {
      return NextResponse.json({ notifications: [] });
    }

    const files = await fs.readdir(notificationsDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    const notifications = await Promise.all(
      jsonFiles.map(async (file) => {
        const filePath = path.join(notificationsDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(content);
      })
    );

    // Sort by id
    notifications.sort((a, b) => a.id - b.id);

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Error reading notifications:", error);
    return NextResponse.json({ notifications: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const notificationsDir = path.join(process.cwd(), "src", "app", "admin", "notifications");

    // Ensure directory exists
    await fs.mkdir(notificationsDir, { recursive: true });

    // Get next ID robustly (không phụ thuộc file 1.json, luôn lấy max + 1)
    const files = await fs.readdir(notificationsDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    const ids = jsonFiles
      .map(file => parseInt(file.replace('.json', '')))
      .filter(id => Number.isInteger(id) && id > 0);
    const nextId = ids.length > 0 ? Math.max(...ids) + 1 : 1;
    console.log(`[Notification] Existing IDs:`, ids, '| Next ID:', nextId);

    const notification = {
      id: nextId,
      ...data,
      createdAt: new Date().toISOString(),
    };

    const filePath = path.join(notificationsDir, `${nextId}.json`);
    await fs.writeFile(filePath, JSON.stringify(notification, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      notification,
      filePath: `src/app/admin/notifications/${nextId}.json`,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create notification" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing notification ID" },
        { status: 400 }
      );
    }

    const notificationsDir = path.join(process.cwd(), "src", "app", "admin", "notifications");
    const filePath = path.join(notificationsDir, `${id}.json`);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json(
        { success: false, message: "Notification not found" },
        { status: 404 }
      );
    }

    // Delete the file
    await fs.unlink(filePath);

    return NextResponse.json({
      success: true,
      message: `Deleted notification ${id}`,
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete notification" },
      { status: 500 }
    );
  }
}
