import NetInfo from '@react-native-community/netinfo';
import {NativeModules} from 'react-native';
import Cloud from '../../shared/CloudBackupAndRestoreUtils';
import {CACHED_API} from '../../shared/api';
import {
  fetchKeyPair,
  generateKeyPair,
} from '../../shared/cryptoutil/cryptoUtil';
import {
  constructIssuerMetaData,
  constructProofJWT,
  hasKeyPair,
  updateCredentialInformation,
  verifyCredentialData,
} from '../../shared/openId4VCI/Utils';
import {VciClient} from '../../shared/vciClient/VciClient';
import {issuerType} from './IssuersMachine';
import {setItem} from '../store';
import {API_CACHED_STORAGE_KEYS} from '../../shared/constants';

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
      const wellknownResponse = await CACHED_API.fetchIssuerWellknownConfig(
        context.selectedIssuer.id,
        context.selectedIssuer.credential_issuer_host
          ? context.selectedIssuer.credential_issuer_host
          : context.selectedIssuer.credential_issuer,
      );
      return wellknownResponse;
    },
    getCredentialTypes: async (context: any) => {
      const credentialTypes = [];
      const selectedIssuer = context.selectedIssuer;

      const keys =
        selectedIssuer.credential_configuration_ids ??
        Object.keys(selectedIssuer.credential_configurations_supported);

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
      const getProofJwt=  async (accessToken: string, cNonce: string) => {
        sendBack({
          type: 'PROOF_REQUEST',
          accessToken: accessToken,
          cNonce: cNonce,
        })
      }
      const credential = await VciClient.requestCredentialFromTrustedIssuer(
        constructIssuerMetaData(
          context.selectedIssuer,
          context.selectedCredentialType,
          context.selectedCredentialType.scope,
        ),
        {
          clientId: context.selectedIssuer.client_id,
          redirectUri: context.selectedIssuer.redirect_uri,
        },
        getProofJwt,
        navigateToAuthView,
      );
      return updateCredentialInformation(context, credential);
    },
    sendTxCode: async (context: any) => {
      await VciClient.client.sendTxCodeFromJS(context.txCode);
    },

    sendConsentGiven: async () => {
      await VciClient.client.sendIssuerTrustResponseFromJS(true);
    },

    sendConsentNotGiven: async () => {
      await VciClient.client.sendIssuerTrustResponseFromJS(false);
    },

    downloadCredentialFromOffer: (context: any) => async (sendBack: any) => {
      const navigateToAuthView = (authorizationEndpoint: string) => {
        sendBack({
          type: 'AUTH_ENDPOINT_RECEIVED',
          authEndpoint: authorizationEndpoint,
        });
      };
      const getSignedProofJwt = async (
        accessToken: string,
        cNonce: string | null,
        issuerMetadata: object,
        credentialConfigurationId: string,
      ) => {
        console.log("issuerMetadata::", issuerMetadata);
        let issuer = issuerMetadata as issuerType;
        issuer.issuer_id = issuer.credential_issuer;
        await setItem(
          API_CACHED_STORAGE_KEYS.fetchIssuerWellknownConfig(issuer.issuer_id),
          issuer,
          '',
        );

        let credentialTypes: Array<{id: string; [key: string]: any}> = [];
        if (
          issuer.credential_configurations_supported[credentialConfigurationId]
        ) {
          credentialTypes.push({
            id: credentialConfigurationId,
            ...issuer.credential_configurations_supported[
              credentialConfigurationId
            ],
          });
          sendBack({
            type: 'PROOF_REQUEST',
            accessToken: accessToken,
            cNonce: cNonce,
            issuerMetadata: issuerMetadata,
            issuer: issuer,
            credentialTypes: credentialTypes,
          });
        }
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

      const requesTrustIssuerConsent = async (issuerMetadata: object) => {
        const issuerMetadataObject = issuerMetadata as issuerType;

        sendBack({
          type: 'TRUST_ISSUER_CONSENT_REQUEST',
          issuerMetadata: issuerMetadataObject,
        });
      };

      const credential = await VciClient.requestCredentialByOffer(
        context.qrData,
        getTxCode,
        getSignedProofJwt,
        navigateToAuthView,
        requesTrustIssuerConsent,
      );
      return credential;
    },
    updateCredential: async (context: any) => {
      const credential = await updateCredentialInformation(
        context,
        context.credential,
      );
      return credential;
    },

    constructProof: async (context: any) => {
      const issuerMeta = context.selectedIssuer;
      const proofJWT = await constructProofJWT(
        context.publicKey,
        context.privateKey,
        context.accessToken,
        issuerMeta,
        context.keyType,
        true,
        context.cNonce,
      );
      await VciClient.client.sendProofFromJS(proofJWT);
      return proofJWT;
    },
    constructProofForTrustedIssuers: async (context: any) => {
      const issuerMeta = context.selectedIssuer;
      const proofJWT = await constructProofJWT(
        context.publicKey,
        context.privateKey,
        context.accessToken,
        issuerMeta,
        context.keyType,
        false,
        context.cNonce,
      );
      await VciClient.client.sendProofFromJS(proofJWT);
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

    verifyCredential: async (context: any) => {
      const verificationResult = await verifyCredentialData(
        context.verifiableCredential?.credential,
        context.selectedCredentialType.format,
        context.selectedIssuerId,
      );
      if (!verificationResult.isVerified) {
        throw new Error(verificationResult.verificationErrorCode);
      }

      return verificationResult;
    },
  };
};
