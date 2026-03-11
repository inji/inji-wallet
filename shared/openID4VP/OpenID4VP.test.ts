const mockInitSdk = jest.fn();
const mockAuthenticateVerifier = jest.fn();
const mockConstructUnsignedVPToken = jest.fn();
const mockShareVerifiablePresentation = jest.fn();
const mockSendErrorToVerifier = jest.fn();

jest.mock('react-native', () => ({
  NativeModules: {
    InjiOpenID4VP: {
      initSdk: mockInitSdk,
      authenticateVerifier: mockAuthenticateVerifier,
      constructUnsignedVPToken: mockConstructUnsignedVPToken,
      shareVerifiablePresentation: mockShareVerifiablePresentation,
      sendErrorToVerifier: mockSendErrorToVerifier,
    },
  },
}));

jest.mock('../GlobalVariables', () => ({
  __AppId: {setValue: jest.fn(), getValue: jest.fn(() => 'test-app-id')},
}));

jest.mock('../Utils', () => ({
  parseJSON: jest.fn((input: any) => {
    try {
      return JSON.parse(input);
    } catch {
      return input;
    }
  }),
}));

jest.mock('../VCFormat', () => ({
  VCFormat: {
    ldp_vc: 'ldp_vc',
    mso_mdoc: 'mso_mdoc',
    vc_sd_jwt: 'vc_sd_jwt',
    dc_sd_jwt: 'dc_sd_jwt',
  },
}));

jest.mock('../VCMetadata', () => ({
  VCMetadata: class {
    format: string;
    constructor(data: any) {
      Object.assign(this, data);
    }
    getVcKey() {
      return 'vc-key';
    }
    static fromVcMetadataString(s: any) {
      return new this(s);
    }
  },
}));

jest.mock('./walletMetadata', () => ({
  walletMetadata: {mock: true},
}));

jest.mock('./OpenID4VPHelper', () => ({
  getWalletMetadata: jest.fn(() => Promise.resolve(null)),
  isClientValidationRequired: jest.fn(() => Promise.resolve(false)),
}));

