import {VCActivityLog} from './ActivityLogEvent';

jest.mock('jsonld', () => ({
  compact: jest.fn(),
  expand: jest.fn(),
}));

describe('ActivityLog', () => {
  let instance: {timestamp: any};

  beforeEach(() => {
    instance = new VCActivityLog();
  });

  it('Activity log instance should have a timestamp set', () => {
    expect(instance.timestamp).not.toBeUndefined();
  });
});

describe('getActionText', () => {
  let activityLog;
  let mockIl18nfn;
  const wellknown = {
    credential_configurations_supported: {
      mockId: {
        display: [
          {
            name: 'fake VC',
            locale: 'en',
            logo: {
              url: 'https://mosip.github.io/inji-config/logos/mosipid-logo.png',
              alt_text: 'a square logo of a MOSIP',
            },
            background_color: '#1A0983',
            background_image: {
              uri: 'https://mosip.github.io/inji-config/logos/mosipid-logo.png',
            },
            text_color: '#000000',
          },
        ],
      },
    },
  };
  beforeEach(() => {
    mockIl18nfn = jest.fn();
    activityLog = new VCActivityLog({
      id: 'mockId',
      credentialConfigurationId: 'mockId',
      idType: ['mockIDtype'] as string[],
      _vcKey: 'mock_vc_key',
      type: 'mockType',
      timestamp: 1234,
      deviceName: 'fakeDevice',
      vcLabel: 'fakeVClabel',
    });
  });
  // BDD examples
  it('should fetch id type from translation file mock', () => {
    mockIl18nfn.mockImplementation(input => {
      if (input === `VcDetails:mockIDtype`) {
        return 'National ID';
      }
    });
    activityLog.getActionText(mockIl18nfn, wellknown);
    expect(mockIl18nfn).toHaveBeenCalledWith('mockType', {
      idType: 'fake VC',
      vcStatus: '',
    });
    expect(mockIl18nfn).toHaveBeenCalledTimes(1);
  });

  it('should use identity card fallback when wellknown is undefined', () => {
    mockIl18nfn.mockImplementation(input => input);
    activityLog.getActionText(mockIl18nfn, undefined);
    expect(mockIl18nfn).toHaveBeenCalledWith('mockType', {
      idType: 'VcDetails:identityCard',
      vcStatus: '',
    });
  });

  it('should append vcStatus to type when vcStatus is set', () => {
    mockIl18nfn.mockImplementation(input => input);
    activityLog.vcStatus = 'expired';
    activityLog.getActionText(mockIl18nfn, wellknown);
    expect(mockIl18nfn).toHaveBeenCalledWith('mockType.expired', {
      idType: 'fake VC',
      vcStatus: 'expired',
    });
  });
});

describe('VCActivityLog.getLogFromObject', () => {
  it('should create VCActivityLog instance from object', () => {
    const mockData = {
      id: 'test-id',
      type: 'VC_ADDED',
      timestamp: 1234567890,
      deviceName: 'Test Device',
    };

    const log = VCActivityLog.getLogFromObject(mockData);

    expect(log).toBeInstanceOf(VCActivityLog);
    expect(log.id).toBe('test-id');
    expect(log.type).toBe('VC_ADDED');
    expect(log.timestamp).toBe(1234567890);
    expect(log.deviceName).toBe('Test Device');
  });

  it('should create VCActivityLog from empty object', () => {
    const log = VCActivityLog.getLogFromObject({});

    expect(log).toBeInstanceOf(VCActivityLog);
    expect(log.timestamp).toBeDefined();
  });
});

describe('VCActivityLog.getActionLabel', () => {
  it('should return formatted action label with device name and time', () => {
    const mockLog = new VCActivityLog({
      deviceName: 'iPhone 12',
      timestamp: Date.now() - 60000, // 1 minute ago
    });

    const label = mockLog.getActionLabel('en');

    expect(label).toContain('iPhone 12');
    expect(label).toContain('·');
    expect(label).toContain('ago');
  });

  it('should return only time when device name is empty', () => {
    const mockLog = new VCActivityLog({
      deviceName: '',
      timestamp: Date.now() - 120000, // 2 minutes ago
    });

    const label = mockLog.getActionLabel('en');

    expect(label).not.toContain('·');
    expect(label).toContain('ago');
  });

  it('should filter out empty labels', () => {
    const mockLog = new VCActivityLog({
      deviceName: '   ', // whitespace only
      timestamp: Date.now(),
    });

    const label = mockLog.getActionLabel('en');

    expect(label).not.toContain('·');
    expect(label).toBeTruthy();
  });
});
