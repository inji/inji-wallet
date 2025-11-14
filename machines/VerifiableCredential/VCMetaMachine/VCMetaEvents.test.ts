import {VcMetaEvents} from './VCMetaEvents';
import {VCMetadata} from '../../../shared/VCMetadata';
import {VC} from './vc';

describe('VcMetaEvents', () => {
  describe('VIEW_VC', () => {
    it('should create event with vc', () => {
      const vc = {id: 'vc-123'} as unknown as VC;
      const result = VcMetaEvents.VIEW_VC(vc);
      expect(result).toEqual({vc});
    });
  });

  describe('GET_VC_ITEM', () => {
    it('should create event with vcMetadata', () => {
      const vcMetadata = new VCMetadata();
      const result = VcMetaEvents.GET_VC_ITEM(vcMetadata);
      expect(result).toEqual({vcMetadata});
    });
  });

  describe('STORE_RESPONSE', () => {
    it('should create event with response', () => {
      const response = {data: 'test'};
      const result = VcMetaEvents.STORE_RESPONSE(response);
      expect(result).toEqual({response: {data: 'test'}});
    });

    it('should handle undefined response', () => {
      const result = VcMetaEvents.STORE_RESPONSE(undefined);
      expect(result).toEqual({response: undefined});
    });
  });

  describe('STORE_ERROR', () => {
    it('should create event with error', () => {
      const error = new Error('Test error');
      const result = VcMetaEvents.STORE_ERROR(error);
      expect(result).toEqual({error});
    });
  });

  describe('VC_ADDED', () => {
    it('should create event with vcMetadata', () => {
      const vcMetadata = new VCMetadata();
      const result = VcMetaEvents.VC_ADDED(vcMetadata);
      expect(result).toEqual({vcMetadata});
    });
  });

  describe('REMOVE_VC_FROM_CONTEXT', () => {
    it('should create event with vcMetadata', () => {
      const vcMetadata = new VCMetadata();
      const result = VcMetaEvents.REMOVE_VC_FROM_CONTEXT(vcMetadata);
      expect(result).toEqual({vcMetadata});
    });
  });

  describe('VC_METADATA_UPDATED', () => {
    it('should create event with vcMetadata', () => {
      const vcMetadata = new VCMetadata();
      const result = VcMetaEvents.VC_METADATA_UPDATED(vcMetadata);
      expect(result).toEqual({vcMetadata});
    });
  });

  describe('VC_DOWNLOADED', () => {
    it('should create event with vc and vcMetadata', () => {
      const vc = {id: 'vc-123'} as unknown as VC;
      const vcMetadata = new VCMetadata();
      const result = VcMetaEvents.VC_DOWNLOADED(vc, vcMetadata);
      expect(result.vc).toBe(vc);
      expect(result.vcMetadata).toBe(vcMetadata);
    });

    it('should handle undefined vcMetadata', () => {
      const vc = {id: 'vc-123'} as unknown as VC;
      const result = VcMetaEvents.VC_DOWNLOADED(vc);
      expect(result.vc).toBe(vc);
      expect(result.vcMetadata).toBeUndefined();
    });
  });

  describe('REFRESH_MY_VCS', () => {
    it('should create empty event', () => {
      const result = VcMetaEvents.REFRESH_MY_VCS();
      expect(result).toEqual({});
    });
  });

  describe('REFRESH_MY_VCS_TWO', () => {
    it('should create event with vc', () => {
      const vc = {id: 'vc-123'} as unknown as VC;
      const result = VcMetaEvents.REFRESH_MY_VCS_TWO(vc);
      expect(result).toEqual({vc});
    });
  });

  describe('REFRESH_RECEIVED_VCS', () => {
    it('should create empty event', () => {
      const result = VcMetaEvents.REFRESH_RECEIVED_VCS();
      expect(result).toEqual({});
    });
  });

  describe('WALLET_BINDING_SUCCESS', () => {
    it('should create event with vcKey and vc', () => {
      const vcKey = 'key-123';
      const vc = {id: 'vc-123'} as unknown as VC;
      const result = VcMetaEvents.WALLET_BINDING_SUCCESS(vcKey, vc);
      expect(result).toEqual({vcKey: 'key-123', vc});
    });
  });

  describe('RESET_WALLET_BINDING_SUCCESS', () => {
    it('should create empty event', () => {
      const result = VcMetaEvents.RESET_WALLET_BINDING_SUCCESS();
      expect(result).toEqual({});
    });
  });

  describe('ADD_VC_TO_IN_PROGRESS_DOWNLOADS', () => {
    it('should create event with requestId', () => {
      const result = VcMetaEvents.ADD_VC_TO_IN_PROGRESS_DOWNLOADS('req-123');
      expect(result).toEqual({requestId: 'req-123'});
    });
  });

  describe('REMOVE_VC_FROM_IN_PROGRESS_DOWNLOADS', () => {
    it('should create event with vcMetadata', () => {
      const vcMetadata = new VCMetadata();
      const result =
        VcMetaEvents.REMOVE_VC_FROM_IN_PROGRESS_DOWNLOADS(vcMetadata);
      expect(result).toEqual({vcMetadata});
    });
  });

  describe('RESET_IN_PROGRESS_VCS_DOWNLOADED', () => {
    it('should create empty event', () => {
      const result = VcMetaEvents.RESET_IN_PROGRESS_VCS_DOWNLOADED();
      expect(result).toEqual({});
    });
  });

  describe('REMOVE_TAMPERED_VCS', () => {
    it('should create empty event', () => {
      const result = VcMetaEvents.REMOVE_TAMPERED_VCS();
      expect(result).toEqual({});
    });
  });

  describe('DOWNLOAD_LIMIT_EXPIRED', () => {
    it('should create event with vcMetadata', () => {
      const vcMetadata = new VCMetadata();
      const result = VcMetaEvents.DOWNLOAD_LIMIT_EXPIRED(vcMetadata);
      expect(result).toEqual({vcMetadata});
    });
  });

  describe('DELETE_VC', () => {
    it('should create empty event', () => {
      const result = VcMetaEvents.DELETE_VC();
      expect(result).toEqual({});
    });
  });

  describe('VERIFY_VC_FAILED', () => {
    it('should create event with errorMessage and vcMetadata', () => {
      const vcMetadata = new VCMetadata();
      const result = VcMetaEvents.VERIFY_VC_FAILED(
        'Verification failed',
        vcMetadata,
      );
      expect(result.errorMessage).toBe('Verification failed');
      expect(result.vcMetadata).toBe(vcMetadata);
    });

    it('should handle undefined vcMetadata', () => {
      const result = VcMetaEvents.VERIFY_VC_FAILED('Error occurred');
      expect(result.errorMessage).toBe('Error occurred');
      expect(result.vcMetadata).toBeUndefined();
    });
  });

  describe('RESET_VERIFY_ERROR', () => {
    it('should create empty event', () => {
      const result = VcMetaEvents.RESET_VERIFY_ERROR();
      expect(result).toEqual({});
    });
  });

  describe('REFRESH_VCS_METADATA', () => {
    it('should create empty event', () => {
      const result = VcMetaEvents.REFRESH_VCS_METADATA();
      expect(result).toEqual({});
    });
  });

  describe('SHOW_TAMPERED_POPUP', () => {
    it('should create empty event', () => {
      const result = VcMetaEvents.SHOW_TAMPERED_POPUP();
      expect(result).toEqual({});
    });
  });

  describe('SET_VERIFICATION_STATUS', () => {
    it('should create event with verificationStatus', () => {
      const status = {verified: true};
      const result = VcMetaEvents.SET_VERIFICATION_STATUS(status);
      expect(result).toEqual({verificationStatus: status});
    });
  });

  describe('RESET_VERIFICATION_STATUS', () => {
    it('should create event with verificationStatus', () => {
      const status = {message: 'Reset'} as any;
      const result = VcMetaEvents.RESET_VERIFICATION_STATUS(status);
      expect(result).toEqual({verificationStatus: status});
    });

    it('should handle null verificationStatus', () => {
      const result = VcMetaEvents.RESET_VERIFICATION_STATUS(null);
      expect(result).toEqual({verificationStatus: null});
    });
  });

  describe('VC_DOWNLOADING_FAILED', () => {
    it('should create empty event', () => {
      const result = VcMetaEvents.VC_DOWNLOADING_FAILED();
      expect(result).toEqual({});
    });
  });

  describe('RESET_DOWNLOADING_FAILED', () => {
    it('should create empty event', () => {
      const result = VcMetaEvents.RESET_DOWNLOADING_FAILED();
      expect(result).toEqual({});
    });
  });

  describe('RESET_DOWNLOADING_SUCCESS', () => {
    it('should create empty event', () => {
      const result = VcMetaEvents.RESET_DOWNLOADING_SUCCESS();
      expect(result).toEqual({});
    });
  });

  describe('VcMetaEvents object structure', () => {
    it('should have all expected event creators', () => {
      expect(VcMetaEvents.VIEW_VC).toBeDefined();
      expect(VcMetaEvents.GET_VC_ITEM).toBeDefined();
      expect(VcMetaEvents.STORE_RESPONSE).toBeDefined();
      expect(VcMetaEvents.STORE_ERROR).toBeDefined();
      expect(VcMetaEvents.VC_ADDED).toBeDefined();
      expect(VcMetaEvents.REMOVE_VC_FROM_CONTEXT).toBeDefined();
      expect(VcMetaEvents.VC_METADATA_UPDATED).toBeDefined();
      expect(VcMetaEvents.VC_DOWNLOADED).toBeDefined();
      expect(VcMetaEvents.REFRESH_MY_VCS).toBeDefined();
      expect(VcMetaEvents.REFRESH_MY_VCS_TWO).toBeDefined();
      expect(VcMetaEvents.REFRESH_RECEIVED_VCS).toBeDefined();
      expect(VcMetaEvents.WALLET_BINDING_SUCCESS).toBeDefined();
      expect(VcMetaEvents.RESET_WALLET_BINDING_SUCCESS).toBeDefined();
      expect(VcMetaEvents.ADD_VC_TO_IN_PROGRESS_DOWNLOADS).toBeDefined();
      expect(VcMetaEvents.REMOVE_VC_FROM_IN_PROGRESS_DOWNLOADS).toBeDefined();
      expect(VcMetaEvents.RESET_IN_PROGRESS_VCS_DOWNLOADED).toBeDefined();
      expect(VcMetaEvents.REMOVE_TAMPERED_VCS).toBeDefined();
      expect(VcMetaEvents.DOWNLOAD_LIMIT_EXPIRED).toBeDefined();
      expect(VcMetaEvents.DELETE_VC).toBeDefined();
      expect(VcMetaEvents.VERIFY_VC_FAILED).toBeDefined();
      expect(VcMetaEvents.RESET_VERIFY_ERROR).toBeDefined();
      expect(VcMetaEvents.REFRESH_VCS_METADATA).toBeDefined();
      expect(VcMetaEvents.SHOW_TAMPERED_POPUP).toBeDefined();
      expect(VcMetaEvents.SET_VERIFICATION_STATUS).toBeDefined();
      expect(VcMetaEvents.RESET_VERIFICATION_STATUS).toBeDefined();
      expect(VcMetaEvents.VC_DOWNLOADING_FAILED).toBeDefined();
      expect(VcMetaEvents.RESET_DOWNLOADING_FAILED).toBeDefined();
      expect(VcMetaEvents.RESET_DOWNLOADING_SUCCESS).toBeDefined();
    });

    it('should have all event creators be functions', () => {
      expect(typeof VcMetaEvents.VIEW_VC).toBe('function');
      expect(typeof VcMetaEvents.GET_VC_ITEM).toBe('function');
      expect(typeof VcMetaEvents.STORE_RESPONSE).toBe('function');
      expect(typeof VcMetaEvents.STORE_ERROR).toBe('function');
      expect(typeof VcMetaEvents.VC_ADDED).toBe('function');
    });
  });
});
