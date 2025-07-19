import {NativeModules, NativeEventEmitter} from 'react-native';
import {__AppId} from '../GlobalVariables';
import {VerifiableCredential} from '../../machines/VerifiableCredential/VCMetaMachine/vc';

const emitter = new NativeEventEmitter(NativeModules.InjiVciClient);

class VciClient {
  private static instance: VciClient;
  private InjiVciClient = NativeModules.InjiVciClient;

  private constructor() {
    console.log('Initializing VciClient with AppId:', __AppId.getValue());
    this.InjiVciClient.init(__AppId.getValue());
  }

  static getInstance(): VciClient {
    if (!VciClient.instance) {
      console.log('Creating new VciClient instance.');
      VciClient.instance = new VciClient();
    }
    return VciClient.instance;
  }

  async sendProof(jwt: string) {
    console.log('sendProof called with JWT:', jwt);
    this.InjiVciClient.sendProofFromJS(jwt);
  }

  async sendAuthCode(authCode: string) {
    console.log('sendAuthCode called with authCode:', authCode);
    this.InjiVciClient.sendAuthCodeFromJS(authCode);
  }

  async sendTxCode(code: string) {
    console.log('sendTxCode called with code:', code);
    this.InjiVciClient.sendTxCodeFromJS(code);
  }

  async sendIssuerConsent(consent: boolean) {
    console.log('sendIssuerConsent called with consent:', consent);
    this.InjiVciClient.sendIssuerTrustResponseFromJS(consent);
  }

  async sendTokenResponse(json: string) {
    console.log('sendTokenResponse called with JSON:', json);
    this.InjiVciClient.sendTokenResponseFromJS(json);
  }

  async getIssuerMetadata(issuerUri: string): Promise<object> {
    console.log('getIssuerMetadata called with issuerUri:', issuerUri);
    const response = await this.InjiVciClient.getIssuerMetadata(issuerUri);
    console.log('Issuer metadata response received:', response);
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
  ): Promise<any> {
    console.log(
      'requestCredentialByOffer called with credentialOffer:',
      credentialOffer,
    );

    const proofListener = emitter.addListener(
      'onRequestProof',
      ({credentialIssuer, cNonce, proofSigningAlgorithmsSupported}) => {
        console.log('onRequestProof triggered with data:', {
          credentialIssuer,
          cNonce,
          proofSigningAlgorithmsSupported,
        });
        getProofJwt(credentialIssuer, cNonce, JSON.parse(proofSigningAlgorithmsSupported));
      },
    );

    const authListener = emitter.addListener(
      'onRequestAuthCode',
      ({authorizationUrl}) => {
        console.log(
          'onRequestAuthCode triggered with authorizationUrl:',
          authorizationUrl,
        );
        navigateToAuthView(authorizationUrl);
      },
    );

    const txCodeListener = emitter.addListener(
      'onRequestTxCode',
      ({inputMode, description, length}) => {
        console.log('onRequestTxCode triggered with data:', {
          inputMode,
          description,
          length,
        });
        getTxCode(inputMode, description, length);
      },
    );

    const tokenResponseListener = emitter.addListener(
      'onRequestTokenResponse',
      ({tokenRequest}) => {
        console.log(
          'onRequestTokenResponse triggered with tokenRequest:',
          tokenRequest,
        );
        requestTokenResponse(tokenRequest);
      },
    );

    const trustIssuerListener = emitter.addListener(
      'onCheckIssuerTrust',
      ({credentialIssuer, issuerDisplay}) => {
        console.log('onCheckIssuerTrust triggered with data:', {
          credentialIssuer,
          issuerDisplay,
        });
        requestTrustIssuerConsent(credentialIssuer, JSON.parse(issuerDisplay));
      },
    );

    let response = '';
    try {
      const clientMetadata = {
        clientId: 'wallet',
        redirectUri: 'io.mosip.residentapp.inji://oauthredirect',
      };
      console.log('Outgoing client metadata:', clientMetadata);

      response = await this.InjiVciClient.requestCredentialByOffer(
        credentialOffer,
        JSON.stringify(clientMetadata),
      );
      console.log('Credential response received:', response);
    } catch (error) {
      console.error('Error requesting credential by offer:', error);
      throw error;
    } finally {
      console.log('Removing listeners after requestCredentialByOffer.');
      proofListener.remove();
      authListener.remove();
      txCodeListener.remove();
      tokenResponseListener.remove();
      trustIssuerListener.remove();
    }

    const parsedResponse = JSON.parse(response);
    console.log('Parsed response:', JSON.stringify(parsedResponse));
    return {
      credential: {
        credential: parsedResponse.credential,
      } as VerifiableCredential,
      credentialConfigurationId:
        parsedResponse.credentialConfigurationId ?? {},
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
  ): Promise<any> {
    console.log('requestCredentialFromTrustedIssuer called with data:', {
      credentialIssuerUri,
      credentialConfigurationId,
      clientMetadata,
    });

    const proofListener = emitter.addListener(
      'onRequestProof',
      ({credentialIssuer, cNonce, proofSigningAlgorithmsSupported}) => {
        console.log('onRequestProof triggered with data:', {
          credentialIssuer,
          cNonce,
          proofSigningAlgorithmsSupported,
        });
        getProofJwt(credentialIssuer, cNonce, JSON.parse(proofSigningAlgorithmsSupported));
      },
    );

    const authListener = emitter.addListener(
      'onRequestAuthCode',
      ({authorizationUrl}) => {
        console.log(
          'onRequestAuthCode triggered with authorizationEndpoint:',
          authorizationUrl,
        );
        navigateToAuthView(authorizationUrl);
      },
    );

    const tokenResponseListener = emitter.addListener(
      'onRequestTokenResponse',
      ({tokenRequest}) => {
        console.log(
          'onRequestTokenResponse triggered with tokenRequest:',
          tokenRequest,
        );
        requestTokenResponse(tokenRequest);
      },
    );

    let response = '';
    try {
      console.log('Outgoing client metadata:', clientMetadata);

      response = await this.InjiVciClient.requestCredentialFromTrustedIssuer(
        credentialIssuerUri,
        credentialConfigurationId,
        JSON.stringify(clientMetadata),
      );
      console.log('Credential response received:', response);
    } catch (error) {
      console.error('Error requesting credential from trusted issuer:', error);
      throw error;
    } finally {
      console.log(
        'Removing listeners after requestCredentialFromTrustedIssuer.',
      );
      proofListener.remove();
      authListener.remove();
      tokenResponseListener.remove();
    }

    const parsedResponse = JSON.parse(response);
    return {
      credential: {
        credential: parsedResponse.credential,
      } as VerifiableCredential,
      credentialConfigurationId:
        parsedResponse.credentialConfigurationId ?? {},
      credentialIssuer: parsedResponse.credentialIssuer ?? '',
    };
  }
}

export default VciClient;
