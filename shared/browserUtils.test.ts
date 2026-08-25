import {Linking, NativeModules, Share} from 'react-native';
import {openURL, openURLInSelectedBrowser} from './browserUtils';
import {isIOS} from './constants';

jest.mock('./constants', () => ({isIOS: jest.fn(() => false)}));

const redirectUri =
  'https://verifier.example.org/cb#response_code=sample-response-code';

describe('browserUtils', () => {
  let openRedirectUriInBrowser: jest.Mock;
  let openURLSpy: jest.SpyInstance;
  let shareSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    (isIOS as jest.Mock).mockReturnValue(false);

    NativeModules.InjiOpenID4VP.openRedirectUriInBrowser = jest
      .fn()
      .mockResolvedValue(true);
    openRedirectUriInBrowser = NativeModules.InjiOpenID4VP
      .openRedirectUriInBrowser as jest.Mock;

    openURLSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    shareSpy = jest
      .spyOn(Share, 'share')
      .mockResolvedValue({action: Share.sharedAction} as any);
  });

  afterEach(() => {
    openURLSpy.mockRestore();
    shareSpy.mockRestore();
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
      const module = NativeModules.InjiOpenID4VP;
      (NativeModules as any).InjiOpenID4VP = undefined;

      await openURLInSelectedBrowser(redirectUri);

      expect(openURLSpy).toHaveBeenCalledWith(redirectUri);

      (NativeModules as any).InjiOpenID4VP = module;
    });
  });

  describe('openURLInSelectedBrowser on ios', () => {
    beforeEach(() => (isIOS as jest.Mock).mockReturnValue(true));

    it('offers the share sheet, which lists the installed browsers', async () => {
      await openURLInSelectedBrowser(redirectUri);

      expect(shareSpy).toHaveBeenCalledWith({
        url: redirectUri,
        message: redirectUri,
      });
      expect(openRedirectUriInBrowser).not.toHaveBeenCalled();
      expect(openURLSpy).not.toHaveBeenCalled();
    });

    it('falls back to the default browser when the share sheet cannot be shown', async () => {
      shareSpy.mockRejectedValue(new Error('could not present'));
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      await openURLInSelectedBrowser(redirectUri);

      expect(openURLSpy).toHaveBeenCalledWith(redirectUri);
      consoleSpy.mockRestore();
    });
  });
});
