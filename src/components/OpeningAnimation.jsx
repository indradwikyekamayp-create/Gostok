import React, { useState, useEffect } from 'react';

const OpeningAnimation = ({ onComplete }) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const totalFrames = 40;
  const frameDuration = 70; // ~14 FPS

  // Generate paths
  const frames = Array.from({ length: totalFrames }, (_, i) => 
    `/Logo_animation/Logo_animation_storyboard_202608220242_${String(i).padStart(3, '0')}.jpg`
  );

  useEffect(() => {
    let loadedCount = 0;
    const preloadPromises = frames.map((src) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          loadedCount++;
          resolve();
        };
        img.onerror = resolve; // just resolve to avoid hanging
      });
    });

    Promise.all(preloadPromises).then(() => {
      setIsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    const timer = setInterval(() => {
      setCurrentFrame((prev) => {
        if (prev >= totalFrames - 1) {
          clearInterval(timer);
          setTimeout(() => onComplete(), 300);
          return prev;
        }
        return prev + 1;
      });
    }, frameDuration);

    return () => clearInterval(timer);
  }, [isLoaded, onComplete]);

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
      {isLoaded ? (
        frames.map((src, index) => (
          <img 
            key={index}
            src={src} 
            alt="Logo Animation Frame" 
            style={{ 
              width: '100vw', 
              height: '100vh', 
              objectFit: 'cover',
              objectPosition: 'center',
              display: currentFrame === index ? 'block' : 'none'
            }} 
          />
        ))
      ) : null}
    </div>
  );
};

export default OpeningAnimation;
