import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_IMAGE = path.join(__dirname, '../public/CineVerse.png');
const ICONS_DIR = path.join(__dirname, '../public/icons');

// Android icon sizes
const androidSizes = [
  { size: 48, name: 'android-launchericon-48-48.png' },
  { size: 72, name: 'android-launchericon-72-72.png' },
  { size: 96, name: 'android-launchericon-96-96.png' },
  { size: 144, name: 'android-launchericon-144-144.png' },
  { size: 192, name: 'android-launchericon-192-192.png' },
  { size: 512, name: 'android-launchericon-512-512.png' },
];

// iOS icon sizes
const iosSizes = [
  16, 20, 29, 32, 40, 50, 57, 58, 60, 64, 72, 76, 80, 87, 
  100, 114, 120, 128, 144, 152, 167, 180, 192, 256, 512, 1024
];

// Windows icon configurations
const windowsIcons = [
  // LargeTile (310x310)
  { size: 310, scale: 100, name: 'LargeTile.scale-100.png' },
  { size: 388, scale: 125, name: 'LargeTile.scale-125.png' },
  { size: 465, scale: 150, name: 'LargeTile.scale-150.png' },
  { size: 620, scale: 200, name: 'LargeTile.scale-200.png' },
  { size: 1240, scale: 400, name: 'LargeTile.scale-400.png' },
  
  // SmallTile (71x71)
  { size: 71, scale: 100, name: 'SmallTile.scale-100.png' },
  { size: 89, scale: 125, name: 'SmallTile.scale-125.png' },
  { size: 107, scale: 150, name: 'SmallTile.scale-150.png' },
  { size: 142, scale: 200, name: 'SmallTile.scale-200.png' },
  { size: 284, scale: 400, name: 'SmallTile.scale-400.png' },
  
  // SplashScreen (620x300)
  { width: 620, height: 300, name: 'SplashScreen.scale-100.png' },
  { width: 775, height: 375, name: 'SplashScreen.scale-125.png' },
  { width: 930, height: 450, name: 'SplashScreen.scale-150.png' },
  { width: 1240, height: 600, name: 'SplashScreen.scale-200.png' },
  { width: 2480, height: 1200, name: 'SplashScreen.scale-400.png' },
  
  // Square150x150Logo
  { size: 150, scale: 100, name: 'Square150x150Logo.scale-100.png' },
  { size: 188, scale: 125, name: 'Square150x150Logo.scale-125.png' },
  { size: 225, scale: 150, name: 'Square150x150Logo.scale-150.png' },
  { size: 300, scale: 200, name: 'Square150x150Logo.scale-200.png' },
  { size: 600, scale: 400, name: 'Square150x150Logo.scale-400.png' },
  
  // Square44x44Logo (all variants)
  { size: 44, scale: 100, name: 'Square44x44Logo.scale-100.png' },
  { size: 55, scale: 125, name: 'Square44x44Logo.scale-125.png' },
  { size: 66, scale: 150, name: 'Square44x44Logo.scale-150.png' },
  { size: 88, scale: 200, name: 'Square44x44Logo.scale-200.png' },
  { size: 176, scale: 400, name: 'Square44x44Logo.scale-400.png' },
  
  // StoreLogo (50x50)
  { size: 50, scale: 100, name: 'StoreLogo.scale-100.png' },
  { size: 63, scale: 125, name: 'StoreLogo.scale-125.png' },
  { size: 75, scale: 150, name: 'StoreLogo.scale-150.png' },
  { size: 100, scale: 200, name: 'StoreLogo.scale-200.png' },
  { size: 200, scale: 400, name: 'StoreLogo.scale-400.png' },
  
  // Wide310x150Logo
  { width: 310, height: 150, name: 'Wide310x150Logo.scale-100.png' },
  { width: 388, height: 188, name: 'Wide310x150Logo.scale-125.png' },
  { width: 465, height: 225, name: 'Wide310x150Logo.scale-150.png' },
  { width: 620, height: 300, name: 'Wide310x150Logo.scale-200.png' },
  { width: 1240, height: 600, name: 'Wide310x150Logo.scale-400.png' },
];

