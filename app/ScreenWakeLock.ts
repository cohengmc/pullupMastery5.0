import { useState, useEffect } from 'react';

// Type definition for the Screen Wake Lock API
interface WakeLockSentinel {
  addEventListener: (type: string, listener: EventListener) => void;
  removeEventListener: (type: string, listener: EventListener) => void;
  release: () => Promise<void>;
}

interface NavigatorWithWakeLock extends Navigator {
  wakeLock?: {
    request: (type: 'screen') => Promise<WakeLockSentinel>;
  };
}

// Custom hook for managing screen wake lock
export const useWakeLock = () => {
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check for browser support
  useEffect(() => {
    const nav = navigator as NavigatorWithWakeLock;
    setIsSupported(
      'wakeLock' in navigator && 
      typeof nav.wakeLock?.request === 'function'
    );
  }, []);

  // Function to request wake lock
  const requestWakeLock = async () => {
    if (!isSupported) {
      setError('Screen Wake Lock API is not supported in this browser');
      return false;
    }

    try {
      const nav = navigator as NavigatorWithWakeLock;
      // Request a screen wake lock
      const wakeLockSentinel = await nav.wakeLock?.request('screen');
      
      if (wakeLockSentinel) {
        setWakeLock(wakeLockSentinel);
        setIsActive(true);
        setError(null);

        // Listen for release event
        const handleRelease = () => {
          setIsActive(false);
          setWakeLock(null);
        };

        wakeLockSentinel.addEventListener('release', handleRelease);
        
        // Re-request wake lock when document becomes visible again
        const handleVisibilityChange = async () => {
          if (document.visibilityState === 'visible' && !isActive) {
            const newWakeLockSentinel = await nav.wakeLock?.request('screen');
            if (newWakeLockSentinel) {
              setWakeLock(newWakeLockSentinel);
              setIsActive(true);
              newWakeLockSentinel.addEventListener('release', handleRelease);
            }
          }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        return true;
      }
      return false;
    } catch (err) {
      setError(`Error requesting wake lock: ${err instanceof Error ? err.message : String(err)}`);
      setIsActive(false);
      return false;
    }
  };

  // Function to release wake lock
  const releaseWakeLock = async () => {
    if (wakeLock) {
      try {
        await wakeLock.release();
        setIsActive(false);
        setWakeLock(null);
        return true;
      } catch (err) {
        setError(`Error releasing wake lock: ${err instanceof Error ? err.message : String(err)}`);
        return false;
      }
    }
    return false;
  };

  return {
    isSupported,
    isActive,
    error,
    requestWakeLock,
    releaseWakeLock
  };
};

// Component for using the wake lock in your application
const ScreenWakeLock: React.FC = () => {
  const { isSupported, isActive, error, requestWakeLock, releaseWakeLock } = useWakeLock();

  useEffect(() => {
    // Request wake lock when component mounts
    requestWakeLock();
    
    // Release wake lock when component unmounts
    return () => {
      releaseWakeLock();
    };
  }, []);

  // This is an invisible component that manages the wake lock
  return null;
};

export default ScreenWakeLock;