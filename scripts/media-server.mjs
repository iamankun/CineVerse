import NodeMediaServer from "node-media-server";
import { fileURLToPath } from "url";
import path from "path";
import os from "os";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getIP() {
  const host = process.env.MEDIA_SERVER_HOST;
  if (host) return host.replace(/^https?:\/\//, "");
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] ?? []) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "127.0.0.1";
}

const ip = getIP();

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60,
  },
  http: {
    port: 8000,
    allow_origin: "*",
  },
};

const nms = new NodeMediaServer(config);
nms.run();

console.log("");
console.log("  Máy chủ phương tiện đã khởi động");
console.log("  ─────────────────────────");
console.log(`  >> RTMP:   rtmp://${ip}:1935/live  (OBS -> Server)`);
console.log(`  >> RTMP:   rtmp://localhost:1935/live`);
console.log(`  >> FLV:    http://${ip}:8000/live/{streamKey}.flv  (trình duyệt)`);
console.log(`  >> FLV:    http://localhost:8000/live/{streamKey}.flv`);
console.log("");
console.log("  Hướng dẫn OBS Studio:");
console.log(`  Server:    rtmp://${ip}:1935/live`);
console.log("  Stream Key: (lấy từ trang broadcaster)");
console.log("");

process.on("SIGINT", () => {
  console.log("\n  Đang tắt máy chủ phương tiện...");
  nms.stop();
  process.exit(0);
});
