import {ViewStyle} from 'react-native';

/**
 * CredIssuer design tokens, from the "CredIssuer Wallet — Frontend Handoff Spec"
 * (Design foundations). Screens built to the new design take every colour from here
 * instead of hard-coding hex values; only credential cards and issuer logos keep their
 * own brand colours.
 */

/** The 17 semantic colour tokens, each with a light and a dark value. */
export const ColorTokens = {
  light: {
    /** Screen background */
    canvas: '#FCFCFA',
    /** Secondary surface, pressed row, chips */
    sand: '#EEECE3',
    /** Cards, inputs, sheets */
    card: '#FFFFFF',
    /** Primary text, icons */
    ink: '#0A3970',
    /** Secondary text */
    inkMuted: '#4F4F4F',
    /** Dividers, hairlines */
    line: '#C6C4BE',
    /** Input borders */
    lineStrong: '#8B877B',
    /** Links, focus ring, info accents */
    azureInk: '#157398',
    /** Selected state, ghost-button border */
    sel: '#0A3970',
    /** Success, verified, checkboxes */
    pass: '#0F6B5A',
    /** Warnings, expiring, "Stored" */
    warn: '#8A5A00',
    /** Errors, declined, revoked */
    fail: '#B3261E',
    /** Icon circles, info banners */
    tintAzure: '#E3EEF4',
    /** Success banners and pills */
    tintPass: '#E2EFEC',
    /** Warning banners and pills */
    tintWarn: '#F5EAD6',
    /** Skeletons, quiet fills */
    ghost1: '#F6F5F0',
    ghost2: '#F2F1EA',
  },
  dark: {
    canvas: '#080D13',
    sand: '#131D28',
    card: '#1A2734',
    ink: '#EDF2F7',
    inkMuted: '#A8B6C6',
    line: '#2B3744',
    lineStrong: '#647486',
    azureInk: '#4AB6E0',
    sel: '#4AB6E0',
    pass: '#5FD4B4',
    warn: '#E7B55A',
    fail: '#FF9B90',
    tintAzure: '#14324A',
    tintPass: '#12352F',
    tintWarn: '#3A2E14',
    ghost1: '#0F1720',
    ghost2: '#111A24',
  },
};

export type ColorTokenSet = typeof ColorTokens.light;

/** Returns `hex` (#RRGGBB) as an rgba() string with the given opacity. */
export function withAlpha(hex: string, alpha: number): string {
  const value = parseInt(hex.replace('#', ''), 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const NAVY = '#0A3970';
const ON_NAVY = '#FCFCFA';
const CYAN = '#2ED9E8';

/**
 * Brand surfaces. Hero panels and primary buttons are navy with light text in both
 * themes. Cyan and mist only ever appear on navy.
 */
export const BrandColors = {
  navy: NAVY,
  onNavy: ON_NAVY,
  cyan: CYAN,
  mist: '#C3D3E6',
  /** Raised panels and rings on navy. */
  navyFill: withAlpha(ON_NAVY, 0.08),
  /** Borders and hairlines on navy. */
  navyLine: withAlpha(ON_NAVY, 0.16),
  /** Cyan halo / pill fill on navy. */
  cyanTint: withAlpha(CYAN, 0.14),
};

const navyShadow = (alpha: number) => withAlpha(NAVY, alpha);

export type ElevationToken = 'btn' | 'ghost' | 'icon' | 'card';

interface ShadowLayer {
  y: number;
  blur: number;
  alpha: number;
}

const ELEVATION_LEVELS: Record<
  ElevationToken,
  {layers: ShadowLayer[]; androidElevation: number; topHighlight?: boolean}
> = {
  /** Filled primary buttons */
  btn: {
    layers: [{y: 6, blur: 12, alpha: 0.32}],
    androidElevation: 6,
    topHighlight: true,
  },
  /** Outline and secondary buttons */
  ghost: {layers: [{y: 4, blur: 10, alpha: 0.14}], androidElevation: 3},
  /** Round icon buttons */
  icon: {layers: [{y: 6, blur: 14, alpha: 0.26}], androidElevation: 4},
  /** Selectable cards (share methods, purposes, list tiles) */
  card: {
    layers: [
      {y: 4, blur: 10, alpha: 0.1},
      {y: 16, blur: 28, alpha: 0.28},
    ],
    androidElevation: 4,
  },
};

/**
 * Elevation styles. `boxShadow` renders only on the New Architecture (Fabric); the iOS app
 * still runs the old one, which gets the main layer as classic shadow props instead.
 */
export function buildElevation(
  newArchitecture: boolean,
): Record<ElevationToken, ViewStyle> {
  const styles = {} as Record<ElevationToken, ViewStyle>;
  (Object.keys(ELEVATION_LEVELS) as ElevationToken[]).forEach(level => {
    const {layers, androidElevation, topHighlight} = ELEVATION_LEVELS[level];
    if (newArchitecture) {
      const shadows = layers.map(
        l => `0px ${l.y}px ${l.blur}px ${navyShadow(l.alpha)}`,
      );
      if (topHighlight) {
        shadows.push(`inset 0px 1px 0px ${withAlpha(ON_NAVY, 0.12)}`);
      }
      styles[level] = {boxShadow: shadows.join(', ')};
    } else {
      const main = layers[0];
      styles[level] = {
        shadowColor: NAVY,
        shadowOffset: {width: 0, height: main.y},
        shadowOpacity: main.alpha,
        shadowRadius: main.blur / 2,
        elevation: androidElevation,
      };
    }
  });
  return styles;
}

const isNewArchitecture =
  (global as {nativeFabricUIManager?: unknown}).nativeFabricUIManager != null;

export const Elevation = buildElevation(isNewArchitecture);

/**
 * Tokens for the active theme. The app has no dark mode yet, so this is the light set;
 * switch `colors` to `ColorTokens.dark` once a theme provider follows the OS setting.
 */
export const DesignTokens = {
  colors: ColorTokens.light,
  brand: BrandColors,
  elevation: Elevation,
};
