'use client';

import React from 'react';
import YouTubePlaylistPlayer, {
  VideoItem,
} from '@/components/ui/YouTubePlaylistPlayer';
import '@/styles/youtube-player.css';

export default function PlaylistDemo() {
  // Danh sách video mẫu - có thể thay bằng dữ liệu từ API
  const demoPlaylist: VideoItem[] = [
    {
      id: 'M7lc1UVf-VE',
      title: 'Bài hát 1 - An Kun Studio',
      artist: 'Nghệ sĩ A',
      duration: '3:45',
    },
    {
      id: 'dQw4w9WgXcQ',
      title: 'Bài hát 2 - An Kun Studio',
      artist: 'Nghệ sĩ B',
      duration: '4:12',
    },
    {
      id: 'kJQP7kiw5Fk',
      title: 'Bài hát 3 - An Kun Studio',
      artist: 'Nghệ sĩ C',
      duration: '3:28',
    },
    {
      id: '9bZkp7q19f0',
      title: 'Bài hát 4 - An Kun Studio',
      artist: 'Nghệ sĩ D',
      duration: '5:01',
    },
    {
      id: 'ZZ5LpwO-An4',
      title: 'Bài hát 5 - An Kun Studio',
      artist: 'Nghệ sĩ E',
      duration: '4:33',
    },
  ];

  const handleVideoChange = (video: VideoItem, index: number) => {
    console.log('Now playing:', video.title, 'at index:', index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            🎵 YouTube Playlist Player
          </h1>
          <p className="text-gray-400 text-lg">
            Trình phát playlist tùy chỉnh cho An Kun Studio / CineVerse
          </p>
        </div>

        {/* Main Playlist Player */}
        <YouTubePlaylistPlayer
          videos={demoPlaylist}
          autoplay={false}
          loop={true}
          onVideoChange={handleVideoChange}
          className="mb-8"
        />

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20">
            <div className="text-3xl mb-3">🎼</div>
            <h4 className="text-lg font-bold text-white mb-2">
              Auto Next
            </h4>
            <p className="text-gray-400 text-sm">
              Tự động chuyển sang video tiếp theo khi kết thúc
            </p>
          </div>

          <div className="bg-gradient-to-br from-pink-500/20 to-pink-600/20 backdrop-blur-sm rounded-lg p-6 border border-pink-500/20">
            <div className="text-3xl mb-3">🔁</div>
            <h4 className="text-lg font-bold text-white mb-2">
              Loop Playlist
            </h4>
            <p className="text-gray-400 text-sm">
              Phát lại từ đầu khi hết danh sách
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-sm rounded-lg p-6 border border-orange-500/20">
            <div className="text-3xl mb-3">📋</div>
            <h4 className="text-lg font-bold text-white mb-2">
              Quản lý Playlist
            </h4>
            <p className="text-gray-400 text-sm">
              Dễ dàng chuyển đổi giữa các video
            </p>
          </div>

          <div className="bg-gradient-to-br from-teal-500/20 to-teal-600/20 backdrop-blur-sm rounded-lg p-6 border border-teal-500/20">
            <div className="text-3xl mb-3">🎨</div>
            <h4 className="text-lg font-bold text-white mb-2">
              Custom UI
            </h4>
            <p className="text-gray-400 text-sm">
              Giao diện đẹp, đồng bộ thương hiệu
            </p>
          </div>
        </div>

        {/* Use Cases */}
        <div className="mt-12 bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 md:p-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            💡 Ứng dụng thực tế cho An Kun Studio
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                1
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Album Release
                </h3>
                <p className="text-gray-400">
                  Phát toàn bộ các bài hát trong album mới một cách liên tục,
                  tạo trải nghiệm nghe nhạc hoàn chỉnh cho fan.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                2
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Top Hits Collection
                </h3>
                <p className="text-gray-400">
                  Tạo playlist "Top 10 bài hát hot nhất" của studio,
                  người dùng có thể nghe liên tục không cần thao tác.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                3
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Artist Showcase
                </h3>
                <p className="text-gray-400">
                  Giới thiệu toàn bộ tác phẩm của một nghệ sĩ cụ thể,
                  giúp fan dễ dàng khám phá và theo dõi.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                4
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Livestream Music
                </h3>
                <p className="text-gray-400">
                  Phát nhạc 24/7 cho các sự kiện livestream hoặc
                  background music cho studio.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Code Example */}
        <div className="mt-8 bg-gray-800/50 backdrop-blur-sm rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">
            📝 Cách sử dụng trong code
          </h3>
          
          <div className="bg-gray-900/80 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-green-400">
{`import YouTubePlaylistPlayer from '@/components/ui/YouTubePlaylistPlayer';

const myPlaylist = [
  {
    id: 'M7lc1UVf-VE',
    title: 'Bài hát 1',
    artist: 'Nghệ sĩ A',
    duration: '3:45',
  },
  // ... more videos
];

export default function MyPage() {
  return (
    <YouTubePlaylistPlayer
      videos={myPlaylist}
      autoplay={false}
      loop={true}
      onVideoChange={(video, index) => {
        console.log('Now playing:', video.title);
      }}
    />
  );
}`}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p className="flex items-center justify-center gap-2">
            Made with <span className="text-red-500">❤️</span> for
            <strong className="text-primary">An Kun Studio</strong> &{' '}
            <strong className="text-primary">CineVerse</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
