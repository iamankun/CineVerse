import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CineVerse - Vũ trụ điện ảnh',
    short_name: 'CineVerse',
    description: 'Vũ trụ điện ảnh dành cho bạn',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: '/logo-cineverse.webp',
        sizes: '192x192',
        type: 'image/webp',
      },
      {
        src: '/logo-cineverse.webp',
        sizes: '512x512',
        type: 'image/webp',
      },
    ],
  };
}