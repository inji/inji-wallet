import {useEffect, useRef, useState} from 'react';
import {AppState} from 'react-native';
import {MMKV} from '../../shared/storage';

const AUTO_LOCK_KEY = 'settings.autoLockMinutes';

/** Minutes in the background before the wallet locks; 0 means never. */
export const AUTO_LOCK_OPTIONS = [1, 5, 15, 0];
const DEFAULT_MINUTES = 1;

export function readAutoLockMinutes(): number {
  const stored = MMKV.getInt(AUTO_LOCK_KEY);
  return typeof stored === 'number' && AUTO_LOCK_OPTIONS.includes(stored)
    ? stored
    : DEFAULT_MINUTES;
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
      const minutes = readAutoLockMinutes();
      if (minutes > 0 && away >= minutes * 60_000) setLocked(true);
    });
    return () => sub.remove();
  }, []);

  return [locked, () => setLocked(false)];
}
