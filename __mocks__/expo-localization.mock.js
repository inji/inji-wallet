const mockedLocale = 'en-US';
const mockLocalization = {
  locale: mockedLocale,
  getLocales: () => [{languageTag: mockedLocale, languageCode: 'en'}],
};
// Customize the mock implementation as needed
export default mockLocalization;
