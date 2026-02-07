import { loadImageSafely } from './promise-helpers';

interface ExtractedColors {
  dominant: string;
  palette: string[];
  confidence: number;
}

interface Options {
  maxSize?: number;
  colorSimilarityThreshold?: number;
  sortBy?: 'dominance' | 'frequency';
}

/**
 * Safe color extraction utility that avoids Promise constructor anti-patterns
 */
export async function extractDominantColorsSafe(
  imageUrl: string, 
  options: Options = {}
): Promise<ExtractedColors[]> {
  const { 
    maxSize = 100, 
    colorSimilarityThreshold = 0.05, 
    sortBy = 'dominance' 
  } = options;

  try {
    console.log('🎨 Extracting colors from:', imageUrl);
    
    // Use safe image loading instead of Promise constructor anti-pattern
    const img = await loadImageSafely(imageUrl);
    
    // Create canvas for color extraction
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get 2D context from canvas');
    }

    // Set canvas size
    if (maxSize) {
      canvas.width = maxSize;
      canvas.height = maxSize;
    } else {
      canvas.width = img.width;
      canvas.height = img.height;
    }

    // Draw image to canvas
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Simple color quantization
    const colorMap = new Map<string, number>();
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      
      const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).padStart(6, '0')}`;
      colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
    }

    // Sort colors by frequency
    const sortedColors = Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([hex, count]) => ({
        hex,
        count,
        percentage: (count / (data.length / 4)) * 100
      }));

    console.log('✅ Colors extracted safely:', sortedColors.length, 'colors found');

    return [{
      dominant: sortedColors[0]?.hex || '#000000',
      palette: sortedColors.map(c => c.hex),
      confidence: sortedColors[0]?.percentage || 0
    }];
    
  } catch (error) {
    console.error('❌ Color extraction failed:', error);
    throw error;
  }
}
