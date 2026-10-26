import React from 'react';
import Svg, {Circle, Path, Rect} from 'react-native-svg';

interface IconProps {
  color: string;
  size?: number;
  strokeWidth?: number;
  filled?: boolean;
}

const base = (size: number, color: string, strokeWidth: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: color,
  strokeWidth,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export const ShareIcon: React.FC<IconProps> = ({
  color,
  size = 22,
  strokeWidth = 1.5,
}) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Circle cx={18} cy={5} r={3} />
    <Circle cx={6} cy={12} r={3} />
    <Circle cx={18} cy={19} r={3} />
    <Path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
  </Svg>
);

export const QrIcon: React.FC<IconProps> = ({
  color,
  size = 22,
  strokeWidth = 1.5,
}) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Rect x={3} y={3} width={7} height={7} rx={1} />
    <Rect x={14} y={3} width={7} height={7} rx={1} />
    <Rect x={3} y={14} width={7} height={7} rx={1} />
    <Path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3" />
  </Svg>
);

export const PinIcon: React.FC<IconProps> = ({
  color,
  size = 22,
  strokeWidth = 1.6,
  filled,
}) => (
  <Svg {...base(size, color, strokeWidth)} fill={filled ? color : 'none'}>
    <Path d="M9 3h6l-1 6 4 4v2H6v-2l4-4z" />
    <Path d="M12 15v6" />
  </Svg>
);

export const ActivityIcon: React.FC<IconProps> = ({
  color,
  size = 22,
  strokeWidth = 1.5,
}) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
    <Path d="M3 3v5h5M12 7v5l4 2" />
  </Svg>
);

export const TrashIcon: React.FC<IconProps> = ({
  color,
  size = 20,
  strokeWidth = 1.5,
}) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
  </Svg>
);

export const FlipIcon: React.FC<IconProps> = ({
  color,
  size = 15,
  strokeWidth = 1.6,
}) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
    <Path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
    <Path d="M21 3v5h-5M3 21v-5h5" />
  </Svg>
);

export const ChevronIcon: React.FC<
  IconProps & {direction: 'left' | 'right'}
> = ({color, size = 18, strokeWidth = 1.8, direction}) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Path d={direction === 'left' ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'} />
  </Svg>
);

export const ShieldCheckIcon: React.FC<IconProps> = ({
  color,
  size = 14,
  strokeWidth = 2,
}) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <Path d="m9 12 2 2 4-4" />
  </Svg>
);

export const AlertIcon: React.FC<IconProps> = ({
  color,
  size = 16,
  strokeWidth = 2,
}) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Circle cx={12} cy={12} r={9.5} />
    <Path d="M12 7.5v5.5M12 16.5v.01" />
  </Svg>
);

export const PlusIcon: React.FC<IconProps> = ({
  color,
  size = 22,
  strokeWidth = 1.8,
}) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Path d="M12 5v14M5 12h14" />
  </Svg>
);

export const SearchIcon: React.FC<IconProps> = ({
  color,
  size = 20,
  strokeWidth = 1.9,
}) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Circle cx={11} cy={11} r={6.5} />
    <Path d="m20 20-4-4" />
  </Svg>
);

export const MoreIcon: React.FC<IconProps> = ({color, size = 20}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Circle cx={5} cy={12} r={1.8} />
    <Circle cx={12} cy={12} r={1.8} />
    <Circle cx={19} cy={12} r={1.8} />
  </Svg>
);

export const CloseIcon: React.FC<IconProps> = ({
  color,
  size = 18,
  strokeWidth = 1.8,
}) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Path d="M18 6 6 18M6 6l12 12" />
  </Svg>
);

export const UserIcon: React.FC<IconProps> = ({
  color,
  size = 20,
  strokeWidth = 1.6,
}) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Circle cx={12} cy={8} r={4} />
    <Path d="M4 21c1-4 4.5-6 8-6s7 2 8 6" />
  </Svg>
);

export const BellIcon: React.FC<IconProps> = ({
  color,
  size = 20,
  strokeWidth = 1.6,
}) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <Path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </Svg>
);

export const StackIcon: React.FC<IconProps> = ({
  color,
  size = 20,
  strokeWidth = 1.6,
}) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Rect x={4} y={3} width={16} height={6} rx={1.5} />
    <Rect x={4} y={11} width={16} height={4} rx={1.5} />
    <Rect x={4} y={17} width={16} height={4} rx={1.5} />
  </Svg>
);

export const CarouselIcon: React.FC<IconProps> = ({
  color,
  size = 20,
  strokeWidth = 1.6,
}) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Rect x={6} y={5} width={12} height={14} rx={2} />
    <Path d="M3 7v10M21 7v10" />
  </Svg>
);

export const SparkIcon: React.FC<IconProps> = ({
  color,
  size = 20,
  strokeWidth = 1.6,
}) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />
  </Svg>
);

export const BackIcon: React.FC<IconProps> = ({
  color,
  size = 22,
  strokeWidth = 1.5,
}) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Path d="M19 12H5M12 19l-7-7 7-7" />
  </Svg>
);

export const ArrowRightIcon: React.FC<IconProps> = ({
  color,
  size = 14,
  strokeWidth = 1.7,
}) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);

export const HomeIcon: React.FC<IconProps> = ({
  color,
  size = 22,
  strokeWidth = 1.6,
  filled,
}) => (
  <Svg {...base(size, color, strokeWidth)} fill={filled ? color : 'none'}>
    <Path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
  </Svg>
);

export const IssuersIcon: React.FC<IconProps> = ({
  color,
  size = 22,
  strokeWidth = 1.6,
}) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Path d="M3 21h18M5 21V11M9.5 21V11M14.5 21V11M19 21V11" />
    <Path d="M2 11 12 4l10 7z" />
  </Svg>
);

export const SettingsIcon: React.FC<IconProps> = ({
  color,
  size = 22,
  strokeWidth = 1.6,
}) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />
  </Svg>
);

export const ScanIcon: React.FC<IconProps> = ({
  color,
  size = 28,
  strokeWidth = 1.8,
}) => (
  <Svg {...base(size, color, strokeWidth)}>
    <Path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
    <Rect x={7.5} y={7.5} width={3.5} height={3.5} rx={0.6} />
    <Rect x={13} y={7.5} width={3.5} height={3.5} rx={0.6} />
    <Rect x={7.5} y={13} width={3.5} height={3.5} rx={0.6} />
    <Path d="M13 13h3.5v3.5" />
  </Svg>
);
