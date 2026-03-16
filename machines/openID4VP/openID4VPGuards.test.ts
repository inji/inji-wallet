import {openID4VPGuards} from './openID4VPGuards';
import {VCShareFlowType} from '../../shared/Utils';

jest.mock('../../components/VC/common/VCUtils', () => ({
  getFaceAttribute: jest.fn(),
}));

import {getFaceAttribute} from '../../components/VC/common/VCUtils';

describe('openID4VPGuards', () => {
  const guards = openID4VPGuards();

  describe('isAuthorizationFlow', () => {
    it('should return true for OPENID4VP_AUTHORIZATION flow type', () => {
      expect(
        guards.isAuthorizationFlow({
          flowType: VCShareFlowType.OPENID4VP_AUTHORIZATION,
        }),
      ).toBe(true);
    });

    it('should return false for other flow types', () => {
      expect(
        guards.isAuthorizationFlow({flowType: VCShareFlowType.SIMPLE_SHARE}),
      ).toBe(false);
    });
  });

  describe('isNotAuthorizationFlow', () => {
    it('should return true for non-authorization flow types', () => {
      expect(
        guards.isNotAuthorizationFlow({flowType: VCShareFlowType.SIMPLE_SHARE}),
      ).toBe(true);
    });

    it('should return false for OPENID4VP_AUTHORIZATION', () => {
      expect(
        guards.isNotAuthorizationFlow({
          flowType: VCShareFlowType.OPENID4VP_AUTHORIZATION,
        }),
      ).toBe(false);
    });
  });

  describe('showFaceAuthConsentScreen', () => {
    it('should return true when both showFaceAuthConsent and isShareWithSelfie are true', () => {
      expect(
        guards.showFaceAuthConsentScreen(
          {showFaceAuthConsent: true, isShareWithSelfie: true},
          {},
        ),
      ).toBe(true);
    });

    it('should return false when showFaceAuthConsent is false', () => {
      expect(
        guards.showFaceAuthConsentScreen(
          {showFaceAuthConsent: false, isShareWithSelfie: true},
          {},
        ),
      ).toBe(false);
    });

    it('should return false when isShareWithSelfie is false', () => {
      expect(
        guards.showFaceAuthConsentScreen(
          {showFaceAuthConsent: true, isShareWithSelfie: false},
          {},
        ),
      ).toBe(false);
    });
  });

  describe('isShareWithSelfie', () => {
    it('should return true when isShareWithSelfie is true', () => {
      expect(guards.isShareWithSelfie({isShareWithSelfie: true})).toBe(true);
    });

    it('should return false when isShareWithSelfie is false', () => {
      expect(guards.isShareWithSelfie({isShareWithSelfie: false})).toBe(false);
    });
  });

  describe('isSimpleOpenID4VPShare', () => {
    it('should return true for OPENID4VP flow', () => {
      expect(
        guards.isSimpleOpenID4VPShare({flowType: VCShareFlowType.OPENID4VP}),
      ).toBe(true);
    });

    it('should return true for OPENID4VP_AUTHORIZATION flow', () => {
      expect(
        guards.isSimpleOpenID4VPShare({
          flowType: VCShareFlowType.OPENID4VP_AUTHORIZATION,
        }),
      ).toBe(true);
    });

    it('should return false for other flows', () => {
      expect(
        guards.isSimpleOpenID4VPShare({flowType: VCShareFlowType.SIMPLE_SHARE}),
      ).toBe(false);
    });
  });

  describe('isSelectedVCMatchingRequest', () => {
    it('should return true when exactly one VC selected', () => {
      expect(
        guards.isSelectedVCMatchingRequest({selectedVCs: {vc1: 'data'}}),
      ).toBe(true);
    });

    it('should return false when multiple VCs selected', () => {
      expect(
        guards.isSelectedVCMatchingRequest({
          selectedVCs: {vc1: 'data1', vc2: 'data2'},
        }),
      ).toBe(false);
    });
  });

  describe('isFlowTypeSimpleShare', () => {
    it('should return true for SIMPLE_SHARE', () => {
      expect(
        guards.isFlowTypeSimpleShare({flowType: VCShareFlowType.SIMPLE_SHARE}),
      ).toBe(true);
    });

    it('should return false for others', () => {
      expect(
        guards.isFlowTypeSimpleShare({flowType: VCShareFlowType.OPENID4VP}),
      ).toBe(false);
    });
  });

  describe('hasKeyPair', () => {
    it('should return true when publicKey exists', () => {
      expect(guards.hasKeyPair({publicKey: 'key123'})).toBe(true);
    });

    it('should return false when publicKey is empty', () => {
      expect(guards.hasKeyPair({publicKey: ''})).toBe(false);
    });
  });

  describe('isAnyVCHasImage', () => {
    it('should return true when a VC has a face attribute', () => {
      (getFaceAttribute as jest.Mock).mockReturnValue('imageData');
      const context = {
        selectedVCs: {
          vc1: [{verifiableCredential: {}, format: 'ldp_vc'}],
        },
      };
      expect(guards.isAnyVCHasImage(context)).toBe(true);
    });

    it('should return false when no VC has a face attribute', () => {
      (getFaceAttribute as jest.Mock).mockReturnValue(null);
      const context = {
        selectedVCs: {
          vc1: [{verifiableCredential: {}, format: 'ldp_vc'}],
        },
      };
      expect(guards.isAnyVCHasImage(context)).toBe(false);
    });
  });

  describe('isFaceVerificationRetryAttempt', () => {
    it('should return true when isFaceVerificationRetryAttempt is true', () => {
      expect(
        guards.isFaceVerificationRetryAttempt({
          isFaceVerificationRetryAttempt: true,
        }),
      ).toBe(true);
    });

    it('should return false when isFaceVerificationRetryAttempt is false', () => {
      expect(
        guards.isFaceVerificationRetryAttempt({
          isFaceVerificationRetryAttempt: false,
        }),
      ).toBe(false);
    });
  });

  describe('isClientValidationRequred', () => {
    it('should return the event data value', () => {
      expect(guards.isClientValidationRequred({}, {data: true})).toBe(true);
      expect(guards.isClientValidationRequred({}, {data: false})).toBe(false);
    });
  });

  describe('hasNoMatchingVCsAndIsAuthorizationFlow', () => {
    it('should return true when no matching VCs and authorization flow', () => {
      expect(
        guards.hasNoMatchingVCsAndIsAuthorizationFlow({
          hasNoMatchingVCs: true,
          flowType: VCShareFlowType.OPENID4VP_AUTHORIZATION,
        }),
      ).toBe(true);
    });

    it('should return false when has matching VCs', () => {
      expect(
        guards.hasNoMatchingVCsAndIsAuthorizationFlow({
          hasNoMatchingVCs: false,
          flowType: VCShareFlowType.OPENID4VP_AUTHORIZATION,
        }),
      ).toBe(false);
    });

    it('should return false when not authorization flow', () => {
      expect(
        guards.hasNoMatchingVCsAndIsAuthorizationFlow({
          hasNoMatchingVCs: true,
          flowType: VCShareFlowType.SIMPLE_SHARE,
        }),
      ).toBe(false);
    });
  });
});
