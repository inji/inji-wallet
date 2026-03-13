jest.mock('@expo-google-fonts/montserrat', () => ({
  Montserrat_400Regular: 'font1',
  Montserrat_500Medium: 'font2',
  Montserrat_600SemiBold: 'font3',
  Montserrat_700Bold: 'font4',
  Montserrat_200ExtraLight: 'font5',
  useFonts: jest.fn().mockReturnValue([true]),
}));

// Restore real React hooks
jest.mock('react', () => jest.requireActual('react'));

describe('useFont', () => {
  it('should return true when fonts are loaded', () => {
    const {useFont} = require('./useFont');
    const result = useFont();
    expect(result).toBe(true);
  });

  it('should call useFonts with expected font families', () => {
    const {useFonts} = require('@expo-google-fonts/montserrat');
    const {useFont} = require('./useFont');
    useFont();
    expect(useFonts).toHaveBeenCalledWith(
      expect.objectContaining({
        Montserrat_400Regular: 'font1',
        Montserrat_700Bold: 'font4',
      }),
    );
  });
});
