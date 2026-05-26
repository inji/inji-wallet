import {useFocusEffect} from '@react-navigation/native';
import React, {Fragment, useContext, useEffect, useLayoutEffect, useState,} from 'react';
import {useTranslation} from 'react-i18next';
import {BackHandler, I18nManager, ScrollView, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Button, Column, Text} from '../../components/ui';
import {Theme} from '../../components/ui/styleUtils';
import {isIOS, LIVENESS_CHECK, OVP_ERROR_CODE, OVP_ERROR_MESSAGES,} from '../../shared/constants';
import {TelemetryConstants} from '../../shared/telemetry/TelemetryConstants';
import {getImpressionEventData, sendImpressionEvent,} from '../../shared/telemetry/TelemetryUtils';
import {VerifyIdentityOverlay} from '../VerifyIdentityOverlay';
import {VPShareOverlay} from '../Scan/VPShareOverlay';
import {FaceVerificationAlertOverlay} from '../Scan/FaceVerificationAlertOverlay';
import {useSendVPScreen} from './SendVPScreenController';
import {ErrorView} from '../../components/ui/Error';
import {SvgImage} from '../../components/ui/svg';
import {Loader, LoaderSkeleton} from '../../components/ui/Loader';
import {Icon} from 'react-native-elements';
import {ScanLayoutProps} from '../../routes/routeTypes';
import OpenID4VP from '../../shared/openID4VP/OpenID4VP';
import {GlobalContext} from '../../shared/GlobalContext';
import {APP_EVENTS} from '../../machines/app';
import {useScanScreen} from '../Scan/ScanScreenController';
import {useOvpErrorModal} from '../../shared/hooks/useOvpErrorModal';
import {TrustModalVerifier} from '../../components/TrustModalVerifier';
import {MatchingVcList} from '../../components/openid4vp/MatchingVcList';
import {VcItemContainer} from '../../components/VC/VcItemContainer';
import {VerifierInfo} from "./VerifierInfo";
import {MatchingVCsResultForDcql, MatchingVCsResultForPresentationExchangeRequest} from "../../shared/openID4VP/openid4vp.types";
import {VCMetadata} from '../../shared/VCMetadata';
import {VC} from '../../machines/VerifiableCredential/VCMetaMachine/vc';
import {VCItemContainerFlowType} from "../../shared/Utils";

