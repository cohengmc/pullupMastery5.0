'use client';

import { useState } from "react";
import WakeLockWithFallback from "../WakeLockWithFallback";
import { useWakeLock } from "../ScreenWakeLock";

export const WakeLockControl = () => {
  const [keepScreenOn, setKeepScreenOn] = useState(true);
  const { isSupported } = useWakeLock();

  return (
    <>
      {keepScreenOn && <WakeLockWithFallback />}
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-background/80 backdrop-blur-sm p-2 rounded-lg shadow-lg">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={keepScreenOn}
            onChange={(e) => setKeepScreenOn(e.target.checked)}
            className="h-4 w-4"
          />
          Keep screen on
        </label>
        {!isSupported && (
          <span className="text-xs text-muted-foreground">
            (Using fallback)
          </span>
        )}
      </div>
    </>
  );
}; 