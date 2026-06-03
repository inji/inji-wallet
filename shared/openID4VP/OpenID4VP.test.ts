import type {VC} from '../../machines/VerifiableCredential/VCMetaMachine/vc';
import {NativeModules, Platform} from 'react-native';
import {
  claimPathPointersToJsonPath,
  getWalletConfig,
  isDcqlFlow,
  isClientValidationRequired,
  jsonLdCanonicalize,
} from './OpenID4VPHelper';
import {jsonLdExpand} from '../Utils';
import {
  getIssuerAuthenticationAlorithmForMdocVC,
  getMdocAuthenticationAlorithm,
} from '../../components/VC/common/VCUtils';
import {CACHED_API} from '../api';
import {isIOS} from '../constants';
// Import OpenID4VP here to ensure jest.mocks are applied before module loading
import OpenID4VPModule from './OpenID4VP';

const mockInitSdk = jest.fn();
const mockAuthenticateVerifier = jest.fn();
const mockConstructUnsignedVPToken = jest.fn();
const mockShareVerifiablePresentation = jest.fn();
const mockSendErrorToVerifier = jest.fn();
const mockGetMatchingCredentials = jest.fn();
const mockSendJsonLdCanonicalizeResultFromJS = jest.fn();
const mockSendJsonLdExpandResultFromJS = jest.fn();
const mockNotifyCanonicalizationFailureFromJS = jest.fn();
const mockEmitterListeners: Record<string, (...args: unknown[]) => void> = {};

const mockAddListener = jest.fn(
  (event: string, listener: (...args: unknown[]) => void) => {
    mockEmitterListeners[event] = listener;
    return {remove: jest.fn()};
  },
);

type MockInjiOpenID4VP = {
  getMatchingCredentials: jest.Mock;
  sendJsonLdCanonicalizeResultFromJS: jest.Mock;
  sendJsonLdExpandResultFromJS: jest.Mock;
  notifyCanonicalizationFailureFromJS: jest.Mock;
};

jest.mock('react-native', () => {
  const reactNative = jest.requireActual('react-native');

  const platformMock: any = {
    OS: 'android',
    Version: 34,
  };

  return {
    ...reactNative,
    NativeEventEmitter: jest.fn(function () {
      this.addListener = mockAddListener;
      return this;
    }),
    NativeModules: {
      ...reactNative.NativeModules,
      InjiOpenID4VP: {
        initSdk: mockInitSdk,
        authenticateVerifier: mockAuthenticateVerifier,
        constructUnsignedVPToken: mockConstructUnsignedVPToken,
        shareVerifiablePresentation: mockShareVerifiablePresentation,
        sendErrorToVerifier: mockSendErrorToVerifier,
        getMatchingCredentials: mockGetMatchingCredentials,
        sendJsonLdCanonicalizeResultFromJS:
          mockSendJsonLdCanonicalizeResultFromJS,
        sendJsonLdExpandResultFromJS: mockSendJsonLdExpandResultFromJS,
        notifyCanonicalizationFailureFromJS:
          mockNotifyCanonicalizationFailureFromJS,
      },
    },
    Platform: platformMock,
    Dimensions: {
      ...reactNative.Dimensions,
      get: jest.fn(() => ({width: 320, height: 640})),
    },
  };
});

jest.mock('../../components/VC/common/VCUtils', () => ({
  getIssuerAuthenticationAlorithmForMdocVC: jest.fn(),
  getMdocAuthenticationAlorithm: jest.fn(),
}));

jest.mock('../GlobalVariables', () => ({
  __AppId: {setValue: jest.fn(), getValue: jest.fn(() => 'test-app-id')},
}));

jest.mock('../constants', () => {
  const actualConstants = jest.requireActual('../constants');
  return {
    ...actualConstants,
    isIOS: jest.fn(() => false),
  };
});

jest.mock('../Utils', () => ({
  parseJSON: jest.fn((input: unknown) => {
    if (typeof input !== 'string') {
      return input;
    }

    try {
      return JSON.parse(input);
    } catch {
      return input;
    }
  }),
  jsonLdExpand: jest.fn((input: unknown) => Promise.resolve(input)),
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
  VCMetadata: {
    fromVcMetadataString: jest.fn(() => ({
      getVcKey: () => 'vc-key',
    })),
  },
}));

