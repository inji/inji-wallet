import {fullScreenCardSize} from './SvgCardFullScreen';

describe('full screen SVG card', () => {
  it('fullScreenCardSize lets the screen width limit a turned card on a phone', () => {
    // 390 x 844 portrait phone, 1000 x 630 card: the short side must fit 358 px
    const size = fullScreenCardSize(390, 844, 0.63);

    expect(size.width).toBeCloseTo(568.25);
    expect(size.height).toBeCloseTo(358);
  });

  it('fullScreenCardSize lets the screen height limit a turned card on a wide screen', () => {
    // 600 x 844 tablet: 812 px of height is less than the width allows
    const size = fullScreenCardSize(600, 844, 0.63);

    expect(size.width).toBe(812);
    expect(size.height).toBeCloseTo(511.56);
  });
});
