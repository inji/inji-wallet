import {NavigationProp, useNavigation} from '@react-navigation/native';
import {useSelector} from '@xstate/react';
import {useContext, useEffect, useRef, useState} from 'react';
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
  selectVCsMatchingAuthRequest,
  selectVerifiableCredentialsData,
  selectVerifierNameInVPSharing,
} from '../../machines/openID4VP/openID4VPSelectors';
import {OpenID4VPEvents} from '../../machines/openID4VP/openID4VPMachine';
import {selectMyVcs} from '../../machines/QrLogin/QrLoginSelectors';
import {VCItemMachine} from '../../machines/VerifiableCredential/VCItemMachine/VCItemMachine';
import {selectShareableVcs} from '../../machines/VerifiableCredential/VCMetaMachine/VCMetaSelectors';
import {RootRouteProps} from '../../routes';
import {BOTTOM_TAB_ROUTES} from '../../routes/routesConstants';
import {GlobalContext} from '../../shared/GlobalContext';
import {formatTextWithGivenLimit, isMosipVC} from '../../shared/Utils';
import {VCMetadata} from '../../shared/VCMetadata';
import {VPShareOverlayProps} from './VPShareOverlay';
import {ActivityLogEvents} from '../../machines/activityLog';
import {VPShareActivityLog} from '../../components/VPShareActivityLogEvent';
import {SelectedCredentialsForVPSharing} from '../../machines/VerifiableCredential/VCMetaMachine/vc';
import {isIOS} from '../../shared/constants';

type MyVcsTabNavigation = NavigationProp<RootRouteProps>;

const changeTabBarVisible = (visible: string) => {
  Theme.BottomTabBarStyle.tabBarStyle.display = visible;
};

