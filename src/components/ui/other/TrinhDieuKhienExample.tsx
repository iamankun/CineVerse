import React, { useState, useRef } from 'react';
import TrinhDieuKhien from './TrinhDieuKhien';

/**
 * Example usage of TrinhDieuKhien component
 * This shows how to integrate the new control into a player
 */
const TrinhDieuKhienExample: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const handleOpenSource = () => {
    console.log('📺 Mở nguồn phát');
    // Add your source selection logic here
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    console.log('🖥️ Toggle fullscreen:', !isFullscreen);
    // Add your fullscreen logic here
  };

  const handleReload = () => {
    console.log('🔄 Reload player');
    // Add your reload logic here
  };

  const handleToggleSound = () => {
    setIsMuted(!isMuted);
    console.log('🔊 Toggle sound:', !isMuted);
    // Add your sound toggle logic here
  };

  const handleSettings = () => {
    console.log('⚙️ Open settings');
    // Add your settings logic here
  };

  return (
    <div 
      ref={playerContainerRef}
      className="relative w-full h-screen bg-black"
    >
      {/* Your existing player content goes here */}
      <div className="flex items-center justify-center h-full">
        <p className="text-white text-xl">Player Content Area</p>
      </div>

      {/* New TrinhDieuKhien control */}
      <TrinhDieuKhien
        onOpenSource={handleOpenSource}
        onToggleFullscreen={handleToggleFullscreen}
        onReload={handleReload}
        onToggleSound={handleToggleSound}
        onSettings={handleSettings}
        isFullscreen={isFullscreen}
        isMuted={isMuted}
        playerContainerRef={playerContainerRef}
      />
    </div>
  );
};

export default TrinhDieuKhienExample;
