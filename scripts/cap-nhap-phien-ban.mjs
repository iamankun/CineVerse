import fs from 'fs/promises'; // Sử dụng fs/promises cho chuẩn bất đồng bộ
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

// Khối Logo CineVerse mới
const logoCineVerse = `
 ██████╗ ██╗███╗   ██╗███████╗██╗   ██╗███████╗██████╗ ███████╗███████╗
██╔════╝ ██║████╗  ██║██╔════╝██║   ██║██╔════╝██╔══██╗██╔════╝██╔════╝
██║      ██║██╔██╗ ██║█████╗  ██║   ██║█████╗  ██████╔╝███████╗█████╗  
██║      ██║██║╚██╗██║██╔══╝  ╚██╗ ██╔╝██╔══╝  ██╔══██╗╚════██║██╔══╝  
╚██████╗ ██║██║ ╚████║███████╗ ╚████╔╝ ███████╗██║  ██║███████║███████╗
 ╚═════╝ ╚═╝╚═╝  ╚═══╝╚══════╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝
`;

// Sử dụng hàm async để chạy luồng chính
async function initializeCineVerse() {
    // 1. Hiển thị Logo & Chào mừng
    console.log(`${colors.cyan}${colors.bright}${logoCineVerse}${colors.reset}`);
    console.log(`${colors.cyan}🚀 Chào nhà phát triển CineVerse! Hệ thống đang khởi tạo...${colors.reset}\n`);

    try {
        // Đọc package.json để lấy phiên bản (Dùng await bất đồng bộ)
        const packageJsonPath = path.join(__dirname, '..', 'package.json');
        const packageJsonData = await fs.readFile(packageJsonPath, 'utf-8');
        const packageJson = JSON.parse(packageJsonData);
        const version = packageJson.version;

        // Đọc manifest.json
        const manifestPath = path.join(__dirname, '..', 'public', 'manifest.json');
        const manifestData = await fs.readFile(manifestPath, 'utf-8');
        const manifest = JSON.parse(manifestData);

        // Loading
        console.log(`${colors.yellow}⏳ Đang đồng bộ hóa phiên bản và biểu tượng...${colors.reset}`);
        
        // Cập nhật phiên bản và xóa bộ nhớ đêm biểu tượng
        manifest.version = version;
        let iconCount = 0;

        if (manifest.icons && Array.isArray(manifest.icons)) {
            iconCount = manifest.icons.length;
            manifest.icons = manifest.icons.map((icon) => {
                const baseSrc = icon.src.split('?')[0]; // Tách bỏ ?v= cũ nếu có
                return {
                    ...icon,
                    src: `${baseSrc}?v=${version}`,
                };
            });
        }

        // Ghi lại tệp manifest mới
        await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

        // 2. Thông báo hoàn tất rực rỡ
        console.log(`\n${colors.green}---------------------------------------------------`);
        console.log(`✅  CineVerse - Vũ Trụ Điện Ảnh đang hoàn tất cài đặt!`);
        console.log(`✨  Phiên bản: ${colors.bright}${version}${colors.reset}${colors.green}`);
        console.log(`🖼️   Đã tối ưu: ${iconCount} biểu tượng hệ thống`);
        console.log(`---------------------------------------------------${colors.reset}`);
        
        console.log(`\n${colors.magenta}📩 Message: "CineVerse - Vũ Trụ Điện Ảnh"${colors.reset}`);
        console.log(`${colors.cyan}👉 Sản phẩm được phát triển bởi An Kun Studio.${colors.reset}\n`);

    } catch (error) {
        // Báo lỗi bằng màu đỏ và DỪNG tiến trình build để tránh lỗi phát sinh
        console.error(`${colors.red}❌ Lỗi cài đặt: ${error.message}${colors.reset}`);
        process.exit(1); 
    }
}

// Kích hoạt hàm
initializeCineVerse();