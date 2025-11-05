import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '../public');

// File cần tối ưu
const filesToOptimize = [
  { 
    name: 'mockup.gif', 
    maxSize: 800, // Giảm xuống max 800px
    quality: 85 
  },
  { 
    name: 'ava.gif', 
    maxSize: 600,
    quality: 85 
  },
  { 
    name: 'loading.gif', 
    maxSize: 400,
    quality: 90 
  },
  { 
    name: 'intro.mp4', 
    skip: true // MP4 cần tools khác
  },
  { 
    name: 'longtieng.png', 
    maxSize: 500,
    quality: 90 
  }
];

async function optimizeFile(fileName, maxSize, quality) {
  const inputPath = path.join(publicDir, fileName);
  const backupPath = path.join(publicDir, `${fileName.split('.')[0]}-original.${fileName.split('.')[1]}`);
  
  if (!fs.existsSync(inputPath)) {
    console.log(`⏭️  Skipping ${fileName} - file not found`);
    return;
  }

  // Backup nếu chưa có
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(inputPath, backupPath);
    console.log(`✅ Backed up: ${fileName} -> ${path.basename(backupPath)}`);
  }

  const originalSize = fs.statSync(inputPath).size;
  console.log(`\n📊 ${fileName}: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);

  try {
    const metadata = await sharp(inputPath, { animated: true, limitInputPixels: false }).metadata();
    console.log(`   📐 Current: ${metadata.width}x${metadata.height}`);

    // Chỉ resize nếu lớn hơn maxSize
    const needsResize = metadata.width > maxSize || metadata.height > maxSize;
    
    if (!needsResize) {
      console.log(`   ✓ Already optimal size`);
      return;
    }

    // Tính toán kích thước mới
    let newWidth = metadata.width;
    let newHeight = metadata.height;
    
    if (metadata.width > metadata.height) {
      newWidth = maxSize;
      newHeight = Math.round((metadata.height / metadata.width) * maxSize);
    } else {
      newHeight = maxSize;
      newWidth = Math.round((metadata.width / metadata.height) * maxSize);
    }

    console.log(`   🎯 Target: ${newWidth}x${newHeight}`);

    const ext = path.extname(fileName).toLowerCase();
    const baseName = path.basename(fileName, ext);
    
    // Tạo version WebP (nếu là GIF)
    if (ext === '.gif') {
      console.log(`   🔄 Creating WebP version...`);
      const webpPath = path.join(publicDir, `${baseName}.webp`);
      
      await sharp(inputPath, { animated: true, limitInputPixels: false })
        .resize(newWidth, newHeight, { fit: 'inside' })
        .webp({ quality, effort: 6 })
        .toFile(webpPath);
      
      const webpSize = fs.statSync(webpPath).size;
      const webpReduction = ((1 - webpSize / originalSize) * 100).toFixed(2);
      console.log(`   ✅ ${baseName}.webp: ${(webpSize / 1024).toFixed(2)} KB (giảm ${webpReduction}%)`);
    }

    // Tối ưu file gốc (GIF hoặc PNG)
    console.log(`   🔄 Optimizing ${ext}...`);
    const tempPath = path.join(publicDir, `${baseName}-temp${ext}`);
    
    const sharpInstance = sharp(inputPath, { animated: true, limitInputPixels: false })
      .resize(newWidth, newHeight, { fit: 'inside' });
    
    if (ext === '.gif') {
      await sharpInstance.gif().toFile(tempPath);
    } else if (ext === '.png') {
      await sharpInstance.png({ quality, compressionLevel: 9 }).toFile(tempPath);
    }

    const newSize = fs.statSync(tempPath).size;
    const reduction = ((1 - newSize / originalSize) * 100).toFixed(2);

    // Replace original
    fs.unlinkSync(inputPath);
    fs.renameSync(tempPath, inputPath);

    console.log(`   ✅ ${fileName}: ${(newSize / 1024).toFixed(2)} KB (giảm ${reduction}%)`);

  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
  }
}

async function optimizeAllFiles() {
  console.log('🚀 Bắt đầu tối ưu hóa các file lớn...\n');

  for (const file of filesToOptimize) {
    if (file.skip) {
      console.log(`⏭️  Skipping ${file.name} - ${file.skip === true ? 'manual optimization needed' : file.skip}`);
      continue;
    }

    await optimizeFile(file.name, file.maxSize, file.quality);
  }

  console.log('\n✨ Hoàn tất tối ưu hóa!');
  console.log('\n📋 Các file backup:');
  console.log('   - mockup-original.gif');
  console.log('   - ava-original.gif');
  console.log('   - loading-original.gif');
  console.log('   - longtieng-original.png');
  console.log('\n💡 Lưu ý: intro.mp4 cần tối ưu bằng ffmpeg riêng');
}

optimizeAllFiles();
