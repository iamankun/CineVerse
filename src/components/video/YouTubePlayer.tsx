'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Settings,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Wifi,
  WifiOff,
  Film,
  Clock,
  Eye,
  ThumbsUp,
  Share2,
  Download,
  List,
  X
} from 'lucide-react'
import { cn } from '@/utils/helpers'

interface YouTubePlayerProps {
  videoId: string
  title?: string
  className?: string
}

export function YouTubePlayer({ videoId, title = "YouTube Video", className }: YouTubePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [quality, setQuality] = useState('1080p')
  const [showSettings, setShowSettings] = useState(false)
  const [isBuffering, setIsBuffering] = useState(false)
  const [showPlaylist, setShowPlaylist] = useState(false)
  const [isTheaterMode, setIsTheaterMode] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<HTMLDivElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout>()

  // Auto-hide controls
  useEffect(() => {
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }
    
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [isPlaying, showControls])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
    setShowControls(true)
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const handleSeek = (value: number) => {
    setCurrentTime(value)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const handleMouseMove = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
  }

  const playbackSpeeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
  const qualities = ['144p', '240p', '360p', '480p', '720p', '1080p', '1440p', '2160p']

  return (
    <div 
      ref={playerRef}
      className={cn(
        "relative bg-black rounded-2xl overflow-hidden group",
        isTheaterMode ? "max-w-6xl mx-auto" : "w-full",
        isFullscreen ? "fixed inset-0 z-50 rounded-none" : "",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Container */}
      <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-black">
        {/* Mock Video */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Film className="w-24 h-24 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Video Player</p>
            <p className="text-gray-500 text-sm mt-2">Video ID: {videoId}</p>
          </div>
        </div>

        {/* Buffering Indicator */}
        <AnimatePresence>
          {isBuffering && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/50"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-3 border-red-500 border-t-transparent rounded-full"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overlay Controls */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50"
            >
              {/* Top Controls */}
              <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.h2 
                    className="text-white font-semibold text-lg"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    {title}
                  </motion.h2>
                  <div className="flex items-center gap-2">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="px-2 py-1 bg-red-600 text-white text-xs rounded-full"
                    >
                      LIVE
                    </motion.div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowPlaylist(!showPlaylist)}
                    className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <List className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <Settings className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleFullscreen}
                    className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                  >
                    {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                  </motion.button>
                </div>
              </div>

              {/* Center Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handlePlayPause}
                  className="p-6 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 text-white" />
                  ) : (
                    <Play className="w-8 h-8 text-white ml-1" />
                  )}
                </motion.button>
              </div>

              {/* Bottom Controls */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="relative h-1 bg-white/30 rounded-full overflow-hidden group/progress">
                    <motion.div
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                    <motion.div
                      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity"
                      style={{ left: `${(currentTime / duration) * 100}%` }}
                      whileHover={{ scale: 1.2 }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-white text-xs">{formatTime(currentTime)}</span>
                    <span className="text-white text-xs">{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <SkipBack className="w-4 h-4" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handlePlayPause}
                      className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <SkipForward className="w-4 h-4" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </motion.button>

                    {/* Volume Control */}
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                      >
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </motion.button>
                      <div className="w-20 h-1 bg-white/30 rounded-full overflow-hidden group/volume">
                        <motion.div
                          className="h-full bg-white rounded-full"
                          style={{ width: `${isMuted ? 0 : volume * 100}%` }}
                        />
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={isMuted ? 0 : volume}
                          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                          className="absolute inset-0 w-full opacity-0 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsTheaterMode(!isTheaterMode)}
                      className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <Film className="w-4 h-4" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-4 bg-black/90 backdrop-blur-md rounded-lg p-4 min-w-[200px] border border-white/20"
          >
            <div className="space-y-4">
              <div>
                <h3 className="text-white text-sm font-semibold mb-2">Playback Speed</h3>
                <div className="space-y-1">
                  {playbackSpeeds.map((speed) => (
                    <motion.button
                      key={speed}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPlaybackSpeed(speed)}
                      className={cn(
                        "w-full text-left px-3 py-1 rounded text-sm transition-colors",
                        playbackSpeed === speed 
                          ? "bg-red-600 text-white" 
                          : "text-gray-300 hover:bg-white/10"
                      )}
                    >
                      {speed}x
                    </motion.button>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-white text-sm font-semibold mb-2">Quality</h3>
                <div className="space-y-1">
                  {qualities.map((q) => (
                    <motion.button
                      key={q}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setQuality(q)}
                      className={cn(
                        "w-full text-left px-3 py-1 rounded text-sm transition-colors",
                        quality === q 
                          ? "bg-red-600 text-white" 
                          : "text-gray-300 hover:bg-white/10"
                      )}
                    >
                      {q}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Playlist Sidebar */}
      <AnimatePresence>
        {showPlaylist && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="absolute top-0 right-0 bottom-0 w-80 bg-black/90 backdrop-blur-md border-l border-white/20 p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Playlist</h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowPlaylist(false)}
                className="p-1 text-white hover:bg-white/20 rounded"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
            
            <div className="space-y-2 max-h-full overflow-y-auto">
              {[1, 2, 3, 4, 5].map((item) => (
                <motion.div
                  key={item}
                  whileHover={{ x: 4 }}
                  className="flex gap-3 p-2 rounded hover:bg-white/10 cursor-pointer transition-colors"
                >
                  <div className="w-20 h-12 bg-gray-700 rounded flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">Video Title {item}</p>
                    <p className="text-gray-400 text-xs">Channel Name</p>
                  </div>
                  <span className="text-gray-400 text-xs">10:23</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
