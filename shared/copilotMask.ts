import {Animated} from 'react-native';

// react-native-copilot's default svgMaskPath cuts a sharp-cornered rectangle
// out of the dimmed overlay to highlight the target element. This variant
// rounds the cutout to match the app's rounded UI: a roughly square target (a
// round button) gets a circle, anything longer (a tab, a card) gets corners of
// at most MAX_CORNER_RADIUS, so a tab becomes a pill and a card stays a card.
const MAX_CORNER_RADIUS = 24;

/**
 * The highlight around a tour step: the cutout is `padding` larger than the element on every
 * side, the ring runs along the cutout's outer edge, and the halo sits `haloGap` beyond the ring.
 */
export const COPILOT_HIGHLIGHT = {
  padding: 4,
  ringColor: '#5BC8E8',
  ringWidth: 4,
  // A light tint of ringColor.
  haloColor: 'rgba(91, 200, 232, 0.3)',
  haloWidth: 8,
  haloGap: 4,
};

/** Corner radius for a highlight cutout of this size; the ring and the cutout share it. */
export const highlightCornerRadius = (width: number, height: number) => {
  const isRoundish = Math.abs(width - height) <= 0.2 * Math.max(width, height);
  return isRoundish
    ? Math.min(width, height) / 2
    : Math.min(MAX_CORNER_RADIUS, width / 2, height / 2);
};

/** Overlay settings shared by every CopilotProvider, so the tour looks the same everywhere. */
// Space between the outer edge of the halo and the tooltip.
const TOOLTIP_GAP = 12;

export const COPILOT_OVERLAY_PROPS = {
  // The ring and halo already mark the element, so the tooltip has no pointer arrow.
  arrowColor: 'transparent',
  backdropColor: 'rgba(28, 36, 48, 0.62)',
  // How far the tooltip sits from the highlighted element: past the cutout padding, ring and
  // halo, plus a gap, so it never covers the halo.
  margin:
    COPILOT_HIGHLIGHT.padding +
    COPILOT_HIGHLIGHT.ringWidth +
    COPILOT_HIGHLIGHT.haloGap +
    COPILOT_HIGHLIGHT.haloWidth +
    TOOLTIP_GAP,
};

interface SvgMaskPathParams {
  size: {x: Animated.Value; y: Animated.Value};
  position: {x: Animated.Value; y: Animated.Value};
  canvasSize: {x: number; y: number};
}

/** The cutout around a step: the element grown by the highlight padding on every side. */
const cutoutFor = ({size, position}: Omit<SvgMaskPathParams, 'canvasSize'>) => {
  // @ts-ignore _value is a private field on Animated.Value, matching the
  // access pattern used by react-native-copilot's own defaultSvgMaskPath.
  const positionX: number = position.x._value;
  // @ts-ignore
  const positionY: number = position.y._value;
  // @ts-ignore
  const sizeX: number = size.x._value;
  // @ts-ignore
  const sizeY: number = size.y._value;

  const pad = COPILOT_HIGHLIGHT.padding;
  return {
    left: positionX - pad,
    top: positionY - pad,
    right: positionX + sizeX + pad,
    bottom: positionY + sizeY + pad,
    radius: highlightCornerRadius(sizeX + 2 * pad, sizeY + 2 * pad),
  };
};

/** A rounded rectangle `outset` outside the cutout, keeping its corners concentric. */
const roundedRectPath = (
  cutout: ReturnType<typeof cutoutFor>,
  outset = 0,
): string => {
  const left = cutout.left - outset;
  const top = cutout.top - outset;
  const right = cutout.right + outset;
  const bottom = cutout.bottom + outset;
  const radius = cutout.radius + outset;
  return (
    `M${left + radius},${top}` +
    `H${right - radius}` +
    `Q${right},${top} ${right},${top + radius}` +
    `V${bottom - radius}` +
    `Q${right},${bottom} ${right - radius},${bottom}` +
    `H${left + radius}` +
    `Q${left},${bottom} ${left},${bottom - radius}` +
    `V${top + radius}` +
    `Q${left},${top} ${left + radius},${top}Z`
  );
};

export const roundedSvgMaskPath = ({
  size,
  position,
  canvasSize,
}: SvgMaskPathParams): string =>
  `M0,0H${canvasSize.x}V${canvasSize.y}H0V0Z` +
  roundedRectPath(cutoutFor({size, position}));

/**
 * The ring along the cutout's outer edge and the soft halo outside it, stroked over the overlay
 * by our patch of react-native-copilot's SvgMask (patches/react-native-copilot+3.3.2.patch),
 * which looks for this property on the svgMaskPath it is given. A stroke is centred on its path,
 * so each path sits half its width outside where the band should start.
 */
roundedSvgMaskPath.highlightPaths = ({size, position}: SvgMaskPathParams) => {
  const cutout = cutoutFor({size, position});
  const {ringWidth, ringColor, haloGap, haloWidth, haloColor} =
    COPILOT_HIGHLIGHT;
  return [
    {
      d: roundedRectPath(cutout, ringWidth + haloGap + haloWidth / 2),
      stroke: haloColor,
      strokeWidth: haloWidth,
    },
    {
      d: roundedRectPath(cutout, ringWidth / 2),
      stroke: ringColor,
      strokeWidth: ringWidth,
    },
  ];
};
