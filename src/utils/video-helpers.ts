// YouTube URL utilities

export function normalizeYouTubeUrl(url: string): { id: string, url: string } | null {
  try {
    if (!url) return null;
    let id = "";
    let newUrl = "";
    // https://www.youtube.com/watch?v=ID&...
    const match = url.match(/[?&]v=([\w-]{11})/);
    if (match) {
      id = match[1];
      newUrl = `https://www.youtube.com/watch?v=${id}`;
      return { id, url: newUrl };
    }
    // https://youtu.be/ID
    const match2 = url.match(/youtu\.be\/([\w-]{11})/);
    if (match2) {
      id = match2[1];
      newUrl = `https://www.youtube.com/watch?v=${id}`;
      return { id, url: newUrl };
    }
    // https://www.youtube.com/embed/ID
    const match3 = url.match(/embed\/([\w-]{11})/);
    if (match3) {
      id = match3[1];
      newUrl = `https://www.youtube.com/watch?v=${id}`;
      return { id, url: newUrl };
    }
    // Nếu chỉ là ID
    if (/^[\w-]{11}$/.test(url)) {
      id = url;
      newUrl = `https://www.youtube.com/watch?v=${id}`;
      return { id, url: newUrl };
    }
    return null;
  } catch {
    return null;
  }
}

export function extractYouTubeId(url: string): string {
  const match = url.match(/[?&]v=([\w-]{11})/);
  if (match) return match[1];
  
  const match2 = url.match(/youtu\.be\/([\w-]{11})/);
  if (match2) return match2[1];
  
  const match3 = url.match(/embed\/([\w-]{11})/);
  if (match3) return match3[1];
  
  return '';
}

export function extractDailymotionId(url: string): string {
  const match = url.match(/dailymotion\.com\/video\/([\w]+)/);
  if (match) return match[1];
  
  const match2 = url.match(/dai\.ly\/([\w]+)/);
  if (match2) return match2[1];
  
  return '';
}

export function detectProvider(url: string): 'youtube' | 'dailymotion' | 'vidsrc' | 'direct' {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  } else if (url.includes('dailymotion.com')) {
    return 'dailymotion';
  } else if (url.includes('vidsrc')) {
    return 'vidsrc';
  } else {
    return 'direct';
  }
}
