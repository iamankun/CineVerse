import { NextResponse } from "next/server";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: 'high' | 'medium' | 'low';
  active: boolean;
  createdAt: string;
}

export async function GET() {
  try {
    const { promises: fs } = await import("fs");
    const path = await import("path");

    const possibleDirs = [
      path.join(process.cwd(), "public", "notifications"),
      path.join(process.cwd(), "src", "app", "admin", "notifications"),
    ];

    for (const dir of possibleDirs) {
      try {
        await fs.access(dir);
        const files = await fs.readdir(dir);
        const jsonFiles = files.filter((f: string) => f.endsWith('.json'));

        const allNotifications: Notification[] = await Promise.all(
          jsonFiles.map(async (file: string) => {
            const content = await fs.readFile(path.join(dir, file), 'utf-8');
            return JSON.parse(content);
          })
        );

        const activeNotifications = allNotifications
          .filter((n: Notification) => n.active)
          .sort((a: Notification, b: Notification) => {
            const order: Record<string, number> = { high: 3, medium: 2, low: 1 };
            return (order[b.priority] || 0) - (order[a.priority] || 0);
          });

        return NextResponse.json({ notifications: activeNotifications });
      } catch {
        continue;
      }
    }

    return NextResponse.json({ notifications: [] });
  } catch {
    return NextResponse.json({ notifications: [] });
  }
}
