import {request} from '../../shared/request';
import getAllConfigurations, {API_URLS} from '../../shared/api';
import {changeEsignetUrl, ESIGNET_BASE_URL} from '../../shared/constants';
import {
  isHardwareKeystoreExists,
  getJWT,
  fetchKeyPair,
} from '../../shared/cryptoutil/cryptoUtil';
import {getPrivateKey} from '../../shared/keystore/SecureKeystore';
import {ESIGNET_HOST} from 'react-native-dotenv';

export const QrLoginServices = {
  linkTransaction: async context => {
    const response = await request(
      API_URLS.linkTransaction.method,
      API_URLS.linkTransaction.buildURL(),
      {
        requestTime: String(new Date().toISOString()),
        request: {
          linkCode: context.linkCode,
        },
      },
      ESIGNET_BASE_URL,
    );
    return response.response;
  },

  sendAuthenticate: async context => {
    let privateKey;
    console.log('selectedVc:', context.selectedVc.vcMetadata.issuer);
    
    const individualId = context.selectedVc.vcMetadata.mosipIndividualId;
    const keyType = context.selectedVc.vcMetadata.downloadKeyType;
    if (!isHardwareKeystoreExists) {
      privateKey = await getPrivateKey(
        context.selectedVc.walletBindingResponse?.walletBindingId,
      );
    }
    const keyPair = await fetchKeyPair(keyType);
    privateKey = keyPair.privateKey;
    var config = await getAllConfigurations();
    console.log('thumbprint:', context.thumbprint);
    const jwtHeader = {
      alg: keyType,
      'x5t#S256': context.thumbprint,
    };

    const jwtPayload = {
      iss: config.issuer,
      sub: individualId,
      aud: config.audience,
      iat: Math.floor(new Date().getTime() / 1000),
      exp: Math.floor(new Date().getTime() / 1000) + 18000,
    };

    const jwt = await getJWT(
      jwtHeader,
      jwtPayload,
      keyType,
      privateKey,
      keyType,
    );

    const response = await request(
      API_URLS.authenticate.method,
      API_URLS.authenticate.buildURL(),
      {
        requestTime: String(new Date().toISOString()),
        request: {
          linkedTransactionId: context.linkTransactionId,
          individualId: individualId,
          challengeList: [
            {
              authFactorType: 'WLA',
              challenge: jwt,
              format: 'jwt',
            },
          ],
        },
      },
      ESIGNET_BASE_URL,
    );
    return response.response;
  },

  sendConsent: async context => {
    let privateKey;
    const keyType = context.selectedVc.vcMetadata.downloadKeyType;
    console.log(
      'wallet binding response:',
      context.selectedVc.walletBindingResponse,
    );
    if (!isHardwareKeystoreExists) {
      privateKey = await getPrivateKey(
        context.selectedVc.walletBindingResponse?.walletBindingId,
      );
    }
    const keyPair = await fetchKeyPair(keyType);
    privateKey = keyPair.privateKey;

    const header = {
      alg: keyType,
      'x5t#S256': context.thumbprint,
    };
    const payload = {
      accepted_claims: context.essentialClaims
        .concat(context.selectedVoluntaryClaims)
        .sort(),
      permitted_authorized_scopes: context.authorizeScopes,
    };

    const JWT = await getJWT(header, payload, keyType, privateKey, keyType);
    const jwtComponents = JWT.split('.');
    const detachedSignature = jwtComponents[0] + '.' + jwtComponents[2];

    const resp = await request(
      API_URLS.sendConsent.method,
      API_URLS.sendConsent.buildURL(),
      {
        requestTime: String(new Date().toISOString()),
        request: {
          linkedTransactionId: context.linkedTransactionId,
          acceptedClaims: context.essentialClaims
            .concat(context.selectedVoluntaryClaims)
            .sort(),
          permittedAuthorizeScopes: context.authorizeScopes,
          signature: detachedSignature,
        },
      },
      ESIGNET_BASE_URL,
    );

    if (context.selectedVc.vcMetadataissuer === 'GlobalIDPass') {
      changeEsignetUrl(ESIGNET_HOST);
    }
  },
};
