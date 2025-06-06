import {NativeModules, NativeEventEmitter} from 'react-native';
import {__AppId} from '../GlobalVariables';
import {constructProofJWT} from '../openId4VCI/Utils';
import {issuerType} from '../../machines/Issuers/IssuersMachine';
import {VerifiableCredential} from '../../machines/VerifiableCredential/VCMetaMachine/vc';

const emitter = new NativeEventEmitter(NativeModules.InjiVciClient);

export class VciClient {
  static get client() {
    const nativeClient = NativeModules.InjiVciClient;
    nativeClient.init(__AppId.getValue());
    return nativeClient;
  }

  static async requestCredentialByOffer(
    credentialOffer: string,
    getTxCode: (
      inputMode: string | undefined,
      description: string | undefined,
      length: number | undefined,
    ) => void,
    getProofJwt: (
      accesToken: string,
      cNonce: string | null,
      issuerMetadata: object,
      credentialConfigurationId: string,
    ) => void,
    navigateToAuthView: (authorizationEndpoint: string) => void,
    requestTrustIssuerConsent: (issuerMetadata: object) => void,
  ) {
    const proofListener = emitter.addListener(
      'onRequestProof',
      async ({
        accessToken,
        cNonce,
        issuerMetadata,
        credentialConfigurationId,
      }) => {
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
      async ({authorizationEndpoint}) => {
        navigateToAuthView(authorizationEndpoint);
      },
    );
    const txCodeListener = emitter.addListener(
      'onRequestTxCode',
      async ({inputMode, description, length}) => {
        getTxCode(inputMode, description, length);
      },
    );

    const trustIssuerListener = emitter.addListener(
      'onCheckIssuerTrust',
      async ({issuerMetadata}) => {
        const issuerMetadataObject = JSON.parse(issuerMetadata);
        requestTrustIssuerConsent(issuerMetadataObject);
      },
    );
    let response = '';
    try {
      response = await VciClient.client.requestCredentialByOffer(
        credentialOffer,
        JSON.stringify({
          clientId: 'wallet',
          redirectUri: 'io.mosip.residentapp.inji://oauthredirect',
        }),
      );
    } catch (error) {
      console.error('Error requesting credential by offer:', error);
      throw error;
    }

    proofListener.remove();
    authListener.remove();
    txCodeListener.remove();
    trustIssuerListener.remove();
    return JSON.parse(response) as VerifiableCredential;
  }

  static async requestCredentialFromTrustedIssuer(
    resolvedIssuerMetaData: Object,
    clientMetadata: Object,
    getProofJwt: (accessToken: string, cNonce: string) => Promise<void>,
    navigateToAuthView: (authorizationEndpoint: string) => void,
  ) {
    const proofListener = emitter.addListener(
      'onRequestProof',
      async ({accessToken, cNonce}) => {
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
      response = await VciClient.client.requestCredentialFromTrustedIssuer(
        JSON.stringify(resolvedIssuerMetaData),
        JSON.stringify(clientMetadata),
      );
    } catch (error) {
      console.error('Error requesting credential from trusted issuer:', error);
      throw error;
    }

    proofListener.remove();
    authListener.remove();

    return JSON.parse(response);
  }
}
