import {QrLoginGuards} from './QrLoginGuards';
import {VCShareFlowType} from '../../shared/Utils';

describe('QrLoginGuards', () => {
  describe('showFaceAuthConsentScreen', () => {
    it('should return true when showFaceAuthConsent is true', () => {
      expect(
        QrLoginGuards.showFaceAuthConsentScreen({showFaceAuthConsent: true}),
      ).toBe(true);
    });

    it('should return false when showFaceAuthConsent is false', () => {
      expect(
        QrLoginGuards.showFaceAuthConsentScreen({showFaceAuthConsent: false}),
      ).toBe(false);
    });
  });

  describe('isConsentAlreadyCaptured', () => {
    it('should return true when consentAction is NOCAPTURE', () => {
      const event = {data: {consentAction: 'NOCAPTURE'}};
      expect(QrLoginGuards.isConsentAlreadyCaptured({}, event)).toBe(true);
    });

    it('should return false when consentAction is not NOCAPTURE', () => {
      const event = {data: {consentAction: 'CAPTURE'}};
      expect(QrLoginGuards.isConsentAlreadyCaptured({}, event)).toBe(false);
    });

    it('should return false when data is undefined', () => {
      const event = {data: undefined};
      expect(QrLoginGuards.isConsentAlreadyCaptured({}, event)).toBeFalsy();
    });
  });

  describe('isSimpleShareFlow', () => {
    it('should return true for SIMPLE_SHARE flow type', () => {
      const context = {flowType: VCShareFlowType.SIMPLE_SHARE};
      expect(QrLoginGuards.isSimpleShareFlow(context, {})).toBe(true);
    });

    it('should return false for other flow types', () => {
      const context = {flowType: VCShareFlowType.MINI_VIEW_SHARE};
      expect(QrLoginGuards.isSimpleShareFlow(context, {})).toBe(false);
    });

    it('should return false for mini view qr login flow type', () => {
      const context = {flowType: VCShareFlowType.MINI_VIEW_QR_LOGIN};
      expect(QrLoginGuards.isSimpleShareFlow(context, {})).toBe(false);
    });
  });
});
