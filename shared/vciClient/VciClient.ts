import {NativeModules, NativeEventEmitter} from 'react-native';
import {__AppId} from '../GlobalVariables';
import {VerifiableCredential} from '../../machines/VerifiableCredential/VCMetaMachine/vc';

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

  async sendAuthCode(authCode: string) {
    this.InjiVciClient.sendAuthCodeFromJS(authCode);
  }

  async sendTxCode(code: string) {
    this.InjiVciClient.sendTxCodeFromJS(code);
  }

  async sendIssuerConsent(consent: boolean) {
    this.InjiVciClient.sendIssuerTrustResponseFromJS(consent);
  }

  async requestCredentialByOffer(
    credentialOffer: string,
    getTxCode: (
      inputMode: string | undefined,
      description: string | undefined,
      length: number | undefined,
    ) => void,
    getProofJwt: (
      accessToken: string,
      cNonce: string | null,
      issuerMetadata: object,
      credentialConfigurationId: string,
    ) => void,
    navigateToAuthView: (authorizationEndpoint: string) => void,
    requestTrustIssuerConsent: (issuerMetadata: object) => void,
  ): Promise<VerifiableCredential> {
    const proofListener = emitter.addListener(
      'onRequestProof',
      ({accessToken, cNonce, issuerMetadata, credentialConfigurationId}) => {
        getProofJwt(
          accessToken,
          cNonce,
          JSON.parse(issuerMetadata),
          credentialConfigurationId,
        );
      },
    );

    const authListener = emitter.addListener(
      'onRequestAuthCode',
      ({authorizationEndpoint}) => {
        navigateToAuthView(authorizationEndpoint);
      },
    );

    const txCodeListener = emitter.addListener(
      'onRequestTxCode',
      ({inputMode, description, length}) => {
        getTxCode(inputMode, description, length);
      },
    );

    const trustIssuerListener = emitter.addListener(
      'onCheckIssuerTrust',
      ({issuerMetadata}) => {
        requestTrustIssuerConsent(JSON.parse(issuerMetadata));
      },
    );

    let response = '';
    try {
      response = await this.InjiVciClient.requestCredentialByOffer(
        credentialOffer,
        JSON.stringify({
          clientId: 'wallet',
          redirectUri: 'io.mosip.residentapp.inji://oauthredirect',
        }),
      );
    } catch (error) {
      console.error('Error requesting credential by offer:', error);
      throw error;
    } finally {
      proofListener.remove();
      authListener.remove();
      txCodeListener.remove();
      trustIssuerListener.remove();
    }

    return JSON.parse(response) as VerifiableCredential;
  }

  async requestCredentialFromTrustedIssuer(
    resolvedIssuerMetaData: object,
    clientMetadata: object,
    getProofJwt: (accessToken: string, cNonce: string) => void,
    navigateToAuthView: (authorizationEndpoint: string) => void,
  ): Promise<VerifiableCredential> {
    const proofListener = emitter.addListener(
      'onRequestProof',
      ({accessToken, cNonce}) => {
        getProofJwt(accessToken, cNonce);
        proofListener.remove();
      },
    );

    const authListener = emitter.addListener(
      'onRequestAuthCode',
      ({authorizationEndpoint}) => {
        navigateToAuthView(authorizationEndpoint);
      },
    );

    let response = '';
    try {
      response = await this.InjiVciClient.requestCredentialFromTrustedIssuer(
        JSON.stringify(resolvedIssuerMetaData),
        JSON.stringify(clientMetadata),
      );
    } catch (error) {
      console.error('Error requesting credential from trusted issuer:', error);
      throw error;
    } finally {
      proofListener.remove();
      authListener.remove();
    }

    return JSON.parse(response) as VerifiableCredential;
  }
}

export default VciClient;
