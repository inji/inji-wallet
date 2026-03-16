import {
  sendStartEvent,
  sendEndEvent,
  sendImpressionEvent,
  sendInteractEvent,
  sendAppInfoEvent,
  sendErrorEvent,
  initializeTelemetry,
  getTelemetryConfigData,
  getStartEventData,
  getEndEventData,
  getInteractEventData,
  getInteractDataSubtype,
  getImpressionEventData,
  getErrorEventData,
  getAppInfoEventData,
  incrementRetryCount,
  resetRetryCount,
  configureTelemetry,
  getEventType,
} from './TelemetryUtils';
import {TelemetryConstants} from './TelemetryConstants';

describe('TelemetryUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetRetryCount();
  });

  describe('sendStartEvent', () => {
    it('should be a function', () => {
      expect(typeof sendStartEvent).toBe('function');
    });
    it('should not throw', () => {
      expect(() => sendStartEvent({})).not.toThrow();
    });
  });

  describe('sendEndEvent', () => {
    it('should be a function', () => {
      expect(typeof sendEndEvent).toBe('function');
    });
    it('should not throw', () => {
      expect(() => sendEndEvent({})).not.toThrow();
    });
  });

  describe('sendImpressionEvent', () => {
    it('should not throw', () => {
      expect(() => sendImpressionEvent({})).not.toThrow();
    });
  });

  describe('sendInteractEvent', () => {
    it('should not throw', () => {
      expect(() => sendInteractEvent({})).not.toThrow();
    });
  });

  describe('sendAppInfoEvent', () => {
    it('should not throw', () => {
      expect(() => sendAppInfoEvent({})).not.toThrow();
    });
  });

  describe('sendErrorEvent', () => {
    it('should not throw', () => {
      expect(() => sendErrorEvent({})).not.toThrow();
    });
  });

  describe('initializeTelemetry', () => {
    it('should not throw when called with config', () => {
      expect(() => initializeTelemetry({})).not.toThrow();
    });
  });

  describe('getTelemetryConfigData', () => {
    it('should return config with required fields', () => {
      const config = getTelemetryConfigData();
      expect(config).toHaveProperty('appid');
      expect(config).toHaveProperty('batchsize');
      expect(config).toHaveProperty('host');
      expect(config).toHaveProperty('endpoint');
      expect(config).toHaveProperty('enableValidation');
      expect(config.batchsize).toBe(5);
    });
  });

  describe('getStartEventData', () => {
    it('should return event with type', () => {
      const data = getStartEventData('testType');
      expect(data.type).toBe('testType');
      expect(data.additionalParameters).toEqual({});
    });

    it('should include additional parameters', () => {
      const data = getStartEventData('testType', {key: 'value'});
      expect(data.additionalParameters).toEqual({key: 'value'});
    });
  });

  describe('getEndEventData', () => {
    it('should return event with type and status', () => {
      const data = getEndEventData('testType', 'SUCCESS');
      expect(data.type).toBe('testType');
      expect(data.status).toBe('SUCCESS');
      expect(data.additionalParameters).toEqual({});
    });

    it('should include additional parameters', () => {
      const data = getEndEventData('type', 'FAILURE', {error: 'test'});
      expect(data.additionalParameters).toEqual({error: 'test'});
    });
  });

  describe('getInteractEventData', () => {
    it('should return interact data with subtype', () => {
      const data = getInteractEventData('type', 'CLICK', 'button');
      expect(data.type).toBe('type');
      expect(data.subtype).toBe('CLICK_button');
    });
  });

  describe('getInteractDataSubtype', () => {
    it('should concatenate interaction type and target', () => {
      expect(getInteractDataSubtype('CLICK', 'button')).toBe('CLICK_button');
    });
  });

  describe('getImpressionEventData', () => {
    it('should return impression data', () => {
      const data = getImpressionEventData('type', 'subtype');
      expect(data.type).toBe('type');
      expect(data.subtype).toBe('subtype');
      expect(data.additionalParameters).toEqual({});
    });
  });

  describe('getErrorEventData', () => {
    it('should return error data with type and message', () => {
      const data = getErrorEventData('flowType', 'errorId', 'Error message');
      expect(data.type).toBe('flowType');
      expect(data.errorId).toBe('errorId');
      expect(data.errorMessage).toBe('Error message');
    });

    it('should include app info data', () => {
      const data = getErrorEventData('flowType', 'errorId', 'msg');
      expect(data).toHaveProperty('env');
      expect(data).toHaveProperty('brandName');
      expect(data).toHaveProperty('osName');
    });
  });

  describe('getAppInfoEventData', () => {
    it('should return app info with required fields', () => {
      const data = getAppInfoEventData();
      expect(data).toHaveProperty('env');
      expect(data).toHaveProperty('brandName');
      expect(data).toHaveProperty('modelName');
      expect(data).toHaveProperty('osName');
      expect(data).toHaveProperty('osVersion');
      expect(data).toHaveProperty('dateTime');
      expect(data).toHaveProperty('zone');
      expect(data).toHaveProperty('preferredLanguage');
    });
  });

  describe('incrementRetryCount', () => {
    it('should not throw on multiple retries', () => {
      expect(() => {
        incrementRetryCount('test', 'Home');
        incrementRetryCount('test', 'Home');
        incrementRetryCount('test', 'Home');
      }).not.toThrow();
    });

    it('should not throw on 5th retry for passcode screen', () => {
      expect(() => {
        for (let i = 0; i < 5; i++) {
          incrementRetryCount('test', TelemetryConstants.Screens.passcode);
        }
      }).not.toThrow();
    });
  });

  describe('resetRetryCount', () => {
    it('should not throw', () => {
      expect(() => resetRetryCount()).not.toThrow();
    });
  });

  describe('configureTelemetry', () => {
    it('should not throw', () => {
      expect(() => configureTelemetry()).not.toThrow();
    });
  });

  describe('getEventType', () => {
    it('should return appOnboarding when isSettingUp is true', () => {
      expect(getEventType(true)).toBe(
        TelemetryConstants.FlowType.appOnboarding,
      );
    });

    it('should return appLogin when isSettingUp is false', () => {
      expect(getEventType(false)).toBe(TelemetryConstants.FlowType.appLogin);
    });
  });
});
