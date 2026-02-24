'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { YouTubePlayer } from '@/components/video/YouTubePlayer'
import { PlayCircle, Film, Settings, Volume2, Maximize, ThumbsUp, Share2, Download } from 'lucide-react'

export default function VideoPlayerDemo() {
  const [selectedVideo, setSelectedVideo] = useState('dQw4w9WgXcQ')

  const videos = [
    { id: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up', duration: '3:33' },
    { id: 'jNQXAC9IVRw', title: 'Me at the zoo', duration: '0:18' },
    { id: '9bZkp7q19f0', title: 'Gangnam Style', duration: '4:13' },
    { id: 'kJQP7kiw5Fk', title: 'Luis Fonsi - Despacito', duration: '4:41' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-600">
            YouTube Player Redesign
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            A modern YouTube player with beautiful microinteractions and motion design
          </p>
        </motion.div>

        {/* Main Player */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <YouTubePlayer 
            videoId={selectedVideo} 
            title={videos.find(v => v.id === selectedVideo)?.title}
          />
        </motion.div>

        {/* Video Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {videos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ y: -4 }}
              onClick={() => setSelectedVideo(video.id)}
              className="cursor-pointer"
            >
              <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 to-black/50" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Film className="w-12 h-12 text-gray-600" />
                </div>
                <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-white text-xs">
                  {video.duration}
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center"
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center"
                  >
                    <PlayCircle className="w-6 h-6 text-white" />
                  </motion.div>
                </motion.div>
              </div>
              <h3 className="text-white font-medium mt-2 line-clamp-2">{video.title}</h3>
              <p className="text-gray-400 text-sm">Channel Name</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-4"
            >
              <Settings className="w-6 h-6 text-white" />
            </motion.div>
            <h3 className="text-white font-semibold mb-2">Advanced Controls</h3>
            <p className="text-gray-400 text-sm">
              Playback speed, quality settings, and comprehensive player controls
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-4"
            >
              <Volume2 className="w-6 h-6 text-white" />
            </motion.div>
            <h3 className="text-white font-semibold mb-2">Rich Interactions</h3>
            <p className="text-gray-400 text-sm">
              Smooth animations, hover effects, and responsive controls
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-4"
            >
              <Maximize className="w-6 h-6 text-white" />
            </motion.div>
            <h3 className="text-white font-semibold mb-2">Multiple Modes</h3>
            <p className="text-gray-400 text-sm">
              Fullscreen, theater mode, and responsive design for all devices
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
