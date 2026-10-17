import {useEffect, useRef, useState} from 'react';
import {AppState} from 'react-native';
import {MMKV} from '../../shared/storage';

const AUTO_LOCK_KEY = 'settings.autoLockMinutes';

/** Minutes in the background before the wallet locks; 0 means never. */
export const AUTO_LOCK_OPTIONS = [1, 5, 15, 0];
/** Off until the holder turns it on, so nobody is locked out by an update. */
const DEFAULT_MINUTES = 0;

export function readAutoLockMinutes(): number {
  const stored = MMKV.getInt(AUTO_LOCK_KEY);
  return typeof stored === 'number' && AUTO_LOCK_OPTIONS.includes(stored)
    ? stored
    : DEFAULT_MINUTES;
}

/** A clock moved back while away gives a negative time; that locks too. */
export function shouldLock(awayMs: number, minutes: number): boolean {
  return minutes > 0 && (awayMs < 0 || awayMs >= minutes * 60_000);
}

export function useAutoLockSetting(): [number, (minutes: number) => void] {
  const [minutes, setMinutes] = useState(readAutoLockMinutes);
  const update = (next: number) => {
    MMKV.setInt(AUTO_LOCK_KEY, next);
    setMinutes(next);
  };
  return [minutes, update];
}

/**
 * Whether the wallet should be locked: true once it comes back to the foreground after spending
 * longer than the chosen time in the background. The screens underneath stay as they were.
 */
export function useAutoLock(): [boolean, () => void] {
  const [locked, setLocked] = useState(false);
  const leftAt = useRef<number | null>(null);

  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state === 'background') {
        leftAt.current = Date.now();
        return;
      }
      if (state !== 'active' || leftAt.current === null) return;
      const away = Date.now() - leftAt.current;
      leftAt.current = null;
      if (shouldLock(away, readAutoLockMinutes())) setLocked(true);
    });
    return () => sub.remove();
  }, []);

  return [locked, () => setLocked(false)];
}
