import React, {Fragment, useCallback, useEffect, useLayoutEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {useFocusEffect} from '@react-navigation/native';
import {Header} from '../../components/ui/Header';
import {Theme} from '../../components/ui/styleUtils';
import {Button} from '../../components/ui';
import {RootRouteProps} from '../../routes';
import {HomeRouteProps} from '../../routes/routeTypes';
import {useIssuerScreenController} from './IssuerScreenController';
import {isTranslationKeyFound} from '../../shared/commonUtil';
import {ErrorMessage} from '../../shared/openId4VCI/Utils';
import {
  getInteractEventData,
  getStartEventData,
  sendInteractEvent,
  sendStartEvent,
} from '../../shared/telemetry/TelemetryUtils';
import {TelemetryConstants} from '../../shared/telemetry/TelemetryConstants';
import {CredentialTypeSelectionScreen} from './CredentialTypeSelectionScreen';
import {ReplaceCredentialSelectionScreen} from './ReplaceCredentialSelectionScreen';
import {AUTH_ROUTES} from '../../routes/routesConstants';
import {TransactionCodeModal} from './TransactionCodeScreen';
import {ScanToAddScreen} from '../../components/addCredential/ScanToAddScreen';
import {TrustIssuerSheet} from '../../components/addCredential/TrustIssuerSheet';
import {DownloadingCard} from '../../components/addCredential/DownloadingCard';
import {DownloadFailed} from '../../components/addCredential/DownloadFailed';
import {AlertSheet} from '../../components/revamp/Page';
import {WarningIcon} from '../../components/revamp/Icons';
import {SendVPScreen} from '../Scan/SendVPScreen';

import {AuthorizationType} from '../../shared/constants';
import {useTimer} from '../../shared/hooks/UseTimer';
import {
  ProcessingModal,
  ProgressIndicator,
} from '../../components/ui/processingScreen/ProcessingModal';

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

  // Used to conditionally skip back with navigation.goBack() when the error happened during the
  // old issuers-list fetch (nothing useful to reset back to, since that fetch is what populated
  // this screen in the first place). That fetch is gone — the machine starts straight in
  // selectingIssuer now — so any error here always has selectingIssuer to reset back to.
  const goBack = () => {
    controller.RESET_ERROR();
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
      <DownloadFailed
        testID="verificationError"
        kind="verification"
        title={t('couldNotAddCard')}
        message={verificationErrorMessage}
        primary={{
          testID: 'goBack',
          title: t('backToWallet'),
          onPress: controller.RESET_VERIFY_ERROR,
        }}
      />
    );
  }
  if (controller.isCredentialAlreadyExists) {
    return (
      <Fragment>
        {scanToAddComponent(true)}
        <AlertSheet
          testID="credentialAlreadyExists"
          isVisible={controller.isCredentialAlreadyExists}
          tone="warn"
          icon={colour => <WarningIcon color={colour} />}
          title={t('errors.credentialAlreadyExists.title')}
          message={t('errors.credentialAlreadyExists.message', {
            card: controller.offeredCredentialTypeNames[0] ?? t('thisCard'),
          })}
          primary={{
            testID: 'replaceExistingCredential',
            title: t('common:replaceExisting'),
            onPress: controller.REPLACE_EXISTING,
          }}
          outline={{
            testID: 'keepBothCredentials',
            title: t('common:keepBoth'),
            onPress: controller.KEEP_BOTH,
          }}
          dismissOnBackdropPress={false}
          onRequestClose={() => undefined}
        />
      </Fragment>
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
      <Fragment>
        {scanToAddComponent(true)}
        <AlertSheet
          testID="biometricsCancelled"
          isVisible={controller.isBiometricsCancelled}
          tone="warn"
          icon={colour => <WarningIcon color={colour} />}
          title={t('errors.biometricsCancelled.title')}
          message={t('errors.biometricsCancelled.message')}
          primary={{
            testID: 'tryAgain',
            title: t('errors.biometricsCancelled.retry'),
            onPress: controller.TRY_AGAIN,
          }}
          secondary={{
            testID: 'stopDownload',
            title: t('errors.biometricsCancelled.stop'),
            destructive: true,
            onPress: controller.RESET_ERROR,
          }}
          onRequestClose={controller.RESET_ERROR}
        />
      </Fragment>
    );
  }
  if (showFullScreenError) {
    const errorType = controller.errorMessageType || ErrorMessage.GENERIC;
    return (
      <DownloadFailed
        testID={`${errorType}Error`}
        kind={errorType === ErrorMessage.NO_INTERNET ? 'connection' : 'generic'}
        title={t('couldNotAddCard')}
        message={t(`errors.${errorType}.message`)}
        onClose={goBack}
        primary={
          errorType != ErrorMessage.TECHNICAL_DIFFICULTIES &&
          errorType != ErrorMessage.AUTHORIZATION_GRANT_TYPE_NOT_SUPPORTED
            ? {
                testID: 'tryAgain',
                title: t('common:tryAgain'),
                onPress: controller.TRY_AGAIN,
              }
            : {
                testID: 'backToWallet',
                title: t('backToWallet'),
                onPress: props.navigation.goBack,
              }
        }
        secondary={
          errorType != ErrorMessage.TECHNICAL_DIFFICULTIES &&
          errorType != ErrorMessage.AUTHORIZATION_GRANT_TYPE_NOT_SUPPORTED
            ? {
                testID: 'backToWallet',
                title: t('backToWallet'),
                onPress: props.navigation.goBack,
              }
            : undefined
        }
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
          <DownloadingCard
            reason={controller.loadingReason}
            cardType={controller.offeredCredentialTypeNames[0]}
            issuerName={controller.issuerName}
            issuerTrusted
            onCancel={
              controller.loadingReason === 'downloadingCredentials'
                ? controller.CANCEL
                : undefined
            }
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
