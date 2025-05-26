import { useState, useEffect } from 'react';
import { useWakeLock } from './ScreenWakeLock';

// Fallback implementation for browsers without Wake Lock API support
const useFallbackNoSleep = () => {
  const [isActive, setIsActive] = useState(false);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);

  useEffect(() => {
    // Create a hidden video element to prevent sleep
    const video = document.createElement('video');
    video.setAttribute('loop', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('muted', '');
    video.setAttribute('autoplay', '');
    video.style.width = '1px';
    video.style.height = '1px';
    video.style.position = 'absolute';
    video.style.opacity = '0';
    video.style.pointerEvents = 'none';
    video.style.zIndex = '-1';
    
    // Create a blank video source (1x1 pixel)
    const source = document.createElement('source');
    source.setAttribute('src', 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAxVtZGF0AAACrwYF//+u3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE1MiByMjg1NCBlMDhhMmVjIC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAxNyAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTMgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDExMyBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MSBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0tMiB0aHJlYWRzPTEgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hdGU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0zIGJfcHlyYW1pZD0yIGJfYWRhcHQ9MSBiX2JpYXM9MCBkaXJlY3Q9MSB3ZWlnaHRiPTEgb3Blbl9nb3A9MCB3ZWlnaHRwPTIga2V5aW50PTI1MCBrZXlpbnRfbWluPTEwIHNjZW5lY3V0PTQwIGludHJhX3JlZnJlc2g9MCByY19sb29rYWhlYWQ9NDAgcmM9Y3JmIG1idHJlZT0xIGNyZj0yMy4wIHFjb21wPTAuNjAgcXBtaW49MCBxcG1heD02OSBxcHN0ZXA9NCBpcF9yYXRpbz0xLjQwIGFxPTE6MS4wMACAAAAADGWIhAA3//728P4FNjuZQQAAAu5tb292AAAAbG12aGQAAAAAAAAAAAAAAAAAAAPoAAAAZAABAAABAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAACGHRyYWsAAABcdGtoZAAAAAMAAAAAAAAAAAAAAAEAAAAAAAAAZAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAgAAAAIAAAAAACRlZHRzAAAAHGVsc3QAAAAAAAAAAQAAAGQAAAAAAAEAAAAAAZBtZGlhAAAAIG1kaGQAAAAAAAAAAAAAAAAAACgAAAAEAFXEAAAAAAAtaGRscgAAAAAAAAAAdmlkZQAAAAAAAAAAAAAAAFZpZGVvSGFuZGxlcgAAAAE7bWluZgAAABR2bWhkAAAAAQAAAAAAAAAAAAAAJGRpbmYAAAAcZHJlZgAAAAAAAAABAAAADHVybCAAAAABAAAA+3N0YmwAAACXc3RzZAAAAAAAAAABAAAAh2F2YzEAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAgACAEgAAABIAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY//8AAAAxYXZjQwFkAAr/4QAYZ2QACqzZX4iIhAAAAwAEAAADAFA8SJZYAQAGaOvjyyLAAAAAGHN0dHMAAAAAAAAAAQAAAAEAAAQAAAAAHHN0c2MAAAAAAAAAAQAAAAEAAAABAAAAAQAAABRzdHN6AAAAAAAAAsUAAAABAAAAFHN0Y28AAAAAAAAAAQAAADAAAABidWR0YQAAAFptZXRhAAAAAAAAACFoZGxyAAAAAAAAAABtZGlyYXBwbAAAAAAAAAAAAAAAAC1pbHN0AAAAJal0b28AAAAdZGF0YQAAAAEAAAAATGF2ZjU3LjQxLjEwMA==');
    source.setAttribute('type', 'video/mp4');
    
    video.appendChild(source);
    setVideoElement(video);

    return () => {
      if (videoElement) {
        videoElement.pause();
        if (videoElement.parentNode) {
          videoElement.parentNode.removeChild(videoElement);
        }
      }
    };
  }, []);

  const enableNoSleep = () => {
    if (videoElement && !isActive) {
      document.body.appendChild(videoElement);
      videoElement.play().catch(e => console.error('Failed to play video fallback:', e));
      setIsActive(true);
    }
  };

  const disableNoSleep = () => {
    if (videoElement && isActive) {
      videoElement.pause();
      if (videoElement.parentNode) {
        videoElement.parentNode.removeChild(videoElement);
      }
      setIsActive(false);
    }
  };

  return {
    isActive,
    enableNoSleep,
    disableNoSleep
  };
};

// Combined component that uses Wake Lock API with fallback
const WakeLockWithFallback: React.FC = () => {
  // Try the modern Wake Lock API first
  const { 
    isSupported, 
    isActive: isWakeLockActive, 
    requestWakeLock, 
    releaseWakeLock 
  } = useWakeLock();
  
  // Fallback for unsupported browsers
  const { 
    isActive: isFallbackActive, 
    enableNoSleep, 
    disableNoSleep 
  } = useFallbackNoSleep();

  // Initial wake lock request
  useEffect(() => {
    const initializeWakeLock = async () => {
      if (isSupported) {
        await requestWakeLock();
      } else {
        enableNoSleep();
      }
    };

    initializeWakeLock();

    // Clean up on unmount
    return () => {
      if (isSupported) {
        releaseWakeLock();
      } else {
        disableNoSleep();
      }
    };
  }, [isSupported]);

  // Handle visibility changes and page focus
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        if (isSupported) {
          await requestWakeLock();
        } else {
          enableNoSleep();
        }
      }
    };

    const handleFocus = async () => {
      if (isSupported) {
        await requestWakeLock();
      } else {
        enableNoSleep();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isSupported]);

  // Handle user interactions for iOS
  useEffect(() => {
    const handleUserInteraction = async () => {
      if (!isSupported && !isFallbackActive) {
        enableNoSleep();
      } else if (isSupported && !isWakeLockActive) {
        await requestWakeLock();
      }
    };

    // Add event listeners for common user interactions
    const events = ['click', 'touchstart', 'keypress', 'mousemove'];
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [isSupported, isFallbackActive, isWakeLockActive]);

  // Periodic wake lock check and re-request
  useEffect(() => {
    const checkAndReRequestWakeLock = async () => {
      if (isSupported && !isWakeLockActive) {
        await requestWakeLock();
      } else if (!isSupported && !isFallbackActive) {
        enableNoSleep();
      }
    };

    const interval = setInterval(checkAndReRequestWakeLock, 5000);
    return () => clearInterval(interval);
  }, [isSupported, isWakeLockActive, isFallbackActive]);

  return null;
};

export default WakeLockWithFallback;