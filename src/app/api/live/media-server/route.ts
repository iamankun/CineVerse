import { NextResponse } from "next/server";
import { exec, spawn } from "child_process";
import { platform } from "os";
import path from "path";
import net from "net";

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

export async function GET() {
  const rtmp = await checkPort(1935);
  const http = await checkPort(8000);
  return NextResponse.json({ running: running || rtmp || http });
}

export async function POST() {
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
