const imagemin = require('imagemin');
const imageminGifsicle = require('imagemin-gifsicle');
const fs = require('fs');
const path = require('path');

async function optimizeLogo() {
  const inputPath = path.join(__dirname, '../public/logo.gif');
  const outputDir = path.join(__dirname, '../public');
  const backupPath = path.join(__dirname, '../public/logo-original.gif');
  
  // Tạo backup file gốc
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(inputPath, backupPath);
    console.log('✅ Đã backup file gốc: logo-original.gif');
  }
  
  const originalSize = fs.statSync(inputPath).size;
  console.log(`📊 Kích thước gốc: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
  
  try {
    // Tối ưu với các mức độ khác nhau
    const optimizationLevels = [
      { level: 3, colors: 256, name: 'logo.gif' },
      { level: 3, colors: 128, name: 'logo-optimized-128.gif' },
      { level: 3, colors: 64, name: 'logo-optimized-64.gif' }
    ];
    
    for (const opt of optimizationLevels) {
      console.log(`\n🔄 Đang tối ưu với ${opt.colors} màu...`);
      
      const files = await imagemin([inputPath], {
        destination: outputDir,
        plugins: [
          imageminGifsicle({
            optimizationLevel: opt.level,
            colors: opt.colors,
            lossy: 80 // Thêm compression lossy để giảm thêm kích thước
          })
        ]
      });
      
      if (files && files.length > 0) {
        const outputPath = path.join(outputDir, opt.name);
        fs.renameSync(files[0].destinationPath, outputPath);
        
        const newSize = fs.statSync(outputPath).size;
        const reduction = ((1 - newSize / originalSize) * 100).toFixed(2);
        
        console.log(`✅ ${opt.name}:`);
        console.log(`   Kích thước: ${(newSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   Giảm: ${reduction}%`);
      }
    }
    
    console.log('\n✨ Hoàn tất! Kiểm tra các file đã tối ưu và chọn file phù hợp nhất.');
    console.log('💡 File gốc đã được backup tại: logo-original.gif');
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  }
}

optimizeLogo();
