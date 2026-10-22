import { useEffect, useRef, useState } from 'react';

export function useWakeLock(isActive: boolean) {
  const [isLocked, setIsLocked] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    let released = false;

    async function requestLock() {
      if (typeof window === 'undefined' || !('wakeLock' in navigator)) {
        return;
      }

      try {
        if (!wakeLockRef.current) {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
          if (!released) {
            setIsLocked(true);
            wakeLockRef.current.addEventListener('release', () => {
              setIsLocked(false);
              wakeLockRef.current = null;
            });
          } else {
            wakeLockRef.current.release();
            wakeLockRef.current = null;
          }
        }
      } catch {
        // WakeLock request might be rejected if low battery or tab in background
        setIsLocked(false);
      }
    }

    async function releaseLock() {
      released = true;
      if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release();
        } catch {
          // ignore
        }
        wakeLockRef.current = null;
        setIsLocked(false);
      }
    }

    if (isActive) {
      requestLock();
    } else {
      releaseLock();
    }

    // Handle visibility change (re-acquire lock if page becomes visible while running)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isActive) {
        requestLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseLock();
    };
  }, [isActive]);

  return isLocked;
}
