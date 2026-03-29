import sharp from 'sharp';
import fs from 'fs';

async function convertToWebP() {
  const inputPath = 'public/logo-cineverse.png';
  const outputPath = 'public/logo-cineverse.webp';

  try {
    if (!fs.existsSync(inputPath)) {
      console.error('Error: Input file not found at', inputPath);
      process.exit(1);
    }

    const originalStats = fs.statSync(inputPath);
    const originalSizeMB = (originalStats.size / 1024 / 1024).toFixed(2);
    console.log(`Original PNG size: ${originalSizeMB} MB`);

    await sharp(inputPath)
      .webp({ quality: 85, effort: 6 })
      .toFile(outputPath);

    const newStats = fs.statSync(outputPath);
    const newSizeMB = (newStats.size / 1024 / 1024).toFixed(2);
    const savings = (((originalStats.size - newStats.size) / originalStats.size) * 100).toFixed(1);

    console.log(`WebP size: ${newSizeMB} MB`);
    console.log(`Space saved: ${savings}%`);
    console.log(`Successfully created: ${outputPath}`);

  } catch (error) {
    console.error('Conversion failed:', error.message);
    process.exit(1);
  }
}

convertToWebP();