jest.mock('../api', () => ({
  CACHED_API: {
    fetchTrustedVerifiersList: jest.fn(() =>
      Promise.resolve({
        data: {
          response: {
            verifiers: [],
          },
        },
      }),
    ),
  },
}));

jest.mock('./walletConfig/WalletConfig', () => ({
  defaultWalletConfig: {mock: true},
}));

jest.mock('./OpenID4VPHelper', () => ({
  getWalletConfig: jest.fn(() => Promise.resolve(null)),
  isClientValidationRequired: jest.fn(() => Promise.resolve(false)),
  jsonLdCanonicalize: jest.fn(() => Promise.resolve('')),
  isDcqlFlow: jest.fn(() => false),
  claimPathPointersToJsonPath: jest.fn((path: Array<string | number | null>) =>
    path.join('.'),
  ),
}));

const mockedGetWalletConfig = jest.mocked(getWalletConfig);
const mockedIsClientValidationRequired = jest.mocked(
  isClientValidationRequired,
);
const mockedJsonLdCanonicalize = jest.mocked(jsonLdCanonicalize);
const mockedJsonLdExpand = jest.mocked(jsonLdExpand);
const mockedClaimPathPointersToJsonPath = jest.mocked(
  claimPathPointersToJsonPath,
);
const mockedIsDcqlFlow = jest.mocked(isDcqlFlow);
const mockedGetIssuerAuthenticationAlorithmForMdocVC = jest.mocked(
  getIssuerAuthenticationAlorithmForMdocVC,
);
const mockedGetMdocAuthenticationAlorithm = jest.mocked(
  getMdocAuthenticationAlorithm,
);
const mockedFetchTrustedVerifiersList = jest.mocked(
  CACHED_API.fetchTrustedVerifiersList,
);
const mockedIsIOS = jest.mocked(isIOS);

let OpenID4VP = OpenID4VPModule;

const getOpenID4VPNativeModule = () => NativeModules.InjiOpenID4VP;

const resetOpenID4VPInstance = () => {
  (OpenID4VP as unknown as {instance?: unknown}).instance = undefined;
};

const setPlatformOS = (os: 'android' | 'ios') => {
  (Platform as any).OS = os;
};

const flushPromises = () => new Promise(resolve => setImmediate(resolve));

const buildVc = (
  id: string,
  format: string,
  credential: unknown,
  processedCredential?: object,
): VC => ({
  vcMetadata: {id, format} as VC['vcMetadata'],
  verifiableCredential: {
    credential,
    ...(processedCredential ? {processedCredential} : {}),
  } as VC['verifiableCredential'],
  lastVerifiedOn: 0,
});

const buildSelectedVCs = (...vcs: VC[]): Record<string, VC[]> => ({
  'inp-1': vcs,
});

const buildPresentationDefinitionVc = (
  format: string,
  credential: unknown,
  verifiableCredentialExtras?: Record<string, unknown>,
): VC & {format: string} =>
  ({
    format,
    vcMetadata: {id: `cred-${format}`, format},
    verifiableCredential: {
      credential,
      ...(verifiableCredentialExtras ?? {}),
    },
    lastVerifiedOn: 0,
  } as VC & {format: string});