// Square44x44Logo targetsize variants
const targetSizes = [16, 20, 24, 30, 32, 36, 40, 44, 48, 60, 64, 72, 80, 96, 256];

// Add all targetsize variants
for (const size of targetSizes) {
  windowsIcons.push(
    { size, name: `Square44x44Logo.targetsize-${size}.png` },
    { size, name: `Square44x44Logo.altform-unplated_targetsize-${size}.png` },
    { size, name: `Square44x44Logo.altform-lightunplated_targetsize-${size}.png` }
  );
}

async function deleteOldIcons() {
  console.log('🗑️  Xóa icons cũ...');
  
  try {
    await fs.rm(path.join(ICONS_DIR, 'android'), { recursive: true, force: true });
    await fs.rm(path.join(ICONS_DIR, 'ios'), { recursive: true, force: true });
    await fs.rm(path.join(ICONS_DIR, 'windows'), { recursive: true, force: true });
    console.log('✅ Đã xóa icons cũ');
  } catch (error) {
    console.log('⚠️  Không tìm thấy icons cũ để xóa');
  }
}

async function createDirectories() {
  console.log('📁 Tạo thư mục...');
  
  await fs.mkdir(path.join(ICONS_DIR, 'android'), { recursive: true });
  await fs.mkdir(path.join(ICONS_DIR, 'ios'), { recursive: true });
  await fs.mkdir(path.join(ICONS_DIR, 'windows'), { recursive: true });
  
  console.log('✅ Đã tạo thư mục');
}

async function generateAndroidIcons() {
  console.log('\n🤖 Generating Android icons...');
  
  for (const icon of androidSizes) {
    const outputPath = path.join(ICONS_DIR, 'android', icon.name);
    
    await sharp(SOURCE_IMAGE)
      .resize(icon.size, icon.size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(outputPath);
    
    console.log(`  ✅ ${icon.name} (${icon.size}x${icon.size})`);
  }
}

async function generateIOSIcons() {
  console.log('\n🍎 Generating iOS icons...');
  
  for (const size of iosSizes) {
    const outputPath = path.join(ICONS_DIR, 'ios', `${size}.png`);
    
    await sharp(SOURCE_IMAGE)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(outputPath);
    
    console.log(`  ✅ ${size}.png (${size}x${size})`);
  }
}

async function generateWindowsIcons() {
  console.log('\n🪟 Generating Windows icons...');
  
  for (const icon of windowsIcons) {
    const outputPath = path.join(ICONS_DIR, 'windows', icon.name);
    
    if (icon.width && icon.height) {
      // Rectangular icons (SplashScreen, Wide)
      await sharp(SOURCE_IMAGE)
        .resize(icon.width, icon.height, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`  ✅ ${icon.name} (${icon.width}x${icon.height})`);
    } else {
      // Square icons
      await sharp(SOURCE_IMAGE)
        .resize(icon.size, icon.size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`  ✅ ${icon.name} (${icon.size}x${icon.size})`);
    }
  }
}

async function main() {
  try {
    console.log('🎨 Generate App Icons from CineVerse.png');
    console.log('=====================================\n');
    
    // Check if source image exists
    try {
      await fs.access(SOURCE_IMAGE);
    } catch (error) {
      console.error('❌ Không tìm thấy CineVerse.png tại:', SOURCE_IMAGE);
      process.exit(1);
    }
    
    // Delete old icons
    await deleteOldIcons();
    
    // Create directories
    await createDirectories();
    
    // Generate icons for all platforms
    await generateAndroidIcons();
    await generateIOSIcons();
    await generateWindowsIcons();
    
    console.log('\n✨ Hoàn tất! Đã tạo tất cả app icons từ CineVerse.png');
    console.log(`📊 Tổng số icons: ${androidSizes.length + iosSizes.length + windowsIcons.length}`);
    console.log('📽 CineVerse - Vũ Trụ Điện Ảnh | Hoàn tất cài đặt, trải nghiệm ngay.');

  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

main();
