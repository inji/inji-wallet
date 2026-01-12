import {CACHED_API} from '../../shared/api';
import {fetchKeyPair} from '../../shared/cryptoutil/cryptoUtil';
import {getJWK, hasKeyPair} from '../../shared/openId4VCI/Utils';
import base64url from 'base64url';
import OpenID4VP from '../../shared/openID4VP/OpenID4VP';
import {OVP_ERROR_CODE, OVP_ERROR_MESSAGES} from '../../shared/constants';
import {getVerifierKey, VCShareFlowType} from '../../shared/Utils';
import {
  isClientValidationRequired,
  signDataForVpPreparation,
} from '../../shared/openID4VP/OpenID4VPHelper';
import {NativeModules} from 'react-native';
import VciClient from '../../shared/vciClient/VciClient';
import {SelectedCredentialsForVPSharing} from '../VerifiableCredential/VCMetaMachine/vc';

export const signatureSuite = 'JsonWebSignature2020';

export const openID4VPServices = () => {
  return {
    fetchTrustedVerifiers: async () => {
      return await CACHED_API.fetchTrustedVerifiersList();
    },

    shouldValidateClient: async () => {
      return await isClientValidationRequired();
    },

    getAuthenticationResponse: (context: any) => async () => {
      return await OpenID4VP.authenticateVerifier(
        context.urlEncodedAuthorizationRequest,
        context.trustedVerifiers,
      );
    },

    isVerifierTrusted: (context: any) => async () => {
      if (context.flowType === VCShareFlowType.OPENID4VP_AUTHORIZATION)
        return true;
      const {RNSecureKeystoreModule} = NativeModules;
      const verifier = context.authenticationResponse?.client_id;
      try {
        return await RNSecureKeystoreModule.hasAlias(getVerifierKey(verifier));
      } catch (error) {
        console.error(
          `Error while checking verifier client ID in trusted verifiers:`,
          error,
        );
        return false;
      }
    },

    storeTrustedVerifier: (context: any) => async () => {
      const {RNSecureKeystoreModule} = NativeModules;
      const verifier = context.authenticationResponse?.client_id;
      const trustValue = JSON.stringify({
        trusted: true,
        createdAt: new Date().toISOString(),
      });
      try {
        return await RNSecureKeystoreModule.storeData(
          getVerifierKey(verifier),
          trustValue,
        );
      } catch (error) {
        console.error(
          `Error while storing verifier client ID in trusted verifiers:`,
          error,
        );
        return false;
      }
    },

    getKeyPair: async (context: any) => {
      if (!!(await hasKeyPair(context.keyType))) {
        return await fetchKeyPair(context.keyType);
      }
    },

    getSelectedKey: async (context: any) => {
      return await fetchKeyPair(context.keyType);
    },

    shareDeclineStatus: async () => {
      return await OpenID4VP.sendErrorToVerifier(
        OVP_ERROR_MESSAGES.DECLINED,
        OVP_ERROR_CODE.DECLINED,
      );
    },

    sendSelectedCredentialsForVP: (context: any) => async () => {
      const selectedCredentials: SelectedCredentialsForVPSharing =
        await OpenID4VP.prepareCredentialsForVPSharing(
          context.selectedVCs,
          context.selectedDisclosuresByVc,
        );
      await VciClient.getInstance().sendSelectedCredentialsForVPSharing(
        selectedCredentials,
      );
    },

    signVP: (context: any) => async () => {
      return await signDataForVpPreparation(context.unsignedVPToken, context);
    },

    sendVP: (context: any) => async () => {
      const jwk = await getJWK(context.publicKey, context.keyType);
      const holderId = 'did:jwk:' + base64url(JSON.stringify(jwk)) + '#0';

      const unSignedVpTokens = await OpenID4VP.constructUnsignedVPToken(
        context.selectedVCs,
        context.selectedDisclosuresByVc,
        holderId,
        signatureSuite,
      );
      const vpTokenSigningResultMap = await signDataForVpPreparation(
        unSignedVpTokens,
        context,
      );
      const verifierResponse = await OpenID4VP.shareVerifiablePresentation(
        vpTokenSigningResultMap,
      );
      if (verifierResponse['status_code'] !== 200) {
        console.error(
          'Error response from verifier during sharing the VP :',
          verifierResponse,
        );
        throw new Error('VERIFIER_RESPONSE_ERROR');
      }
      return verifierResponse;
    },
  };
};
