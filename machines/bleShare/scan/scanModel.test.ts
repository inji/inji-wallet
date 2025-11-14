import {ScanModel} from './scanModel';
import {VCShareFlowType} from '../../../shared/Utils';

describe('ScanModel', () => {
  describe('Model structure', () => {
    it('should be defined', () => {
      expect(ScanModel).toBeDefined();
    });

    it('should have initialContext', () => {
      expect(ScanModel.initialContext).toBeDefined();
    });

    it('should have events', () => {
      expect(ScanModel.events).toBeDefined();
    });
  });

  describe('Initial Context', () => {
    const initialContext = ScanModel.initialContext;

    it('should have serviceRefs as empty object', () => {
      expect(initialContext.serviceRefs).toEqual({});
      expect(typeof initialContext.serviceRefs).toBe('object');
    });

    it('should have senderInfo as empty object', () => {
      expect(initialContext.senderInfo).toEqual({});
      expect(typeof initialContext.senderInfo).toBe('object');
    });

    it('should have receiverInfo as empty object', () => {
      expect(initialContext.receiverInfo).toEqual({});
      expect(typeof initialContext.receiverInfo).toBe('object');
    });

    it('should have selectedVc as empty object', () => {
      expect(initialContext.selectedVc).toEqual({});
      expect(typeof initialContext.selectedVc).toBe('object');
    });

    it('should have bleError as empty object', () => {
      expect(initialContext.bleError).toEqual({});
      expect(typeof initialContext.bleError).toBe('object');
    });

    it('should have loggers as empty array', () => {
      expect(initialContext.loggers).toEqual([]);
      expect(Array.isArray(initialContext.loggers)).toBe(true);
    });

    it('should have vcName as empty string', () => {
      expect(initialContext.vcName).toBe('');
      expect(typeof initialContext.vcName).toBe('string');
    });

    it('should have flowType as SIMPLE_SHARE', () => {
      expect(initialContext.flowType).toBe(VCShareFlowType.SIMPLE_SHARE);
    });

    it('should have openID4VPFlowType as empty string', () => {
      expect(initialContext.openID4VPFlowType).toBe('');
      expect(typeof initialContext.openID4VPFlowType).toBe('string');
    });

    it('should have verificationImage as empty object', () => {
      expect(initialContext.verificationImage).toEqual({});
      expect(typeof initialContext.verificationImage).toBe('object');
    });

    it('should have openId4VpUri as empty string', () => {
      expect(initialContext.openId4VpUri).toBe('');
      expect(typeof initialContext.openId4VpUri).toBe('string');
    });

    it('should have shareLogType as empty string', () => {
      expect(initialContext.shareLogType).toBe('');
      expect(typeof initialContext.shareLogType).toBe('string');
    });

    it('should have QrLoginRef as empty object', () => {
      expect(initialContext.QrLoginRef).toEqual({});
      expect(typeof initialContext.QrLoginRef).toBe('object');
    });

    it('should have OpenId4VPRef as empty object', () => {
      expect(initialContext.OpenId4VPRef).toEqual({});
      expect(typeof initialContext.OpenId4VPRef).toBe('object');
    });

    it('should have showQuickShareSuccessBanner as false', () => {
      expect(initialContext.showQuickShareSuccessBanner).toBe(false);
      expect(typeof initialContext.showQuickShareSuccessBanner).toBe('boolean');
    });

    it('should have linkCode as empty string', () => {
      expect(initialContext.linkCode).toBe('');
      expect(typeof initialContext.linkCode).toBe('string');
    });

    it('should have authorizationRequest as empty string', () => {
      expect(initialContext.authorizationRequest).toBe('');
      expect(typeof initialContext.authorizationRequest).toBe('string');
    });

    it('should have quickShareData as empty object', () => {
      expect(initialContext.quickShareData).toEqual({});
      expect(typeof initialContext.quickShareData).toBe('object');
    });

    it('should have isQrLoginViaDeepLink as false', () => {
      expect(initialContext.isQrLoginViaDeepLink).toBe(false);
      expect(typeof initialContext.isQrLoginViaDeepLink).toBe('boolean');
    });

    it('should have isOVPViaDeepLink as false', () => {
      expect(initialContext.isOVPViaDeepLink).toBe(false);
      expect(typeof initialContext.isOVPViaDeepLink).toBe('boolean');
    });

    it('should have showFaceAuthConsent as true', () => {
      expect(initialContext.showFaceAuthConsent).toBe(true);
      expect(typeof initialContext.showFaceAuthConsent).toBe('boolean');
    });

    it('should have readyForBluetoothStateCheck as false', () => {
      expect(initialContext.readyForBluetoothStateCheck).toBe(false);
      expect(typeof initialContext.readyForBluetoothStateCheck).toBe('boolean');
    });

    it('should have showFaceCaptureSuccessBanner as false', () => {
      expect(initialContext.showFaceCaptureSuccessBanner).toBe(false);
      expect(typeof initialContext.showFaceCaptureSuccessBanner).toBe(
        'boolean',
      );
    });

    it('should have all 23 required properties', () => {
      const properties = Object.keys(initialContext);
      expect(properties).toHaveLength(23);
    });
  });

  describe('String properties', () => {
    const context = ScanModel.initialContext;

    it('all empty string properties should be empty', () => {
      const emptyStrings = [
        context.vcName,
        context.openID4VPFlowType,
        context.openId4VpUri,
        context.shareLogType,
        context.linkCode,
        context.authorizationRequest,
      ];

      emptyStrings.forEach(str => {
        expect(str).toBe('');
        expect(typeof str).toBe('string');
      });
    });

    it('flowType should be SIMPLE_SHARE enum value', () => {
      expect(context.flowType).toBe(VCShareFlowType.SIMPLE_SHARE);
    });
  });

  describe('Array properties', () => {
    const context = ScanModel.initialContext;

    it('loggers should be empty array', () => {
      expect(Array.isArray(context.loggers)).toBe(true);
      expect(context.loggers).toHaveLength(0);
    });
  });

  describe('Object properties', () => {
    const context = ScanModel.initialContext;

    it('all empty object properties should be empty objects', () => {
      const emptyObjects = [
        context.serviceRefs,
        context.senderInfo,
        context.receiverInfo,
        context.selectedVc,
        context.bleError,
        context.verificationImage,
        context.QrLoginRef,
        context.OpenId4VPRef,
        context.quickShareData,
      ];

      emptyObjects.forEach(obj => {
        expect(typeof obj).toBe('object');
        expect(Object.keys(obj)).toHaveLength(0);
      });
    });
  });

  describe('Boolean properties', () => {
    const context = ScanModel.initialContext;

    it('showQuickShareSuccessBanner should be false', () => {
      expect(context.showQuickShareSuccessBanner).toBe(false);
      expect(typeof context.showQuickShareSuccessBanner).toBe('boolean');
    });

    it('isQrLoginViaDeepLink should be false', () => {
      expect(context.isQrLoginViaDeepLink).toBe(false);
      expect(typeof context.isQrLoginViaDeepLink).toBe('boolean');
    });

    it('isOVPViaDeepLink should be false', () => {
      expect(context.isOVPViaDeepLink).toBe(false);
      expect(typeof context.isOVPViaDeepLink).toBe('boolean');
    });

    it('showFaceAuthConsent should be true', () => {
      expect(context.showFaceAuthConsent).toBe(true);
      expect(typeof context.showFaceAuthConsent).toBe('boolean');
    });

    it('readyForBluetoothStateCheck should be false', () => {
      expect(context.readyForBluetoothStateCheck).toBe(false);
      expect(typeof context.readyForBluetoothStateCheck).toBe('boolean');
    });

    it('showFaceCaptureSuccessBanner should be false', () => {
      expect(context.showFaceCaptureSuccessBanner).toBe(false);
      expect(typeof context.showFaceCaptureSuccessBanner).toBe('boolean');
    });

    it('should have correct initial values for boolean properties', () => {
      const falseProps = [
        context.showQuickShareSuccessBanner,
        context.isQrLoginViaDeepLink,
        context.isOVPViaDeepLink,
        context.readyForBluetoothStateCheck,
        context.showFaceCaptureSuccessBanner,
      ];

      falseProps.forEach(prop => {
        expect(prop).toBe(false);
        expect(typeof prop).toBe('boolean');
      });

      expect(context.showFaceAuthConsent).toBe(true);
      expect(typeof context.showFaceAuthConsent).toBe('boolean');
    });
  });

  describe('Model events', () => {
    it('should have events object', () => {
      expect(ScanModel.events).toBeDefined();
      expect(typeof ScanModel.events).toBe('object');
    });

    it('should have event creators', () => {
      const eventKeys = Object.keys(ScanModel.events);
      expect(eventKeys.length).toBeGreaterThan(0);
    });
  });

  describe('Property types validation', () => {
    const context = ScanModel.initialContext;

    it('should have correct types for all properties', () => {
      expect(typeof context.vcName).toBe('string');
      expect(typeof context.openID4VPFlowType).toBe('string');
      expect(typeof context.openId4VpUri).toBe('string');
      expect(typeof context.shareLogType).toBe('string');
      expect(typeof context.linkCode).toBe('string');
      expect(typeof context.authorizationRequest).toBe('string');
      expect(Array.isArray(context.loggers)).toBe(true);
      expect(typeof context.showQuickShareSuccessBanner).toBe('boolean');
      expect(typeof context.isQrLoginViaDeepLink).toBe('boolean');
      expect(typeof context.isOVPViaDeepLink).toBe('boolean');
      expect(typeof context.showFaceAuthConsent).toBe('boolean');
      expect(typeof context.readyForBluetoothStateCheck).toBe('boolean');
      expect(typeof context.showFaceCaptureSuccessBanner).toBe('boolean');
      expect(typeof context.serviceRefs).toBe('object');
      expect(typeof context.senderInfo).toBe('object');
      expect(typeof context.receiverInfo).toBe('object');
      expect(typeof context.selectedVc).toBe('object');
      expect(typeof context.bleError).toBe('object');
      expect(typeof context.verificationImage).toBe('object');
      expect(typeof context.QrLoginRef).toBe('object');
      expect(typeof context.OpenId4VPRef).toBe('object');
      expect(typeof context.quickShareData).toBe('object');
    });
  });
});
