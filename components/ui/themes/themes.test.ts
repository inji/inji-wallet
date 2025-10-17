import {DefaultTheme} from './DefaultTheme';
import {PurpleTheme} from './PurpleTheme';

describe('DefaultTheme', () => {
  it('should be defined', () => {
    expect(DefaultTheme).toBeDefined();
  });

  it('should have Colors property', () => {
    expect(DefaultTheme.Colors).toBeDefined();
    expect(typeof DefaultTheme.Colors).toBe('object');
  });

  it('should have ProfileIconColor', () => {
    expect(DefaultTheme.Colors.ProfileIconColor).toBeDefined();
  });

  it('should have TextStyles property', () => {
    expect(DefaultTheme.TextStyles).toBeDefined();
    expect(typeof DefaultTheme.TextStyles).toBe('object');
  });

  it('should have ButtonStyles property', () => {
    expect(DefaultTheme.ButtonStyles).toBeDefined();
    expect(typeof DefaultTheme.ButtonStyles).toBe('object');
  });

  it('should have spacing function', () => {
    expect(DefaultTheme.spacing).toBeDefined();
    expect(typeof DefaultTheme.spacing).toBe('function');
  });

  it('should have elevation function', () => {
    expect(DefaultTheme.elevation).toBeDefined();
    expect(typeof DefaultTheme.elevation).toBe('function');
  });
});

describe('PurpleTheme', () => {
  it('should be defined', () => {
    expect(PurpleTheme).toBeDefined();
  });

  it('should have Colors property', () => {
    expect(PurpleTheme.Colors).toBeDefined();
    expect(typeof PurpleTheme.Colors).toBe('object');
  });

  it('should have ProfileIconColor', () => {
    expect(PurpleTheme.Colors.ProfileIconColor).toBeDefined();
  });

  it('should have different colors than Default', () => {
    expect(PurpleTheme.Colors).not.toEqual(DefaultTheme.Colors);
  });

  it('should have TextStyles property', () => {
    expect(PurpleTheme.TextStyles).toBeDefined();
    expect(typeof PurpleTheme.TextStyles).toBe('object');
  });

  it('should have ButtonStyles property', () => {
    expect(PurpleTheme.ButtonStyles).toBeDefined();
    expect(typeof PurpleTheme.ButtonStyles).toBe('object');
  });

  it('should have spacing function', () => {
    expect(PurpleTheme.spacing).toBeDefined();
    expect(typeof PurpleTheme.spacing).toBe('function');
  });

  it('should have elevation function', () => {
    expect(PurpleTheme.elevation).toBeDefined();
    expect(typeof PurpleTheme.elevation).toBe('function');
  });

  it('should have same structure as DefaultTheme', () => {
    const defaultKeys = Object.keys(DefaultTheme);
    const purpleKeys = Object.keys(PurpleTheme);
    expect(purpleKeys.sort()).toEqual(defaultKeys.sort());
  });
});

describe('Theme spacing function', () => {
  it('should return spacing styles for Default theme', () => {
    const spacing = DefaultTheme.spacing('margin', 'xs');
    expect(spacing).toBeDefined();
  });

  it('should return spacing styles for Purple theme', () => {
    const spacing = PurpleTheme.spacing('padding', 'sm');
    expect(spacing).toBeDefined();
  });
});

describe('Theme elevation function', () => {
  it('should return elevation styles for Default theme', () => {
    const elevation = DefaultTheme.elevation(2);
    expect(elevation).toBeDefined();
  });

  it('should return elevation styles for Purple theme', () => {
    const elevation = PurpleTheme.elevation(3);
    expect(elevation).toBeDefined();
  });
});
