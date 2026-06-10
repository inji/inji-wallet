import {useFocusEffect} from '@react-navigation/native';
import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {useTranslation} from 'react-i18next';
import {BackHandler, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Column, Text} from '../../components/ui';
import {Theme} from '../../components/ui/styleUtils';
import {
  isIOS,
  LIVENESS_CHECK,
  OVP_ERROR_CODE,
  OVP_ERROR_MESSAGES,
} from '../../shared/constants';
import {TelemetryConstants} from '../../shared/telemetry/TelemetryConstants';
import {
  getImpressionEventData,
  sendImpressionEvent,
} from '../../shared/telemetry/TelemetryUtils';
import {useSendVPScreen} from './SendVPScreenController';
import {ScanLayoutProps} from '../../routes/routeTypes';
import OpenID4VP from '../../shared/openID4VP/OpenID4VP';
import {GlobalContext} from '../../shared/GlobalContext';
import {APP_EVENTS} from '../../machines/app';
import {useScanScreen} from '../Scan/ScanScreenController';
import {TrustModalVerifier} from '../../components/TrustModalVerifier';
import {
  MatchingVcListContainer,
  MatchingVcListRef,
} from '../../components/openid4vp/matchingVc/MatchingVcListContainer';
import {SendVPHeader} from '../../components/openid4vp/SendVPHeader';
import {SendVPLoadingState} from '../../components/openid4vp/SendVPLoadingState';
import {SendVPActions} from '../../components/openid4vp/SendVPActions';
import {SendVPOverlays} from '../../components/openid4vp/overlay/SendVPOverlays';
import {SendVPError} from '../../components/openid4vp/SendVPError';
import {DeeplinkBanner} from '../../components/DeeplinkBanner';

