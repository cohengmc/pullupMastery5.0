'use client';

import { useEffect, useRef } from 'react';

export const WakeLock = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleUserInteraction = () => {
      const video = videoRef.current;
      if (video && video.paused) {
        video.play().catch((err) => {
          console.error('Video play failed:', err);
        });
      }
    };

    // Add event listeners for user interaction
    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('touchstart', handleUserInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      id="wakeLockVideo"
      muted
      playsInline
      autoPlay
      loop
      style={{ display: 'none' }}
    >
      <source src="/silent.mp4" type="video/mp4" />
    </video>
  );
}; 