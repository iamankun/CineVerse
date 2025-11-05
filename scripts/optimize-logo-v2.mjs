import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function optimizeLogo() {
  const inputPath = path.join(__dirname, '../public/logo.gif');
  const backupPath = path.join(__dirname, '../public/logo-original.gif');
  
  // Backup file gốc
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(inputPath, backupPath);
    console.log('✅ Đã backup file gốc: logo-original.gif');
  }
  
  const originalSize = fs.statSync(inputPath).size;
  console.log(`📊 Kích thước gốc: ${(originalSize / 1024 / 1024).toFixed(2)} MB\n`);
  
  try {
    // Đọc metadata của GIF
    const metadata = await sharp(inputPath, { animated: true }).metadata();
    console.log(`📐 Kích thước hiện tại: ${metadata.width}x${metadata.height}`);
    console.log(`🎞️  Frames: ${metadata.pages || 1}\n`);
    
    // Tính toán kích thước phù hợp cho logo (giữ nguyên width, tính lại height)
    // Logo thông thường nên có chiều cao ~40-100px
    const targetHeight = 100; // Chiều cao mục tiêu
    const targetWidth = Math.round((metadata.width / metadata.height) * targetHeight);
    
    console.log(`🎯 Kích thước mục tiêu: ${targetWidth}x${targetHeight}\n`);
    
    // Phương án 1: WebP với kích thước phù hợp
    console.log('🔄 Đang tạo logo-optimized.webp...');
    const webpPath = path.join(__dirname, '../public/logo-optimized.webp');
    await sharp(inputPath, { animated: true })
      .resize(targetWidth, targetHeight, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ 
        quality: 85,
        effort: 6
      })
      .toFile(webpPath);
    
    const webpSize = fs.statSync(webpPath).size;
    const webpReduction = ((1 - webpSize / originalSize) * 100).toFixed(2);
    console.log(`✅ logo-optimized.webp:`);
    console.log(`   Kích thước: ${(webpSize / 1024).toFixed(2)} KB`);
    console.log(`   Giảm: ${webpReduction}%\n`);
    
    // Phương án 2: GIF với kích thước phù hợp
    console.log('🔄 Đang tạo logo-optimized.gif...');
    const gifPath = path.join(__dirname, '../public/logo-optimized.gif');
    await sharp(inputPath, { animated: true })
      .resize(targetWidth, targetHeight, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .gif()
      .toFile(gifPath);
    
    const gifSize = fs.statSync(gifPath).size;
    const gifReduction = ((1 - gifSize / originalSize) * 100).toFixed(2);
    console.log(`✅ logo-optimized.gif:`);
    console.log(`   Kích thước: ${(gifSize / 1024).toFixed(2)} KB`);
    console.log(`   Giảm: ${gifReduction}%\n`);
    
    // Phương án 3: PNG tĩnh (first frame) cho fallback
    console.log('🔄 Đang tạo logo.png (static)...');
    const pngPath = path.join(__dirname, '../public/logo.png');
    await sharp(inputPath)
      .resize(targetWidth, targetHeight, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(pngPath);
    
    const pngSize = fs.statSync(pngPath).size;
    console.log(`✅ logo.png:`);
    console.log(`   Kích thước: ${(pngSize / 1024).toFixed(2)} KB\n`);
    
    console.log('✨ Hoàn tất!');
    console.log('\n📋 Các file đã tạo:');
    console.log(`   • logo-optimized.webp (${(webpSize / 1024).toFixed(2)} KB) - Khuyến nghị sử dụng`);
    console.log(`   • logo-optimized.gif (${(gifSize / 1024).toFixed(2)} KB) - Fallback`);
    console.log(`   • logo.png (${(pngSize / 1024).toFixed(2)} KB) - Static fallback`);
    console.log(`   • logo-original.gif (${(originalSize / 1024 / 1024).toFixed(2)} MB) - Backup`);
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    console.error(error);
  }
}

optimizeLogo();
