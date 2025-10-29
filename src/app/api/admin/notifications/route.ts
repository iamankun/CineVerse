import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const notificationsDir = path.join(process.cwd(), "public", "notifications");
    
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
    const notificationsDir = path.join(process.cwd(), "public", "notifications");

    // Ensure directory exists
    await fs.mkdir(notificationsDir, { recursive: true });

    // Get next ID
    const files = await fs.readdir(notificationsDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    const ids = jsonFiles.map(file => parseInt(file.replace('.json', ''))).filter(id => !isNaN(id));
    const nextId = ids.length > 0 ? Math.max(...ids) + 1 : 1;

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
      filePath: `public/notifications/${nextId}.json`,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create notification" },
      { status: 500 }
    );
  }
}
