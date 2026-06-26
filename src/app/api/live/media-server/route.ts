import { NextResponse } from "next/server";
import { exec, spawn } from "child_process";
import { platform } from "os";
import path from "path";
import net from "net";

const MS_HOST = process.env.MEDIA_SERVER_HOST;
const isRemote = !!MS_HOST;

let childPid: number | null = null;
let running = false;

function checkPort(port: number): Promise<boolean> {
  return new Promise((ok) => {
    const s = new net.Socket();
    s.setTimeout(2000);
    s.on("connect", () => { s.destroy(); ok(true); });
    s.on("error", () => { s.destroy(); ok(false); });
    s.on("timeout", () => { s.destroy(); ok(false); });
    s.connect(port, "127.0.0.1");
  });
}

async function checkRemote(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`http://${MS_HOST}:8000/live/health.flv`, {
      method: "HEAD",
      signal: controller.signal,
    });
    clearTimeout(timer);
    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  if (isRemote) {
    const ok = await checkRemote();
    return NextResponse.json({ running: ok, remote: true });
  }
  if (process.env.VERCEL) {
    return NextResponse.json(
      { running: false, message: "Thiếu biến môi trường MEDIA_SERVER_HOST" },
      { status: 503 }
    );
  }
  const rtmp = await checkPort(1935);
  const http = await checkPort(8000);
  return NextResponse.json({ running: running || rtmp || http });
}

export async function POST() {
  if (isRemote) {
    return NextResponse.json(
      { running: false, message: "Media server chạy trên VPS, không thể điều khiển từ đây" },
      { status: 400 }
    );
  }
  if (process.env.VERCEL) {
    return NextResponse.json(
      { running: false, message: "Media server không khả dụng trên serverless" },
      { status: 503 }
    );
  }
  if (running) return NextResponse.json({ running: true });

  const already = await checkPort(1935);
  if (already) return NextResponse.json({ running: true });

  const scriptPath = path.join(process.cwd(), "scripts", "media-server.mjs");

  return new Promise<NextResponse>((resolve) => {
    const child = exec(`node ${scriptPath}`, (err, stdout, stderr) => {
      if (stdout) console.log("[MS]", stdout.trim());
      if (stderr) console.error("[MS]", stderr.trim());
      running = false;
      childPid = null;
    });

    childPid = child.pid || null;
    running = true;

    let tries = 0;
    const iv = setInterval(() => {
      tries++;
      checkPort(1935).then((up) => {
        if (up) {
          clearInterval(iv);
          resolve(NextResponse.json({ running: true, message: "Media server đã khởi động" }));
        } else if (tries >= 15) {
          clearInterval(iv);
          resolve(NextResponse.json({ running: false, message: "Không thể khởi động" }, { status: 500 }));
        }
      });
    }, 500);
  });
}

export async function DELETE() {
  if (isRemote) {
    return NextResponse.json(
      { running: false, message: "Media server chạy trên VPS, không thể điều khiển từ đây" },
      { status: 400 }
    );
  }
  if (!running && !childPid) {
    return NextResponse.json({ running: false, message: "Media server không chạy" });
  }

  if (childPid) {
    if (platform() === "win32") {
      spawn("taskkill", ["/pid", String(childPid), "/T", "/F"]);
    } else {
      try { process.kill(childPid, "SIGTERM"); } catch {}
    }
  }

  running = false;
  childPid = null;
  return NextResponse.json({ running: false, message: "Media server đã tắt" });
}
