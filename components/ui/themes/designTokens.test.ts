import {
  BrandColors,
  buildElevation,
  ColorTokens,
  Elevation,
  withAlpha,
} from './designTokens';

describe('designTokens', () => {
  it('defines every colour token in both light and dark', () => {
    expect(Object.keys(ColorTokens.dark).sort()).toEqual(
      Object.keys(ColorTokens.light).sort(),
    );
    expect(Object.keys(ColorTokens.light)).toHaveLength(17);
  });

  it('uses #RRGGBB values so withAlpha can derive tints', () => {
    [ColorTokens.light, ColorTokens.dark].forEach(set =>
      Object.values(set).forEach(value =>
        expect(value).toMatch(/^#[0-9A-F]{6}$/),
      ),
    );
  });

  it('withAlpha converts a hex colour to rgba', () => {
    expect(withAlpha('#0A3970', 0.32)).toBe('rgba(10, 57, 112, 0.32)');
    expect(BrandColors.navyLine).toBe('rgba(252, 252, 250, 0.16)');
  });

  it('uses multi-layer boxShadow on the New Architecture', () => {
    const elevation = buildElevation(true);
    expect(elevation.btn.boxShadow).toContain(
      '0px 6px 12px rgba(10, 57, 112, 0.32)',
    );
    expect(elevation.card.boxShadow).toContain('0px 16px 28px');
    expect(elevation.btn.shadowOpacity).toBeUndefined();
  });

  it('falls back to classic shadow props on the old architecture (iOS today)', () => {
    const elevation = buildElevation(false);
    expect(elevation.btn).toEqual({
      shadowColor: '#0A3970',
      shadowOffset: {width: 0, height: 6},
      shadowOpacity: 0.32,
      shadowRadius: 6,
      elevation: 6,
    });
    expect(elevation.btn.boxShadow).toBeUndefined();
    expect(Elevation.card).toBeDefined();
  });
});
