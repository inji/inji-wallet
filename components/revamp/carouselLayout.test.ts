import {
  carouselScale,
  FRONT_CARD_LIFT,
  FRONT_CARD_SCALE,
  frontCardFrame,
  slotPosition,
} from './carouselLayout';
import {CARD_HEIGHT, CARD_WIDTH} from './tokens';

// What the carousel draws for its centre card at rest: the card's slot box, scaled about its
// centre by `scale * FRONT_CARD_SCALE` and moved up by FRONT_CARD_LIFT (see CarouselCard).
const drawnCentreCard = (screenWidth: number) => {
  const scale = carouselScale(screenWidth);
  const {left, top} = slotPosition(screenWidth, scale);
  const width = CARD_WIDTH * scale * FRONT_CARD_SCALE;
  const height = CARD_HEIGHT * scale * FRONT_CARD_SCALE;
  return {
    left: left + (CARD_WIDTH - width) / 2,
    top: top + (CARD_HEIGHT - height) / 2 - FRONT_CARD_LIFT,
    width,
    height,
  };
};

const expectFrame = (actual: object, expected: Record<string, number>) =>
  Object.entries(expected).forEach(([key, value]) =>
    expect(actual[key]).toBeCloseTo(value, 3),
  );

describe('frontCardFrame', () => {
  it.each([360, 390, 428, 768])(
    'matches the drawn centre card on a %i-wide screen',
    screenWidth => {
      expectFrame(frontCardFrame(screenWidth), drawnCentreCard(screenWidth));
    },
  );

  it.each([360, 390, 428, 768])(
    'is horizontally centred on a %i-wide screen',
    screenWidth => {
      const {left, width} = frontCardFrame(screenWidth);
      expect(left + width / 2).toBeCloseTo(screenWidth / 2, 3);
    },
  );

  it('uses the design size at 390 wide', () => {
    // scale 0.8, centre card 1.03x that.
    expectFrame(frontCardFrame(390), {
      left: 54.096,
      top: 1.408,
      width: 281.808,
      height: 177.984,
    });
  });

  it('caps the centre card at its design size on a tablet', () => {
    expectFrame(frontCardFrame(768), {
      left: 213,
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
    });
  });

  it('grows by the padding on every side', () => {
    const frame = frontCardFrame(390);
    expectFrame(frontCardFrame(390, 6), {
      left: frame.left - 6,
      top: frame.top - 6,
      width: frame.width + 12,
      height: frame.height + 12,
    });
  });
});
