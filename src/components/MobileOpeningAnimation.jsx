import React, { useState, useEffect } from 'react';

const totalFrames = 40;
const frameDuration = 75; // ~13.3 FPS for 40 frames over 3 seconds
const folderPath = '/Logo_animation/Mobile_version/Create_AyoStock_splash_screen_an._202608220301_000';
const prefix = 'Create_AyoStock_splash_screen_an._202608220301_';

// Generate paths (000 to 039)
const frames = Array.from({ length: totalFrames }, (_, i) => 
  `${folderPath}/${prefix}${String(i).padStart(3, '0')}.jpg`
);

const MobileOpeningAnimation = ({ onComplete }) => {
  const [currentFrame, setCurrentFrame] = useState(0);

  useEffect(() => {
    // We start playing immediately, streaming frames as they load
    const timer = setInterval(() => {
      setCurrentFrame((prev) => {
        if (prev >= totalFrames - 1) {
          clearInterval(timer);
          setTimeout(() => onComplete(), 100);
          return prev;
        }
        return prev + 1;
      });
    }, frameDuration);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: '#ffffff',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {frames.map((src, index) => (
        <img 
          key={index}
          src={src} 
          alt={`Splash ${index}`}
          style={{ 
            width: '100vw', 
            height: '100vh', 
            objectFit: 'contain', // Di-paskan penuh tanpa terpotong
            objectPosition: 'center', // Di-tengah
            display: currentFrame === index ? 'block' : 'none'
          }} 
        />
      ))}
    </div>
  );
};

export default MobileOpeningAnimation;
