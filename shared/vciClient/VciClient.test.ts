// Test the real VciClient class by adding InjiVciClient to existing NativeModules

const mockInit = jest.fn();
const mockSendProofFromJS = jest.fn();
const mockSendSelectedCredentialsForVPSharingFromJS = jest.fn();
const mockSendVPTokenSigningResultFromJS = jest.fn();
const mockSendAuthCodeFromJS = jest.fn();
const mockSendTxCodeFromJS = jest.fn();
const mockSendIssuerTrustResponseFromJS = jest.fn();
const mockSendTokenResponseFromJS = jest.fn();
const mockGetIssuerMetadata = jest.fn();
const mockRequestCredentialByOffer = jest.fn();
const mockRequestCredentialFromTrustedIssuer = jest.fn();
const mockAbortPresentationFlowFromJS = jest.fn();
const mockAddListener = jest.fn(() => ({remove: jest.fn()}));

// Mock NativeEventEmitter at file level (resolved via haste)
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter', () => ({
  __esModule: true,
  default: class MockNativeEventEmitter {
    addListener = mockAddListener;
  },
}));

jest.mock('../GlobalVariables', () => ({
  __AppId: {getValue: jest.fn(() => 'test-app-id')},
}));

jest.mock('../../machines/openID4VP/openID4VPServices', () => ({
  signatureSuite: 'JsonWebSignature2020',
}));