export const SendVPScreen: React.FC<ScanLayoutProps> = props => {
  const {t} = useTranslation('SendVPScreen');
  const matchingVcListRef = useRef<MatchingVcListRef | null>(null);
  const controller = useSendVPScreen(props);
  const [disableShareButton, setDisableShareButton] = useState<boolean>(true);
  const scanScreenController = useScanScreen();
  const insets = useSafeAreaInsets();

  const {appService} = useContext(GlobalContext);
  const [showInfoOverlay, setShowInfoOverlay] = useState(false);

  useEffect(() => {
    sendImpressionEvent(
      getImpressionEventData(
        TelemetryConstants.FlowType.senderVcShare,
        TelemetryConstants.Screens.vcList,
      ),
    );
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      props.navigation
        .getParent()
        ?.setOptions({tabBarStyle: {display: 'none'}});

      const onBackPress = () => true;

      const disableBackHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => {
        props.navigation
          .getParent()
          ?.setOptions({tabBarStyle: {display: 'flex'}});
        disableBackHandler.remove();
      };
    }, [props.navigation]),
  );

  useEffect(() => {
    if (scanScreenController.isStartPermissionCheck) {
      if (
        scanScreenController.authorizationRequest !== '' &&
        scanScreenController.isNoSharableVCs
      ) {
        scanScreenController.START_PERMISSION_CHECK();
      } else if (!scanScreenController.isNoSharableVCs) {
        scanScreenController.START_PERMISSION_CHECK();
      }
    }
  });

  const handleDismiss = async () => {
    // Send error to verifier is initiated and its response is not listened to here.
    if (!controller.isAuthorizationFlow) {
      void OpenID4VP.sendErrorToVerifier(
        OVP_ERROR_MESSAGES.DECLINED,
        OVP_ERROR_CODE.DECLINED,
      );
    }

    controller.generateAndStoreLogMessage('USER_DECLINED_CONSENT');
    goBack();
  };

  function goBack() {
    if (controller.isOVPViaDeepLink) {
      controller.GO_TO_HOME();
      BackHandler.exitApp();
    } else {
      controller.DISMISS();
    }
  }

  const handleRejectButtonEvent = async () => {
    // Send error to verifier is initiated and its response is not listened to here.
    if (!controller.isAuthorizationFlow) {
      void OpenID4VP.sendErrorToVerifier(
        OVP_ERROR_MESSAGES.DECLINED,
        OVP_ERROR_CODE.DECLINED,
      );
    }

    controller.generateAndStoreLogMessage('USER_DECLINED_CONSENT');
    if (controller.isOVPViaDeepLink) {
      controller.GO_TO_HOME();
      BackHandler.exitApp();
    } else {
      controller.CANCEL();
    }
  };

  useLayoutEffect(() => {
    if (controller.showLoadingScreen) {
      props.navigation.setOptions({
        headerShown: false,
      });
    } else {
      props.navigation.setOptions({
        headerShown: true,
        header: () => (
          <SendVPHeader
            topInset={insets.top}
            requesterLabel={t('requester')}
            onDismiss={handleDismiss}
            verifierName={controller.vpVerifierName}
            verifierLogo={controller.verifierLogoInTrustModal}
            isDcqlFlow={controller.isDcqlFlow}
            onInfoPress={() => setShowInfoOverlay(true)}
          />
        ),
      });
    }
  }, [
    controller.showLoadingScreen,
    controller.vpVerifierName,
    controller.isOVPViaDeepLink,
    controller.verifierLogoInTrustModal,
    insets.top,
  ]);

  if (controller.showLoadingScreen) {
    return (
      <React.Fragment>
        <TrustModalVerifier
          isVisible={controller.showTrustConsentModal}
          logo={controller.verifierLogoInTrustModal}
          name={
            controller.verifierNameInTrustModal ??
            t('ScanScreen:unknownVerifier')
          }
          onConfirm={controller.VERIFIER_TRUST_CONSENT_GIVEN}
          onCancel={controller.CANCEL}
          flowType={'verifier'}
        />
        <SendVPLoadingState
          isAuthorizationFlow={controller.isAuthorizationFlow}
        />
      </React.Fragment>
    );
  }

  const handleTextButtonEvent = () => {
    controller.GO_TO_HOME();
    controller.RESET_RETRY_COUNT();
  };

  const handleDeepLinkErrorExit = () => {
    controller.GO_TO_HOME();
    controller.RESET_RETRY_COUNT();
    appService.send(APP_EVENTS.RESET_AUTHORIZATION_REQUEST());
    BackHandler.exitApp();
  };

  const getPrimaryButtonEvent = () => {
    if (controller.showConfirmationPopup && controller.isOVPViaDeepLink) {
      return async () => {
        // Send error to verifier is initiated and its response is not listened to here.
        void OpenID4VP.sendErrorToVerifier(
          OVP_ERROR_MESSAGES.DECLINED,
          OVP_ERROR_CODE.DECLINED,
        );
        controller.overlayDetails?.primaryButtonEvent();
        setTimeout(
          () => {
            controller.GO_TO_HOME();
            BackHandler.exitApp();
          },
          isIOS() ? 400 : 200,
        );
      };
    }
    return controller.overlayDetails?.primaryButtonEvent;
  };

  const handleVPShare = () => {
    const selectedDisclosuresFromRef =
      matchingVcListRef.current?.selectedDisclosures;
    const selectedDisclosures: Record<string, string[]> =
      typeof selectedDisclosuresFromRef === 'function'
        ? selectedDisclosuresFromRef()
        : selectedDisclosuresFromRef ?? {};
    const selectedVcs: Record<string, Set<string>> = matchingVcListRef.current?.getSelectedVcs?.() ?? {};

    controller.ACCEPT_REQUEST(selectedVcs, selectedDisclosures);
  };

  return (
    <React.Fragment>
      <DeeplinkBanner absolute/>
      {
        <TrustModalVerifier
          isVisible={controller.showTrustConsentModal}
          logo={controller.verifierLogoInTrustModal}
          name={
            controller.verifierNameInTrustModal ??
            t('ScanScreen:unknownVerifier')
          }
          onConfirm={controller.VERIFIER_TRUST_CONSENT_GIVEN}
          onCancel={controller.CANCEL}
          flowType={'verifier'}
        />
      }
      {controller.matchingVcsResult?.success && (
        <>
          {controller.purpose !== '' && (
            <View style={{backgroundColor: Theme.Colors.whiteBackgroundColor}}>
              <Column
                padding="14 12 14 12"
                margin="20 20 20 20"
                style={Theme.VPSharingStyles.purposeContainer}>
                <Text
                  color={Theme.Colors.TimeoutHintText}
                  style={Theme.VPSharingStyles.purposeText}>
                  {controller.isAuthorizationFlow
                    ? t('authorizationPurpose')
                    : controller.purpose}
                </Text>
              </Column>
            </View>
          )}
          <Column fill backgroundColor={Theme.Colors.lightGreyBackgroundColor}>
            <MatchingVcListContainer
              ref={matchingVcListRef}
              setDisableShareButton={setDisableShareButton}
              controller={controller}
            />
            <SendVPActions
              isDcqlFlow={controller.isDcqlFlow}
              isCancelling={controller.isCancelling}
              isAuthorizationFlow={controller.isAuthorizationFlow}
              disableShareButton={disableShareButton}
              onShare={handleVPShare}
              onReject={handleRejectButtonEvent}
              consentAndShareLabel={t('consentAndShare')}
              dcqlInstructionLabel={t('dcqlSection.instruction')}
              cancelLabel={t('common:cancel')}
              declineLabel={t('common:decline')}
            />
          </Column>
        </>
      )}
      <SendVPError
        isAuthorizationFlow={controller.isAuthorizationFlow}
        error={controller.error}
        noCredentialsMatchingVPRequest={
          controller.noCredentialsMatchingVPRequest
        }
        requestedClaimsByVerifier={controller.requestedClaimsByVerifier}
        getAdditionalMessage={controller.getAdditionalMessage}
        generateAndStoreLogMessage={controller.generateAndStoreLogMessage}
        matchingVcsResult={controller.matchingVcsResult}
        verifierInfo={{
          name: controller.vpVerifierName,
          logo: controller.verifierLogoInTrustModal,
        }}
        verifierNameInTrustModal={controller.verifierNameInTrustModal}
        verifierLogoInTrustModal={controller.verifierLogoInTrustModal}
        isOVPViaDeepLink={controller.isOVPViaDeepLink}
        openID4VPRetryCount={controller.openID4VPRetryCount}
        onRetry={controller.RETRY}
        onGoBack={goBack}
        onGoHome={handleTextButtonEvent}
        onDeepLinkErrorExit={handleDeepLinkErrorExit}
      />
      <SendVPOverlays
        controller={controller}
        isLivenessEnabled={LIVENESS_CHECK}
        showShareOverlays={Boolean(controller.matchingVcsResult?.success)}
        primaryButtonEvent={getPrimaryButtonEvent() ?? (() => undefined)}
        showInfoOverlay={showInfoOverlay}
        onCloseInfoOverlay={() => setShowInfoOverlay(false)}
      />
    </React.Fragment>
  );
};