export function useSendVPScreen() {
  const {t} = useTranslation('SendVPScreen');
  const {appService} = useContext(GlobalContext);
  const scanService = appService.children.get('scan')!!;
  const vcMetaService = appService.children.get('vcMeta')!!;
  const activityLogService = appService.children.get('activityLog')!!;
  const navigation = useNavigation<MyVcsTabNavigation>();
  const openID4VPService = scanService.getSnapshot().context.OpenId4VPRef;
  const [selectedVCKeys, setSelectedVCKeys] = useState<Record<string, string>>(
    {},
  );

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
        return isMosipVC(vc.vcMetadata?.issuer);
      });
  };

  const checkIfAllVCsHasImage = vcs => {
    return Object.values(vcs)
      .flatMap(vc => vc)
      .every(vc => isMosipVC(vc.vcMetadata.issuer));
  };

  const getSelectedVCs = (): Record<string, any[]> => {
    let selectedVcsData: Record<string, any[]> = {};
    Object.entries(selectedVCKeys).forEach(([vcKey, inputDescriptorId]) => {
      const vcData = myVcs[vcKey];
      if (!selectedVcsData[inputDescriptorId]) {
        selectedVcsData[inputDescriptorId] = [];
      }
      selectedVcsData[inputDescriptorId].push(vcData);
    });
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

  const getAdditionalMessage = () => {
    return isOVPViaDeepLink && isIOS() ? t('errors.additionalMessage') : '';
  };

  function generateAndStoreLogMessage(logType: string, errorInfo?: string) {
    activityLogService.send(
      ActivityLogEvents.LOG_ACTIVITY(
        VPShareActivityLog.getLogFromObject({
          timestamp: Date.now(),
          type: logType,
          info: errorInfo,
        }),
      ),
    );
  }
  const requestedClaimsByVerifier = useSelector(
    openID4VPService,
    selectRequestedClaimsByVerifier,
  );

  const [errorModal, setErrorModalData] = useState({
    show: false,
    title: '',
    message: '',
    additionalMessage: '',
    showRetryButton: false,
  });

  const claimsAsString = '[' + requestedClaimsByVerifier + ']';
  if (noCredentialsMatchingVPRequest) {
    errorModal.title = t('errors.noMatchingCredentials.title');
    errorModal.message = t('errors.noMatchingCredentials.message', {
      claims: claimsAsString,
    });
    generateAndStoreLogMessage(
      'NO_CREDENTIAL_MATCHING_REQUEST',
      claimsAsString,
    );
  } else if (
    error.includes('Verifier authentication was unsuccessful') ||
    error.startsWith('api error')
  ) {
    errorModal.title = t('errors.invalidVerifier.title');
    errorModal.message = t('errors.invalidVerifier.message');
    generateAndStoreLogMessage('VERIFIER_AUTHENTICATION_FAILED');
  } else if (error.includes('credential mismatch detected')) {
    errorModal.title = t('errors.credentialsMismatch.title');
    errorModal.message = t('errors.credentialsMismatch.message', {
      claims: claimsAsString,
    });
    generateAndStoreLogMessage(
      'CREDENTIAL_MISMATCH_FROM_KEBAB',
      claimsAsString,
    );
  } else if (error.includes('none of the selected VC has image')) {
    errorModal.title = t('errors.noImage.title');
    errorModal.message = t('errors.noImage.message');
    generateAndStoreLogMessage('NO_SELECTED_VC_HAS_IMAGE');
  } else if (error.includes('invalid_request_uri_method')) {
    errorModal.title = t('errors.invalidRequestURI.title');
    errorModal.message = t('errors.invalidRequestURI.message');
    generateAndStoreLogMessage('INVALID_REQUEST_URI_METHOD');
  } else if (error.includes('invalid_request')) {
    errorModal.title = t('errors.invalidQrCode.title');
    errorModal.message = t('errors.invalidQrCode.message');
    generateAndStoreLogMessage('INVALID_AUTH_REQUEST');
  } else if (error.includes('vp_formats_not_supported')) {
    errorModal.title = t('errors.vpFormatsNotSupported.title');
    errorModal.message = t('errors.vpFormatsNotSupported.message');
    generateAndStoreLogMessage('VP_FORMATS_NOT_SUPPORTED');
  } else if (error.includes('invalid_presentation_definition_uri')) {
    errorModal.title = t('errors.invalidPresentationDefinitionURI.title');
    errorModal.message = t('errors.invalidPresentationDefinitionURI.message');
    generateAndStoreLogMessage('INVALID_PRESENTATION_DEFINITION_URI');
  } else if (error.includes('invalid_presentation_definition_reference')) {
    errorModal.title = t('errors.invalidPresentationDefinitionRef.title');
    errorModal.message = t('errors.invalidPresentationDefinitionRef.message');
    generateAndStoreLogMessage('INVALID_PRESENTATION_DEFINITION_REFERENCE');
  } else if (error.startsWith('send vp')) {
    errorModal.title = t('errors.sendVPError.title');
    errorModal.message = t('errors.sendVPError.message');
    errorModal.showRetryButton = true;
  } else if (error !== '') {
    errorModal.title = t('errors.genericError.title');
    errorModal.message = t('errors.genericError.message');
    generateAndStoreLogMessage('TECHNICAL_ERROR');
  }

  useEffect(() => {
    if (noCredentialsMatchingVPRequest && !hasLoggedErrorRef.current) {
      setErrorModalData({
        show: true,
        title: t('errors.noMatchingCredentials.title'),
        message: t('errors.noMatchingCredentials.message', {
          claims: claimsAsString,
        }),
        additionalMessage: getAdditionalMessage(),
        showRetryButton: false,
      });
      generateAndStoreLogMessage(
        'NO_CREDENTIAL_MATCHING_REQUEST',
        claimsAsString,
      );
      hasLoggedErrorRef.current = true;
    } else if (
      (error.includes('Verifier authentication was unsuccessful') ||
        error.startsWith('api error')) &&
      !hasLoggedErrorRef.current
    ) {
      setErrorModalData({
        show: true,
        title: t('errors.invalidVerifier.title'),
        message: t('errors.invalidVerifier.message'),
        additionalMessage: getAdditionalMessage(),
        showRetryButton: false,
      });
      generateAndStoreLogMessage('VERIFIER_AUTHENTICATION_FAILED');
      hasLoggedErrorRef.current = true;
    } else if (
      error.includes('credential mismatch detected') &&
      !hasLoggedErrorRef.current
    ) {
      setErrorModalData({
        show: true,
        title: t('errors.credentialsMismatch.title'),
        message: t('errors.credentialsMismatch.message', {
          claims: claimsAsString,
        }),
        additionalMessage: getAdditionalMessage(),
        showRetryButton: false,
      });
      generateAndStoreLogMessage(
        'CREDENTIAL_MISMATCH_FROM_KEBAB',
        claimsAsString,
      );
      hasLoggedErrorRef.current = true;
    } else if (
      error.includes('none of the selected VC has image') &&
      !hasLoggedErrorRef.current
    ) {
      setErrorModalData({
        show: true,
        title: t('errors.noImage.title'),
        message: t('errors.noImage.message'),
        additionalMessage: getAdditionalMessage(),
        showRetryButton: false,
      });
      generateAndStoreLogMessage('NO_SELECTED_VC_HAS_IMAGE');
      hasLoggedErrorRef.current = true;
    } else if (
      error.startsWith('vc validation') &&
      !hasLoggedErrorRef.current
    ) {
      setErrorModalData({
        show: true,
        title: t('errors.invalidQrCode.title'),
        message: t('errors.invalidQrCode.message'),
        additionalMessage: getAdditionalMessage(),
        showRetryButton: false,
      });
      generateAndStoreLogMessage('INVALID_AUTH_REQUEST');
      hasLoggedErrorRef.current = true;
    } else if (error.startsWith('send vp') && !hasLoggedErrorRef.current) {
      setErrorModalData({
        show: true,
        title: t('errors.genericError.title'),
        message: t('errors.genericError.message'),
        additionalMessage: getAdditionalMessage(),
        showRetryButton: true,
      });
      hasLoggedErrorRef.current = true;
    } else if (error !== '' && !hasLoggedErrorRef.current) {
      setErrorModalData({
        show: true,
        title: t('errors.genericError.title'),
        message: t('errors.genericError.message'),
        additionalMessage: getAdditionalMessage(),
        showRetryButton: false,
      });
      generateAndStoreLogMessage('TECHNICAL_ERROR');
      hasLoggedErrorRef.current = true;
    } else if (error === '') {
      setErrorModalData({
        show: false,
        title: '',
        message: '',
        additionalMessage: '',
        showRetryButton: false,
      });
      hasLoggedErrorRef.current = false;
    }
  }, [error, noCredentialsMatchingVPRequest]);

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
    isSendingVP: useSelector(openID4VPService, selectIsSharingVP),
    showLoadingScreen: useSelector(openID4VPService, selectIsShowLoadingScreen),
    vpVerifierName,
    flowType: useSelector(openID4VPService, selectFlowType),
    showConfirmationPopup,
    isSelectingVCs,
    checkIfAnyVCHasImage,
    checkIfAllVCsHasImage,
    getSelectedVCs,
    errorModal,
    overlayDetails,
    RESET_LOGGED_ERROR: () => {
      hasLoggedErrorRef.current = false;
      setErrorModalData({
        show: false,
        title: '',
        message: '',
        additionalMessage: '',
        showRetryButton: false,
      });
    },
    scanScreenError: useSelector(scanService, selectIsSendingVPError),
    vcsMatchingAuthRequest,
    userSelectedVCs: useSelector(openID4VPService, selectSelectedVCs),
    areAllVCsChecked,
    selectedVCKeys,
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
        let selectedVcs = {...selectedVCKeys};
        const isVCSelected = !!!selectedVcs[vcKey];
        if (isVCSelected) {
          selectedVcs[vcKey] = inputDescriptorId;
        } else {
          delete selectedVcs[vcKey];
        }
        setSelectedVCKeys(selectedVcs);
        const {serviceRefs, wellknownResponse, ...vcData} =
          vcRef.getSnapshot().context;
      },

    UNCHECK_ALL: () => {
      setSelectedVCKeys({});
    },

    CHECK_ALL: () => {
      let updatedVCsList = {};
      Object.entries(vcsMatchingAuthRequest).map(([inputDescriptorId, vcs]) => {
        vcs.map(vcData => {
          const vcKey = VCMetadata.fromVcMetadataString(
            vcData.vcMetadata,
          ).getVcKey();
          updatedVCsList[vcKey] = inputDescriptorId;
        });
      });
      setSelectedVCKeys({...updatedVCsList});
    },

    ACCEPT_REQUEST: () => {
      openID4VPService.send(OpenID4VPEvents.ACCEPT_REQUEST(getSelectedVCs()));
    },

    VERIFY_AND_ACCEPT_REQUEST: () => {
      openID4VPService.send(
        OpenID4VPEvents.VERIFY_AND_ACCEPT_REQUEST(getSelectedVCs()),
      );
    },
    CANCEL,
    openID4VPRetryCount,
    RESET_RETRY_COUNT: () =>
      openID4VPService.send(OpenID4VPEvents.RESET_RETRY_COUNT()),
  };
}
