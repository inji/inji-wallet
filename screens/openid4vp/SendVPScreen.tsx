import {useFocusEffect} from '@react-navigation/native';
import React, {
  Fragment,
  useContext,
  useEffect,
  useLayoutEffect, useRef,
  useState,
} from 'react';
import {useTranslation} from 'react-i18next';
import {BackHandler, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Button, Column, Text} from '../../components/ui';
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
import {VerifyIdentityOverlay} from '../VerifyIdentityOverlay';
import {VPShareOverlay} from '../Scan/VPShareOverlay';
import {FaceVerificationAlertOverlay} from '../Scan/FaceVerificationAlertOverlay';
import {useSendVPScreen} from './SendVPScreenController';
import {ErrorView} from '../../components/ui/Error';
import {SvgImage} from '../../components/ui/svg';
import {Loader, LoaderSkeleton} from '../../components/ui/Loader';
import {ScanLayoutProps} from '../../routes/routeTypes';
import OpenID4VP from '../../shared/openID4VP/OpenID4VP';
import {GlobalContext} from '../../shared/GlobalContext';
import {APP_EVENTS} from '../../machines/app';
import {useScanScreen} from '../Scan/ScanScreenController';
import {useOvpErrorModal} from '../../shared/hooks/useOvpErrorModal';
import {TrustModalVerifier} from '../../components/TrustModalVerifier';
import {MatchingVcListContainer} from '../../components/openid4vp/matchingVc/MatchingVcListContainer';
import {VcItemContainer} from '../../components/VC/VcItemContainer';
import {VerifierInfo} from '../../components/openid4vp/verifier/VerifierInfo';
import {WhyWeNeedDocumentsOverlay} from '../../components/openid4vp/infoOverlay/WhyWeNeedDocumentsOverlay';
import {
  MatchingVCsResultForDcql,
  MatchingVCsResultForPresentationExchangeRequest,
} from '../../shared/openID4VP/openid4vp.types';
import {getVcKey, VCMetadata} from '../../shared/VCMetadata';
import {VC} from '../../machines/VerifiableCredential/VCMetaMachine/vc';
import {VCItemContainerFlowType} from '../../shared/Utils';
import {BackButton} from '../../components/ui/backButton/BackButton';
import {MissingClaimsView} from '../../components/openid4vp/missingClaimsView/MissingClaimsView';
import {claimPathPointersToJsonPath} from '../../shared/openID4VP/OpenID4VPHelper';

