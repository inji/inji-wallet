import {VCShareFlowType} from '../../../shared/Utils';
import {androidVersion, isAndroid, isIOS} from '../../../shared/constants';
import {isShareable} from '../../../shared/shareability';

export const ScanGuards = () => {
  return {
    showFaceAuthConsentScreen: context => {
      return context.showFaceAuthConsent;
    },

    // sample: 'OPENID4VP://connect:?name=OVPMOSIP&key=69dc92a2cc91f02258aa8094d6e2b62877f5b6498924fbaedaaa46af30abb364'
    isOpenIdQr: (_context, event) => event.params.startsWith('OPENID4VP://'),
    // sample: 'INJIQUICKSHARE://NAKDFK:DB:JAHDIHAIDJXKABDAJDHUHW'
    isQuickShare: (_context, event) =>
      // event.params.startsWith(DEFAULT_QR_HEADER),
      // toggling the feature for now
      false,
    isQrLogin: (context, event) => {
      try {
        let linkCode = new URL(event.params);
        // sample: 'inji://landing-page-name?linkCode=sTjp0XVH3t3dGCU&linkExpireDateTime=2023-11-09T06:56:18.482Z'
        return linkCode.searchParams.get('linkCode') !== null;
      } catch (e) {
        return false;
      }
    },

    isOnlineSharing: (_, event) => {
      return event.params.startsWith('openid4vp://authorize');
    },

    uptoAndroid11: () => isAndroid() && androidVersion < 31,

    isIOS: () => isIOS(),

    isMinimumStorageRequiredForAuditEntryReached: (_context, event) =>
      Boolean(event.data),

    isQrLoginViaDeepLinking: context => context.isQrLoginViaDeepLink === true,
    isOVPViaDeepLink: context => context.isOVPViaDeepLink === true,

    isFlowTypeDeepLink: context =>
      context.isOVPViaDeepLink || context.isQrLoginViaDeepLink,

    isFlowTypeMiniViewShareWithSelfie: context =>
      context.flowType === VCShareFlowType.MINI_VIEW_SHARE_WITH_SELFIE,

    isFlowTypeMiniViewShare: context =>
      context.flowType === VCShareFlowType.MINI_VIEW_SHARE,

    isFlowTypeSimpleShare: context =>
      context.flowType === VCShareFlowType.SIMPLE_SHARE,

    isSelectedVcShareable: (_context, event) =>
      isShareable(event.vc?.vcMetadata, event.vc?.verifiableCredential),
  };
};
