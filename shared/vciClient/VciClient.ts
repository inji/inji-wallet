import {NativeModules, NativeEventEmitter} from 'react-native';
import {__AppId} from '../GlobalVariables';
import {
  SelectedCredentialsForVPSharing,
  VerifiableCredential,
} from '../../machines/VerifiableCredential/VCMetaMachine/vc';
import {signatureSuite} from '../../machines/openID4VP/openID4VPServices';

const emitter = new NativeEventEmitter(NativeModules.InjiVciClient);

class VciClient {
  private static instance: VciClient;
  private InjiVciClient = NativeModules.InjiVciClient;

  private constructor() {
    this.InjiVciClient.init(__AppId.getValue());
  }

  static getInstance(): VciClient {
    if (!VciClient.instance) {
      VciClient.instance = new VciClient();
    }
    return VciClient.instance;
  }

  async sendProof(jwt: string) {
    this.InjiVciClient.sendProofFromJS(jwt);
  }

  async sendSelectedCredentialsForVPSharing(
    credentials: SelectedCredentialsForVPSharing,
  ) {
    this.InjiVciClient.sendSelectedCredentialsForVPSharingFromJS(credentials);
  }

  sendSignedVP(vpTokenSigningResult: object) {
    this.InjiVciClient.sendVPTokenSigningResultFromJS(vpTokenSigningResult);
  }

  async sendAuthCode(authCode: string) {
    this.InjiVciClient.sendAuthCodeFromJS(authCode);
  }

  async sendTxCode(code: string) {
    this.InjiVciClient.sendTxCodeFromJS(code);
  }

  async sendIssuerConsent(consent: boolean) {
    this.InjiVciClient.sendIssuerTrustResponseFromJS(consent);
  }

  async sendTokenResponse(json: string) {
    this.InjiVciClient.sendTokenResponseFromJS(json);
  }

  async getIssuerMetadata(issuerUri: string): Promise<object> {
    const response = await this.InjiVciClient.getIssuerMetadata(issuerUri);
    return JSON.parse(response);
  }

  async requestCredentialByOffer(
    credentialOffer: string,
    getTxCode: (
      inputMode: string | undefined,
      description: string | undefined,
      length: number | undefined,
    ) => void,
    getProofJwt: (
      credentialIssuer: string,
      cNonce: string | null,
      proofSigningAlgosSupported: string[] | null,
    ) => void,
    navigateToAuthView: (authorizationEndpoint: string) => void,
    requestTokenResponse: (tokenRequest: object) => void,
    requestTrustIssuerConsent: (
      credentialIssuer: string,
      issuerDisplay: object[],
    ) => void,
    handlePresentationRequest: (presentationRequest: object) => void,
    signPresentation: (vpTokenSigningRequest: object) => void,
  ): Promise<any> {
    const proofListener = emitter.addListener(
      'onRequestProof',
      ({credentialIssuer, cNonce, proofSigningAlgorithmsSupported}) => {
        getProofJwt(
          credentialIssuer,
          cNonce,
          JSON.parse(proofSigningAlgorithmsSupported),
        );
      },
    );

    const presentationRequestListener = emitter.addListener(
      'onPresentationRequest',
      ({presentationRequest}) => {
        handlePresentationRequest(JSON.parse(presentationRequest));
      },
    );

    const signVPListener = emitter.addListener(
      'onRequestSignedVPToken',
      ({vpTokenSigningRequest}) => {
        signPresentation(vpTokenSigningRequest);
      },
    );

    const authListener = emitter.addListener(
      'onRequestAuthCode',
      ({authorizationUrl}) => {
        navigateToAuthView(authorizationUrl);
      },
    );

    const txCodeListener = emitter.addListener(
      'onRequestTxCode',
      ({inputMode, description, length}) => {
        getTxCode(inputMode, description, length);
      },
    );

    const tokenResponseListener = emitter.addListener(
      'onRequestTokenResponse',
      ({tokenRequest}) => {
        requestTokenResponse(tokenRequest);
      },
    );

    const trustIssuerListener = emitter.addListener(
      'onCheckIssuerTrust',
      ({credentialIssuer, issuerDisplay}) => {
        requestTrustIssuerConsent(credentialIssuer, JSON.parse(issuerDisplay));
      },
    );

    let response = '';
    try {
      const clientMetadata = {
        clientId: 'wallet',
        redirectUri: 'io.mosip.residentapp.inji://oauthredirect',
      };
      response = await this.InjiVciClient.requestCredentialByOffer(
        credentialOffer,
        JSON.stringify(clientMetadata),
        signatureSuite,
      );
    } catch (error) {
      console.error('Error requesting credential by offer:', error);
      throw error;
    } finally {
      proofListener.remove();
      authListener.remove();
      txCodeListener.remove();
      tokenResponseListener.remove();
      trustIssuerListener.remove();
      presentationRequestListener.remove();
      signVPListener.remove();
    }

    const parsedResponse = JSON.parse(response);
    return {
      credential: {
        credential: parsedResponse.credential,
      } as VerifiableCredential,
      credentialConfigurationId: parsedResponse.credentialConfigurationId ?? '',
      credentialIssuer: parsedResponse.credentialIssuer ?? '',
    };
  }

