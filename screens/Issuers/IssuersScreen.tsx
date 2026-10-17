import React, {Fragment, useCallback, useEffect, useLayoutEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {useFocusEffect} from '@react-navigation/native';
import {Header} from '../../components/ui/Header';
import {Theme} from '../../components/ui/styleUtils';
import {Button, Row} from '../../components/ui';
import {RootRouteProps} from '../../routes';
import {HomeRouteProps} from '../../routes/routeTypes';
import {useIssuerScreenController} from './IssuerScreenController';
import {Loader} from '../../components/ui/Loader';
import {isTranslationKeyFound} from '../../shared/commonUtil';
import {ErrorMessage} from '../../shared/openId4VCI/Utils';
import {
  getInteractEventData,
  getStartEventData,
  sendInteractEvent,
  sendStartEvent,
} from '../../shared/telemetry/TelemetryUtils';
import {TelemetryConstants} from '../../shared/telemetry/TelemetryConstants';
import {MessageOverlay} from '../../components/MessageOverlay';
import {SvgImage} from '../../components/ui/svg';
import {CredentialTypeSelectionScreen} from './CredentialTypeSelectionScreen';
import {ReplaceCredentialSelectionScreen} from './ReplaceCredentialSelectionScreen';
import {AUTH_ROUTES} from '../../routes/routesConstants';
import {TransactionCodeModal} from './TransactionCodeScreen';
import {ScanToAddScreen} from '../../components/addCredential/ScanToAddScreen';
import {TrustIssuerSheet} from '../../components/addCredential/TrustIssuerSheet';
import {SendVPScreen} from '../Scan/SendVPScreen';

import {AuthorizationType} from '../../shared/constants';
import {useTimer} from '../../shared/hooks/UseTimer';
import {
  ProcessingModal,
  ProgressIndicator,
} from '../../components/ui/processingScreen/ProcessingModal';
import {ErrorView} from '../../components/ui/Error';

export const IssuersScreen: React.FC<
  HomeRouteProps | RootRouteProps
> = props => {
  const controller = useIssuerScreenController(props);
  const {t} = useTranslation('IssuersScreen');
  const showFullScreenError = controller.isError;
  const [successDownloadRedirectTimer, initiateSuccessDownloadRedirectTimer] =
    useTimer({initialValue: 5});

  const isVerificationFailed = controller.verificationErrorMessage !== '';

  const translationKey = `errors.verificationFailed.${controller.verificationErrorMessage}`;

  const verificationErrorMessage = isTranslationKeyFound(translationKey, t)
    ? t(translationKey)
    : t('errors.verificationFailed.ERR_GENERIC');

  const isPreparingOffer =
    controller.loadingReason === 'preparingRequest' &&
    !controller.isPresentationAuthorization;
  // Scanning, reading the offer and the trust sheet all sit on the scanner, so the sheet can
  // slide in and out over it instead of the whole screen being swapped.
  const isInScanFlow =
    controller.isSelectingIssuer ||
    controller.isQrScanning ||
    controller.isConsentRequested ||
    isPreparingOffer;

  useFocusEffect(
    useCallback(() => {
      const tabs = props.navigation.getParent();
      tabs?.setOptions({tabBarStyle: {display: 'none'}});
      return () =>
        tabs?.setOptions({
          tabBarStyle: {
            ...Theme.BottomTabBarStyle.tabBarStyle,
            display: 'flex',
          },
        });
    }, [props.navigation]),
  );

  // The scanner is where this screen starts, and where cancelling the trust sheet or closing an
  // error returns to.
  useEffect(() => {
    if (controller.isSelectingIssuer) {
      controller.SCAN_CREDENTIAL_OFFER_QR_CODE();
    }
  }, [controller.isSelectingIssuer]);

  useLayoutEffect(() => {
    if (controller.loadingReason || showFullScreenError || isInScanFlow) {
      props.navigation.setOptions({
        headerShown: false,
      });
    } else {
      props.navigation.setOptions({
        headerShown: true,
        header: props => (
          <Header
            goBack={props.navigation.goBack}
            title={t('title')}
            testID="issuersScreenHeader"
          />
        ),
      });
    }
  }, [controller.loadingReason, controller.errorMessageType, isInScanFlow]);

  useLayoutEffect(() => {
    if (controller.loadingReason && controller.isPresentationAuthorization) {
      props.navigation.setOptions({
        headerShown: true,
        header: props => (
          <Header
            goBack={props.navigation.goBack}
            title={t('selectCard')}
            testID="selectCardIssuersScreenHeader"
          />
        ),
      });
    }
  }, [controller.loadingReason, controller.isPresentationAuthorization]);

  useEffect(() => {
    if (controller.isDownloadSuccess) {
      if (controller.authorizationType === AuthorizationType.IMPLICIT) {
        props.navigation.goBack();
      } else {
        initiateSuccessDownloadRedirectTimer();
      }
    }
  }, [controller.isDownloadSuccess]);

  useEffect(() => {
    if (successDownloadRedirectTimer === 0) {
      props.navigation.goBack();
    }
  }, [successDownloadRedirectTimer]);

  useEffect(() => {
    if (controller.isAuthEndpointToOpen) {
      (props.navigation as any).navigate(AUTH_ROUTES.AuthView, {
        authorizationURL: controller.authEndpoint,
        clientId: controller.selectedIssuer.client_id ?? 'wallet',
        redirectUri:
          controller.selectedIssuer.redirect_uri ??
          'io.mosip.residentapp.inji://oauthredirect',
        controller: controller,
      });
    }
  }, [controller.isAuthEndpointToOpen]);

  const isGenericError = () => {
    return controller.errorMessageType === ErrorMessage.GENERIC;
  };

  function isBackendError(): boolean {
    return (
      controller.errorMessageType === ErrorMessage.TECHNICAL_DIFFICULTIES ||
      controller.errorMessageType ===
        ErrorMessage.CREDENTIAL_TYPE_DOWNLOAD_FAILURE ||
      controller.errorMessageType ===
        ErrorMessage.AUTHORIZATION_GRANT_TYPE_NOT_SUPPORTED ||
      controller.errorMessageType === ErrorMessage.NETWORK_REQUEST_FAILED
    );
  }

  // Used to conditionally skip back with navigation.goBack() when the error happened during the
  // old issuers-list fetch (nothing useful to reset back to, since that fetch is what populated
  // this screen in the first place). That fetch is gone — the machine starts straight in
  // selectingIssuer now — so any error here always has selectingIssuer to reset back to.
  const goBack = () => {
    controller.RESET_ERROR();
  };

  const getImage = () => {
    if (isGenericError()) {
      return SvgImage.SomethingWentWrong();
    }
    if (isBackendError()) return SvgImage.ErrorOccurred();
    return SvgImage.NoInternetConnection();
  };

  if (
    controller.authorizationType === AuthorizationType.OPENID4VP_PRESENTATION &&
    (controller.isPresentationAuthorizationInProgress ||
      controller.isDownloadSuccess ||
      controller.isAuthorizationSuccess) &&
    !controller.isError &&
    !isVerificationFailed
  ) {
    return (
      <ProcessingModal
        testID={controller.isDownloadSuccess ? 'download-success' : 'download'}
        isVisible={
          controller.authorizationType ===
            AuthorizationType.OPENID4VP_PRESENTATION &&
          (controller.isPresentationAuthorizationInProgress ||
            controller.isDownloadSuccess ||
            controller.isAuthorizationSuccess) &&
          !controller.isError
        }
        title={
          controller.isDownloadSuccess
            ? t('downloadSuccess')
            : t('loaders.processing')
        }
        subTitle={
          controller.isDownloadSuccess
            ? t('loaders.progressIndicators.redirectToHome', {
                remainingTime: successDownloadRedirectTimer,
              })
            : t('loaders.subTitle.inProgress')
        }
        progressSteps={[
          <ProgressIndicator
            key={1}
            label={
              controller.isAuthorizationSuccess
                ? t('loaders.progressIndicators.sharedCard')
                : t('loaders.progressIndicators.sharingCard')
            }
            completed={controller.isAuthorizationSuccess}
            testID={
              controller.isAuthorizationSuccess ? 'shared-card' : 'sharing-card'
            }
          />,
          <ProgressIndicator
            key={2}
            label={
              controller.isDownloadSuccess
                ? t('loaders.progressIndicators.downloadedCard')
                : t('loaders.progressIndicators.downloadingCard')
            }
            completed={controller.isDownloadSuccess}
            testID={
              controller.isDownloadSuccess
                ? 'downloaded-card'
                : 'downloading-card'
            }
          />,
        ]}
        action={
          <Button
            testID={'go-home'}
            title={t('goHome')}
            type={'gradient'}
            fill
            onPress={props.navigation.goBack}
            disabled={!controller.isDownloadSuccess}
          />
        }
      />
    );
  }

  if (controller.isSelectingCredentialType) {
    return <CredentialTypeSelectionScreen {...props} />;
  }

  if (isVerificationFailed) {
    return (
      <ErrorView
        testID="verificationError"
        isVisible={isVerificationFailed}
        isModal={true}
        alignActionsOnEnd
        title={t('MyVcsTab:errors.verificationFailed.title')}
        message={verificationErrorMessage}
        image={SvgImage.PermissionDenied()}
        showClose={false}
        primaryButtonText="goBack"
        primaryButtonEvent={controller.RESET_VERIFY_ERROR}
        primaryButtonTestID="goBack"
        customStyles={{marginTop: '30%'}}
      />
    );
  }
  if (controller.isCredentialAlreadyExists) {
    return (
      <ErrorView
        testID="credentialAlreadyExists"
        isVisible={controller.isCredentialAlreadyExists}
        isModal={true}
        alignActionsOnEnd
        title={t('errors.credentialAlreadyExists.title')}
        message={t('errors.credentialAlreadyExists.message')}
        // A choice, not a failure — the red error shield overstates it.
        image={SvgImage.WarningLogo()}
        showClose={false}
        // Button labels are resolved by ErrorView against the `common` namespace, so these are
        // keys in `common` — not `IssuersScreen` like the title and message above.
        primaryButtonText="replaceExisting"
        primaryButtonEvent={controller.REPLACE_EXISTING}
        primaryButtonTestID="replaceExistingCredential"
        textButtonText="keepBoth"
        textButtonEvent={controller.KEEP_BOTH}
        textButtonTestID="keepBothCredentials"
        customStyles={{marginTop: '30%'}}
      />
    );
  }
  if (controller.isSelectingCredentialsToReplace) {
    return <ReplaceCredentialSelectionScreen {...props} />;
  }
  if (controller.isTxCodeRequested) {
    return (
      <TransactionCodeModal
        visible={controller.isTxCodeRequested}
        onDismiss={controller.CANCEL}
        onVerify={controller.TX_CODE_RECEIVED}
        inputMode={controller.txCodeDisplayDetails.inputMode}
        description={controller.txCodeDisplayDetails.description}
        length={controller.txCodeDisplayDetails.length}
      />
    );
  }

  if (controller.isBiometricsCancelled) {
    return (
      <MessageOverlay
        isVisible={controller.isBiometricsCancelled}
        minHeight={'auto'}
        title={t('errors.biometricsCancelled.title')}
        message={t('errors.biometricsCancelled.message')}
        onBackdropPress={controller.RESET_ERROR}>
        <Row>
          <Button
            fill
            type="clear"
            title={t('common:cancel')}
            onPress={controller.RESET_ERROR}
            margin={[0, 8, 0, 0]}
          />
          <Button
            testID="tryAgain"
            fill
            title={t('common:tryAgain')}
            onPress={controller.TRY_AGAIN}
          />
        </Row>
      </MessageOverlay>
    );
  }
  if (showFullScreenError) {
    return (
      <ErrorView
        testID={`${controller.errorMessageType}Error`}
        isVisible={controller.errorMessageType !== ''}
        title={t(`errors.${controller.errorMessageType}.title`)}
        message={t(`errors.${controller.errorMessageType}.message`)}
        goBack={goBack}
        tryAgain={controller.TRY_AGAIN}
        image={getImage()}
        showClose
        primaryButtonTestID="tryAgain"
        primaryButtonText={
          controller.errorMessageType != ErrorMessage.TECHNICAL_DIFFICULTIES &&
          controller.errorMessageType !=
            ErrorMessage.AUTHORIZATION_GRANT_TYPE_NOT_SUPPORTED
            ? 'tryAgain'
            : undefined
        }
        primaryButtonEvent={controller.TRY_AGAIN}
        onDismiss={goBack}
      />
    );
  }

  if (isInScanFlow) {
    return scanToAddComponent(
      isPreparingOffer && !controller.isConsentRequested,
    );
  }

  if (controller.loadingReason) {
    return (
      <Fragment>
        {controller.isPresentationAuthorization ? (
          <SendVPScreen
            navigation={props.navigation}
            route={{
              ...props.route,
              params: {
                ...props.route.params,
                ovpService: controller.ovpMachine,
              },
            }}
          />
        ) : (
          <Loader
            title={
              controller.loadingReason === 'preparingRequest'
                ? t('loaders.preparingRequest')
                : t('loaders.loading')
            }
            subTitle={t(`loaders.subTitle.${controller.loadingReason}`)}
          />
        )}
      </Fragment>
    );
  }

  // Nothing else to show on the way out, e.g. once the card is stored and the screen is
  // about to close.
  return scanToAddComponent(true);

  function scanToAddComponent(isProcessing: boolean) {
    return (
      <Fragment>
        <ScanToAddScreen
          isCameraActive={controller.isQrScanning}
          isProcessing={isProcessing}
          onQrFound={controller.QR_CODE_SCANNED}
          onClose={props.navigation.goBack}
        />
        <TrustIssuerSheet
          isVisible={controller.isConsentRequested}
          name={controller.issuerName}
          credentialTypes={controller.offeredCredentialTypeNames}
          logo={controller.issuerLogo}
          consentStatus={controller.trustedIssuerConsentStatus}
          onConfirm={controller.ON_CONSENT_GIVEN}
          onCancel={controller.CANCEL}
        />
      </Fragment>
    );
  }
};
