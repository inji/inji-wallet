const mockedLocale = 'en-US';
// i18n.ts imports this module as a namespace and calls getLocales(), so it must be a named export.
export const getLocales = () => [{languageTag: mockedLocale, languageCode: 'en'}];
const mockLocalization = {
  locale: mockedLocale,
  getLocales,
};
// Customize the mock implementation as needed
export default mockLocalization;