export const SendVPScreen: React.FC<ScanLayoutProps> = props => {
  const {t} = useTranslation('SendVPScreen');
  const childRef = useRef();
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
  const [showInfoOverlay, setShowInfoOverlay] = useState(false);

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
                columnGap: 4,
              }}>
              <BackButton
                onPress={handleDismiss}
                type={'chevron'}
                customIconStyle={{color: Theme.Colors.blackIcon}}
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
                showInfo={controller.isDcqlFlow}
                onInfoPress={() => setShowInfoOverlay(true)}
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
        <Loader
          title={t('loaders.loading')}
          subTitle={t(`loaders.subTitle.fetchingVerifiers`)}
        />
      </React.Fragment>
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
    function handleVPShare() {
      let selectedDisclosures: Record<string, string[]> =
        selectedDisclosuresByVc;
      if (controller.isDcqlFlow) {
        const selectedVcsInfo = childRef.current?.getSelectedVcs();
        controller.DESELECT_VC_ITEMS(selectedVcsInfo)

        console.debug("selected VCs data = ", selectedVcsInfo)
        const vcKeyToSelectedDisclosuresSet: Record<
          string,
          Set<string>
        > = {};
        const matchingVcsResult =
          controller.matchingVcsResult as MatchingVCsResultForDcql;
        Object.entries(
          controller.credentialRequestIdToSelectedVcKeys,
        ).forEach(([credentialQueryId, selectedVcKeys]) => {
          matchingVcsResult.matchingVCs[
            credentialQueryId
            ].matchingVcs?.forEach(({vc, matchedClaims}) => {
            const setOfMatchingClaims = new Set<string>();
            const vcKey = getVcKey(vc);
            if (selectedVcKeys.has(vcKey)) {
              matchedClaims?.forEach(claim => {
                return setOfMatchingClaims.add(
                  claimPathPointersToJsonPath(claim.path),
                );
              });
            }
            vcKeyToSelectedDisclosuresSet[vcKey] = new Set([
              ...(vcKeyToSelectedDisclosuresSet[vcKey] ??
                new Set<string>()),
              ...setOfMatchingClaims,
            ]);
          });
        });
        selectedDisclosures = Object.fromEntries(
          Object.entries(vcKeyToSelectedDisclosuresSet).map(([k, s]) => [
            k,
            [...s],
          ]),
        );
      }
      console.log("Selected disclosures ", selectedDisclosures)
      console.log("Selected VCS ", controller.credentialRequestIdToSelectedVcKeys)
      controller.ACCEPT_REQUEST(selectedDisclosures);
    }


    return (
      <Button
        type="gradient"
        styles={{marginTop: 12}}
        title={t('consentAndShare')}
        testID={'consent-share-button'}
        disabled={!controller.successfullySatisfiedCredentialRequest()}
        onPress={handleVPShare}
      />
    );
  };

  function getVerifierActionAndMatchingCredentials() {
    if (errorModal.matchingVcsResult) {
      const uniqueVcsByKey = new Map<string, VC>();
      if (Object.keys(errorModal.matchingVcsResult).length > 0) {
        const isDcql =
          (errorModal.matchingVcsResult as MatchingVCsResultForDcql)
            .credentialSetOptions !== undefined;
        if (isDcql) {
          const dcqlResult =
            errorModal.matchingVcsResult as MatchingVCsResultForDcql;
          for (const matchResult of Object.values(dcqlResult.matchingVCs)) {
            for (const {vc} of matchResult.matchingVcs ?? []) {
              const key = VCMetadata.fromVcMetadataString(
                vc.vcMetadata,
              ).getVcKey();
              uniqueVcsByKey.set(key, vc);
            }
          }
        } else {
          const peResult =
            errorModal.matchingVcsResult as MatchingVCsResultForPresentationExchangeRequest;
          for (const vcs of Object.values(peResult.matchingVCs)) {
            for (const vc of vcs) {
              const key = VCMetadata.fromVcMetadataString(
                vc.vcMetadata,
              ).getVcKey();
              uniqueVcsByKey.set(key, vc);
            }
          }
        }
      }
      const consolidatedMatchingVcs = Array.from(uniqueVcsByKey.values());

      const requestedClaims = Array.from(
        errorModal.matchingVcsResult?.requestedClaims ?? [],
      );

      return (
        <Column>
          {requestedClaims.length > 0 && (
            <MissingClaimsView claims={requestedClaims} />
          )}
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
          {consolidatedMatchingVcs.length > 0 && (
            <Fragment>
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
            </Fragment>
          )}
        </Column>
      );
    }

    return undefined;
  }

  const additionalErrorContent = getVerifierActionAndMatchingCredentials();

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
            <MatchingVcListContainer
              ref={childRef}
              controller={controller}
              onDisclosureChange={handleDisclosureChange}
            />
            <Column
              style={[
                Theme.SendVcScreenStyles.shareOptionButtonsContainer,
                {
                  position: 'relative',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 12,
                  marginBottom: 1,
                  marginTop: 1,
                  rowGap: 8,
                },
              ]}
              backgroundColor={Theme.Colors.whiteBackgroundColor}>
              {controller.isDcqlFlow && (
                <Text weight="regular" color={Theme.Colors.instructionLabel}>
                  {t('dcqlSection.instruction')}
                </Text>
              )}
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
          goBack={errorModal.showBackButton ? goBack : undefined}
          goBackButtonVisible={errorModal.showBackButton}
          onDismiss={errorModal.showBackButton ? goBack : undefined}
          alignActionsOnEnd
          showClose={false}
          isVisible={errorModal.show}
          title={errorModal.title}
          additionalContent={additionalErrorContent}
          message={errorModal.message}
          additionalMessage={getAdditionalMessage()}
          image={SvgImage.PermissionDenied()}
          primaryButtonTestID={'retry'}
          primaryButtonText={getPrimaryButtonText()}
          primaryButtonEvent={controller.RETRY}
          textButtonTestID={'home'}
          textButtonText={getTextButtonText()}
          textButtonEvent={handleTextButtonEvent}
          textButtonType={getPrimaryButtonText() ? 'clear' : 'gradient'}
          customImageStyles={{paddingBottom: 0, marginBottom: -6}}
          customStyles={additionalErrorContent ? {} : {marginTop: '30%'}}
          exitAppWithTimer={controller.isOVPViaDeepLink}
          testID={'vpShareError'}
        />
      )}
      <WhyWeNeedDocumentsOverlay
        isVisible={showInfoOverlay}
        onClose={() => setShowInfoOverlay(false)}
      />
    </React.Fragment>
  );
};