export const SendVPScreen: React.FC<ScanLayoutProps> = props => {
  const {t} = useTranslation('SendVPScreen');
  const controller = useSendVPScreen(props);
  const scanScreenController = useScanScreen();
  const insets = useSafeAreaInsets();

  const [errorModal, resetErrorModal] = useOvpErrorModal({
    error: controller.error,
    noCredentialsMatchingVPRequest: controller.noCredentialsMatchingVPRequest,
    requestedClaimsByVerifier: controller.requestedClaimsByVerifier,
    getAdditionalMessage: controller.getAdditionalMessage,
    generateAndStoreLogMessage: controller.generateAndStoreLogMessage,
    matchingVcsResult: controller.matchingVcsResult,
    verifierInfo: {
      name: controller.vpVerifierName,
      logo: controller.verifierLogoInTrustModal,
    },
    t,
  });

  const {appService} = useContext(GlobalContext);
  const [triggerExitFlow, setTriggerExitFlow] = useState(false);
  const [selectedDisclosuresByVc, setSelectedDisclosuresByVc] = useState<
    Record<string, string[]>
  >({});

  const handleDisclosureChange = (vcKey: string, disclosures: string[]) => {
    setSelectedDisclosuresByVc(prev => ({
      ...prev,
      [vcKey]: disclosures,
    }));
  };

  useEffect(() => {
    if (errorModal.show && controller.isOVPViaDeepLink) {
      const timeout = setTimeout(
        async () => {
          // Send error to verifier is initiated and its response is not listened to here.
          void OpenID4VP.sendErrorToVerifier(
            OVP_ERROR_MESSAGES.NO_MATCHING_VCS,
            OVP_ERROR_CODE.NO_MATCHING_VCS,
          );
          setTriggerExitFlow(true);
        },
        isIOS() ? 4000 : 2000,
      );

      return () => clearTimeout(timeout);
    }
  }, [errorModal.show, controller.isOVPViaDeepLink]);

  useEffect(() => {
    if (triggerExitFlow) {
      RESET_LOGGED_ERROR();
      controller.GO_TO_HOME();
      controller.RESET_RETRY_COUNT();
      appService.send(APP_EVENTS.RESET_AUTHORIZATION_REQUEST());
      setTriggerExitFlow(false);
      BackHandler.exitApp();
    }
  }, [triggerExitFlow]);

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
      props.navigation.getParent()?.setOptions({tabBarStyle: {display: 'none'}});

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

  const RESET_LOGGED_ERROR = () => {
    resetErrorModal();
  };

  const handleDismiss = async () => {
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
      controller.DISMISS();
    }
  };

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

  const getAdditionalMessage = () => {
    if (
      controller.isOVPViaDeepLink &&
      !(errorModal.showRetryButton && controller.openID4VPRetryCount < 3)
    ) {
      return errorModal.additionalMessage;
    }
    return undefined;
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
          <View
            style={{
              backgroundColor: Theme.Colors.whiteBackgroundColor,
              paddingTop: insets.top,
            }}>
            <View
              style={{
                height: 56,
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 12,
              }}>
              <Icon
                name={I18nManager.isRTL ? 'arrow-forward' : 'arrow-back'}
                color={Theme.Colors.blackIcon}
                onPress={handleDismiss}
              />
              <View style={Theme.Styles.sendVPHeaderContainer}>
                <Text style={Theme.Styles.sendVPHeaderTitle}>
                  {t('requester')}
                </Text>
              </View>
            </View>
            {controller.vpVerifierName && (
              <VerifierInfo
                logoUri={controller.verifierLogoInTrustModal}
                name={controller.vpVerifierName}
                showInfo={true}
              />
            )}
          </View>
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
    if (controller.isAuthorizationFlow) {
      return <LoaderSkeleton testID={'presentation-authorization'} />;
    }

    return (
      <Loader
        title={t('loaders.loading')}
        subTitle={t(`loaders.subTitle.fetchingVerifiers`)}
      />
    );
  }

  const handleTextButtonEvent = () => {
    controller.GO_TO_HOME();
    controller.RESET_RETRY_COUNT();
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

  const getPrimaryButtonText = () => {
    return errorModal.showRetryButton && controller.openID4VPRetryCount < 3
      ? t('ScanScreen:status.retry')
      : undefined;
  };

  const getTextButtonText = () => {
    return controller.isOVPViaDeepLink
      ? undefined
      : t('ScanScreen:status.accepted.home');
  };

  const shareActions = () => {
    return (
      <Button
        type="gradient"
        styles={{marginTop: 12}}
        title={t('consentAndShare')}
        testID={'consent-share-button'}
        disabled={!controller.successfullySatisfiedCredentialRequest()}
        onPress={() =>
          controller.checkIfAnyVCHasImage(controller.getSelectedVCs())
            ? controller.VERIFY_AND_ACCEPT_REQUEST(selectedDisclosuresByVc)
            : controller.ACCEPT_REQUEST(selectedDisclosuresByVc)
        }
      />
    );
  };

  function getVerifierActionAndMatchingCredentials() {
    if (errorModal.matchingVcsResult) {
      console.log("errorModal has got matchingVCs result")
      const uniqueVcsByKey = new Map<string, VC>();
      const isDcql = (errorModal.matchingVcsResult as MatchingVCsResultForDcql).credentialSetOptions !== undefined;
      if (isDcql) {
        const dcqlResult = errorModal.matchingVcsResult as MatchingVCsResultForDcql;
        for (const matchResult of Object.values(dcqlResult.matchingVCs)) {
          for (const {vc} of matchResult.matchingVcs) {
            const key = VCMetadata.fromVcMetadataString(vc.vcMetadata).getVcKey();
            uniqueVcsByKey.set(key, vc);
          }
        }
      } else {
        const peResult = errorModal.matchingVcsResult as MatchingVCsResultForPresentationExchangeRequest;
        for (const vcs of Object.values(peResult.matchingVCs)) {
          for (const vc of vcs) {
            const key = VCMetadata.fromVcMetadataString(vc.vcMetadata).getVcKey();
            uniqueVcsByKey.set(key, vc);
          }
        }
      }
      const consolidatedMatchingVcs = Array.from(uniqueVcsByKey.values());
      console.log("consolidatedMatchingVcs ",consolidatedMatchingVcs)

      return (
        <Column>
          <Text style={Theme.DcqlStyles.credentialMissingSectionLabel}>
            {t('errors.noMatchingCredentials.whatYouCanDo')}
          </Text>
          <View style={Theme.DcqlStyles.credentialMissingCard}>
            <VerifierInfo
              flat
              subLabel={t('errors.noMatchingCredentials.contactVerifier')}
              subLabelColor={Theme.Colors.Icon}
              name={controller.verifierNameInTrustModal}
              logoUri={controller.verifierLogoInTrustModal}
              showInfo={false}
            />
            <View style={Theme.DcqlStyles.credentialMissingCardDivider} />
            <Text style={Theme.DcqlStyles.credentialMissingCardBodyText}>
              {t('errors.noMatchingCredentials.reachOutText')}
            </Text>
          </View>
          <Text style={Theme.DcqlStyles.credentialMissingSectionLabel}>
            {t('errors.noMatchingCredentials.matchingCredentials')}
          </Text>
          <View style={Theme.DcqlStyles.credentialMissingCard}>
              {Array.from(uniqueVcsByKey.entries()).map(([vcKey, vcData]) => (
                <VcItemContainer
                  key={vcKey}
                  vcMetadata={vcData.vcMetadata}
                  margin="0 2 8 2"
                  selectable={false}
                  selected={false}
                  onPress={() => {}}
                  flow={VCItemContainerFlowType.VP_SHARE}
                  isPinned={vcData.vcMetadata.isPinned}
                />
              ))}
          </View>
        </Column>
      )
    }

    return undefined
  }

  const additionalModalContent = getVerifierActionAndMatchingCredentials();

  return (
    <React.Fragment>
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
            <MatchingVcList
              controller={controller}
              onDisclosureChange={handleDisclosureChange}
            />
            <Column
              style={[
                Theme.SendVcScreenStyles.shareOptionButtonsContainer,
                {position: 'relative'},
              ]}
              backgroundColor={Theme.Colors.whiteBackgroundColor}>
              {shareActions()}

              <Button
                type="clear"
                loading={controller.isCancelling}
                title={
                  controller.isAuthorizationFlow
                    ? t('common:cancel')
                    : t('common:decline')
                }
                onPress={handleRejectButtonEvent}
              />
            </Column>
          </Column>
          <VerifyIdentityOverlay
            credential={controller.credentials}
            verifiableCredentialData={controller.verifiableCredentialsData}
            isVerifyingIdentity={controller.isVerifyingIdentity}
            onCancel={controller.CANCEL}
            onFaceValid={controller.FACE_VALID}
            onFaceInvalid={controller.FACE_INVALID}
            isInvalidIdentity={controller.isInvalidIdentity}
            onNavigateHome={controller.GO_TO_HOME}
            onRetryVerification={controller.RETRY_VERIFICATION}
            isLivenessEnabled={LIVENESS_CHECK}
          />

          {controller.overlayDetails !== null && (
            <VPShareOverlay
              isVisible={controller.overlayDetails !== null}
              title={controller.overlayDetails.title}
              titleTestID={controller.overlayDetails.titleTestID}
              message={controller.overlayDetails.message}
              messageTestID={controller.overlayDetails.messageTestID}
              primaryButtonTestID={
                controller.overlayDetails.primaryButtonTestID
              }
              primaryButtonText={controller.overlayDetails.primaryButtonText}
              primaryButtonEvent={getPrimaryButtonEvent()}
              secondaryButtonTestID={
                controller.overlayDetails.secondaryButtonTestID
              }
              secondaryButtonText={
                controller.overlayDetails.secondaryButtonText
              }
              secondaryButtonEvent={
                controller.overlayDetails.secondaryButtonEvent
              }
              onCancel={controller.overlayDetails.onCancel}
            />
          )}

          <FaceVerificationAlertOverlay
            isVisible={controller.isFaceVerificationConsent}
            onConfirm={controller.FACE_VERIFICATION_CONSENT}
            close={controller.DISMISS_POPUP}
          />
        </>
      )}
      {errorModal.show && !controller.isAuthorizationFlow && (
        <ErrorView
          isModal
          alignActionsOnEnd
          showClose={false}
          isVisible={errorModal.show}
          title={errorModal.title}
          additionalContent={additionalModalContent}
          message={errorModal.message}
          additionalMessage={getAdditionalMessage()}
          image={SvgImage.PermissionDenied()}
          primaryButtonTestID={'retry'}
          primaryButtonText={getPrimaryButtonText()}
          primaryButtonEvent={controller.RETRY}
          textButtonTestID={'home'}
          textButtonText={getTextButtonText()}
          textButtonEvent={handleTextButtonEvent}
          textButtonType={getPrimaryButtonText() ? "clear" : "gradient"}
          customImageStyles={{paddingBottom: 0, marginBottom: -6}}
          customStyles={additionalModalContent ? {} : {marginTop: '30%'}}
          exitAppWithTimer={controller.isOVPViaDeepLink}
          testID={'vpShareError'}
        />
      )}
    </React.Fragment>
  );
};
