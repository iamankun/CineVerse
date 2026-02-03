'use client';

import React, { useState, useEffect } from 'react';
import YouTubePlayer from '@/components/ui/YouTubePlayer';
import { List, Music2, Play } from 'lucide-react';

export interface VideoItem {
  id: string;
  title: string;
  artist?: string;
  thumbnail?: string;
  duration?: string;
}

interface YouTubePlaylistPlayerProps {
  videos: VideoItem[];
  autoplay?: boolean;
  loop?: boolean;
  className?: string;
  onVideoChange?: (video: VideoItem, index: number) => void;
}

export const YouTubePlaylistPlayer: React.FC<YouTubePlaylistPlayerProps> = ({
  videos,
  autoplay = false,
  loop = false,
  className = '',
  onVideoChange,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPlaylist, setShowPlaylist] = useState(true);
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  const currentVideo = videos[currentIndex];

  useEffect(() => {
    if (currentVideo && onVideoChange) {
      onVideoChange(currentVideo, currentIndex);
    }
  }, [currentIndex, currentVideo, onVideoChange]);

  const handleVideoEnd = (state: number) => {
    // State 0 = ENDED
    if (state === 0) {
      if (currentIndex < videos.length - 1) {
        // Chuyển sang video tiếp theo
        setCurrentIndex(currentIndex + 1);
      } else if (loop) {
        // Quay lại đầu playlist nếu loop = true
        setCurrentIndex(0);
      }
    }
  };

  const handlePlayVideo = (index: number) => {
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (loop) {
      setCurrentIndex(0);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (loop) {
      setCurrentIndex(videos.length - 1);
    }
  };

  if (!currentVideo) {
    return (
      <div className="text-center text-white p-8">
        <Music2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p className="text-gray-400">Không có video trong playlist</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col lg:flex-row gap-6 ${className}`}>
      {/* Main Player */}
      <div className="flex-1">
        <YouTubePlayer
          videoId={currentVideo.id}
          autoplay={autoplay && currentIndex > 0}
          showControls={true}
          onReady={() => setIsPlayerReady(true)}
          onStateChange={handleVideoEnd}
        />

        {/* Video Info */}
        <div className="mt-4 bg-gray-800/50 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-1">
                {currentVideo.title}
              </h3>
              {currentVideo.artist && (
                <p className="text-gray-400">{currentVideo.artist}</p>
              )}
            </div>
            <div className="text-sm text-gray-500">
              {currentIndex + 1} / {videos.length}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              onClick={handlePrevious}
              disabled={!loop && currentIndex === 0}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              ← Trước
            </button>
            <button
              onClick={handleNext}
              disabled={!loop && currentIndex === videos.length - 1}
              className="px-4 py-2 bg-primary hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              Tiếp →
            </button>
          </div>
        </div>
      </div>

      {/* Playlist Sidebar */}
      <div className="lg:w-96 w-full">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden">
          {/* Playlist Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <List className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-white">Danh sách phát</h3>
              <span className="text-sm text-gray-500">({videos.length})</span>
            </div>
            <button
              onClick={() => setShowPlaylist(!showPlaylist)}
              className="lg:hidden p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <List className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Playlist Items */}
          <div
            className={`max-h-[600px] overflow-y-auto youtube-playlist ${
              showPlaylist ? 'block' : 'hidden lg:block'
            }`}
          >
            {videos.map((video, index) => (
              <button
                key={video.id + index}
                onClick={() => handlePlayVideo(index)}
                className={`w-full text-left p-4 border-b border-gray-700/50 transition-all hover:bg-gray-700/30 ${
                  index === currentIndex
                    ? 'bg-primary/20 border-l-4 border-l-primary'
                    : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Thumbnail or Index */}
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-700 rounded flex items-center justify-center">
                    {index === currentIndex && isPlayerReady ? (
                      <Play className="w-5 h-5 text-primary" fill="currentColor" />
                    ) : (
                      <span className="text-gray-400 font-semibold">
                        {index + 1}
                      </span>
                    )}
                  </div>

                  {/* Video Info */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-semibold truncate ${
                        index === currentIndex ? 'text-primary' : 'text-white'
                      }`}
                    >
                      {video.title}
                    </p>
                    {video.artist && (
                      <p className="text-sm text-gray-400 truncate">
                        {video.artist}
                      </p>
                    )}
                  </div>

                  {/* Duration */}
                  {video.duration && (
                    <span className="text-xs text-gray-500">
                      {video.duration}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Playlist Footer */}
          <div className="p-4 border-t border-gray-700 bg-gray-900/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">
                Tổng: {videos.length} video
              </span>
              <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={loop}
                  onChange={() => {}}
                  className="w-4 h-4 text-primary bg-gray-700 border-gray-600 rounded focus:ring-primary"
                  disabled
                />
                <span>Lặp lại</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YouTubePlaylistPlayer;
