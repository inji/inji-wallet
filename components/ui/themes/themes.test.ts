import {DefaultTheme} from './DefaultTheme';
import {PurpleTheme} from './PurpleTheme';

describe('Themes', () => {
  it.each([
    ['DefaultTheme', DefaultTheme],
    ['PurpleTheme', PurpleTheme],
  ])('%s should have all required properties', (_name, theme) => {
    expect(theme.Colors).toEqual(expect.any(Object));
    expect(theme.Colors.ProfileIconColor).toBeDefined();
    expect(theme.TextStyles).toEqual(expect.any(Object));
    expect(theme.ButtonStyles).toEqual(expect.any(Object));
    expect(typeof theme.spacing).toBe('function');
    expect(typeof theme.elevation).toBe('function');
  });

  it('PurpleTheme should have different colors than DefaultTheme', () => {
    expect(PurpleTheme.Colors).not.toEqual(DefaultTheme.Colors);
  });

  it('PurpleTheme should have same structure as DefaultTheme', () => {
    const defaultKeys = Object.keys(DefaultTheme);
    const purpleKeys = Object.keys(PurpleTheme);
    expect(purpleKeys.sort()).toEqual(defaultKeys.sort());
  });

  it('spacing should return styles', () => {
    const defaultSpacing = DefaultTheme.spacing('margin', 'xs');
    const purpleSpacing = PurpleTheme.spacing('padding', 'sm');
    expect(defaultSpacing).toBeDefined();
    expect(purpleSpacing).toBeDefined();
  });

  it('elevation should return styles', () => {
    const defaultElevation = DefaultTheme.elevation(2);
    const purpleElevation = PurpleTheme.elevation(3);
    expect(defaultElevation).toBeDefined();
    expect(purpleElevation).toBeDefined();
  });
});
