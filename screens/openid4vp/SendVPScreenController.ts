import {NavigationProp, useNavigation} from '@react-navigation/native';
import {useSelector} from '@xstate/react';
import {useCallback, useContext} from 'react';
import {useTranslation} from 'react-i18next';
import {Theme} from '../../components/ui/styleUtils';
import {selectIsCancelling} from '../../machines/bleShare/commonSelectors';
import {ScanEvents} from '../../machines/bleShare/scan/scanMachine';
import {selectFlowType, selectIsSendingVPError,} from '../../machines/bleShare/scan/scanSelectors';
import {
  selectAreAllVCsChecked,
  selectCredentials,
  selectIsAuthorization,
  selectIsError,
  selectIsFaceVerificationConsent,
  selectIsGetVCsSatisfyingAuthRequest,
  selectIsGetVPSharingConsent,
  selectIsInvalidIdentity,
  selectIsOVPViaDeeplink,
  selectIsSelectingVcs,
  selectIsSharingVP,
  selectIsShowError,
  selectIsShowLoadingScreen,
  selectIsVerifyingIdentity,
  selectMatchingVcsResult,
  selectOpenID4VPRetryCount,
  selectPurpose,
  selectRequestedClaimsByVerifier,
  selectSelectedVCs,
  selectShowConfirmationPopup,
  selectshowTrustConsentModal,
  selectVerifiableCredentialsData,
  selectVerifierLogoInTrustModal,
  selectVerifierNameInTrustModal,
  selectVerifierNameInVPSharing,
  selectVPRequest,
} from '../../machines/openID4VP/openID4VPSelectors';
import {OpenID4VPEvents} from '../../machines/openID4VP/openID4VPMachine';
import {selectMyVcs} from '../../machines/QrLogin/QrLoginSelectors';
import {selectShareableVcs} from '../../machines/VerifiableCredential/VCMetaMachine/VCMetaSelectors';
import {RootRouteProps} from '../../routes';
import {BOTTOM_TAB_ROUTES} from '../../routes/routesConstants';
import {GlobalContext} from '../../shared/GlobalContext';
import {formatTextWithGivenLimit} from '../../shared/Utils';
import {VPShareOverlayProps} from '../Scan/VPShareOverlay';
import {ActivityLogEvents} from '../../machines/activityLog';
import {VPShareActivityLog} from '../../components/VPShareActivityLogEvent';
import {isIOS} from '../../shared/constants';
import {getFaceAttribute, getMosipLogo} from '../../components/VC/common/VCUtils';
import {Credential, VC, VerifiableCredentialData} from '../../machines/VerifiableCredential/VCMetaMachine/vc';
import {isDcqlFlow} from '../../shared/openID4VP/OpenID4VPHelper';
import {VCMetadata} from "../../shared/VCMetadata";

type MyVcsTabNavigation = NavigationProp<RootRouteProps>;

const changeTabBarVisible = (visible: string) => {
  Theme.BottomTabBarStyle.tabBarStyle.display = visible;
};

