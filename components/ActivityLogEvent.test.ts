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

describe('getActionText', () => {
  let activityLog;
  let mockIl18nfn;
  let wellknown = {
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
