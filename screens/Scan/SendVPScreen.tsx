import {useFocusEffect} from '@react-navigation/native';
import React, {
  Fragment,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import {useTranslation} from 'react-i18next';
import {
  BackHandler,
  I18nManager,
  Pressable,
  ScrollView,
  StyleSheet,
  Text as RNText,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Theme} from '../../components/ui/styleUtils';
import {VPShareCredentialCard} from '../../components/VC/VPShareCredentialCard';
import {VerifierAvatar} from '../../components/VerifierAvatar';
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
import {VCMetadata} from '../../shared/VCMetadata';
import {VerifyIdentityOverlay} from '../VerifyIdentityOverlay';
import {VPShareOverlay} from './VPShareOverlay';
import {FaceVerificationConsentSheet} from './FaceVerificationConsentSheet';
import {getFaceAttribute} from '../../components/VC/common/VCUtils';
import {useSendVPScreen} from './SendVPScreenController';
import {ErrorView} from '../../components/ui/Error';
import {SvgImage} from '../../components/ui/svg';
import {Loader, LoaderSkeleton} from '../../components/ui/Loader';
import {Icon} from 'react-native-elements';
import {ScanLayoutProps} from '../../routes/routeTypes';
import OpenID4VP from '../../shared/openID4VP/OpenID4VP';
import {GlobalContext} from '../../shared/GlobalContext';
import {APP_EVENTS} from '../../machines/app';
import {useScanScreen} from './ScanScreenController';
import {useOvpErrorModal} from '../../shared/hooks/useOvpErrorModal';
import {TrustModalVerifier} from '../../components/TrustModalVerifier';

const COLORS = Theme.Colors.Design;
// Protocol names are not translated.
const PROTOCOL_NAME = 'OpenID4VP';

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
    t,
  });

  const vcsMatchingAuthRequest = controller.vcsMatchingAuthRequest;

  const {appService} = useContext(GlobalContext);
  const [triggerExitFlow, setTriggerExitFlow] = useState(false);
  const [selectedDisclosuresByVc, setSelectedDisclosuresByVc] = useState<
    Record<string, string[]>
  >({});
  // Card type names ("National ID") reported by the cards once their issuer metadata loads.
  const [credentialTypesByVcKey, setCredentialTypesByVcKey] = useState<
    Record<string, string>
  >({});

  const handleCredentialTypeLoaded = (vcKey: string, credentialType: string) =>
    setCredentialTypesByVcKey(previous =>
      previous[vcKey] === credentialType
        ? previous
        : {...previous, [vcKey]: credentialType},
    );

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

  // The holder already agreed to the face check in the selfie sheet at the sharing-consent
  // step, so the machine's separate face-consent step is confirmed without asking again.
  useEffect(() => {
    if (
      controller.isFaceVerificationConsent &&
      !controller.isAuthorizationFlow
    ) {
      controller.FACE_VERIFICATION_CONSENT(false);
    }
  }, [controller.isFaceVerificationConsent, controller.isAuthorizationFlow]);

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
      const closeButton = () => (
        <Pressable
          testID="shareRequestClose"
          accessibilityRole="button"
          accessibilityLabel={t('close')}
          onPress={handleDismiss}
          style={styles.closeButton}>
          <Icon
            name="close"
            type="material-community"
            size={24}
            color={COLORS.navy}
          />
        </Pressable>
      );
      const protocolBadge = () => (
        <View style={styles.protocolBadge}>
          <RNText style={styles.protocolBadgeText}>{PROTOCOL_NAME}</RNText>
        </View>
      );
      props.navigation.setOptions({
        headerShown: true,
        title: t('shareRequestTitle'),
        headerTitleAlign: 'center',
        headerShadowVisible: false,
        headerStyle: {backgroundColor: COLORS.sheetBackground},
        headerTitle: () => (
          <RNText style={styles.headerTitle} numberOfLines={1}>
            {t('shareRequestTitle')}
          </RNText>
        ),
        headerLeft: () => (I18nManager.isRTL ? protocolBadge() : closeButton()),
        headerRight: () =>
          I18nManager.isRTL ? closeButton() : protocolBadge(),
      });
    }
  }, [
    controller.showLoadingScreen,
    controller.vpVerifierName,
    controller.isOVPViaDeepLink,
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

  const getVcKey = vcData => {
    return VCMetadata.fromVcMetadataString(vcData.vcMetadata).getVcKey();
  };

  const selectedVCs = controller.getSelectedVCs();
  const selectedCount = Object.values(selectedVCs).flat().length;
  const selectedHasImage = controller.checkIfAnyVCHasImage(selectedVCs);
  const selectionSummary = t('sharingIds', {
    ids: t('idsCount', {count: selectedCount}),
  });

  const selectedVcKeys = Object.values(
    controller.inputDescriptorIdToSelectedVcKeys,
  ).flat();
  const selectedCardNames = selectedVcKeys
    .map(vcKey => credentialTypesByVcKey[vcKey])
    .filter(Boolean);
  // The selfie is matched against the photo on the first selected card that has one.
  const photoCard = Object.values(selectedVCs)
    .flat()
    .map(vc => ({
      vcKey: getVcKey(vc),
      face: getFaceAttribute(vc.verifiableCredential, vc.format),
    }))
    .find(card => !!card.face);

  // A selfie share asks for consent once, in the selfie sheet: agreeing there covers both
  // sharing the cards and the face check. The issuer download flow has no sharing-consent
  // step, so it shows the sheet at the face-check step instead.
  const isSelfieShareConsent =
    controller.isVPSharingConsent && controller.isShareWithSelfie;
  const isSelfieConsentVisible =
    isSelfieShareConsent ||
    (controller.isFaceVerificationConsent && controller.isAuthorizationFlow);

  const verifierName =
    controller.vpVerifierName ??
    controller.verifierNameInTrustModal ??
    t('ScanScreen:unknownVerifier');
  const purpose = controller.isAuthorizationFlow
    ? t('authorizationPurpose')
    : controller.purpose;

  const shareTitle = controller.isAuthorizationFlow
    ? t('consentShare')
    : selectedHasImage
    ? t('SendVcScreen:acceptRequestAndVerify')
    : t('SendVcScreen:acceptRequest');

  // A selected card with a photo is only shared after the holder's face is verified.
  const onShare = () =>
    selectedHasImage
      ? controller.VERIFY_AND_ACCEPT_REQUEST(selectedDisclosuresByVc)
      : controller.ACCEPT_REQUEST(selectedDisclosuresByVc);

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
          url={controller.verifierUrlInTrustModal}
          requestName={controller.verifierRequestNameInTrustModal}
          isRegistered={controller.isVerifierRegistered}
          onConfirm={controller.VERIFIER_TRUST_CONSENT_GIVEN}
          onCancel={controller.CANCEL}
        />
      }
      {Object.keys(vcsMatchingAuthRequest).length > 0 && (
        <>
          <View style={styles.screen}>
            <ScrollView contentContainerStyle={styles.content}>
              <View style={styles.verifierCard}>
                <VerifierAvatar
                  logo={controller.verifierLogoInTrustModal}
                  size={64}
                />
                <View style={styles.verifierInfo}>
                  <RNText
                    style={styles.verifierName}
                    numberOfLines={2}
                    testID="shareRequestVerifierName">
                    {verifierName}
                  </RNText>
                  {!controller.isAuthorizationFlow &&
                    controller.isVerifierRegistered && (
                      <View style={styles.trustedRow}>
                        <Icon
                          name="shield-check-outline"
                          type="material-community"
                          size={16}
                          color={COLORS.teal}
                        />
                        <RNText style={styles.trustedText}>
                          {t('trustedVerifier')}
                        </RNText>
                      </View>
                    )}
                  {!!purpose && (
                    <RNText style={styles.purpose} testID="shareRequestPurpose">
                      {controller.isAuthorizationFlow
                        ? purpose
                        : t('purposeLabel', {purpose})}
                    </RNText>
                  )}
                </View>
              </View>

              {Object.entries(vcsMatchingAuthRequest).map(
                ([inputDescriptorId, vcs]) => {
                  const group =
                    controller.requestedCredentialGroups[inputDescriptorId];
                  const hasChoice = vcs.length > 1;
                  const description =
                    group?.purpose || (hasChoice ? t('pickOneHint') : '');
                  return (
                    <View key={inputDescriptorId} style={styles.group}>
                      <View style={styles.groupHeader}>
                        <RNText style={styles.groupTitle}>
                          {group?.name || t('requestedCard')}
                        </RNText>
                        <View style={styles.requiredBadge}>
                          <RNText style={styles.requiredBadgeText}>
                            {hasChoice ? t('requiredPickOne') : t('required')}
                          </RNText>
                        </View>
                      </View>
                      {!!description && (
                        <RNText style={styles.groupDescription}>
                          {description}
                        </RNText>
                      )}
                      <View style={styles.groupCards}>
                        {vcs.map(vcData => {
                          const vcKey = getVcKey(vcData);
                          return (
                            <VPShareCredentialCard
                              key={`${vcKey}-${inputDescriptorId}`}
                              testID={`shareRequestCard-${vcKey}`}
                              vcMetadata={vcData.vcMetadata}
                              selected={
                                !!controller.inputDescriptorIdToSelectedVcKeys[
                                  inputDescriptorId
                                ]?.includes(vcKey)
                              }
                              onPress={() =>
                                controller.SELECT_VC_ITEM(
                                  vcKey,
                                  inputDescriptorId,
                                )
                              }
                              selectedDisclosures={
                                selectedDisclosuresByVc[vcKey]
                              }
                              onDisclosuresChange={disclosures =>
                                handleDisclosureChange(vcKey, disclosures)
                              }
                              onCredentialTypeLoaded={credentialType =>
                                handleCredentialTypeLoaded(
                                  vcKey,
                                  credentialType,
                                )
                              }
                            />
                          );
                        })}
                      </View>
                    </View>
                  );
                },
              )}

              {selectedHasImage && (
                <View style={styles.selfieNote}>
                  <Icon
                    name="camera-outline"
                    type="material-community"
                    size={20}
                    color={COLORS.link}
                  />
                  <RNText style={styles.selfieNoteText}>
                    {t('selfieNote')}
                  </RNText>
                </View>
              )}
            </ScrollView>

            <View style={[styles.footer, {paddingBottom: insets.bottom + 12}]}>
              {selectedCount > 0 && (
                <RNText style={styles.summary} testID="shareRequestSummary">
                  {selectionSummary}
                </RNText>
              )}
              <Pressable
                testID={
                  controller.isAuthorizationFlow
                    ? 'consent-share-button'
                    : selectedHasImage
                    ? 'accept-request-and-verify-button'
                    : 'accept-request-button'
                }
                accessibilityRole="button"
                accessibilityState={{disabled: !controller.isSelectionComplete}}
                disabled={!controller.isSelectionComplete}
                onPress={onShare}
                style={({pressed}) => [
                  styles.shareButton,
                  !controller.isSelectionComplete && styles.shareButtonDisabled,
                  pressed && styles.pressed,
                ]}>
                {selectedHasImage && (
                  <Icon
                    name="face-recognition"
                    type="material-community"
                    size={22}
                    color={COLORS.surface}
                  />
                )}
                <RNText style={styles.shareButtonText}>{shareTitle}</RNText>
              </Pressable>
            </View>
          </View>
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

          {controller.overlayDetails !== null && !isSelfieShareConsent && (
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

          <FaceVerificationConsentSheet
            isVisible={isSelfieConsentVisible}
            face={photoCard?.face}
            photoCardName={photoCard && credentialTypesByVcKey[photoCard.vcKey]}
            cardNames={selectedCardNames}
            verifierName={verifierName}
            onConfirm={
              controller.isVPSharingConsent
                ? controller.CONFIRM
                : () => controller.FACE_VERIFICATION_CONSENT(false)
            }
            onCancel={controller.DISMISS_POPUP}
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

const styles = StyleSheet.create({
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    elevation: 3,
  },
  protocolBadge: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  protocolBadgeText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 13,
    color: COLORS.link,
  },
  headerTitle: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 20,
    color: COLORS.navy,
  },
  screen: {
    flex: 1,
    backgroundColor: COLORS.sheetBackground,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  verifierCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.mutedBackground,
    borderRadius: 22,
    padding: 16,
    marginBottom: 24,
  },
  verifierInfo: {
    flex: 1,
    marginLeft: 16,
  },
  verifierName: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 19,
    color: COLORS.navy,
  },
  trustedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  trustedText: {
    marginLeft: 5,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 13,
    color: COLORS.teal,
  },
  purpose: {
    marginTop: 3,
    fontFamily: 'Montserrat_400Regular',
    fontSize: 13,
    color: COLORS.bodyText,
  },
  group: {
    marginBottom: 10,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  groupTitle: {
    flex: 1,
    marginRight: 10,
    fontFamily: 'Montserrat_700Bold',
    fontSize: 20,
    color: COLORS.navy,
  },
  requiredBadge: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  requiredBadgeText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 12,
    color: COLORS.link,
  },
  groupCards: {
    marginTop: 12,
  },
  groupDescription: {
    marginTop: 6,
    fontFamily: 'Montserrat_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.bodyText,
  },
  selfieNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  selfieNoteText: {
    flex: 1,
    marginLeft: 10,
    fontFamily: 'Montserrat_400Regular',
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.bodyText,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.sheetBackground,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  summary: {
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'Montserrat_500Medium',
    fontSize: 14,
    color: COLORS.bodyText,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 58,
    borderRadius: 29,
    backgroundColor: COLORS.navy,
    paddingHorizontal: 20,
    shadowColor: COLORS.navy,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
    elevation: 5,
  },
  shareButtonDisabled: {
    opacity: 0.4,
  },
  shareButtonText: {
    marginLeft: 10,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 17,
    color: COLORS.surface,
  },
  pressed: {
    opacity: 0.8,
  },
});
