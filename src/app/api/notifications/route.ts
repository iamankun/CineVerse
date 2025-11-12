import { NextResponse } from "next/server";
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

    // Filter active notifications only and sort by priority
    const activeNotifications = notifications
      .filter(n => n.active)
      .sort((a, b) => {
        // Sort by priority: high > medium > low
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

    return NextResponse.json({ notifications: activeNotifications });
  } catch (error) {
    console.error("Error reading notifications:", error);
    return NextResponse.json({ notifications: [] });
  }
}
