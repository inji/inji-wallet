import {Linking, NativeModules} from 'react-native';
import {openURL, openURLInSelectedBrowser} from './browserUtils';
import {isIOS} from './constants';

jest.mock('./constants', () => ({isIOS: jest.fn(() => false)}));

const redirectUri =
  'https://verifier.example.org/cb#response_code=sample-response-code';

describe('browserUtils', () => {
  const injiOpenID4VP = NativeModules.InjiOpenID4VP;
  let openRedirectUriInBrowser: jest.Mock;
  let openURLSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    (isIOS as jest.Mock).mockReturnValue(false);

    (NativeModules as any).InjiOpenID4VP = injiOpenID4VP;
    injiOpenID4VP.openRedirectUriInBrowser = jest.fn().mockResolvedValue(true);
    openRedirectUriInBrowser =
      injiOpenID4VP.openRedirectUriInBrowser as jest.Mock;

    openURLSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
  });

  afterEach(() => {
    (NativeModules as any).InjiOpenID4VP = injiOpenID4VP;
    jest.restoreAllMocks();
  });

  describe('openURL', () => {
    it('opens the url in the default browser', async () => {
      await openURL(redirectUri);

      expect(openURLSpy).toHaveBeenCalledWith(redirectUri);
    });
  });

  describe('openURLInSelectedBrowser on android', () => {
    it('offers the system browser chooser', async () => {
      await openURLInSelectedBrowser(redirectUri);

      expect(openRedirectUriInBrowser).toHaveBeenCalledWith(redirectUri);
      expect(openURLSpy).not.toHaveBeenCalled();
    });

    it('falls back to the default browser when no browser could be chosen', async () => {
      openRedirectUriInBrowser.mockResolvedValue(false);

      await openURLInSelectedBrowser(redirectUri);

      expect(openURLSpy).toHaveBeenCalledWith(redirectUri);
    });

    it('falls back to the default browser when the native module has no chooser method', async () => {
      delete (NativeModules.InjiOpenID4VP as any).openRedirectUriInBrowser;

      await openURLInSelectedBrowser(redirectUri);

      expect(openURLSpy).toHaveBeenCalledWith(redirectUri);
    });

    it('falls back to the default browser when the native module is unavailable', async () => {
      (NativeModules as any).InjiOpenID4VP = undefined;

      await openURLInSelectedBrowser(redirectUri);

      expect(openURLSpy).toHaveBeenCalledWith(redirectUri);
    });
  });

  describe('openURLInSelectedBrowser on ios', () => {
    beforeEach(() => (isIOS as jest.Mock).mockReturnValue(true));

    it('opens the default browser, since ios cannot offer a browser chooser', async () => {
      await openURLInSelectedBrowser(redirectUri);

      expect(openURLSpy).toHaveBeenCalledWith(redirectUri);
      expect(openRedirectUriInBrowser).not.toHaveBeenCalled();
    });
  });
});
