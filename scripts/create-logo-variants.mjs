import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createOptimizedLogos() {
  const inputPath = path.join(__dirname, '../public/logo.gif');
  const originalSize = fs.statSync(inputPath).size;
  
  console.log(`📊 Kích thước gốc logo.gif: ${(originalSize / 1024 / 1024).toFixed(2)} MB\n`);
  
  try {
    // Tạo các phiên bản với kích thước chuẩn cho logo
    const sizes = [
      { width: 160, height: 160, name: 'logo-160.webp', format: 'webp' },
      { width: 120, height: 120, name: 'logo-120.webp', format: 'webp' },
      { width: 80, height: 80, name: 'logo-80.webp', format: 'webp' },
      { width: 160, height: 160, name: 'logo-160.gif', format: 'gif' },
      { width: 120, height: 120, name: 'logo-120.gif', format: 'gif' },
      { width: 80, height: 80, name: 'logo-80.gif', format: 'gif' },
    ];
    
    for (const size of sizes) {
      console.log(`🔄 Đang tạo ${size.name} (${size.width}x${size.height})...`);
      const outputPath = path.join(__dirname, '../public', size.name);
      
      const sharpInstance = sharp(inputPath, { animated: true, limitInputPixels: false })
        .resize(size.width, size.height, { 
          fit: 'contain', 
          background: { r: 0, g: 0, b: 0, alpha: 0 } 
        });
      
      if (size.format === 'webp') {
        await sharpInstance.webp({ quality: 90, effort: 6 }).toFile(outputPath);
      } else {
        await sharpInstance.gif().toFile(outputPath);
      }
      
      const newSize = fs.statSync(outputPath).size;
      const reduction = ((1 - newSize / originalSize) * 100).toFixed(2);
      console.log(`   ✅ Kích thước: ${(newSize / 1024).toFixed(2)} KB (giảm ${reduction}%)\n`);
    }
    
    console.log('✨ Hoàn tất! Các file đã được tạo với nhiều kích thước khác nhau.');
    console.log('\n💡 Khuyến nghị sử dụng:');
    console.log('   • logo-120.webp hoặc logo-80.webp - Cho hiển thị thông thường');
    console.log('   • logo-120.gif hoặc logo-80.gif - Cho fallback');
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    console.error(error);
  }
}

createOptimizedLogos();
