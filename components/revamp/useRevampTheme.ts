import {useEffect, useState} from 'react';
import {AccessibilityInfo, useColorScheme} from 'react-native';
import {colors, RevampColors, RevampScheme} from './tokens';

export interface RevampTheme {
  scheme: RevampScheme;
  c: RevampColors;
  /** The system asks for less motion: skip decorative animation, keep state changes instant. */
  reduceMotion: boolean;
}

/**
 * Off until the rest of the app has a dark theme too; a dark home among light screens would
 * look broken.
 */
const FOLLOW_SYSTEM_SCHEME = false;

export function useRevampTheme(): RevampTheme {
  const system = useColorScheme();
  const scheme: RevampScheme =
    FOLLOW_SYSTEM_SCHEME && system === 'dark' ? 'dark' : 'light';
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );
    return () => sub.remove();
  }, []);

  return {scheme, c: colors[scheme], reduceMotion};
}
