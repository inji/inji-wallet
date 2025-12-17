import {useFocusEffect} from '@react-navigation/native';
import React, {useContext, useEffect, useLayoutEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {BackHandler, I18nManager, View} from 'react-native';
import {Button, Column, Row, Text} from '../../components/ui';
import {Theme} from '../../components/ui/styleUtils';
import {VcItemContainer} from '../../components/VC/VcItemContainer';
import {
  isIOS,
  LIVENESS_CHECK,
  OVP_ERROR_MESSAGES,
  OVP_ERROR_CODE,
} from '../../shared/constants';
import {TelemetryConstants} from '../../shared/telemetry/TelemetryConstants';
import {
  getImpressionEventData,
  sendImpressionEvent,
} from '../../shared/telemetry/TelemetryUtils';
import {VCItemContainerFlowType} from '../../shared/Utils';
import {VCMetadata} from '../../shared/VCMetadata';
import {VerifyIdentityOverlay} from '../VerifyIdentityOverlay';
import {VPShareOverlay} from './VPShareOverlay';
import {FaceVerificationAlertOverlay} from './FaceVerificationAlertOverlay';
import {useSendVPScreen} from './SendVPScreenController';
import LinearGradient from 'react-native-linear-gradient';
import {ErrorView} from '../../components/ui/Error';
import {SvgImage} from '../../components/ui/svg';
import {Loader} from '../../components/ui/Loader';
import {Icon} from 'react-native-elements';
import {ScanLayoutProps} from '../../routes/routeTypes';
import OpenID4VP from '../../shared/openID4VP/OpenID4VP';
import {GlobalContext} from '../../shared/GlobalContext';
import {APP_EVENTS} from '../../machines/app';
import {useScanScreen} from './ScanScreenController';
import {useOvpErrorModal} from '../../shared/hooks/useOvpErrorModal';
import {TrustModal} from '../../components/TrustModal';

export const SendVPScreen: React.FC<ScanLayoutProps> = props => {
  const {t} = useTranslation('SendVPScreen');
  const controller = useSendVPScreen();
  const scanScreenController = useScanScreen();

  const [errorModal, resetErrorModal] = useOvpErrorModal({
    error: controller.error,
    noCredentialsMatchingVPRequest: controller.noCredentialsMatchingVPRequest,
    requestedClaimsByVerifier: controller.requestedClaimsByVerifier,
    getAdditionalMessage: controller.getAdditionalMessage,
    generateAndStoreLogMessage: controller.generateAndStoreLogMessage,
    t,
  });

  const vcsMatchingAuthRequest = controller.vcsMatchingAuthRequest;

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
      const onBackPress = () => true;

      const disableBackHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => disableBackHandler.remove();
    }, []),
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
    void OpenID4VP.sendErrorToVerifier(
      OVP_ERROR_MESSAGES.DECLINED,
      OVP_ERROR_CODE.DECLINED,
    );

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
    void OpenID4VP.sendErrorToVerifier(
      OVP_ERROR_MESSAGES.DECLINED,
      OVP_ERROR_CODE.DECLINED,
    );
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
        title: t('SendVPScreen:requester'),
        headerTitleAlign: 'center',
        headerTitle: props => (
          <View style={Theme.Styles.sendVPHeaderContainer}>
            <Text style={Theme.Styles.sendVPHeaderTitle}>{props.children}</Text>
            {controller.vpVerifierName && (
              <Text
                numLines={1}
                ellipsizeMode="tail"
                style={Theme.Styles.sendVPHeaderSubTitle}>
                {controller.vpVerifierName}
              </Text>
            )}
          </View>
        ),
        headerRight: () =>
          !I18nManager.isRTL && (
            <Icon
              name="close"
              color={Theme.Colors.blackIcon}
              onPress={handleDismiss}
            />
          ),
        headerLeft: () =>
          I18nManager.isRTL && (
            <Icon
              name="close"
              color={Theme.Colors.blackIcon}
              onPress={handleDismiss}
            />
          ),
      });
    }
  }, [
    controller.showLoadingScreen,
    controller.vpVerifierName,
    controller.isOVPViaDeepLink,
  ]);

  if (controller.showLoadingScreen) {
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

  const getVcKey = vcData => {
    return VCMetadata.fromVcMetadataString(vcData.vcMetadata).getVcKey();
  };

  const noOfCardsSelected = controller.areAllVCsChecked
    ? Object.values(controller.vcsMatchingAuthRequest).length
    : Object.values(controller.inputDescriptorIdToSelectedVcKeys).reduce(
        (vcCount, arr) => vcCount + arr.length,
        0,
      );

  const cardsSelectedText =
    noOfCardsSelected === 1
      ? noOfCardsSelected + ' ' + t('cardSelected')
      : noOfCardsSelected + ' ' + t('cardsSelected');

  const areAllVcsChecked =
    noOfCardsSelected ===
    Object.values(controller.vcsMatchingAuthRequest).flatMap(vc => vc).length;

  return (
    <React.Fragment>
      {
        <TrustModal
          isVisible={controller.showTrustConsentModal}
          logo={controller.verifierLogoInTrustModal}
          name={
            controller.verifierNameInTrustModal ??
            t('ScanScreen:unknownVerifier')
          }
          onConfirm={controller.VERIFIER_TRUST_CONSENT_GIVEN}
          onCancel={controller.CANCEL}
          flowType="verifier"></TrustModal>
      }
      {Object.keys(vcsMatchingAuthRequest).length > 0 && (
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
                  {controller.purpose}
                </Text>
              </Column>
            </View>
          )}
          <Column fill backgroundColor={Theme.Colors.lightGreyBackgroundColor}>
            <LinearGradient colors={Theme.Colors.selectIDTextGradient}>
              <Column>
                <Text
                  margin="15 0 13 24"
                  color={Theme.Colors.textValue}
                  style={Theme.VPSharingStyles.selectIDText}>
                  {t('SendVcScreen:pleaseSelectAnId')}
                </Text>
              </Column>
            </LinearGradient>
            <Row
              padding="11 24 11 24"
              style={{
                backgroundColor: '#FAFAFA',
                justifyContent: 'space-between',
              }}>
              <Text style={Theme.VPSharingStyles.cardsSelectedText}>
                {cardsSelectedText}
              </Text>
              <Text
                style={{
                  color: Theme.Colors.Icon,
                  fontFamily: 'Montserrat_600SemiBold',
                }}
                onPress={
                  areAllVcsChecked
                    ? controller.UNCHECK_ALL
                    : controller.CHECK_ALL
                }>
                {areAllVcsChecked ? t('unCheck') : t('checkAll')}
              </Text>
            </Row>
            <Column scroll backgroundColor={Theme.Colors.whiteBackgroundColor}>
              {Object.entries(vcsMatchingAuthRequest).map(
                ([inputDescriptorId, vcs]) =>
                  vcs.map(vcData => (
                    <VcItemContainer
                      key={`${getVcKey(vcData)}-${inputDescriptorId}`}
                      vcMetadata={vcData.vcMetadata}
                      margin="0 2 8 2"
                      onPress={controller.SELECT_VC_ITEM(
                        getVcKey(vcData),
                        inputDescriptorId,
                      )}
                      selectable
                      selected={
                        controller.areAllVCsChecked ||
                        (Object.keys(
                          controller.inputDescriptorIdToSelectedVcKeys,
                        ).includes(inputDescriptorId) &&
                          controller.inputDescriptorIdToSelectedVcKeys[
                            inputDescriptorId
                          ].includes(getVcKey(vcData)))
                      }
                      flow={VCItemContainerFlowType.VP_SHARE}
                      isPinned={vcData.vcMetadata.isPinned}
                      onDisclosuresChange={disclosures => {
                        handleDisclosureChange(getVcKey(vcData), disclosures);
                      }}
                    />
                  )),
              )}
            </Column>
            <Column
              style={[
                Theme.SendVcScreenStyles.shareOptionButtonsContainer,
                {position: 'relative'},
              ]}
              backgroundColor={Theme.Colors.whiteBackgroundColor}>
              {!controller.checkIfAllVCsHasImage(
                controller.vcsMatchingAuthRequest,
              ) && (
                <Button
                  type="gradient"
                  styles={{marginTop: 12}}
                  title={t('SendVcScreen:acceptRequest')}
                  disabled={
                    Object.keys(controller.getSelectedVCs()).length === 0 ||
                    controller.checkIfAnyVCHasImage(controller.getSelectedVCs())
                  }
                  onPress={() =>
                    controller.ACCEPT_REQUEST(selectedDisclosuresByVc)
                  }
                />
              )}
              {/*If one of the selected vc has image, it needs to sent only after biometric authentication (Share with Selfie)*/}
              {controller.checkIfAnyVCHasImage(
                controller.vcsMatchingAuthRequest,
              ) && (
                <Button
                  type="gradient"
                  title={t('SendVcScreen:acceptRequestAndVerify')}
                  styles={{marginTop: 12}}
                  disabled={
                    Object.keys(controller.getSelectedVCs()).length === 0 ||
                    !controller.checkIfAnyVCHasImage(
                      controller.getSelectedVCs(),
                    )
                  }
                  onPress={() =>
                    controller.VERIFY_AND_ACCEPT_REQUEST(
                      selectedDisclosuresByVc,
                    )
                  }
                />
              )}

              <Button
                type="clear"
                loading={controller.isCancelling}
                title={t('SendVcScreen:reject')}
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
      {errorModal.show && (
        <ErrorView
          isModal
          alignActionsOnEnd
          showClose={false}
          isVisible={errorModal.show}
          title={errorModal.title}
          message={errorModal.message}
          additionalMessage={getAdditionalMessage()}
          image={SvgImage.PermissionDenied()}
          primaryButtonTestID={'retry'}
          primaryButtonText={getPrimaryButtonText()}
          primaryButtonEvent={controller.RETRY}
          textButtonTestID={'home'}
          textButtonText={getTextButtonText()}
          textButtonEvent={handleTextButtonEvent}
          customImageStyles={{paddingBottom: 0, marginBottom: -6}}
          customStyles={{marginTop: '30%'}}
          exitAppWithTimer={controller.isOVPViaDeepLink}
          testID={'vpShareError'}
        />
      )}
    </React.Fragment>
  );
};
