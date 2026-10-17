import {CARD_HEIGHT, CARD_WIDTH} from './tokens';

/**
 * Card carousel geometry, shared by the carousel and by overlays that must line up with its
 * centre card (the tour's highlight), so retuning the carousel moves both together.
 */

const SLOT = 0.8; // card scale relative to its design size, at a 390-wide screen
// The centre card is drawn slightly larger than the slot scale and lifted a little.
export const FRONT_CARD_SCALE = 1.03;
export const FRONT_CARD_LIFT = 8;
// Keeps the centre card at most its design size on wide screens.
const MAX_SCALE = 1 / FRONT_CARD_SCALE;
// Space above (and below) the cards inside the carousel.
export const SLOT_TOP = 12;

/**
 * Card scale for a screen width. Grows with the screen like the design, but only up to its full
 * size, so on wide phones and tablets the centre card matches the pinned card and details page.
 */
export const carouselScale = (screenWidth: number) =>
  Math.min((screenWidth / 390) * SLOT, MAX_SCALE);

/**
 * Where each card's unscaled CARD_WIDTH x CARD_HEIGHT box is laid out, before its transforms
 * (which scale it about its centre) are applied.
 */
export const slotPosition = (screenWidth: number, scale: number) => ({
  left: (screenWidth - CARD_WIDTH) / 2,
  // Scaling is about the centre, so shift up by the space the shrink leaves at the top.
  top: SLOT_TOP - (CARD_HEIGHT * (1 - scale)) / 2,
});

/**
 * Where the centre card is drawn inside the carousel, at rest, grown by `padding` on every side.
 */
export const frontCardFrame = (screenWidth: number, padding = 0) => {
  const scale = carouselScale(screenWidth);
  const slot = slotPosition(screenWidth, scale);
  const width = CARD_WIDTH * scale * FRONT_CARD_SCALE;
  const height = CARD_HEIGHT * scale * FRONT_CARD_SCALE;
  const centreX = slot.left + CARD_WIDTH / 2;
  const centreY = slot.top + CARD_HEIGHT / 2 - FRONT_CARD_LIFT;
  return {
    left: centreX - width / 2 - padding,
    top: centreY - height / 2 - padding,
    width: width + 2 * padding,
    height: height + 2 * padding,
  };
};
