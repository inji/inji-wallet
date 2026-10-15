import React from 'react';
import Svg, {Path} from 'react-native-svg';

/**
 * Outlined shield with a tick, plus or cross (Lucide `shield-check` / `shield-plus` /
 * `shield-x`); the icon fonts only have filled or heavier variants.
 */
export const ShieldIcon: React.FC<{
  mark: 'check' | 'plus' | 'x';
  size: number;
  color: string;
  strokeWidth?: number;
}> = ({mark, size, color, strokeWidth = 2}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round">
    <Path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    {mark === 'check' && <Path d="m9 12 2 2 4-4" />}
    {mark === 'plus' && (
      <>
        <Path d="M9 12h6" />
        <Path d="M12 9v6" />
      </>
    )}
    {mark === 'x' && (
      <>
        <Path d="m14.5 9.5-5 5" />
        <Path d="m9.5 9.5 5 5" />
      </>
    )}
  </Svg>
);
