import {VPShareActivityLog} from './VPShareActivityLogEvent';
import {VCItemContainerFlowType} from '../shared/Utils';

describe('VPShareActivityLog', () => {
  describe('constructor', () => {
    it('should create instance with default values', () => {
      const log = new VPShareActivityLog({});

      expect(log.type).toBe('');
      expect(log.timestamp).toBeDefined();
      expect(log.flow).toBe(VCItemContainerFlowType.VP_SHARE);
      expect(log.info).toBe('');
    });

    it('should create instance with provided values', () => {
      const timestamp = Date.now();
      const log = new VPShareActivityLog({
        type: 'SHARED_SUCCESSFULLY',
        timestamp,
        flow: VCItemContainerFlowType.QR_LOGIN,
        info: 'Test info',
      });

      expect(log.type).toBe('SHARED_SUCCESSFULLY');
      expect(log.timestamp).toBe(timestamp);
      expect(log.flow).toBe(VCItemContainerFlowType.QR_LOGIN);
      expect(log.info).toBe('Test info');
    });

    it('should handle different activity types', () => {
      const types: Array<
        | 'SHARED_SUCCESSFULLY'
        | 'SHARED_WITH_FACE_VERIFIACTION'
        | 'VERIFIER_AUTHENTICATION_FAILED'
        | 'INVALID_AUTH_REQUEST'
        | 'USER_DECLINED_CONSENT'
      > = [
        'SHARED_SUCCESSFULLY',
        'SHARED_WITH_FACE_VERIFIACTION',
        'VERIFIER_AUTHENTICATION_FAILED',
        'INVALID_AUTH_REQUEST',
        'USER_DECLINED_CONSENT',
      ];

      types.forEach(type => {
        const log = new VPShareActivityLog({type});
        expect(log.type).toBe(type);
      });
    });
  });

  describe('getActionText', () => {
    it('should return formatted action text', () => {
      const log = new VPShareActivityLog({
        type: 'SHARED_SUCCESSFULLY',
        info: 'Test info',
      });

      const mockT = jest.fn(key => `Translated: ${key}`);
      const result = log.getActionText(mockT);

      expect(mockT).toHaveBeenCalledWith(
        'ActivityLogText:vpSharing:SHARED_SUCCESSFULLY',
        {info: 'Test info'},
      );
      expect(result).toContain('Translated:');
    });

    it('should handle empty type', () => {
      const log = new VPShareActivityLog({type: ''});
      const mockT = jest.fn(key => key);

      log.getActionText(mockT);
      expect(mockT).toHaveBeenCalled();
    });

    it('should pass info to translation function', () => {
      const log = new VPShareActivityLog({
        type: 'TECHNICAL_ERROR',
        info: 'Error details',
      });

      const mockT = jest.fn();
      log.getActionText(mockT);

      expect(mockT).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({info: 'Error details'}),
      );
    });
  });

  describe('getLogFromObject', () => {
    it('should create log from object', () => {
      const data = {
        type: 'SHARED_SUCCESSFULLY',
        timestamp: 1234567890,
        flow: VCItemContainerFlowType.VP_SHARE,
        info: 'Test',
      };

      const log = VPShareActivityLog.getLogFromObject(data);

      expect(log).toBeInstanceOf(VPShareActivityLog);
      expect(log.type).toBe('SHARED_SUCCESSFULLY');
      expect(log.timestamp).toBe(1234567890);
    });

    it('should handle empty object', () => {
      const log = VPShareActivityLog.getLogFromObject({});

      expect(log).toBeInstanceOf(VPShareActivityLog);
      expect(log.type).toBe('');
    });

    it('should handle partial object', () => {
      const log = VPShareActivityLog.getLogFromObject({
        type: 'USER_DECLINED_CONSENT',
      });

      expect(log).toBeInstanceOf(VPShareActivityLog);
      expect(log.type).toBe('USER_DECLINED_CONSENT');
    });
  });

  describe('getActionLabel', () => {
    it('should return formatted action label in English', () => {
      const log = new VPShareActivityLog({
        timestamp: Date.now() - 60000, // 1 minute ago
      });

      const label = log.getActionLabel('enUS');

      expect(label).toBeDefined();
      expect(typeof label).toBe('string');
      expect(label.length).toBeGreaterThan(0);
    });

    it('should handle different languages', () => {
      const log = new VPShareActivityLog({
        timestamp: Date.now() - 3600000, // 1 hour ago
      });

      const languages = ['enUS', 'hi', 'kn', 'ta', 'ar'];

      languages.forEach(lang => {
        const label = log.getActionLabel(lang);
        expect(label).toBeDefined();
        expect(typeof label).toBe('string');
      });
    });

    it('should show relative time', () => {
      const recentTimestamp = Date.now() - 5000; // 5 seconds ago
      const log = new VPShareActivityLog({timestamp: recentTimestamp});

      const label = log.getActionLabel('enUS');

      expect(label).toBeDefined();
      expect(label.length).toBeGreaterThan(0);
    });

    it('should handle old timestamps', () => {
      const oldTimestamp = Date.now() - 86400000; // 1 day ago
      const log = new VPShareActivityLog({timestamp: oldTimestamp});

      const label = log.getActionLabel('enUS');

      expect(label).toBeDefined();
      expect(label).toContain('ago');
    });
  });

  describe('Activity Log Types', () => {
    it('should handle all success types', () => {
      const successTypes: Array<
        | 'SHARED_SUCCESSFULLY'
        | 'SHARED_WITH_FACE_VERIFIACTION'
        | 'SHARED_AFTER_RETRY'
        | 'SHARED_WITH_FACE_VERIFICATION_AFTER_RETRY'
      > = [
        'SHARED_SUCCESSFULLY',
        'SHARED_WITH_FACE_VERIFIACTION',
        'SHARED_AFTER_RETRY',
        'SHARED_WITH_FACE_VERIFICATION_AFTER_RETRY',
      ];

      successTypes.forEach(type => {
        const log = new VPShareActivityLog({type});
        expect(log.type).toBe(type);
      });
    });

    it('should handle all error types', () => {
      const errorTypes: Array<
        | 'VERIFIER_AUTHENTICATION_FAILED'
        | 'INVALID_AUTH_REQUEST'
        | 'RETRY_ATTEMPT_FAILED'
        | 'MAX_RETRY_ATTEMPT_FAILED'
        | 'FACE_VERIFICATION_FAILED'
        | 'TECHNICAL_ERROR'
      > = [
        'VERIFIER_AUTHENTICATION_FAILED',
        'INVALID_AUTH_REQUEST',
        'RETRY_ATTEMPT_FAILED',
        'MAX_RETRY_ATTEMPT_FAILED',
        'FACE_VERIFICATION_FAILED',
        'TECHNICAL_ERROR',
      ];

      errorTypes.forEach(type => {
        const log = new VPShareActivityLog({type});
        expect(log.type).toBe(type);
      });
    });

    it('should handle credential-related types', () => {
      const credentialTypes: Array<
        | 'NO_SELECTED_VC_HAS_IMAGE'
        | 'CREDENTIAL_MISMATCH_FROM_KEBAB'
        | 'NO_CREDENTIAL_MATCHING_REQUEST'
      > = [
        'NO_SELECTED_VC_HAS_IMAGE',
        'CREDENTIAL_MISMATCH_FROM_KEBAB',
        'NO_CREDENTIAL_MATCHING_REQUEST',
      ];

      credentialTypes.forEach(type => {
        const log = new VPShareActivityLog({type});
        expect(log.type).toBe(type);
      });
    });
  });
});
