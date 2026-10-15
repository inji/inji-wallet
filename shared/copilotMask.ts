import {Animated} from 'react-native';

// react-native-copilot's default svgMaskPath cuts a sharp-cornered rectangle
// out of the dimmed overlay to highlight the target element. This variant
// rounds the cutout to match the app's rounded UI: a roughly square target (a
// round button) gets a circle, anything longer (a tab, a card) gets corners of
// at most MAX_CORNER_RADIUS, so a tab becomes a pill and a card stays a card.
const MAX_CORNER_RADIUS = 24;

/** Overlay settings shared by every CopilotProvider, so the tour looks the same everywhere. */
export const COPILOT_OVERLAY_PROPS = {
  arrowColor: '#FFFFFF',
  arrowSize: 10,
  backdropColor: 'rgba(28, 36, 48, 0.62)',
};

interface SvgMaskPathParams {
  size: {x: Animated.Value; y: Animated.Value};
  position: {x: Animated.Value; y: Animated.Value};
  canvasSize: {x: number; y: number};
}

export const roundedSvgMaskPath = ({
  size,
  position,
  canvasSize,
}: SvgMaskPathParams): string => {
  // @ts-ignore _value is a private field on Animated.Value, matching the
  // access pattern used by react-native-copilot's own defaultSvgMaskPath.
  const positionX = position.x._value;
  // @ts-ignore
  const positionY = position.y._value;
  // @ts-ignore
  const sizeX = size.x._value;
  // @ts-ignore
  const sizeY = size.y._value;

  const isRoundish = Math.abs(sizeX - sizeY) <= 0.2 * Math.max(sizeX, sizeY);
  const radius = isRoundish
    ? Math.min(sizeX, sizeY) / 2
    : Math.min(MAX_CORNER_RADIUS, sizeX / 2, sizeY / 2);

  const left = positionX;
  const top = positionY;
  const right = positionX + sizeX;
  const bottom = positionY + sizeY;

  const roundedRect =
    `M${left + radius},${top}` +
    `H${right - radius}` +
    `Q${right},${top} ${right},${top + radius}` +
    `V${bottom - radius}` +
    `Q${right},${bottom} ${right - radius},${bottom}` +
    `H${left + radius}` +
    `Q${left},${bottom} ${left},${bottom - radius}` +
    `V${top + radius}` +
    `Q${left},${top} ${left + radius},${top}Z`;

  return `M0,0H${canvasSize.x}V${canvasSize.y}H0V0Z${roundedRect}`;
};
