import {EventTypes, VerificationStatus} from './events';

describe('shared/tuvali', () => {
  describe('EventTypes', () => {
    it('should have all event type values', () => {
      expect(EventTypes.onConnected).toBe('onConnected');
      expect(EventTypes.onSecureChannelEstablished).toBe(
        'onSecureChannelEstablished',
      );
      expect(EventTypes.onDataSent).toBe('onDataSent');
      expect(EventTypes.onDataReceived).toBe('onDataReceived');
      expect(EventTypes.onVerificationStatusReceived).toBe(
        'onVerificationStatusReceived',
      );
      expect(EventTypes.onError).toBe('onError');
      expect(EventTypes.onDisconnected).toBe('onDisconnected');
    });
  });

  describe('VerificationStatus', () => {
    it('should have ACCEPTED and REJECTED values', () => {
      expect(VerificationStatus.ACCEPTED).toBe(0);
      expect(VerificationStatus.REJECTED).toBe(1);
    });
  });
});