  async requestCredentialFromTrustedIssuer(
    credentialIssuerUri: string,
    credentialConfigurationId: string,
    clientMetadata: object,
    getProofJwt: (
      credentialIssuer: string,
      cNonce: string | null,
      proofSigningAlgosSupported: string[] | null,
    ) => void,
    navigateToAuthView: (authorizationEndpoint: string) => void,
    requestTokenResponse: (tokenRequest: object) => void,
    handlePresentationRequest: (presentationRequest: object) => void,
    signPresentation: (vpTokenSigningRequest: object) => void,
  ): Promise<any> {
    const proofListener = emitter.addListener(
      'onRequestProof',
      ({credentialIssuer, cNonce, proofSigningAlgorithmsSupported}) => {
        getProofJwt(
          credentialIssuer,
          cNonce,
          JSON.parse(proofSigningAlgorithmsSupported),
        );
      },
    );

    const presentationRequestListener = emitter.addListener(
      'onPresentationRequest',
      ({presentationRequest}) => {
        //TODO: Handle presentation request
        handlePresentationRequest(JSON.parse(presentationRequest));
      },
    );

    const signVPListener = emitter.addListener(
      'onRequestSignedVPToken',
      ({vpTokenSigningRequest}) => {
        signPresentation(vpTokenSigningRequest);
      },
    );

    const authListener = emitter.addListener(
      'onRequestAuthCode',
      ({authorizationUrl}) => {
        navigateToAuthView(authorizationUrl);
      },
    );

    const tokenResponseListener = emitter.addListener(
      'onRequestTokenResponse',
      ({tokenRequest}) => {
        requestTokenResponse(tokenRequest);
      },
    );

    let response = '';
    try {
      response = await this.InjiVciClient.requestCredentialFromTrustedIssuer(
        credentialIssuerUri,
        credentialConfigurationId,
        JSON.stringify(clientMetadata),
        signatureSuite,
      );
    } catch (error) {
      console.error('Error requesting credential from trusted issuer:', error);
      throw error;
    } finally {
      proofListener.remove();
      authListener.remove();
      tokenResponseListener.remove();
      presentationRequestListener.remove();
      signVPListener.remove();
    }

    const parsedResponse = JSON.parse(response);
    return {
      credential: {
        credential: parsedResponse.credential,
      } as VerifiableCredential,
      credentialConfigurationId: parsedResponse.credentialConfigurationId ?? '',
      credentialIssuer: parsedResponse.credentialIssuer ?? '',
    };
  }

  abortPresentationFlow(error: {code: string; message: string}) {
    console.debug(`message ${error.message}`);
    this.InjiVciClient.abortPresentationFlowFromJS(error.code, error.message);
  }
}

export default VciClient;
