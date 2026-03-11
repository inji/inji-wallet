import {ScanGuards} from './scanGuards';
import {VCShareFlowType} from '../../../shared/Utils';

jest.mock('../../../shared/constants', () => ({
  androidVersion: 30,
  isAndroid: jest.fn(() => true),
  isIOS: jest.fn(() => false),
}));

describe('ScanGuards', () => {
  const guards = ScanGuards();

  describe('showFaceAuthConsentScreen', () => {
    it('should return true when showFaceAuthConsent is true', () => {
      expect(
        guards.showFaceAuthConsentScreen({showFaceAuthConsent: true}),
      ).toBe(true);
    });

    it('should return false when showFaceAuthConsent is false', () => {
      expect(
        guards.showFaceAuthConsentScreen({showFaceAuthConsent: false}),
      ).toBe(false);
    });
  });

  describe('isOpenIdQr', () => {
    it('should return true for OPENID4VP:// prefix', () => {
      const event = {params: 'OPENID4VP://connect:?name=test&key=abc'};
      expect(guards.isOpenIdQr({}, event)).toBe(true);
    });

    it('should return false for other prefixes', () => {
      const event = {params: 'http://example.com'};
      expect(guards.isOpenIdQr({}, event)).toBe(false);
    });
  });

  describe('isQuickShare', () => {
    it('should return false (feature toggled off)', () => {
      const event = {params: 'INJIQUICKSHARE://test'};
      expect(guards.isQuickShare({}, event)).toBe(false);
    });
  });

  describe('isQrLogin', () => {
    it('should return true for QR login URLs with linkCode', () => {
      const event = {
        params: 'inji://landing?linkCode=abc123&linkExpireDateTime=2023-11-09',
      };
      expect(guards.isQrLogin({}, event)).toBe(true);
    });

    it('should return false for URLs without linkCode', () => {
      const event = {params: 'https://example.com'};
      expect(guards.isQrLogin({}, event)).toBe(false);
    });

    it('should return false for invalid URLs', () => {
      const event = {params: 'not a url'};
      expect(guards.isQrLogin({}, event)).toBe(false);
    });
  });

  describe('isOnlineSharing', () => {
    it('should return true for openid4vp://authorize', () => {
      const event = {params: 'openid4vp://authorize?request_uri=test'};
      expect(guards.isOnlineSharing({}, event)).toBe(true);
    });

    it('should return false for other URIs', () => {
      const event = {params: 'http://example.com'};
      expect(guards.isOnlineSharing({}, event)).toBe(false);
    });
  });

  describe('uptoAndroid11', () => {
    it('should return true for Android version < 31', () => {
      const {isAndroid} = require('../../../shared/constants');
      (isAndroid as jest.Mock).mockReturnValue(true);
      expect(guards.uptoAndroid11()).toBe(true);
    });
  });

  describe('isIOS', () => {
    it('should return the isIOS value', () => {
      const {isIOS} = require('../../../shared/constants');
      (isIOS as jest.Mock).mockReturnValue(false);
      expect(guards.isIOS()).toBe(false);
    });
  });

  describe('isMinimumStorageRequiredForAuditEntryReached', () => {
    it('should return true when event data is truthy', () => {
      expect(
        guards.isMinimumStorageRequiredForAuditEntryReached({}, {data: true}),
      ).toBe(true);
    });

    it('should return false when event data is falsy', () => {
      expect(
        guards.isMinimumStorageRequiredForAuditEntryReached({}, {data: false}),
      ).toBe(false);
    });
  });

  describe('isQrLoginViaDeepLinking', () => {
    it('should return true when isQrLoginViaDeepLink is true', () => {
      expect(guards.isQrLoginViaDeepLinking({isQrLoginViaDeepLink: true})).toBe(
        true,
      );
    });

    it('should return false when isQrLoginViaDeepLink is false', () => {
      expect(
        guards.isQrLoginViaDeepLinking({isQrLoginViaDeepLink: false}),
      ).toBe(false);
    });
  });

  describe('isOVPViaDeepLink', () => {
    it('should return true when isOVPViaDeepLink is true', () => {
      expect(guards.isOVPViaDeepLink({isOVPViaDeepLink: true})).toBe(true);
    });

    it('should return false when isOVPViaDeepLink is false', () => {
      expect(guards.isOVPViaDeepLink({isOVPViaDeepLink: false})).toBe(false);
    });
  });

  describe('isFlowTypeDeepLink', () => {
    it('should return true when isOVPViaDeepLink is true', () => {
      expect(
        guards.isFlowTypeDeepLink({
          isOVPViaDeepLink: true,
          isQrLoginViaDeepLink: false,
        }),
      ).toBe(true);
    });

    it('should return true when isQrLoginViaDeepLink is true', () => {
      expect(
        guards.isFlowTypeDeepLink({
          isOVPViaDeepLink: false,
          isQrLoginViaDeepLink: true,
        }),
      ).toBe(true);
    });

    it('should return false when both are false', () => {
      expect(
        guards.isFlowTypeDeepLink({
          isOVPViaDeepLink: false,
          isQrLoginViaDeepLink: false,
        }),
      ).toBe(false);
    });
  });

  describe('flow type guards', () => {
    it('isFlowTypeMiniViewShareWithSelfie', () => {
      expect(
        guards.isFlowTypeMiniViewShareWithSelfie({
          flowType: VCShareFlowType.MINI_VIEW_SHARE_WITH_SELFIE,
        }),
      ).toBe(true);
      expect(
        guards.isFlowTypeMiniViewShareWithSelfie({
          flowType: VCShareFlowType.SIMPLE_SHARE,
        }),
      ).toBe(false);
    });

    it('isFlowTypeMiniViewShare', () => {
      expect(
        guards.isFlowTypeMiniViewShare({
          flowType: VCShareFlowType.MINI_VIEW_SHARE,
        }),
      ).toBe(true);
      expect(
        guards.isFlowTypeMiniViewShare({
          flowType: VCShareFlowType.SIMPLE_SHARE,
        }),
      ).toBe(false);
    });

    it('isFlowTypeSimpleShare', () => {
      expect(
        guards.isFlowTypeSimpleShare({flowType: VCShareFlowType.SIMPLE_SHARE}),
      ).toBe(true);
      expect(
        guards.isFlowTypeSimpleShare({
          flowType: VCShareFlowType.MINI_VIEW_SHARE,
        }),
      ).toBe(false);
    });
  });
});