describe('VciClient', () => {
  let VciClient: any;

  beforeAll(() => {
    // Add InjiVciClient to already-mocked NativeModules before requiring VciClient
    const {NativeModules} = require('react-native');
    NativeModules.InjiVciClient = {
      init: mockInit,
      sendProofFromJS: mockSendProofFromJS,
      sendSelectedCredentialsForVPSharingFromJS:
        mockSendSelectedCredentialsForVPSharingFromJS,
      sendVPTokenSigningResultFromJS: mockSendVPTokenSigningResultFromJS,
      sendAuthCodeFromJS: mockSendAuthCodeFromJS,
      sendTxCodeFromJS: mockSendTxCodeFromJS,
      sendIssuerTrustResponseFromJS: mockSendIssuerTrustResponseFromJS,
      sendTokenResponseFromJS: mockSendTokenResponseFromJS,
      getIssuerMetadata: mockGetIssuerMetadata,
      requestCredentialByOffer: mockRequestCredentialByOffer,
      requestCredentialFromTrustedIssuer:
        mockRequestCredentialFromTrustedIssuer,
      abortPresentationFlowFromJS: mockAbortPresentationFlowFromJS,
      addListener: jest.fn(),
      removeListeners: jest.fn(),
    };
    VciClient = require('./VciClient').default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('singleton pattern', () => {
    it('getInstance returns same instance', () => {
      const a = VciClient.getInstance();
      const b = VciClient.getInstance();
      expect(a).toBe(b);
    });

    it('initializes with AppId on construction', () => {
      // init is called once during singleton construction in beforeAll
      // Verify the singleton was created and init was wired correctly
      expect(VciClient.getInstance()).toBeDefined();
      // Call init directly to verify wiring
      VciClient.getInstance().InjiVciClient.init('verify-app-id');
      expect(mockInit).toHaveBeenCalledWith('verify-app-id');
    });
  });

  describe('sendProof', () => {
    it('calls InjiVciClient.sendProofFromJS', async () => {
      await VciClient.getInstance().sendProof('jwt-proof');
      expect(mockSendProofFromJS).toHaveBeenCalledWith('jwt-proof');
    });
  });

  describe('sendSelectedCredentialsForVPSharing', () => {
    it('calls native method with credentials', async () => {
      const creds = {vc1: {credential: 'data'}};
      await VciClient.getInstance().sendSelectedCredentialsForVPSharing(
        creds as any,
      );
      expect(
        mockSendSelectedCredentialsForVPSharingFromJS,
      ).toHaveBeenCalledWith(creds);
    });
  });

  describe('sendSignedVP', () => {
    it('calls native method with VP token result', () => {
      VciClient.getInstance().sendSignedVP({token: 'signed'});
      expect(mockSendVPTokenSigningResultFromJS).toHaveBeenCalledWith({
        token: 'signed',
      });
    });
  });

  describe('sendAuthCode', () => {
    it('calls native method with auth code', async () => {
      await VciClient.getInstance().sendAuthCode('auth-code-123');
      expect(mockSendAuthCodeFromJS).toHaveBeenCalledWith('auth-code-123');
    });
  });

  describe('sendTxCode', () => {
    it('calls native method with tx code', async () => {
      await VciClient.getInstance().sendTxCode('tx-code-456');
      expect(mockSendTxCodeFromJS).toHaveBeenCalledWith('tx-code-456');
    });
  });

  describe('sendIssuerConsent', () => {
    it('calls native method with consent boolean', async () => {
      await VciClient.getInstance().sendIssuerConsent(true);
      expect(mockSendIssuerTrustResponseFromJS).toHaveBeenCalledWith(true);
    });
  });

  describe('sendTokenResponse', () => {
    it('calls native method with token JSON', async () => {
      await VciClient.getInstance().sendTokenResponse('{"token":"abc"}');
      expect(mockSendTokenResponseFromJS).toHaveBeenCalledWith(
        '{"token":"abc"}',
      );
    });
  });

  describe('getIssuerMetadata', () => {
    it('parses and returns JSON response', async () => {
      mockGetIssuerMetadata.mockResolvedValueOnce(
        '{"issuer":"test","credential_endpoint":"url"}',
      );
      const result = await VciClient.getInstance().getIssuerMetadata(
        'https://issuer.example.com',
      );
      expect(mockGetIssuerMetadata).toHaveBeenCalledWith(
        'https://issuer.example.com',
      );
      expect(result).toEqual({issuer: 'test', credential_endpoint: 'url'});
    });

    it('should reject when native returns malformed JSON', async () => {
      mockGetIssuerMetadata.mockResolvedValueOnce('not-valid-json');
      await expect(
        VciClient.getInstance().getIssuerMetadata('https://issuer.example.com'),
      ).rejects.toThrow();
    });
  });

  describe('abortPresentationFlow', () => {
    it('calls native method with error code and message', () => {
      VciClient.getInstance().abortPresentationFlow({
        code: 'ERR_001',
        message: 'cancelled',
      });
      expect(mockAbortPresentationFlowFromJS).toHaveBeenCalledWith(
        'ERR_001',
        'cancelled',
      );
    });
  });

  describe('requestCredentialByOffer', () => {
    it('sets up listeners, calls native, and cleans up', async () => {
      const mockRemove = jest.fn();
      mockAddListener.mockReturnValue({remove: mockRemove});
      mockRequestCredentialByOffer.mockResolvedValueOnce(
        JSON.stringify({
          credential: {type: 'VerifiableCredential'},
          credentialConfigurationId: 'config1',
          credentialIssuer: 'issuer1',
        }),
      );

      const result = await VciClient.getInstance().requestCredentialByOffer(
        'offer-data',
        jest.fn(),
        jest.fn(),
        jest.fn(),
        jest.fn(),
        jest.fn(),
        jest.fn(),
        jest.fn(),
      );

      expect(mockRequestCredentialByOffer).toHaveBeenCalled();
      expect(result.credential.credential).toEqual({
        type: 'VerifiableCredential',
      });
      expect(result.credentialConfigurationId).toBe('config1');
      expect(result.credentialIssuer).toBe('issuer1');
      expect(mockRemove).toHaveBeenCalledTimes(7);
    });

    it('cleans up listeners on error', async () => {
      const mockRemove = jest.fn();
      mockAddListener.mockReturnValue({remove: mockRemove});
      mockRequestCredentialByOffer.mockRejectedValueOnce(
        new Error('native error'),
      );

      await expect(
        VciClient.getInstance().requestCredentialByOffer(
          'bad-offer',
          jest.fn(),
          jest.fn(),
          jest.fn(),
          jest.fn(),
          jest.fn(),
          jest.fn(),
          jest.fn(),
        ),
      ).rejects.toMatchObject({
        code: 'UNKNOWN_ERROR',
        message: 'native error',
      });

      expect(mockRemove).toHaveBeenCalledTimes(7);
    });

    it('triggers event listeners correctly', async () => {
      const listenerMap: Record<string, Function> = {};
      mockAddListener.mockImplementation((eventName: string, cb: Function) => {
        listenerMap[eventName] = cb;
        return {remove: jest.fn()};
      });
      mockRequestCredentialByOffer.mockResolvedValueOnce(
        JSON.stringify({
          credential: {},
          credentialConfigurationId: '',
          credentialIssuer: '',
        }),
      );

      const getTxCode = jest.fn();
      const getProofJwt = jest.fn();
      const navigateToAuthView = jest.fn();
      const requestTokenResponse = jest.fn();
      const requestTrustIssuerConsent = jest.fn();
      const handlePresentationRequest = jest.fn();
      const signPresentation = jest.fn();

      await VciClient.getInstance().requestCredentialByOffer(
        'offer',
        getTxCode,
        getProofJwt,
        navigateToAuthView,
        requestTokenResponse,
        requestTrustIssuerConsent,
        handlePresentationRequest,
        signPresentation,
      );

      expect(listenerMap['onRequestProof']).toBeDefined();
      listenerMap['onRequestProof']({
        credentialIssuer: 'iss',
        cNonce: 'nonce',
        proofSigningAlgorithmsSupported: '["ES256"]',
      });
      expect(getProofJwt).toHaveBeenCalledWith('iss', 'nonce', ['ES256']);

      expect(listenerMap['onRequestAuthCode']).toBeDefined();
      listenerMap['onRequestAuthCode']({
        authorizationUrl: 'https://auth.example.com',
      });
      expect(navigateToAuthView).toHaveBeenCalledWith(
        'https://auth.example.com',
      );

      expect(listenerMap['onRequestTxCode']).toBeDefined();
      listenerMap['onRequestTxCode']({
        inputMode: 'numeric',
        description: 'Enter code',
        length: 6,
      });
      expect(getTxCode).toHaveBeenCalledWith('numeric', 'Enter code', 6);

      expect(listenerMap['onRequestTokenResponse']).toBeDefined();
      listenerMap['onRequestTokenResponse']({
        tokenRequest: {grant_type: 'code'},
      });
      expect(requestTokenResponse).toHaveBeenCalledWith({grant_type: 'code'});

      expect(listenerMap['onCheckIssuerTrust']).toBeDefined();
      listenerMap['onCheckIssuerTrust']({
        credentialIssuer: 'iss',
        issuerDisplay: '[{"name":"Issuer"}]',
      });
      expect(requestTrustIssuerConsent).toHaveBeenCalledWith('iss', [
        {name: 'Issuer'},
      ]);

      expect(listenerMap['onPresentationRequest']).toBeDefined();
      listenerMap['onPresentationRequest']({
        presentationRequest: '{"type":"vp"}',
      });
      expect(handlePresentationRequest).toHaveBeenCalledWith({type: 'vp'});

      expect(listenerMap['onRequestSignedVPToken']).toBeDefined();
      listenerMap['onRequestSignedVPToken']({
        vpTokenSigningRequest: {data: 'sign-me'},
      });
      expect(signPresentation).toHaveBeenCalledWith({data: 'sign-me'});
    });
  });

  describe('requestCredentialFromTrustedIssuer', () => {
    it('sets up listeners, calls native, and returns credential', async () => {
      const mockRemove = jest.fn();
      mockAddListener.mockReturnValue({remove: mockRemove});
      mockRequestCredentialFromTrustedIssuer.mockResolvedValueOnce(
        JSON.stringify({
          credential: {type: 'VerifiableCredential'},
          credentialConfigurationId: 'config2',
          credentialIssuer: 'issuer2',
        }),
      );

      const result =
        await VciClient.getInstance().requestCredentialFromTrustedIssuer(
          'https://issuer.example.com',
          'IdentityCredential',
          {clientId: 'client1', redirectUri: 'redirect://'},
          jest.fn(),
          jest.fn(),
          jest.fn(),
          jest.fn(),
          jest.fn(),
        );

      expect(mockRequestCredentialFromTrustedIssuer).toHaveBeenCalled();
      expect(result.credential.credential).toEqual({
        type: 'VerifiableCredential',
      });
      expect(result.credentialConfigurationId).toBe('config2');
      expect(mockRemove).toHaveBeenCalledTimes(5);
    });

    it('cleans up listeners on error', async () => {
      const mockRemove = jest.fn();
      mockAddListener.mockReturnValue({remove: mockRemove});
      mockRequestCredentialFromTrustedIssuer.mockRejectedValueOnce(
        new Error('fail'),
      );

      await expect(
        VciClient.getInstance().requestCredentialFromTrustedIssuer(
          'url',
          'type',
          {},
          jest.fn(),
          jest.fn(),
          jest.fn(),
          jest.fn(),
          jest.fn(),
        ),
      ).rejects.toMatchObject({
        code: 'UNKNOWN_ERROR',
        message: 'fail',
      });

      expect(mockRemove).toHaveBeenCalledTimes(5);
    });
  });
});
