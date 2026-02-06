import { request } from '../../shared/request';
import getAllConfigurations, { API_URLS } from '../../shared/api';
import { ESIGNET_BASE_URL } from '../../shared/constants';
import {
  isHardwareKeystoreExists,
  getJWT,
  fetchKeyPair,
} from '../../shared/cryptoutil/cryptoUtil';
import { getPrivateKey } from '../../shared/keystore/SecureKeystore';
const GLOBAL_ID_HOST = "https://esignet-globalid.collab.mosip.net";
const DEFAULT_HOST = ESIGNET_BASE_URL;

export const QrLoginServices = {
  linkTransaction: async context => {
    const body = {
      requestTime: new Date().toISOString(),
      request: { linkCode: context.linkCode },
    };

    try {
      console.log("Trying GlobalID host...");
      const res = await request(
        API_URLS.linkTransaction.method,
        API_URLS.linkTransaction.buildURL(),
        body,
        GLOBAL_ID_HOST,
      );

      console.log("Using GlobalID host");
      return res.response;

    } catch (e) {
      console.log("GlobalID failed, trying default host...");

      const res = await request(
        API_URLS.linkTransaction.method,
        API_URLS.linkTransaction.buildURL(),
        body,
        DEFAULT_HOST,
      );

      console.log("Using default host");
      return res.response;
    }
  },


  sendAuthenticate: async context => {
    const requestUrl = context.selectedVc.vcMetadata.issuer === "GlobalIDPass" ? GLOBAL_ID_HOST : ESIGNET_BASE_URL

    let privateKey;

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
      requestUrl,
    );
    return response.response;
  },

  sendConsent: async context => {
    const requestUrl = context.selectedVc.vcMetadata.issuer === "GlobalIDPass" ? GLOBAL_ID_HOST : ESIGNET_BASE_URL
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
      requestUrl,
    );
  },
};
