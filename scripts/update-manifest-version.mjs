import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Cấu hình màu sắc cho Console ---
const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    cyan: "\x1b[36m",
    magenta: "\x1b[35m"
};

// 1. Hiển thị Logo & Chào mừng
console.log(`${colors.red}${colors.bright}
|   _____ _         __        __                
|  / ____(_)        \ \      / /                 
| | |     _ _ __   __\ \    / /__ _ ___ ___  ___    
| | |    | | '_ \ / _ \ \  / / _ \ | __/ __|/ _ \   
| | |____| | | | |  __/\ \/ /  __/  |  \__ \  __/   
|  /_____|_|_| |_|\___| \__/ \___|__|  |___/\___|    ,
${colors.reset}`);
console.log(`${colors.cyan}🚀 Chào nhà phát triển CineVerse! Hệ thống đang khởi tạo...${colors.reset}\n`);

try {
    // Read package.json to get version
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const version = packageJson.version;

    // Read manifest.json
    const manifestPath = path.join(__dirname, '..', 'public', 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

    // Giả lập thanh Loading cho chuyên nghiệp
    console.log(`${colors.yellow}⏳ Đang đồng bộ hóa phiên bản và biểu tượng...${colors.reset}`);
    
    // Logic xử lý chính
    manifest.version = version;
    if (manifest.icons && Array.isArray(manifest.icons)) {
        manifest.icons = manifest.icons.map((icon) => {
            const baseSrc = icon.src.split('?')[0];
            return {
                ...icon,
                src: `${baseSrc}?v=${version}`,
            };
        });
    }

    // Write updated manifest
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    // 2. Thông báo hoàn tất rực rỡ
    console.log(`\n${colors.green}---------------------------------------------------`);
    console.log(`✅  CineVerse - Vũ Trụ Điện Ảnh đang hoàn tất cài đặt!`);
    console.log(`✨  Phiên bản: ${colors.bright}${version}${colors.reset}${colors.green}`);
    console.log(`🖼️   Đang tối ưu: ${manifest.icons.length} biểu tượng hệ thống`);
    console.log(`---------------------------------------------------${colors.reset}`);
    
    console.log(`\n${colors.magenta}📩 Message: "CineVerse - Vũ Trụ Điện Ảnh"${colors.reset}`);
    console.log(`${colors.cyan}👉 Sản phẩm được phát triển bởi An Kun Studio.${colors.reset}\n`);

} catch (error) {
    console.error(`${colors.red}❌ Lỗi cài đặt: ${error.message}${colors.reset}`);
}