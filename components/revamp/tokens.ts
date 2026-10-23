import {Easing} from 'react-native';

/**
 * Design tokens for the revamped screens: colours, type, shape, elevation and motion.
 *
 * Screens take every colour, font and timing from here. Swapping the typeface (Clash Grotesk once
 * its files are in the app) is a change to `fonts` alone.
 */

export type RevampScheme = 'light' | 'dark';

export interface RevampColors {
  canvas: string;
  sand: string;
  card: string;
  ink: string;
  inkMuted: string;
  line: string;
  lineStrong: string;
  azureInk: string;
  pass: string;
  warn: string;
  fail: string;
  /** The stack view's expired-status orange. */
  expired: string;
  sel: string;
  tintAzure: string;
  tintPass: string;
  tintWarn: string;
  /** Filled primary action: navy in both schemes. */
  primary: string;
  onPrimary: string;
}

export const colors: Record<RevampScheme, RevampColors> = {
  light: {
    canvas: '#fcfcfa',
    sand: '#eeece3',
    card: '#ffffff',
    ink: '#0a3970',
    inkMuted: '#4f4f4f',
    line: '#c6c4be',
    lineStrong: '#8b877b',
    azureInk: '#157398',
    pass: '#0f6b5a',
    warn: '#8a5a00',
    fail: '#b3261e',
    expired: '#E27835',
    sel: '#0a3970',
    tintAzure: '#e3eef4',
    tintPass: '#e2efec',
    tintWarn: '#f5ead6',
    primary: '#0a3970',
    onPrimary: '#fcfcfa',
  },
  dark: {
    canvas: '#080d13',
    sand: '#131d28',
    card: '#1a2734',
    ink: '#edf2f7',
    inkMuted: '#a8b6c6',
    line: '#2b3744',
    lineStrong: '#647486',
    azureInk: '#4ab6e0',
    pass: '#5fd4b4',
    warn: '#e7b55a',
    fail: '#ff9b90',
    expired: '#E27835',
    sel: '#4ab6e0',
    tintAzure: '#14324a',
    tintPass: '#12352f',
    tintWarn: '#3a2e14',
    primary: '#0a3970',
    onPrimary: '#fcfcfa',
  },
};

export const fonts = {
  regular: 'Montserrat_400Regular',
  medium: 'Montserrat_500Medium',
  semibold: 'Montserrat_600SemiBold',
  bold: 'Montserrat_700Bold',
  mono: 'monospace',
};

export const radii = {
  card: 16,
  surface: 16,
  pill: 100,
  chip: 10,
};

/**
 * Small labels in rows of equal slots (tabs, actions) shrink together on screens narrower than
 * the design, so neighbours keep the same size instead of each shrinking on its own.
 */
/** How far labels in fixed-width slots (tabs, action buttons) may grow with the system font size. */
export const SLOT_LABEL_MAX_SCALE = 1.15;

export const narrowTextScale = (screenWidth: number) =>
  Math.min(1, Math.max(0.8, screenWidth / 375));

/** Card size in the design; the carousel scales it to the screen width. */
export const CARD_WIDTH = 342;
export const CARD_HEIGHT = 216;

export const shadows = {
  card: {
    shadowColor: '#0a3970',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: {width: 0, height: 14},
    elevation: 10,
  },
  raised: {
    shadowColor: '#0a3970',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 6},
    elevation: 4,
  },
};

/** Curves and timings taken from the design's CSS. */
export const motion = {
  /** Cards settling after a swipe: overshoots slightly. */
  settle: {duration: 620, easing: Easing.bezier(0.18, 0.89, 0.32, 1.12)},
  flip: {duration: 750, easing: Easing.bezier(0.3, 0.7, 0.2, 1)},
  rise: {duration: 450, easing: Easing.bezier(0.2, 0.8, 0.2, 1)},
  pager: {duration: 400, easing: Easing.bezier(0.2, 0.9, 0.25, 1.1)},
};
