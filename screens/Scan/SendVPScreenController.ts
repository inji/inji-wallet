import {NavigationProp, useNavigation} from '@react-navigation/native';
import {useSelector} from '@xstate/react';
import {useCallback, useContext, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ActorRefFrom} from 'xstate';
import {Theme} from '../../components/ui/styleUtils';
import {selectIsCancelling} from '../../machines/bleShare/commonSelectors';
import {ScanEvents} from '../../machines/bleShare/scan/scanMachine';
import {
  selectFlowType,
  selectIsSendingVPError,
} from '../../machines/bleShare/scan/scanSelectors';
import {
  selectIsAuthorization,
  selectAreAllVCsChecked,
  selectCredentials,
  selectIsError,
  selectIsFaceVerificationConsent,
  selectIsGetVCsSatisfyingAuthRequest,
  selectIsGetVPSharingConsent,
  selectIsInvalidIdentity,
  selectIsOVPViaDeeplink,
  selectIsSelectingVcs,
  selectIsSharingVP,
  selectIsShowLoadingScreen,
  selectIsVerifyingIdentity,
  selectOpenID4VPRetryCount,
  selectPurpose,
  selectRequestedClaimsByVerifier,
  selectSelectedVCs,
  selectShowConfirmationPopup,
  selectshowTrustConsentModal,
  selectVCsMatchingAuthRequest,
  selectVerifiableCredentialsData,
  selectVerifierLogoInTrustModal,
  selectVerifierNameInTrustModal,
  selectVerifierNameInVPSharing,
} from '../../machines/openID4VP/openID4VPSelectors';
import {OpenID4VPEvents} from '../../machines/openID4VP/openID4VPMachine';
import {selectMyVcs} from '../../machines/QrLogin/QrLoginSelectors';
import {VCItemMachine} from '../../machines/VerifiableCredential/VCItemMachine/VCItemMachine';
import {selectShareableVcs} from '../../machines/VerifiableCredential/VCMetaMachine/VCMetaSelectors';
import {RootRouteProps} from '../../routes';
import {BOTTOM_TAB_ROUTES} from '../../routes/routesConstants';
import {GlobalContext} from '../../shared/GlobalContext';
import {formatTextWithGivenLimit} from '../../shared/Utils';
import {VCMetadata} from '../../shared/VCMetadata';
import {VPShareOverlayProps} from './VPShareOverlay';
import {ActivityLogEvents} from '../../machines/activityLog';
import {VPShareActivityLog} from '../../components/VPShareActivityLogEvent';
import {isIOS} from '../../shared/constants';
import {getFaceAttribute} from '../../components/VC/common/VCUtils';

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
  // input descriptor id to VCs mapping
  const [
    inputDescriptorIdToSelectedVcKeys,
    setInputDescriptorIdToSelectedVcKeys,
  ] = useState<Record<string, [string]>>({});

  const hasLoggedErrorRef = useRef(false);

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
  const vcsMatchingAuthRequest = useSelector(
    openID4VPService,
    selectVCsMatchingAuthRequest,
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

  const getSelectedVCs = (): Record<string, any[]> => {
    let selectedVcsData: Record<string, any[]> = {}; // input_descriptor_id to VC[]
    Object.entries(inputDescriptorIdToSelectedVcKeys).forEach(
      ([inputDescriptorId, vcKeys]) => {
        vcKeys.forEach((vcKey: string) => {
          const vcData = myVcs[vcKey];
          selectedVcsData[inputDescriptorId] =
            selectedVcsData[inputDescriptorId] || [];
          selectedVcsData[inputDescriptorId].push(vcData);
        });
      },
    );
    return selectedVcsData;
  };

  const showConfirmationPopup = useSelector(
    openID4VPService,
    selectShowConfirmationPopup,
  );
  const isSelectingVCs = useSelector(openID4VPService, selectIsSelectingVcs);
  const error = useSelector(openID4VPService, selectIsError);
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
    isSelectingVCs &&
    (Object.keys(vcsMatchingAuthRequest).length === 0 ||
      Object.values(vcsMatchingAuthRequest).every(
        value => Array.isArray(value) && value.length === 0,
      ));

  const isOVPViaDeepLink = useSelector(
    openID4VPService,
    selectIsOVPViaDeeplink,
  );

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
  let vpVerifierName = useSelector(
    openID4VPService,
    selectVerifierNameInVPSharing,
  );
  if (isVPSharingConsent) {
    overlayDetails = {
      primaryButtonTestID: 'confirm',
      primaryButtonText: t('consentDialog.confirmButton'),
      primaryButtonEvent: CONFIRM,
      secondaryButtonTestID: 'cancel',
      secondaryButtonText: t('consentDialog.cancelButton'),
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
    getSelectedVCs,
    error,
    noCredentialsMatchingVPRequest,
    requestedClaimsByVerifier,
    getAdditionalMessage,
    overlayDetails,
    generateAndStoreLogMessage,
    scanScreenError: useSelector(scanService, selectIsSendingVPError),
    vcsMatchingAuthRequest,
    userSelectedVCs: useSelector(openID4VPService, selectSelectedVCs),
    areAllVCsChecked,
    inputDescriptorIdToSelectedVcKeys,
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
    SELECT_VC_ITEM:
      (vcKey: string, inputDescriptorId: string) =>
      (vcRef: ActorRefFrom<typeof VCItemMachine>) => {
        let descriptorMappingToVCs = {...inputDescriptorIdToSelectedVcKeys};

        const isVCSelected =
          Object.keys(inputDescriptorIdToSelectedVcKeys)?.includes(
            inputDescriptorId,
          ) &&
          inputDescriptorIdToSelectedVcKeys[inputDescriptorId]?.includes(vcKey)
            ? false
            : true;
        if (isVCSelected) {
          if (descriptorMappingToVCs[inputDescriptorId]) {
            if (!descriptorMappingToVCs[inputDescriptorId].includes(vcKey)) {
              descriptorMappingToVCs[inputDescriptorId].push(vcKey);
            }
          } else {
            descriptorMappingToVCs[inputDescriptorId] = [vcKey];
          }
        } else {
          // remove vc key from the input descriptor mapping
          if (descriptorMappingToVCs[inputDescriptorId]) {
            descriptorMappingToVCs[inputDescriptorId] = descriptorMappingToVCs[
              inputDescriptorId
            ].filter(key => key !== vcKey); // remove the vcKey from the array
            if (descriptorMappingToVCs[inputDescriptorId].length === 0) {
              // if the array is empty, remove the input descriptor id
              delete descriptorMappingToVCs[inputDescriptorId];
            }
          }
        }
        setInputDescriptorIdToSelectedVcKeys(descriptorMappingToVCs);
        const {serviceRefs, wellknownResponse, ...vcData} =
          vcRef.getSnapshot().context;
      },

    UNCHECK_ALL: () => {
      setInputDescriptorIdToSelectedVcKeys({});
    },

    CHECK_ALL: () => {
      const updatedInputDescriptorToCredentialsMapping: Record<string, any[]> =
        {};
      Object.entries(vcsMatchingAuthRequest).map(([inputDescriptorId, vcs]) => {
        updatedInputDescriptorToCredentialsMapping[inputDescriptorId] = [];
        vcs.map(vcData => {
          const vcKey = VCMetadata.fromVcMetadataString(
            vcData.vcMetadata,
          ).getVcKey();
          updatedInputDescriptorToCredentialsMapping[inputDescriptorId].push(
            vcKey,
          );
        });
      });
      setInputDescriptorIdToSelectedVcKeys({
        ...updatedInputDescriptorToCredentialsMapping,
      });
    },

    ACCEPT_REQUEST: selectedDisclosuresByVc => {
      openID4VPService.send(
        OpenID4VPEvents.ACCEPT_REQUEST(
          getSelectedVCs(),
          selectedDisclosuresByVc,
        ),
      );
    },

    VERIFIER_TRUST_CONSENT_GIVEN: () => {
      openID4VPService.send(OpenID4VPEvents.VERIFIER_TRUST_CONSENT_GIVEN());
    },

    VERIFY_AND_ACCEPT_REQUEST: selectedDisclosuresByVc => {
      openID4VPService.send(
        OpenID4VPEvents.VERIFY_AND_ACCEPT_REQUEST(
          getSelectedVCs(),
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
