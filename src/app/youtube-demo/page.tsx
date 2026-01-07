'use client';

import React, { useState, useEffect } from 'react';
import YouTubePlayer from '@/components/ui/YouTubePlayer';
import '@/styles/youtube-player.css';

export default function YouTubePlayerDemo() {
  const [currentVideoId, setCurrentVideoId] = useState('M7lc1UVf-VE');
  const [customVideoId, setCustomVideoId] = useState('');

  // Preload YouTube API
  useEffect(() => {
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  // Danh sách video mẫu (có thể thay bằng danh sách từ An Kun Studio)
  const demoVideos = [
    {
      id: 'M7lc1UVf-VE',
      title: 'Video Demo 1',
      artist: 'Artist Name',
    },
    {
      id: 'dQw4w9WgXcQ',
      title: 'Video Demo 2',
      artist: 'Artist Name',
    },
    {
      id: 'kJQP7kiw5Fk',
      title: 'Video Demo 3',
      artist: 'Artist Name',
    },
  ];

  const handleVideoChange = (videoId: string) => {
    setCurrentVideoId(videoId);
  };

  const handleCustomVideo = () => {
    if (customVideoId.trim()) {
      setCurrentVideoId(customVideoId);
      setCustomVideoId('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Custom YouTube Player cho CineVerse
          </h1>
          <p className="text-gray-400 text-lg">
            Player tùy chỉnh với controls đẹp mắt và đồng bộ thương hiệu
          </p>
        </div>

        {/* Main Player */}
        <div className="mb-8">
          <YouTubePlayer
            videoId={currentVideoId}
            autoplay={false}
            showControls={true}
            className="shadow-2xl"
            onReady={() => console.log('Player is ready!')}
            onStateChange={(state) => console.log('State changed:', state)}
            onError={(error) => console.error('Player error:', error)}
          />
        </div>

        {/* Video Information */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Đang phát: {demoVideos.find((v) => v.id === currentVideoId)?.title}
          </h2>
          <p className="text-gray-400">
            Nghệ sĩ: {demoVideos.find((v) => v.id === currentVideoId)?.artist}
          </p>
        </div>

        {/* Playlist */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Demo Videos */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              📹 Danh sách phát Demo
            </h3>
            <div className="space-y-2">
              {demoVideos.map((video) => (
                <button
                  key={video.id}
                  onClick={() => handleVideoChange(video.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    currentVideoId === video.id
                      ? 'bg-primary text-white'
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <div className="font-semibold">{video.title}</div>
                  <div className="text-sm opacity-75">{video.artist}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Video Input */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              🎵 Nhập Video ID tùy chỉnh
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  YouTube Video ID
                </label>
                <input
                  type="text"
                  value={customVideoId}
                  onChange={(e) => setCustomVideoId(e.target.value)}
                  placeholder="VD: M7lc1UVf-VE"
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCustomVideo();
                    }
                  }}
                />
              </div>
              <button
                onClick={handleCustomVideo}
                className="w-full px-4 py-2 bg-primary hover:bg-primary/80 text-white font-semibold rounded-lg transition-colors"
              >
                Phát Video
              </button>
              <p className="text-xs text-gray-500">
                💡 Mẹo: Video ID là phần sau "v=" trong URL YouTube
                <br />
                VD: youtube.com/watch?v=<strong>M7lc1UVf-VE</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 backdrop-blur-sm rounded-lg p-6 border border-red-500/20">
            <div className="text-3xl mb-3">🎨</div>
            <h4 className="text-lg font-bold text-white mb-2">
              Thiết kế tùy chỉnh
            </h4>
            <p className="text-gray-400 text-sm">
              Controls đẹp mắt, đồng bộ với thương hiệu CineVerse
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm rounded-lg p-6 border border-blue-500/20">
            <div className="text-3xl mb-3">⚡</div>
            <h4 className="text-lg font-bold text-white mb-2">
              Hiệu suất cao
            </h4>
            <p className="text-gray-400 text-sm">
              Tải nhanh, mượt mà với YouTube IFrame API
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-sm rounded-lg p-6 border border-green-500/20">
            <div className="text-3xl mb-3">📱</div>
            <h4 className="text-lg font-bold text-white mb-2">
              Responsive
            </h4>
            <p className="text-gray-400 text-sm">
              Tương thích mọi thiết bị, từ mobile đến desktop
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">
            📚 Hướng dẫn sử dụng
          </h3>
          <div className="space-y-3 text-gray-300">
            <div className="flex items-start gap-3">
              <span className="text-primary font-bold">1.</span>
              <p>
                <strong>Import component:</strong> Thêm{' '}
                <code className="bg-gray-700 px-2 py-1 rounded text-sm">
                  import YouTubePlayer from '@/components/ui/YouTubePlayer'
                </code>{' '}
                vào file của bạn
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-primary font-bold">2.</span>
              <p>
                <strong>Sử dụng component:</strong> Truyền{' '}
                <code className="bg-gray-700 px-2 py-1 rounded text-sm">
                  videoId
                </code>{' '}
                từ URL YouTube (phần sau "v=")
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-primary font-bold">3.</span>
              <p>
                <strong>Tùy chỉnh:</strong> Sử dụng props như{' '}
                <code className="bg-gray-700 px-2 py-1 rounded text-sm">
                  autoplay
                </code>
                ,{' '}
                <code className="bg-gray-700 px-2 py-1 rounded text-sm">
                  showControls
                </code>{' '}
                để điều chỉnh hành vi
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-900/50 rounded-lg">
            <p className="text-sm text-gray-400 mb-2">Ví dụ code:</p>
            <pre className="text-xs text-green-400 overflow-x-auto">
              {`<YouTubePlayer
  videoId="M7lc1UVf-VE"
  autoplay={false}
  showControls={true}
  onReady={() => console.log('Ready!')}
/>`}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p>
            Made with ❤️ for <strong className="text-primary">CineVerse</strong>
          </p>
          <p className="text-sm mt-2">
            Custom YouTube Player with Full Controls
          </p>
        </div>
      </div>
    </div>
  );
}
