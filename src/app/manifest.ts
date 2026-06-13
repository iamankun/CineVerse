import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CineVerse - Vũ Trụ Điện Ảnh',
    short_name: 'CineVerse',
    description: 'Dịch vụ xem phim và chương trình truyền hình đỉnh cao',
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