describe('OpenID4VP', () => {
  beforeEach(() => {
    resetOpenID4VPInstance();
    // Manually reset mocks instead of jest.clearAllMocks() to preserve mockAddListener
    mockInitSdk.mockClear();
    mockAuthenticateVerifier.mockClear();
    mockConstructUnsignedVPToken.mockClear();
    mockShareVerifiablePresentation.mockClear();
    mockSendErrorToVerifier.mockClear();
    mockGetMatchingCredentials.mockClear();
    mockSendJsonLdCanonicalizeResultFromJS.mockClear();
    mockSendJsonLdExpandResultFromJS.mockClear();
    mockNotifyCanonicalizationFailureFromJS.mockClear();
    // Don't clear  mockAddListener to preserve its implementation
    mockedGetWalletConfig.mockClear();
    mockedIsClientValidationRequired.mockClear();
    mockedJsonLdCanonicalize.mockClear();
    mockedJsonLdExpand.mockClear();
    mockedClaimPathPointersToJsonPath.mockClear();
    mockedIsDcqlFlow.mockClear();
    mockedGetIssuerAuthenticationAlorithmForMdocVC.mockClear();
    mockedGetMdocAuthenticationAlorithm.mockClear();
    mockedFetchTrustedVerifiersList.mockClear();
    mockedIsIOS.mockClear();
    Object.keys(mockEmitterListeners).forEach(
      key => delete mockEmitterListeners[key],
    );
    setPlatformOS('android');

    // Default: isIOS returns false (Android)
    mockedIsIOS.mockReturnValue(false);

    const nativeModule = getOpenID4VPNativeModule() as MockInjiOpenID4VP;
    nativeModule.getMatchingCredentials = mockGetMatchingCredentials;
    nativeModule.sendJsonLdCanonicalizeResultFromJS =
      mockSendJsonLdCanonicalizeResultFromJS;
    nativeModule.sendJsonLdExpandResultFromJS =
      mockSendJsonLdExpandResultFromJS;
    nativeModule.notifyCanonicalizationFailureFromJS =
      mockNotifyCanonicalizationFailureFromJS;

    mockedGetWalletConfig.mockResolvedValue(null);
    mockedIsClientValidationRequired.mockResolvedValue(false);
    mockedJsonLdCanonicalize.mockResolvedValue('');
    mockedJsonLdExpand.mockResolvedValue([]);
    mockedClaimPathPointersToJsonPath.mockImplementation(
      (path: Array<string | number | null>) => path.join('.'),
    );
    mockedGetIssuerAuthenticationAlorithmForMdocVC.mockReturnValue('ES256');
    mockedGetMdocAuthenticationAlorithm.mockReturnValue('ES256');
    mockedFetchTrustedVerifiersList.mockResolvedValue({
      data: {
        response: {
          verifiers: [],
        },
      },
    } as never);
  });

  describe('authenticateVerifier', () => {
    it('should call native authenticateVerifier and parse response', async () => {
      const nativeModule = getOpenID4VPNativeModule();
      nativeModule.authenticateVerifier.mockResolvedValue(
        '{"status":"success"}',
      );

      const result = await OpenID4VP.authenticateVerifier('encoded-request');

      expect(nativeModule.initSdk).toHaveBeenCalledWith('test-app-id', {
        mock: true,
        trusted_verifiers: [],
      });
      expect(nativeModule.authenticateVerifier).toHaveBeenCalledWith(
        'encoded-request',
        false,
      );
      expect(result).toEqual({status: 'success'});
    });

    it('should pass shouldValidateClient from config', async () => {
      mockedIsClientValidationRequired.mockResolvedValue(true);
      const nativeModule = getOpenID4VPNativeModule();
      nativeModule.authenticateVerifier.mockResolvedValue('{}');

      await OpenID4VP.authenticateVerifier('req');

      expect(nativeModule.authenticateVerifier).toHaveBeenCalledWith(
        'req',
        true,
      );
    });
  });

  describe('prepareCredentialsForVPSharing', () => {
    it('should process selected VCs for sharing', async () => {
      const selectedVCs = buildSelectedVCs(
        buildVc('cred-1', 'ldp_vc', {id: 'cred-1'}),
      );

      const result = await OpenID4VP.prepareCredentialsForVPSharing(
        {},
        selectedVCs,
        {},
      );

      expect(result).toEqual({
        'inp-1': {
          ldp_vc: [{id: 'cred-1'}],
        },
      });
    });
  });

  describe('constructUnsignedVPToken', () => {
    it('should call native constructUnsignedVPToken and parse result', async () => {
      const nativeModule = getOpenID4VPNativeModule();
      nativeModule.constructUnsignedVPToken.mockResolvedValue(
        '{"token":"unsigned"}',
      );
      const selectedVCs = buildSelectedVCs(
        buildVc('cred-1', 'ldp_vc', {id: 'cred-1'}),
      );

      const result = await OpenID4VP.constructUnsignedVPToken(
        {},
        selectedVCs,
        {},
      );

      expect(nativeModule.constructUnsignedVPToken).toHaveBeenCalledWith({
        'inp-1': [
          {
            credential: {id: 'cred-1'},
            credentialId: 'cred-1',
            format: 'ldp_vc',
          },
        ],
      });
      expect(result).toEqual({token: 'unsigned'});
    });
  });

  describe('shareVerifiablePresentation', () => {
    it('should call native shareVerifiablePresentation and parse result', async () => {
      const nativeModule = getOpenID4VPNativeModule();
      nativeModule.shareVerifiablePresentation.mockResolvedValue(
        '{"success":true}',
      );

      const result = await OpenID4VP.shareVerifiablePresentation({
        format: 'ldp_vc',
      });

      expect(nativeModule.shareVerifiablePresentation).toHaveBeenCalledWith({
        format: 'ldp_vc',
      });
      expect(result).toEqual({success: true});
    });
  });

  describe('sendErrorToVerifier', () => {
    it('should call native sendErrorToVerifier', async () => {
      const nativeModule = getOpenID4VPNativeModule();
      nativeModule.sendErrorToVerifier.mockResolvedValue('ok');

      await OpenID4VP.sendErrorToVerifier('error msg', 'ERR_001');

      expect(nativeModule.sendErrorToVerifier).toHaveBeenCalledWith(
        'error msg',
        'ERR_001',
      );
    });
  });

  describe('singleton pattern', () => {
    it('should use wallet config from getWalletConfig', async () => {
      mockedGetWalletConfig.mockResolvedValue({custom: 'metadata'} as never);
      const nativeModule = getOpenID4VPNativeModule();
      nativeModule.authenticateVerifier.mockResolvedValue('{}');

      await OpenID4VP.authenticateVerifier('req');

      expect(nativeModule.initSdk).toHaveBeenCalledWith('test-app-id', {
        custom: 'metadata',
        trusted_verifiers: [],
      });
    });
  });

  describe('processSelectedVCs - extractCredential', () => {
    it('should handle mso_mdoc format', async () => {
      const selectedVCs = buildSelectedVCs(
        buildVc('cred-1', 'mso_mdoc', 'mdoc-data'),
      );

      const result = await OpenID4VP.prepareCredentialsForVPSharing(
        {},
        selectedVCs,
        {},
      );

      expect(result['inp-1']['mso_mdoc']).toEqual(['mdoc-data']);
    });

    it('should handle vc_sd_jwt format with disclosures', async () => {
      const selectedVCs = buildSelectedVCs(
        buildVc('cred-1', 'vc_sd_jwt', 'header.payload.sig~disc1~disc2~', {
          pathToDisclosures: {
            name: ['disc1'],
            email: ['disc2'],
          },
        }),
      );
      const disclosures = {'vc-key': ['name', 'email']};

      const result = await OpenID4VP.prepareCredentialsForVPSharing(
        {},
        selectedVCs,
        disclosures,
      );

      expect(result['inp-1']['vc_sd_jwt']).toEqual([
        'header.payload.sig~disc1~disc2~',
      ]);
    });

    it('should handle dc_sd_jwt format', async () => {
      const selectedVCs = buildSelectedVCs(
        buildVc('cred-1', 'dc_sd_jwt', 'jwt-part~', {pathToDisclosures: {}}),
      );

      const result = await OpenID4VP.prepareCredentialsForVPSharing(
        {},
        selectedVCs,
        {'vc-key': []},
      );

      expect(result['inp-1']['dc_sd_jwt']).toEqual(['jwt-part~']);
    });

    it('should sanitize wildcard disclosure paths before lookup', async () => {
      mockedIsDcqlFlow.mockReturnValue(true);
      const selectedVCs = buildSelectedVCs(
        buildVc('cred-1', 'vc_sd_jwt', 'header.payload.sig~disc1~', {
          pathToDisclosures: {
            degrees: ['disc1'],
          },
        }),
      );
      const disclosures = {'vc-key': ['degrees[*]']};

      const result = await OpenID4VP.prepareCredentialsForVPSharing(
        {},
        selectedVCs,
        disclosures,
      );

      expect(result['inp-1']['vc_sd_jwt']).toEqual([
        'header.payload.sig~disc1~',
      ]);
    });

    it('should fallback to parent path when exact disclosure path is missing', async () => {
      mockedIsDcqlFlow.mockReturnValue(true);
      const selectedVCs = buildSelectedVCs(
        buildVc('cred-1', 'vc_sd_jwt', 'header.payload.sig~disc1~', {
          pathToDisclosures: {
            address: ['disc1'],
          },
        }),
      );
      const disclosures = {'vc-key': ['address.city']};

      const result = await OpenID4VP.prepareCredentialsForVPSharing(
        {},
        selectedVCs,
        disclosures,
      );

      expect(result['inp-1']['vc_sd_jwt']).toEqual([
        'header.payload.sig~disc1~',
      ]);
    });

    it('should fallback to the nearest parent path for deeply nested selection', async () => {
      mockedIsDcqlFlow.mockReturnValue(true);
      const selectedVCs = buildSelectedVCs(
        buildVc('cred-1', 'vc_sd_jwt', 'header.payload.sig~disc1~', {
          pathToDisclosures: {
            'address.city': ['disc1'],
          },
        }),
      );
      const disclosures = {'vc-key': ['address.city.name']};

      const result = await OpenID4VP.prepareCredentialsForVPSharing(
        {},
        selectedVCs,
        disclosures,
      );

      expect(result['inp-1']['vc_sd_jwt']).toEqual([
        'header.payload.sig~disc1~',
      ]);
    });

    it('should match all indexed paths for wildcard array selections', async () => {
      mockedIsDcqlFlow.mockReturnValue(true);
      const selectedVCs = buildSelectedVCs(
        buildVc('cred-1', 'vc_sd_jwt', 'header.payload.sig~disc1~disc2~', {
          pathToDisclosures: {
            'degrees.0.type': ['disc1'],
            'degrees.1.type': ['disc2'],
          },
        }),
      );
      const disclosures = {'vc-key': ['degrees[*].type']};

      const result = await OpenID4VP.prepareCredentialsForVPSharing(
        {},
        selectedVCs,
        disclosures,
      );

      expect(result['inp-1']['vc_sd_jwt']).toEqual([
        'header.payload.sig~disc1~disc2~',
      ]);
    });

    it('should fallback from wildcard leaf path to indexed parent path', async () => {
      mockedIsDcqlFlow.mockReturnValue(true);
      const selectedVCs = buildSelectedVCs(
        buildVc('cred-1', 'vc_sd_jwt', 'header.payload.sig~disc1~', {
          pathToDisclosures: {
            'degrees.0': ['disc1'],
          },
        }),
      );
      const disclosures = {'vc-key': ['degrees[*].type']};

      const result = await OpenID4VP.prepareCredentialsForVPSharing(
        {},
        selectedVCs,
        disclosures,
      );

      expect(result['inp-1']['vc_sd_jwt']).toEqual([
        'header.payload.sig~disc1~',
      ]);
    });

    it('should throw for sd_jwt with missing credential', async () => {
      const selectedVCs = buildSelectedVCs(
        buildVc('cred-1', 'vc_sd_jwt', null, {pathToDisclosures: {}}),
      );

      await expect(
        OpenID4VP.prepareCredentialsForVPSharing({}, selectedVCs, {
          'vc-key': [],
        }),
      ).rejects.toThrow('Invalid VC: missing credential');
    });
  });

  describe('getMatchingCredentials - presentation definition case', () => {
    it('matches ldp_vc format with proof type', async () => {
      const vc = buildPresentationDefinitionVc('ldp_vc', {
        proof: {type: 'Ed25519Signature2018'},
        credentialSubject: {name: 'John'},
      });

      const result = await OpenID4VP.getMatchingCredentials(
        {
          presentation_definition: {
            input_descriptors: [
              {
                id: 'desc1',
                format: {ldp_vc: {proof_type: ['Ed25519Signature2018']}},
                constraints: {
                  fields: [
                    {
                      path: ['$.credentialSubject.name'],
                      filter: {type: 'string'},
                    },
                  ],
                },
              },
            ],
          },
        },
        [vc],
      );

      expect(result.success).toBe(true);
      expect(result.matchingVCs.desc1).toHaveLength(1);
      expect(result.requestedClaims).toEqual(new Set<string>(['name']));
      expect(result.purpose).toBe('');
    });

    it('matches mso_mdoc format with alg', async () => {
      const vc = buildPresentationDefinitionVc('mso_mdoc', 'mdoc-data', {
        processedCredential: {
          issuerSigned: {
            issuerAuth: [{'1': 'certData'}, null, 'authData'],
            nameSpaces: {},
          },
        },
      });

      const result = await OpenID4VP.getMatchingCredentials(
        {
          presentation_definition: {
            input_descriptors: [
              {
                id: 'desc1',
                format: {mso_mdoc: {alg: ['ES256']}},
                constraints: {fields: undefined},
              },
            ],
          },
        },
        [vc],
      );

      expect(result.success).toBe(true);
      expect(result.matchingVCs.desc1).toHaveLength(1);
    });

    it('handles mso_mdoc without issuerSigned (uses issuerAuth directly)', async () => {
      const vc = buildPresentationDefinitionVc('mso_mdoc', 'mdoc-data', {
        processedCredential: {
          issuerAuth: [{'1': 'certData'}, null, 'authData'],
          nameSpaces: {},
        },
      });

      const result = await OpenID4VP.getMatchingCredentials(
        {
          presentation_definition: {
            input_descriptors: [
              {
                id: 'mdoc-desc',
                format: {mso_mdoc: {alg: ['ES256']}},
                constraints: {fields: undefined},
              },
            ],
          },
        },
        [vc],
      );

      expect(result.success).toBe(true);
      expect(result.matchingVCs['mdoc-desc']).toHaveLength(1);
    });

    it('handles mso_mdoc format error gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const vc = buildPresentationDefinitionVc('mso_mdoc', 'mdoc-data', {
        processedCredential: null,
      });

      const result = await OpenID4VP.getMatchingCredentials(
        {
          presentation_definition: {
            input_descriptors: [
              {
                id: 'desc1',
                format: {mso_mdoc: {alg: ['ES256']}},
                constraints: {fields: undefined},
              },
            ],
          },
        },
        [vc],
      );

      expect(result.success).toBe(false);
      expect(result.matchingVCs).toEqual({});
      consoleSpy.mockRestore();
    });

    it('matches vc_sd_jwt format with alg', async () => {
      const header = Buffer.from(JSON.stringify({alg: 'ES256'})).toString(
        'base64',
      );
      const sdJwt = `${header}.payload.signature~`;
      const vc = buildPresentationDefinitionVc('vc_sd_jwt', sdJwt, {
        fullResolvedPayload: {sub: 'test'},
      });

      const result = await OpenID4VP.getMatchingCredentials(
        {
          presentation_definition: {
            input_descriptors: [
              {
                id: 'desc1',
                format: {vc_sd_jwt: {'sd-jwt_alg_values': ['ES256']}},
                constraints: {fields: undefined},
              },
            ],
          },
        },
        [vc],
      );

      expect(result.success).toBe(true);
      expect(result.matchingVCs.desc1).toHaveLength(1);
    });

    it('matches dc_sd_jwt format', async () => {
      const header = Buffer.from(JSON.stringify({alg: 'ES256'})).toString(
        'base64',
      );
      const sdJwt = `${header}.payload.signature~`;
      const vc = buildPresentationDefinitionVc('dc_sd_jwt', sdJwt, {
        fullResolvedPayload: {sub: 'test'},
      });

      const result = await OpenID4VP.getMatchingCredentials(
        {
          presentation_definition: {
            input_descriptors: [
              {
                id: 'desc1',
                format: {dc_sd_jwt: {'sd-jwt_alg_values': ['ES256']}},
                constraints: {fields: undefined},
              },
            ],
          },
        },
        [vc],
      );

      expect(result.success).toBe(true);
      expect(result.matchingVCs.desc1).toHaveLength(1);
    });

    it('handles sd_jwt format error gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const vc = buildPresentationDefinitionVc('vc_sd_jwt', 'invalid-jwt');

      const result = await OpenID4VP.getMatchingCredentials(
        {
          presentation_definition: {
            input_descriptors: [
              {
                id: 'desc1',
                format: {vc_sd_jwt: {'sd-jwt_alg_values': ['ES256']}},
                constraints: {fields: undefined},
              },
            ],
          },
        },
        [vc],
      );

      expect(result.success).toBe(false);
      expect(result.matchingVCs).toEqual({});
      consoleSpy.mockRestore();
    });

    it('returns requestedClaims for format mismatch', async () => {
      const vc = buildPresentationDefinitionVc('ldp_vc', {
        proof: {type: 'UnknownProof'},
      });

      const result = await OpenID4VP.getMatchingCredentials(
        {
          presentation_definition: {
            input_descriptors: [
              {
                id: 'desc1',
                format: {ldp_vc: {proof_type: ['Ed25519Signature2018']}},
                constraints: {fields: [{path: ['$.type']}]},
              },
            ],
          },
        },
        [vc],
      );

      expect(result.success).toBe(false);
      expect(result.requestedClaims).toEqual(new Set(['type']));
    });

    it('uses all VCs when no format or constraints in descriptors', async () => {
      const vc1 = buildPresentationDefinitionVc('ldp_vc', {
        proof: {type: 'Any'},
      });
      const vc2 = buildPresentationDefinitionVc('ldp_vc', {
        proof: {type: 'Any'},
      });

      const result = await OpenID4VP.getMatchingCredentials(
        {
          presentation_definition: {
            input_descriptors: [
              {
                id: 'desc1',
                format: undefined,
                constraints: {fields: undefined},
              },
            ],
          },
        },
        [vc1, vc2],
      );

      expect(result.success).toBe(true);
      expect(result.matchingVCs.desc1).toHaveLength(2);
    });

    it('handles constraints with filter type check', async () => {
      const vc = buildPresentationDefinitionVc('ldp_vc', {
        proof: {type: 'Ed25519Signature2018'},
        credentialSubject: {name: 'John'},
      });

      const result = await OpenID4VP.getMatchingCredentials(
        {
          presentation_definition: {
            input_descriptors: [
              {
                id: 'desc1',
                format: {ldp_vc: {proof_type: ['Ed25519Signature2018']}},
                constraints: {
                  fields: [
                    {
                      path: ['$.credentialSubject.name'],
                      filter: {type: 'string'},
                    },
                  ],
                },
              },
            ],
          },
        },
        [vc],
      );

      expect(result.success).toBe(true);
      expect(result.matchingVCs.desc1).toHaveLength(1);
    });

    // TODO: Check - should it accept everything?
    it('handles constraints with no filter (accepts anything)', async () => {
      const vc = buildPresentationDefinitionVc('ldp_vc', {
        proof: {type: 'Ed25519Signature2018'},
        type: ['Credential'],
      });

      const result = await OpenID4VP.getMatchingCredentials(
        {
          presentation_definition: {
            input_descriptors: [
              {
                id: 'desc1',
                format: {ldp_vc: {proof_type: ['Ed25519Signature2018']}},
                constraints: {fields: [{path: ['$.type']}]},
              },
            ],
          },
        },
        [vc],
      );

      expect(result.success).toBe(true);
      expect(result.matchingVCs.desc1).toHaveLength(1);
    });

    it('collects requestedClaims from field paths', async () => {
      const vc = buildPresentationDefinitionVc('ldp_vc', {
        proof: {type: 'UnknownProof'},
      });

      const result = await OpenID4VP.getMatchingCredentials(
        {
          presentation_definition: {
            input_descriptors: [
              {
                id: 'desc1',
                format: {ldp_vc: {proof_type: ['Ed25519Signature2018']}},
                constraints: {
                  fields: [
                    {path: ['$.credentialSubject.name']},
                    {path: ['$.credentialSubject.email']},
                  ],
                },
              },
            ],
          },
        },
        [vc],
      );

      expect(result.success).toBe(false);
      expect(result.requestedClaims).toEqual(new Set(['name', 'email']));
    });
  });

  describe('getMatchingCredentials - DCQL flow', () => {
    it('calls native DCQL matching and maps the returned result on Android', async () => {
      setPlatformOS('android');

      const nativeModule = getOpenID4VPNativeModule();
      const vc1 = buildVc('cred-1', 'ldp_vc', {
        id: 'cred-1',
        credentialSubject: {name: 'John'},
      });
      const vc2 = buildVc('cred-2', 'vc_sd_jwt', 'header.payload.sig~');

      nativeModule.getMatchingCredentials.mockResolvedValue(
        JSON.stringify({
          success: true,
          queryMatches: {
            'query-1': {
              matchingCredentials: [
                {
                  credentialId: 'cred-1',
                  matchingClaims: [
                    {
                      id: 'name',
                      path: ['credentialSubject', 'name'],
                      values: ['John'],
                    },
                  ],
                },
              ],
              allowMultipleCredentials: true,
            },
            'query-2': {
              failedClaims: [
                {
                  claim: {
                    path: ['credentialSubject', 'birthDate'],
                  },
                },
              ],
            },
            'query-3': {
              failureReason:
                'no_matching_credentials_with_requested_credential_formats_found',
            },
          },
          credentialSets: [{options: [['query-1']], required: true}],
        }),
      );

      const result = await OpenID4VP.getMatchingCredentials(
        {dcql_query: {query: 'example'}},
        [vc1, vc2],
      );

      expect(nativeModule.initSdk).toHaveBeenCalledWith('test-app-id', {
        mock: true,
        trusted_verifiers: [],
      });
      expect(nativeModule.getMatchingCredentials).toHaveBeenCalledWith(
        {dcql_query: {query: 'example'}},
        [
          {
            format: 'ldp_vc',
            credentialId: 'cred-1',
            credential: {
              id: 'cred-1',
              credentialSubject: {name: 'John'},
            },
          },
          {
            format: 'vc_sd_jwt',
            credentialId: 'cred-2',
            credential: 'header.payload.sig~',
          },
        ],
      );
      expect(result).toEqual({
        matchingVCs: {
          'query-1': {
            matchingVcs: [
              {
                vc: vc1,
                matchedClaims: [
                  {
                    id: 'name',
                    path: ['credentialSubject', 'name'],
                    values: ['John'],
                  },
                ],
              },
            ],
            allowMultipleCredentials: true,
          },
        },
        success: true,
        requestedClaims: new Set(['birthDate']),
        purpose: '',
        credentialSetOptions: [{options: [['query-1']], required: true}],
      });
      expect(mockAddListener).not.toHaveBeenCalledWith(
        'onJsonLdExpand',
        expect.any(Function),
      );
    });

    it('registers onJsonLdExpand on iOS and forwards the expanded payload to native', async () => {
      mockedIsIOS.mockReturnValue(true);

      const nativeModule = getOpenID4VPNativeModule();
      nativeModule.getMatchingCredentials.mockResolvedValue(
        JSON.stringify({success: true, queryMatches: {}, credentialSets: []}),
      );
      mockedJsonLdExpand.mockResolvedValue([{expanded: true}]);

      await OpenID4VP.getMatchingCredentials({dcql_query: {query: 'example'}}, [
        buildVc('cred-1', 'ldp_vc', {id: 'cred-1'}),
      ]);

      // Verify mockAddListener was called for canonicalizer and expander
      expect(mockAddListener.mock.calls.length).toBeGreaterThan(0);

      // Verify the onJsonLdExpand listener was registered on iOS
      expect(mockAddListener).toHaveBeenCalledWith(
        'onJsonLdExpand',
        expect.any(Function),
      );

      // Simulate the native JSON-LD expand event
      const expandListener = mockEmitterListeners.onJsonLdExpand;
      expect(expandListener).toBeDefined();

      expandListener({data: {'@context': 'https://example.org'}});
      await flushPromises();

      // Verify the result is sent to native
      expect(mockedJsonLdExpand).toHaveBeenCalledWith({
        '@context': 'https://example.org',
      });
      expect(nativeModule.sendJsonLdExpandResultFromJS).toHaveBeenCalledWith([
        {expanded: true},
      ]);
    });
  });
});
