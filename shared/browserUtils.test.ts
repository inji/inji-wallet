import {Linking, NativeModules} from 'react-native';
import {openURL, openURLInSelectedBrowser} from './browserUtils';
import {isIOS} from './constants';

jest.mock('./constants', () => ({isIOS: jest.fn(() => false)}));

const redirectUri =
  'https://verifier.example.org/cb#response_code=sample-response-code';

describe('browserUtils', () => {
  let openRedirectUriInBrowser: jest.Mock;
  let openURLSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    (isIOS as jest.Mock).mockReturnValue(false);

    NativeModules.InjiOpenID4VP.openRedirectUriInBrowser = jest
      .fn()
      .mockResolvedValue(true);
    openRedirectUriInBrowser = NativeModules.InjiOpenID4VP
      .openRedirectUriInBrowser as jest.Mock;

    openURLSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
  });

  afterEach(() => openURLSpy.mockRestore());

  describe('openURL', () => {
    it('opens the url in the default browser', async () => {
      await openURL(redirectUri);

      expect(openURLSpy).toHaveBeenCalledWith(redirectUri);
    });
  });

  describe('openURLInSelectedBrowser', () => {
    it('offers the browser chooser on android', async () => {
      await openURLInSelectedBrowser(redirectUri);

      expect(openRedirectUriInBrowser).toHaveBeenCalledWith(redirectUri);
      expect(openURLSpy).not.toHaveBeenCalled();
    });

    it('falls back to the default browser when no browser could be chosen', async () => {
      openRedirectUriInBrowser.mockResolvedValue(false);

      await openURLInSelectedBrowser(redirectUri);

      expect(openRedirectUriInBrowser).toHaveBeenCalledWith(redirectUri);
      expect(openURLSpy).toHaveBeenCalledWith(redirectUri);
    });

    it('falls back to the default browser when the native module has no chooser method', async () => {
      delete (NativeModules.InjiOpenID4VP as any).openRedirectUriInBrowser;

      await openURLInSelectedBrowser(redirectUri);

      expect(openURLSpy).toHaveBeenCalledWith(redirectUri);
    });

    it('opens the default browser on ios, which cannot offer a chooser', async () => {
      (isIOS as jest.Mock).mockReturnValue(true);

      await openURLInSelectedBrowser(redirectUri);

      expect(openRedirectUriInBrowser).not.toHaveBeenCalled();
      expect(openURLSpy).toHaveBeenCalledWith(redirectUri);
    });
  });
});
