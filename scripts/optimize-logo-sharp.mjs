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
    console.log(`🎞️  Pages (frames): ${metadata.pages || 1}\n`);
    
    // Phương án 1: Chuyển sang WebP với animation (giảm nhiều nhất)
    console.log('🔄 Đang tạo WebP animation...');
    const webpPath = path.join(__dirname, '../public/logo.webp');
    await sharp(inputPath, { animated: true })
      .webp({ 
        quality: 80,
        effort: 6
      })
      .toFile(webpPath);
    
    const webpSize = fs.statSync(webpPath).size;
    const webpReduction = ((1 - webpSize / originalSize) * 100).toFixed(2);
    console.log(`✅ logo.webp:`);
    console.log(`   Kích thước: ${(webpSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Giảm: ${webpReduction}%\n`);
    
    // Phương án 2: Giảm kích thước xuống 50% rồi chuyển WebP
    console.log('🔄 Đang tạo WebP nhỏ hơn (resize 70%)...');
    const webpSmallPath = path.join(__dirname, '../public/logo-small.webp');
    await sharp(inputPath, { animated: true })
      .resize(Math.round(metadata.width * 0.7), Math.round(metadata.height * 0.7))
      .webp({ 
        quality: 80,
        effort: 6
      })
      .toFile(webpSmallPath);
    
    const webpSmallSize = fs.statSync(webpSmallPath).size;
    const webpSmallReduction = ((1 - webpSmallSize / originalSize) * 100).toFixed(2);
    console.log(`✅ logo-small.webp:`);
    console.log(`   Kích thước: ${(webpSmallSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Giảm: ${webpSmallReduction}%\n`);
    
    // Phương án 3: GIF với kích thước nhỏ hơn
    console.log('🔄 Đang tạo GIF nhỏ hơn (resize 70%)...');
    const gifSmallPath = path.join(__dirname, '../public/logo-small.gif');
    await sharp(inputPath, { animated: true })
      .resize(Math.round(metadata.width * 0.7), Math.round(metadata.height * 0.7))
      .gif()
      .toFile(gifSmallPath);
    
    const gifSmallSize = fs.statSync(gifSmallPath).size;
    const gifSmallReduction = ((1 - gifSmallSize / originalSize) * 100).toFixed(2);
    console.log(`✅ logo-small.gif:`);
    console.log(`   Kích thước: ${(gifSmallSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Giảm: ${gifSmallReduction}%\n`);
    
    console.log('✨ Hoàn tất!');
    console.log('\n📋 Khuyến nghị:');
    console.log('   1. Sử dụng logo.webp với fallback về logo.gif');
    console.log('   2. Hoặc sử dụng logo-small.webp nếu muốn nhỏ gọn hơn');
    console.log('   3. File gốc được backup tại: logo-original.gif');
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  }
}

optimizeLogo();
