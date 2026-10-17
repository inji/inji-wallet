import {VCActivityLog} from './ActivityLogEvent';

describe('ActivityLog', () => {
  let instance: {timestamp: any};

  beforeEach(() => {
    instance = new VCActivityLog();
    jest.mock('jsonld', () => ({
      compact: jest.fn(),
      expand: jest.fn(),
    }));
  });

  it('Activity log instance should have a timestamp set', () => {
    expect(instance.timestamp).not.toBeUndefined();
  });
});

describe('VCActivityLog credential and issuer names', () => {
  const t = jest.fn(key => key) as any;

  it('copies the names from a card metadata record', () => {
    expect(
      VCActivityLog.namesFrom({
        credentialType: 'Driving Licence',
        issuerName: 'Road Transport Authority',
      }),
    ).toEqual({
      credentialName: 'Driving Licence',
      issuerName: 'Road Transport Authority',
    });
    expect(VCActivityLog.namesFrom(undefined)).toEqual({
      credentialName: '',
      issuerName: '',
    });
  });

  it('labels the credential with its saved name before any lookup', () => {
    const log = new VCActivityLog({
      credentialName: 'Driving Licence',
      credentialConfigurationId: 'unknown',
    });
    expect(log.getCredentialTypeLabel(t, {})).toBe('Driving Licence');
  });

  it('falls back to the generic label without a saved name or metadata', () => {
    expect(new VCActivityLog().getCredentialTypeLabel(t, undefined)).toBe(
      'VcDetails:identityCard',
    );
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
    jest.mock('jsonld', () => ({
      compact: jest.fn(),
      expand: jest.fn(),
    }));
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
    // TODO: assert the returned string
  });
  it.skip('should not fetch id type from translation file mock', () => {
    // Reason: The test assertion needs fix
    activityLog.idType = undefined;
    activityLog.getActionText(mockIl18nfn, wellknown);
    expect(mockIl18nfn).toHaveBeenCalledWith('mockType', {
      idType: '',
    });
    expect(mockIl18nfn).toHaveBeenCalledTimes(1);
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

  it('should format time with device name in English locale', () => {
    const mockLog = new VCActivityLog({
      deviceName: 'Test Device',
      timestamp: Date.now() - 300000, // 5 minutes ago
    });

    const labelEn = mockLog.getActionLabel('en');
    expect(labelEn).toBeTruthy();
    expect(labelEn).toContain('Test Device');
  });
});
