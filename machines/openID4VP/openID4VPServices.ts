import {CACHED_API} from '../../shared/api';
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

    shareDeclineStatus: async () => {
      return await OpenID4VP.sendErrorToVerifier(
        OVP_ERROR_MESSAGES.DECLINED,
        OVP_ERROR_CODE.DECLINED,
      );
    },

    getMatchingCredentialsForVPRequest: (context: any) => async () => {
      return await OpenID4VP.getMatchingCredentials(
        context.authenticationResponse,
        context.availableWalletCredentials,
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
      return await signDataForVpPreparation(context.unsignedVPToken);
    },

    sendVP: (context: any) => async () => {
      const unSignedVpTokens = await OpenID4VP.constructUnsignedVPToken(
        context.selectedVCs,
        context.selectedDisclosuresByVc,
      );
      const vpTokenSigningResults = await signDataForVpPreparation(
        unSignedVpTokens,
      );

      const verifierResponse = await OpenID4VP.shareVerifiablePresentation(
        vpTokenSigningResults,
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
