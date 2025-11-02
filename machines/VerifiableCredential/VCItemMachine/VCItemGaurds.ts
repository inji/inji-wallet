import {isSignedInResult} from '../../../shared/CloudBackupAndRestoreUtils';
import {isHardwareKeystoreExists} from '../../../shared/cryptoutil/cryptoUtil';
import {VerificationErrorType} from '../../../shared/vcjs/verifyCredential';

export const VCItemGaurds = () => {
  return {
    hasCredentialAndWellknown: (context, event) => {
      const vc = event.response;
      return (
        vc?.verifiableCredential != null &&
        !!context.verifiableCredential?.wellKnown
      );
    },
    hasCredential: (_, event) => {
      const vc = event.response;
      return vc?.verifiableCredential != null;
    },
    hasKeyPair: (_, event) => !!event?.data?.publicKey,

    isSignedIn: (_context, event) =>
      (event.data as isSignedInResult).isSignedIn,

    isDownloadAllowed: _context => {
      return _context.downloadCounter <= _context.maxDownloadCount;
    },

    isCustomSecureKeystore: () => isHardwareKeystoreExists,

    isVerificationPendingBecauseOfNetworkIssue: (_context, event) =>
      (event.data as Error).message == VerificationErrorType.NETWORK_ERROR,

    hasVcStatusChangedAfterReverification: (context:any) => {
      return context.statusChangedDuringVerification;
    }
  };
};
