import {ScanModel} from './scanModel';
import {VCShareFlowType} from '../../../shared/Utils';

describe('ScanModel', () => {
  describe('Initial Context', () => {
    const initialContext = ScanModel.initialContext;

    it('should have serviceRefs as empty object', () => {
      expect(initialContext.serviceRefs).toEqual({});
    });

    it('should have senderInfo as empty object', () => {
      expect(initialContext.senderInfo).toEqual({});
    });

    it('should have receiverInfo as empty object', () => {
      expect(initialContext.receiverInfo).toEqual({});
    });

    it('should have selectedVc as empty object', () => {
      expect(initialContext.selectedVc).toEqual({});
    });

    it('should have bleError as empty object', () => {
      expect(initialContext.bleError).toEqual({});
    });

    it('should have loggers as empty array', () => {
      expect(initialContext.loggers).toEqual([]);
    });

    it('should have vcName as empty string', () => {
      expect(initialContext.vcName).toBe('');
    });

    it('should have flowType as SIMPLE_SHARE', () => {
      expect(initialContext.flowType).toBe(VCShareFlowType.SIMPLE_SHARE);
    });

    it('should have openID4VPFlowType as empty string', () => {
      expect(initialContext.openID4VPFlowType).toBe('');
    });

    it('should have verificationImage as empty object', () => {
      expect(initialContext.verificationImage).toEqual({});
    });

    it('should have openId4VpUri as empty string', () => {
      expect(initialContext.openId4VpUri).toBe('');
    });

    it('should have shareLogType as empty string', () => {
      expect(initialContext.shareLogType).toBe('');
    });

    it('should have QrLoginRef as empty object', () => {
      expect(initialContext.QrLoginRef).toEqual({});
    });

    it('should have OpenId4VPRef as empty object', () => {
      expect(initialContext.OpenId4VPRef).toEqual({});
    });

    it('should have showQuickShareSuccessBanner as false', () => {
      expect(initialContext.showQuickShareSuccessBanner).toBe(false);
    });

    it('should have linkCode as empty string', () => {
      expect(initialContext.linkCode).toBe('');
    });

    it('should have authorizationRequest as empty string', () => {
      expect(initialContext.authorizationRequest).toBe('');
    });

    it('should have quickShareData as empty object', () => {
      expect(initialContext.quickShareData).toEqual({});
    });

    it('should have isQrLoginViaDeepLink as false', () => {
      expect(initialContext.isQrLoginViaDeepLink).toBe(false);
    });

    it('should have isOVPViaDeepLink as false', () => {
      expect(initialContext.isOVPViaDeepLink).toBe(false);
    });

    it('should have showFaceAuthConsent as true', () => {
      expect(initialContext.showFaceAuthConsent).toBe(true);
    });

    it('should have readyForBluetoothStateCheck as false', () => {
      expect(initialContext.readyForBluetoothStateCheck).toBe(false);
    });

    it('should have showFaceCaptureSuccessBanner as false', () => {
      expect(initialContext.showFaceCaptureSuccessBanner).toBe(false);
    });
  });
});