describe('OpenID4VP', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe('OpenID4VP_Proof_Sign_Algo', () => {
    it('equals EdDSA', () => {
      const {OpenID4VP_Proof_Sign_Algo} = require('./OpenID4VP');
      expect(OpenID4VP_Proof_Sign_Algo).toBe('EdDSA');
    });
  });

  describe('authenticateVerifier', () => {
    it('should call native authenticateVerifier and parse response', async () => {
      mockAuthenticateVerifier.mockResolvedValue('{"status":"success"}');
      const OpenID4VP = require('./OpenID4VP').default;
      const result = await OpenID4VP.authenticateVerifier('encoded-request', [
        {id: 'v1'},
      ]);
      expect(mockInitSdk).toHaveBeenCalledWith('test-app-id', {mock: true});
      expect(mockAuthenticateVerifier).toHaveBeenCalledWith(
        'encoded-request',
        [{id: 'v1'}],
        false,
      );
      expect(result).toEqual({status: 'success'});
    });

    it('should pass shouldValidateClient from config', async () => {
      const {isClientValidationRequired} = require('./OpenID4VPHelper');
      isClientValidationRequired.mockResolvedValue(true);
      mockAuthenticateVerifier.mockResolvedValue('{}');
      const OpenID4VP = require('./OpenID4VP').default;
      await OpenID4VP.authenticateVerifier('req', []);
      expect(mockAuthenticateVerifier).toHaveBeenCalledWith('req', [], true);
    });
  });

  describe('prepareCredentialsForVPSharing', () => {
    it('should process selected VCs for sharing', async () => {
      const OpenID4VP = require('./OpenID4VP').default;
      const selectedVCs = {
        'inp-1': [
          {
            vcMetadata: {format: 'ldp_vc'},
            verifiableCredential: {credential: {id: 'cred-1'}},
          },
        ],
      };
      const result = await OpenID4VP.prepareCredentialsForVPSharing(
        selectedVCs,
        {},
      );
      expect(result).toHaveProperty('inp-1');
      expect(result['inp-1']).toHaveProperty('ldp_vc');
    });
  });

  describe('constructUnsignedVPToken', () => {
    it('should call native constructUnsignedVPToken and parse result', async () => {
      mockConstructUnsignedVPToken.mockResolvedValue('{"token":"unsigned"}');
      const OpenID4VP = require('./OpenID4VP').default;
      const selectedVCs = {
        'inp-1': [
          {
            vcMetadata: {format: 'ldp_vc'},
            verifiableCredential: {credential: {id: 'cred-1'}},
          },
        ],
      };
      const result = await OpenID4VP.constructUnsignedVPToken(
        selectedVCs,
        {},
        'holder-1',
        'EdDSA',
      );
      expect(mockConstructUnsignedVPToken).toHaveBeenCalled();
      expect(result).toEqual({token: 'unsigned'});
    });
  });

  describe('shareVerifiablePresentation', () => {
    it('should call native shareVerifiablePresentation and parse result', async () => {
      mockShareVerifiablePresentation.mockResolvedValue('{"success":true}');
      const OpenID4VP = require('./OpenID4VP').default;
      const result = await OpenID4VP.shareVerifiablePresentation({
        format: 'ldp_vc',
      });
      expect(mockShareVerifiablePresentation).toHaveBeenCalledWith({
        format: 'ldp_vc',
      });
      expect(result).toEqual({success: true});
    });
  });

  describe('sendErrorToVerifier', () => {
    it('should call native sendErrorToVerifier', async () => {
      mockSendErrorToVerifier.mockResolvedValue('ok');
      const OpenID4VP = require('./OpenID4VP').default;
      await OpenID4VP.sendErrorToVerifier('error msg', 'ERR_001');
      expect(mockSendErrorToVerifier).toHaveBeenCalledWith(
        'error msg',
        'ERR_001',
      );
    });
  });

  describe('singleton pattern', () => {
    it('should use walletMetadata config from getWalletMetadata', async () => {
      const {getWalletMetadata} = require('./OpenID4VPHelper');
      getWalletMetadata.mockResolvedValue({custom: 'metadata'});
      mockAuthenticateVerifier.mockResolvedValue('{}');
      const OpenID4VP = require('./OpenID4VP').default;
      await OpenID4VP.authenticateVerifier('req', []);
      expect(mockInitSdk).toHaveBeenCalledWith('test-app-id', {
        custom: 'metadata',
      });
    });
  });

  describe('processSelectedVCs - extractCredential', () => {
    it('should handle mso_mdoc format', async () => {
      const OpenID4VP = require('./OpenID4VP').default;
      const selectedVCs = {
        'inp-1': [
          {
            vcMetadata: {format: 'mso_mdoc'},
            verifiableCredential: {credential: 'mdoc-data'},
          },
        ],
      };
      const result = await OpenID4VP.prepareCredentialsForVPSharing(
        selectedVCs,
        {},
      );
      expect(result['inp-1']['mso_mdoc']).toEqual(['mdoc-data']);
    });

    it('should handle vc_sd_jwt format with disclosures', async () => {
      const OpenID4VP = require('./OpenID4VP').default;
      const selectedVCs = {
        'inp-1': [
          {
            vcMetadata: {format: 'vc_sd_jwt'},
            verifiableCredential: {
              credential: 'header.payload.sig~disc1~disc2~',
              processedCredential: {
                pathToDisclosures: {
                  name: ['disc1'],
                  email: ['disc2'],
                },
              },
            },
          },
        ],
      };
      const disclosures = {'vc-key': ['name', 'email']};
      const result = await OpenID4VP.prepareCredentialsForVPSharing(
        selectedVCs,
        disclosures,
      );
      expect(result['inp-1']['vc_sd_jwt']).toBeDefined();
      expect(result['inp-1']['vc_sd_jwt'][0]).toContain('~');
    });

    it('should handle dc_sd_jwt format', async () => {
      const OpenID4VP = require('./OpenID4VP').default;
      const selectedVCs = {
        'inp-1': [
          {
            vcMetadata: {format: 'dc_sd_jwt'},
            verifiableCredential: {
              credential: 'jwt-part~',
              processedCredential: {pathToDisclosures: {}},
            },
          },
        ],
      };
      const result = await OpenID4VP.prepareCredentialsForVPSharing(
        selectedVCs,
        {'vc-key': []},
      );
      expect(result['inp-1']['dc_sd_jwt']).toBeDefined();
    });

    it('should throw for sd_jwt with missing credential', async () => {
      const OpenID4VP = require('./OpenID4VP').default;
      const selectedVCs = {
        'inp-1': [
          {
            vcMetadata: {format: 'vc_sd_jwt'},
            verifiableCredential: {
              credential: null,
              processedCredential: {pathToDisclosures: {}},
            },
          },
        ],
      };
      await expect(
        OpenID4VP.prepareCredentialsForVPSharing(selectedVCs, {'vc-key': []}),
      ).rejects.toThrow('Invalid VC: missing credential');
    });
  });
});