export function useSendVPScreen(props) {
  const {t} = useTranslation('SendVPScreen');
  const {appService} = useContext(GlobalContext);
  const scanService = appService.children.get('scan')!!;
  const vcMetaService = appService.children.get('vcMeta')!!;
  const activityLogService = appService.children.get('activityLog')!!;
  const navigation = useNavigation<MyVcsTabNavigation>();
  const openID4VPService =
    props?.route?.name === 'IssuersScreen'
      ? props.route.params.ovpService
      : scanService.getSnapshot().context.OpenId4VPRef;

  const shareableVcs = useSelector(vcMetaService, selectShareableVcs);

  const myVcs = useSelector(vcMetaService, selectMyVcs);

  const isGetVCsSatisfyingAuthRequest = useSelector(
    openID4VPService,
    selectIsGetVCsSatisfyingAuthRequest,
  );

  if (isGetVCsSatisfyingAuthRequest) {
    openID4VPService.send('DOWNLOADED_VCS', {vcs: shareableVcs});
  }

  const areAllVCsChecked = useSelector(
    openID4VPService,
    selectAreAllVCsChecked,
  );

  const matchingVcsResult = useSelector(
    openID4VPService,
    selectMatchingVcsResult,
  );

  const checkIfAnyVCHasImage = vcs => {
    return Object.values(vcs)
      .flatMap(vc => vc)
      .some(vc => {
        return getFaceAttribute(vc.verifiableCredential, vc.format) != null;
      });
  };

  const checkIfAllVCsHasImage = vcs => {
    return Object.values(vcs)
      .flatMap(vc => vc)
      .every(
        vc => getFaceAttribute(vc.verifiableCredential, vc.format) != null,
      );
  };

  const getSelectedVCs = (credentialRequestIdToSelectedVcKeys: Record<string, Set<string>>): Record<string, any[]> => {
    const selectedVcsData: Record<string, VC[]> = {}; // input_descriptor_id or credential query ID to VC[]
    console.log("credentialRequestIdToSelectedVcKeys ", (credentialRequestIdToSelectedVcKeys))
    const availableCredentials = myVcs
    Object.entries(credentialRequestIdToSelectedVcKeys).forEach(
      ([credentialRequestId, vcKeys]) => {
        vcKeys.forEach((vcKey: string) => {
          const vcData = availableCredentials[vcKey];
          selectedVcsData[credentialRequestId] =
            selectedVcsData[credentialRequestId] || [];
          selectedVcsData[credentialRequestId].push(vcData);
        });
      },
    );
    console.log("selectedVcsData in getSelectedVCs ", selectedVcsData)
    return selectedVcsData;
  };

  const showConfirmationPopup = useSelector(
    openID4VPService,
    selectShowConfirmationPopup,
  );
  const isSelectingVCs = useSelector(openID4VPService, selectIsSelectingVcs);
  const error = useSelector(openID4VPService, selectIsError);
  const showError = useSelector(openID4VPService, selectIsShowError);
  const isVPSharingConsent = useSelector(
    openID4VPService,
    selectIsGetVPSharingConsent,
  );
  const CONFIRM = () => openID4VPService.send(OpenID4VPEvents.CONFIRM());

  const CANCEL = () => openID4VPService.send(OpenID4VPEvents.CANCEL());

  const GO_BACK = () => openID4VPService.send(OpenID4VPEvents.GO_BACK());

  const DISMISS = () => scanService.send(ScanEvents.DISMISS());

  const DISMISS_POPUP = () =>
    openID4VPService.send(OpenID4VPEvents.DISMISS_POPUP());
  const openID4VPRetryCount = useSelector(
    openID4VPService,
    selectOpenID4VPRetryCount,
  );
  const noCredentialsMatchingVPRequest =
    (!matchingVcsResult.success) && Object.keys(matchingVcsResult).length > 0 &&
    showError;

  const isOVPViaDeepLink = useSelector(
    openID4VPService,
    selectIsOVPViaDeeplink,
  );

  const vpRequest = useSelector(openID4VPService, selectVPRequest);

  const isDcqlRequestFlow = isDcqlFlow(vpRequest);

  const getAdditionalMessage = useCallback(() => {
    return isOVPViaDeepLink && isIOS() ? t('errors.additionalMessage') : '';
  }, [isOVPViaDeepLink, t]);

  const generateAndStoreLogMessage = useCallback(
    (logType: string, errorInfo?: string) => {
      activityLogService.send(
        ActivityLogEvents.LOG_ACTIVITY(
          VPShareActivityLog.getLogFromObject({
            timestamp: Date.now(),
            type: logType,
            info: errorInfo,
          }),
        ),
      );
    },
    [activityLogService],
  );

  const requestedClaimsByVerifier = useSelector(
    openID4VPService,
    selectRequestedClaimsByVerifier,
  );

  let overlayDetails: Omit<VPShareOverlayProps, 'isVisible'> | null = null;
  const vpVerifierName = useSelector(
    openID4VPService,
    selectVerifierNameInVPSharing,
  );
  if (isVPSharingConsent) {
    overlayDetails = {
      primaryButtonTestID: 'confirm',
      primaryButtonText: t('consentDialog.confirmButton'),
      primaryButtonEvent: CONFIRM,
      secondaryButtonTestID: 'cancel',
      secondaryButtonText: t('common:decline'),
      secondaryButtonEvent: CANCEL,
      title: t('consentDialog.title'),
      titleTestID: 'consentTitle',
      message: t('consentDialog.message', {
        verifierName: formatTextWithGivenLimit(vpVerifierName),
        interpolation: {escapeValue: false},
      }),
      messageTestID: 'consentMsg',
      onCancel: DISMISS_POPUP,
    };
  } else if (showConfirmationPopup) {
    overlayDetails = {
      primaryButtonTestID: 'yesProceed',
      primaryButtonText: t('confirmationDialog.confirmButton'),
      primaryButtonEvent: CONFIRM,
      secondaryButtonTestID: 'goBack',
      secondaryButtonText: t('confirmationDialog.cancelButton'),
      secondaryButtonEvent: GO_BACK,
      title: t('confirmationDialog.title'),
      titleTestID: 'confirmationTitle',
      message: t('confirmationDialog.message'),
      messageTestID: 'confirmationMsg',
      onCancel: DISMISS_POPUP,
    };
  }

  return {
    isAuthorizationFlow: useSelector(openID4VPService, selectIsAuthorization),
    isSendingVP: useSelector(openID4VPService, selectIsSharingVP),
    showLoadingScreen: useSelector(openID4VPService, selectIsShowLoadingScreen),
    vpVerifierName,
    flowType: useSelector(openID4VPService, selectFlowType),
    showTrustConsentModal: useSelector(
      openID4VPService,
      selectshowTrustConsentModal,
    ),
    verifierNameInTrustModal: useSelector(
      openID4VPService,
      selectVerifierNameInTrustModal,
    ),
    verifierLogoInTrustModal: useSelector(
      openID4VPService,
      selectVerifierLogoInTrustModal,
    ),
    showConfirmationPopup,
    isSelectingVCs,
    checkIfAnyVCHasImage,
    checkIfAllVCsHasImage,
    error,
    noCredentialsMatchingVPRequest,
    requestedClaimsByVerifier,
    getAdditionalMessage,
    overlayDetails,
    generateAndStoreLogMessage,
    scanScreenError: useSelector(scanService, selectIsSendingVPError),
    matchingVcsResult,
    userSelectedVCs: useSelector(openID4VPService, selectSelectedVCs),
    areAllVCsChecked,
    isVerifyingIdentity: useSelector(
      openID4VPService,
      selectIsVerifyingIdentity,
    ),
    purpose: useSelector(openID4VPService, selectPurpose),
    isInvalidIdentity: useSelector(openID4VPService, selectIsInvalidIdentity),
    isCancelling: useSelector(scanService, selectIsCancelling),
    isFaceVerificationConsent: useSelector(
      openID4VPService,
      selectIsFaceVerificationConsent,
    ),
    isOVPViaDeepLink,
    credentials: useSelector(openID4VPService, selectCredentials),
    verifiableCredentialsData: useSelector(
      openID4VPService,
      selectVerifiableCredentialsData,
    ),
    isDcqlFlow: isDcqlRequestFlow,

    FACE_VERIFICATION_CONSENT: (isDoNotAskAgainChecked: boolean) =>
      openID4VPService.send(
        OpenID4VPEvents.FACE_VERIFICATION_CONSENT(isDoNotAskAgainChecked),
      ),
    DISMISS,
    DISMISS_POPUP,
    RETRY: () => openID4VPService.send(OpenID4VPEvents.RETRY()),
    FACE_VALID: () => openID4VPService.send(OpenID4VPEvents.FACE_VALID()),
    FACE_INVALID: () => openID4VPService.send(OpenID4VPEvents.FACE_INVALID()),
    RETRY_VERIFICATION: () =>
      openID4VPService.send(OpenID4VPEvents.RETRY_VERIFICATION()),
    GO_TO_HOME: () => {
      openID4VPService.send(OpenID4VPEvents.RESET_ERROR());
      scanService.send(ScanEvents.RESET());
      setTimeout(() => {
        navigation.navigate(BOTTOM_TAB_ROUTES.home, {screen: 'HomeScreen'});
        changeTabBarVisible('flex');
      }, 0);
    },

    ACCEPT_REQUEST: (credentialRequestIdToSelectedVcKeys, selectedDisclosuresByVc) => {
      console.log("credentialRequestIdToSelectedVcKeys in ACCEPT_REQUEST", credentialRequestIdToSelectedVcKeys)
      openID4VPService.send(
        OpenID4VPEvents.ACCEPT_REQUEST(
          getSelectedVCs(credentialRequestIdToSelectedVcKeys),
          selectedDisclosuresByVc,
        ),
      );
    },

    VERIFIER_TRUST_CONSENT_GIVEN: () => {
      openID4VPService.send(OpenID4VPEvents.VERIFIER_TRUST_CONSENT_GIVEN());
    },

    VERIFY_AND_ACCEPT_REQUEST: (credentialRequestIdToSelectedVcKeys, selectedDisclosuresByVc) => {
      openID4VPService.send(
        OpenID4VPEvents.VERIFY_AND_ACCEPT_REQUEST(
          getSelectedVCs(credentialRequestIdToSelectedVcKeys),
          selectedDisclosuresByVc,
        ),
      );
    },
    CANCEL,
    openID4VPRetryCount,
    RESET_RETRY_COUNT: () =>
      openID4VPService.send(OpenID4VPEvents.RESET_RETRY_COUNT()),
  };
}
