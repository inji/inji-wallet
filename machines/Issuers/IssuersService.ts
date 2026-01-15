import NetInfo from '@react-native-community/netinfo';
import {NativeModules} from 'react-native';
import Cloud from '../../shared/CloudBackupAndRestoreUtils';
import getAllConfigurations, {CACHED_API} from '../../shared/api';
import {
  fetchKeyPair,
  generateKeyPair,
} from '../../shared/cryptoutil/cryptoUtil';
import {
  constructProofJWT,
  hasKeyPair,
  updateCredentialInformation,
  verifyCredentialData,
} from '../../shared/openId4VCI/Utils';
import VciClient from '../../shared/vciClient/VciClient';
import {displayType, issuerType} from './IssuersMachine';
import {setItem} from '../store';
import {
  API_CACHED_STORAGE_KEYS,
  AuthorizationType,
} from '../../shared/constants';
import {createCacheObject} from '../../shared/Utils';
import {VerificationResult} from '../../shared/vcjs/verifyCredential';
import {sign} from '@noble/secp256k1';

export const IssuersService = () => {
  return {
    isUserSignedAlready: () => async () => {
      return await Cloud.isSignedInAlready();
    },
    downloadIssuersList: async () => {
      const trustedIssuersList = await CACHED_API.fetchIssuers();
      return trustedIssuersList;
    },
    checkInternet: async () => await NetInfo.fetch(),
    downloadIssuerWellknown: async (context: any) => {
      const wellknownResponse =
        (await VciClient.getInstance().getIssuerMetadata(
          context.selectedIssuer.credential_issuer_host,
        )) as issuerType;
      if (wellknownResponse) {
        const wellknownCacheObject = createCacheObject(wellknownResponse);
        await setItem(
          API_CACHED_STORAGE_KEYS.fetchIssuerWellknownConfig(
            context.selectedIssuer.credential_issuer_host,
          ),
          wellknownCacheObject,
          '',
        );
      }

      return wellknownResponse;
    },
    getCredentialTypes: async (context: any) => {
      const credentialTypes: Array<{id: string; [key: string]: any}> = [];
      const selectedIssuer = context.selectedIssuer;

      const keys = Object.keys(
        selectedIssuer.credential_configurations_supported,
      );

      for (const key of keys) {
        if (selectedIssuer.credential_configurations_supported[key]) {
          credentialTypes.push({
            id: key,
            ...selectedIssuer.credential_configurations_supported[key],
          });
        }
      }

      if (credentialTypes.length === 0) {
        throw new Error(
          `No credential type found for issuer ${selectedIssuer.issuer_id}`,
        );
      }
      return credentialTypes;
    },

    downloadCredential: (context: any) => async (sendBack: any) => {
      const navigateToAuthView = (authorizationEndpoint: string) => {
        sendBack({
          type: 'AUTH_ENDPOINT_RECEIVED',
          authEndpoint: authorizationEndpoint,
        });
      };
      const getProofJwt = async (
        credentialIssuer: string,
        cNonce: string | null,
        proofSigningAlgosSupported: string[] | null,
      ) => {
        sendBack({
          type: 'PROOF_REQUEST',
          credentialIssuer: credentialIssuer,
          cNonce: cNonce,
          proofSigningAlgosSupported: proofSigningAlgosSupported,
        });
      };
      const getTokenResponse = (tokenRequest: object) => {
        sendBack({
          type: 'TOKEN_REQUEST',
          tokenRequest: tokenRequest,
        });
      };
      const handlePresentationRequest = (presentationRequest: object) => {
        sendBack({
          type: 'PRESENTATION_REQUEST',
          presentationRequest: presentationRequest,
        });
      };

      const signPresentation = (presentationRequest: object) => {
        sendBack({
          type: 'SIGN_PRESENTATION',
          presentationRequest: presentationRequest,
        });
      };

      const {credential} =
        await VciClient.getInstance().requestCredentialFromTrustedIssuer(
          context.selectedIssuer.credential_issuer_host,
          context.selectedCredentialType.id,
          {
            clientId: context.selectedIssuer.client_id,
            redirectUri: context.selectedIssuer.redirect_uri,
          },
          getProofJwt,
          navigateToAuthView,
          getTokenResponse,
          handlePresentationRequest,
          signPresentation,
        );
      return updateCredentialInformation(context, credential);
    },
    sendTxCode: async (context: any) => {
      await VciClient.getInstance().sendTxCode(context.txCode);
    },

    sendConsentGiven: async () => {
      await VciClient.getInstance().sendIssuerConsent(true);
    },

    sendConsentNotGiven: async () => {
      await VciClient.getInstance().sendIssuerConsent(false);
    },

    checkIssuerIdInStoredTrustedIssuers: async (context: any) => {
      const {RNSecureKeystoreModule} = NativeModules;
      try {
        return await RNSecureKeystoreModule.hasAlias(
          context.credentialOfferCredentialIssuer,
        );
      } catch (error) {
        console.error(
          `Error while checking issuer ID in trusted issuers:`,
          error,
        );
        return false;
      }
    },
    addIssuerToTrustedIssuers: async (context: any) => {
      const {RNSecureKeystoreModule} = NativeModules;
      try {
        await RNSecureKeystoreModule.storeData(
          context.credentialOfferCredentialIssuer,
          'trusted',
        );
      } catch {
        console.error('Error updating issuer trust in keystore');
        throw new Error('Error adding issuer to trusted issuers');
      }
    },
    downloadCredentialFromOffer: (context: any) => async (sendBack: any) => {
      const navigateToAuthView = (authorizationEndpoint: string) => {
        sendBack({
          type: 'AUTH_ENDPOINT_RECEIVED',
          authEndpoint: authorizationEndpoint,
        });
      };
      const getSignedProofJwt = async (
        credentialIssuer: string,
        cNonce: string | null,
        proofSigningAlgosSupported: string[] | null,
      ) => {
        sendBack({
          type: 'PROOF_REQUEST',
          cNonce: cNonce,
          issuer: credentialIssuer,
          proofSigningAlgosSupported: proofSigningAlgosSupported,
        });
      };

      const getTxCode = async (
        inputMode: string | undefined,
        description: string | undefined,
        length: number | undefined,
      ) => {
        sendBack({
          type: 'TX_CODE_REQUEST',
          inputMode: inputMode,
          description: description,
          length: length,
        });
      };

      const requesTrustIssuerConsent = async (
        credentialIssuer: string,
        issuerDisplay: object[],
      ) => {
        const issuerDisplayObject = issuerDisplay as displayType[];

        sendBack({
          type: 'TRUST_ISSUER_CONSENT_REQUEST',
          issuerDisplay: issuerDisplayObject,
          issuer: credentialIssuer,
        });
      };
      const getTokenResponse = (tokenRequest: object) => {
        sendBack({
          type: 'TOKEN_REQUEST',
          tokenRequest: tokenRequest,
        });
      };

      const handlePresentationRequest = (presentationRequest: object) => {
        sendBack({
          type: 'PRESENTATION_REQUEST',
          presentationRequest: presentationRequest,
        });
      };

      const signPresentation = (presentationRequest: object) => {
        sendBack({
          type: 'SIGN_PRESENTATION',
          presentationRequest: presentationRequest,
        });
      };

      const credentialResponse =
        await VciClient.getInstance().requestCredentialByOffer(
          context.qrData,
          getTxCode,
          getSignedProofJwt,
          navigateToAuthView,
          getTokenResponse,
          requesTrustIssuerConsent,
          handlePresentationRequest,
          signPresentation,
        );
      return credentialResponse;
    },
    sendTokenRequest: async (context: any) => {
      const tokenRequestObject = context.tokenRequestObject;
      return await sendTokenRequest(
        tokenRequestObject,
        context.authorizationType === AuthorizationType.IMPLICIT
          ? context.selectedIssuer?.token_endpoint
          : null,
      );
    },
    sendTokenResponse: async (context: any) => {
      const tokenResponse = context.tokenResponse;
      if (!tokenResponse) {
        throw new Error(
          'Could not send token response, tokenResponse is undefined or null',
        );
      }
      return await VciClient.getInstance().sendTokenResponse(
        JSON.stringify(tokenResponse),
      );
    },

    updateCredential: async (context: any) => {
      const credential = await updateCredentialInformation(
        context,
        context.credential,
      );
      return credential;
    },
    cacheIssuerWellknown: async (context: any) => {
      const credentialIssuer = context.credentialOfferCredentialIssuer;
      const issuerMetadata = (await VciClient.getInstance().getIssuerMetadata(
        credentialIssuer,
      )) as issuerType;
      if (issuerMetadata) {
        const wellknownCacheObject = createCacheObject(issuerMetadata);
        await setItem(
          API_CACHED_STORAGE_KEYS.fetchIssuerWellknownConfig(credentialIssuer),
          wellknownCacheObject,
          '',
        );
      }
      return issuerMetadata;
    },
    constructProof: async (context: any) => {
      const proofJWT = await constructProofJWT(
        context.publicKey,
        context.privateKey,
        context.credentialOfferCredentialIssuer,
        null,
        context.keyType,
        context.wellknownKeyTypes,
        true,
        context.cNonce,
      );
      await VciClient.getInstance().sendProof(proofJWT);
      return proofJWT;
    },
    constructAndSendProofForTrustedIssuers: async (context: any) => {
      const issuerMeta = context.selectedIssuer;
      const proofJWT = await constructProofJWT(
        context.publicKey,
        context.privateKey,
        context.selectedIssuer.credential_issuer_host,
        context.selectedIssuer.client_id,
        context.keyType,
        context.wellknownKeyTypes,
        false,
        context.cNonce,
      );
      await VciClient.getInstance().sendProof(proofJWT);
      return proofJWT;
    },

    getKeyOrderList: async () => {
      const {RNSecureKeystoreModule} = NativeModules;
      const keyOrder = JSON.parse(
        (await RNSecureKeystoreModule.getData('keyPreference'))[1],
      );
      return keyOrder;
    },

    generateKeyPair: async (context: any) => {
      const keypair = await generateKeyPair(context.keyType);
      return keypair;
    },

    getKeyPair: async (context: any) => {
      if (context.keyType === '') {
        throw new Error('key type not found');
      } else if (!!(await hasKeyPair(context.keyType))) {
        return await fetchKeyPair(context.keyType);
      }
    },

    getSelectedKey: async (context: any) => {
      return context.keyType;
    },

    verifyCredential: async (context: any): Promise<VerificationResult> => {
      const {
        isCredentialOfferFlow,
        verifiableCredential,
        selectedCredentialType,
      } = context;
      if (isCredentialOfferFlow) {
        const configurations = await getAllConfigurations();
        if (configurations.disableCredentialOfferVcVerification) {
          return {
            isVerified: true,
            verificationMessage: '',
            verificationErrorCode: '',
          };
        }
      }
      const verificationResult = await verifyCredentialData(
        verifiableCredential?.credential,
        selectedCredentialType.format,
      );
      if (!verificationResult.isVerified) {
        throw new Error(verificationResult.verificationErrorCode);
      }

      return verificationResult;
    },
  };
};
async function sendTokenRequest(
  tokenRequestObject: any,
  proxyTokenEndpoint: any = null,
) {
  if (proxyTokenEndpoint) {
    tokenRequestObject.tokenEndpoint = proxyTokenEndpoint;
  }
  if (!tokenRequestObject?.tokenEndpoint) {
    console.error('tokenEndpoint is not provided in tokenRequestObject');
    throw new Error('tokenEndpoint is required');
  }

  const formBody = new URLSearchParams();

  formBody.append('grant_type', tokenRequestObject.grantType);

  if (tokenRequestObject.authCode) {
    formBody.append('code', tokenRequestObject.authCode);
  }
  if (tokenRequestObject.preAuthCode) {
    formBody.append('pre-authorized_code', tokenRequestObject.preAuthCode);
  }
  if (tokenRequestObject.txCode) {
    formBody.append('tx_code', tokenRequestObject.txCode);
  }
  if (tokenRequestObject.clientId) {
    formBody.append('client_id', tokenRequestObject.clientId);
  }
  if (tokenRequestObject.redirectUri) {
    formBody.append('redirect_uri', tokenRequestObject.redirectUri);
  }
  if (tokenRequestObject.codeVerifier) {
    formBody.append('code_verifier', tokenRequestObject.codeVerifier);
  }
  const response = await fetch(tokenRequestObject.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formBody.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      'Token request failed with status:',
      response.status,
      errorText,
    );
    throw new Error(`Token request failed: ${response.status} ${errorText}`);
  }
  const tokenResponse = await response.json();
  return tokenResponse;
}
