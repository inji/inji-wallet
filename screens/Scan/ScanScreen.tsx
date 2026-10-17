import React, {useCallback, useContext, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  ErrorMessageOverlay,
  MessageOverlay,
} from '../../components/MessageOverlay';
import {Centered} from '../../components/ui';
import {VerifierQrScanner} from '../../components/VerifierQrScanner';
import {Theme} from '../../components/ui/styleUtils';
import {QrLogin} from '../QrLogin/QrLogin';
import {useScanScreen} from './ScanScreenController';
import BluetoothStateManager from 'react-native-bluetooth-state-manager';
import {
  BackHandler,
  Linking,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from 'react-native-elements';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {isIOS, LIVENESS_CHECK} from '../../shared/constants';
import {BannerNotificationContainer} from '../../components/BannerNotificationContainer';
import {SharingStatusModal} from './SharingStatusModal';
import {SvgImage} from '../../components/ui/svg';
import {LocationPermissionRational} from './LocationPermissionRational';
import {FaceVerificationAlertOverlay} from './FaceVerificationAlertOverlay';
import {useSendVcScreen} from './SendVcScreenController';
import {useSendVPScreen} from './SendVPScreenController';
import {ErrorView} from '../../components/ui/Error';
import {VPShareOverlay} from './VPShareOverlay';
import {VerifyIdentityOverlay} from '../VerifyIdentityOverlay';
import {VCShareFlowType} from '../../shared/Utils';
import {APP_EVENTS} from '../../machines/app';
import {GlobalContext} from '../../shared/GlobalContext';
import {useOvpErrorModal} from '../../shared/hooks/useOvpErrorModal';
import {useScanStackScreenSwitcher} from './useScanStackScreenSwitcher';

const COLORS = Theme.Colors.Design;
const COMING_SOON_MS = 2000;

export const ScanScreen: React.FC = () => {
  const {t} = useTranslation('ScanScreen');
  // Drives ScanStack's own navigate() between ScanScreen/SendVcScreen/SendVPScreen — has to be
  // called from a screen *of* ScanStack (this one) rather than from ScanLayoutController (called
  // from ScanLayout, above ScanStack.Navigator) for useNavigation() to resolve to this stack
  // directly. See useScanStackScreenSwitcher.ts for the full reasoning.
  useScanStackScreenSwitcher();
  const scanScreenController = useScanScreen();
  const sendVcScreenController = useSendVcScreen();
  const sendVPScreenController = useSendVPScreen();
  const [errorModal] = useOvpErrorModal({
    error: sendVPScreenController.error,
    noCredentialsMatchingVPRequest:
      sendVPScreenController.noCredentialsMatchingVPRequest,
    requestedClaimsByVerifier: sendVPScreenController.requestedClaimsByVerifier,
    getAdditionalMessage: sendVPScreenController.getAdditionalMessage,
    generateAndStoreLogMessage:
      sendVPScreenController.generateAndStoreLogMessage,
    t,
  });
  const [isBluetoothOn, setIsBluetoothOn] = useState(false);
  const insets = useSafeAreaInsets();
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [isComingSoonVisible, setIsComingSoonVisible] = useState(false);

  // This tab is dark, so the status bar switches to light icons while it is in focus.
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('light-content');
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(COLORS.darkBackground);
      }
      return () => {
        StatusBar.setBarStyle('dark-content');
        if (Platform.OS === 'android') {
          StatusBar.setBackgroundColor(Theme.Colors.whiteBackgroundColor);
        }
      };
    }, []),
  );

  useEffect(() => {
    if (!scanScreenController.isScanning) {
      setIsTorchOn(false);
    }
  }, [scanScreenController.isScanning]);

  // "From Photos" and "Show My QR" are placeholders until those features are built.
  useEffect(() => {
    if (!isComingSoonVisible) {
      return;
    }
    const timeout = setTimeout(
      () => setIsComingSoonVisible(false),
      COMING_SOON_MS,
    );
    return () => clearTimeout(timeout);
  }, [isComingSoonVisible]);
  const showComingSoon = () => setIsComingSoonVisible(true);
  const showErrorModal =
    sendVPScreenController.scanScreenError ||
    (errorModal.show &&
      (sendVPScreenController.flowType ===
        VCShareFlowType.MINI_VIEW_SHARE_OPENID4VP ||
        sendVPScreenController.flowType ===
          VCShareFlowType.MINI_VIEW_SHARE_WITH_SELFIE_OPENID4VP));

  const {appService} = useContext(GlobalContext);

  useEffect(() => {
    (async () => {
      await BluetoothStateManager.onStateChange(state => {
        if (state === 'PoweredOff') {
          setIsBluetoothOn(false);
        } else {
          setIsBluetoothOn(true);
        }
      }, true);
    })();
  }, [isBluetoothOn]);

  // TODO(kludge): skip running this hook on every render
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

  useEffect(() => {
    if (scanScreenController.isQuickShareDone) scanScreenController.GOTO_HOME();
  }, [scanScreenController.isQuickShareDone]);

  useEffect(() => {
    if (
      scanScreenController.isNoSharableVCs &&
      scanScreenController.linkcode !== ''
    )
      setTimeout(() => {
        scanScreenController.GOTO_HOME();
        appService.send(APP_EVENTS.RESET_LINKCODE());
        BackHandler.exitApp();
      }, 2000);
  }, [scanScreenController.isNoSharableVCs, scanScreenController.linkcode]);

  const openSettings = () => {
    Linking.openSettings();
  };

  const handleTextButtonEvent = () => {
    sendVPScreenController.GO_TO_HOME();
    sendVPScreenController.RESET_RETRY_COUNT();
  };

  function noShareableVcText() {
    return (
      <Text testID="noShareableVcs" style={styles.stateMessage}>
        {t('noShareableVcs')}
      </Text>
    );
  }

  function bluetoothIsOffText() {
    return (
      <Text testID="bluetoothIsTurnedOffMessage" style={styles.stateMessage}>
        {t(isIOS() ? 'bluetoothStateIos' : 'bluetoothStateAndroid')}
      </Text>
    );
  }

  function stateWithAction(
    messageTestID: string,
    message: string,
    buttonTestID: string,
    buttonTitle: string,
    onPress: () => void,
  ) {
    return (
      <View style={styles.stateWithAction}>
        <Text testID={messageTestID} style={styles.stateMessage}>
          {message}
        </Text>
        <Pressable
          testID={buttonTestID}
          accessibilityRole="button"
          onPress={onPress}
          style={({pressed}) => [
            styles.primaryPill,
            pressed && styles.pressed,
          ]}>
          <Text style={styles.primaryPillText}>{buttonTitle}</Text>
        </Pressable>
      </View>
    );
  }

  function allowBluetoothPermissionComponent() {
    return stateWithAction(
      'enableBluetoothMessage',
      t('enableBluetoothMessage'),
      'enableBluetoothButton',
      t('enableBluetoothButtonText'),
      openSettings,
    );
  }

  function allowNearbyDevicesPermissionComponent() {
    return stateWithAction(
      'allowNearbyDevicesPermissionMessage',
      t('errors.nearbyDevicesPermissionDenied.message'),
      'allowNearbyDevicesPermissionButton',
      t('errors.nearbyDevicesPermissionDenied.button'),
      openSettings,
    );
  }

  function allowLocationComponent() {
    return stateWithAction(
      'enableLocationServicesMessage',
      scanScreenController.locationError.message,
      'enableLocationServicesButton',
      scanScreenController.locationError.button,
      scanScreenController.LOCATION_REQUEST,
    );
  }

  function qrScannerComponent() {
    return (
      <VerifierQrScanner
        onQrFound={scanScreenController.SCAN}
        isTorchOn={isTorchOn}
        title={t('pointCameraTitle')}
        subtitle={t('pointCameraSubtitle')}
      />
    );
  }

  function loadQRScanner() {
    if (
      scanScreenController.isNoSharableVCs &&
      scanScreenController.authorizationRequest === ''
    ) {
      return noShareableVcText();
    }
    if (scanScreenController.selectIsInvalid) {
      return displayInvalidQRpopup();
    }
    if (scanScreenController.isNearByDevicesPermissionDenied) {
      return allowNearbyDevicesPermissionComponent();
    }
    if (
      (scanScreenController.isBluetoothDenied || !isBluetoothOn) &&
      scanScreenController.isReadyForBluetoothStateCheck
    ) {
      return bluetoothIsOffText();
    }
    if (scanScreenController.isLocalPermissionRational) {
      return (
        <LocationPermissionRational
          onConfirm={scanScreenController.ALLOWED}
          onCancel={scanScreenController.DENIED}
        />
      );
    }
    if (
      scanScreenController.isLocationDisabled ||
      scanScreenController.isLocationDenied
    ) {
      return allowLocationComponent();
    }

    if (scanScreenController.isBluetoothPermissionDenied) {
      return allowBluetoothPermissionComponent();
    }
    if (scanScreenController.isScanning) {
      return qrScannerComponent();
    }
  }

  function displayStorageLimitReachedError(): React.ReactNode {
    return (
      !scanScreenController.isNoSharableVCs && (
        <ErrorMessageOverlay
          testID="storageLimitReachedError"
          isVisible={
            scanScreenController.isMinimumStorageRequiredForAuditEntryLimitReached
          }
          translationPath={'ScanScreen'}
          error="errors.storageLimitReached"
          onDismiss={scanScreenController.GOTO_HOME}
        />
      )
    );
  }

  function displayInvalidQRpopup(): React.ReactNode {
    return (
      !scanScreenController.isNoSharableVCs && (
        <SharingStatusModal
          isVisible={scanScreenController.selectIsInvalid}
          testId={'invalidQrPopup'}
          image={SvgImage.ErrorLogo()}
          title={t(`status.bleError.TVW_CON_001.title`)}
          message={t(`status.bleError.TVW_CON_001.message`)}
          gradientButtonTitle={t('status.bleError.retry')}
          clearButtonTitle={t('status.bleError.home')}
          onGradientButton={scanScreenController.DISMISS}
          onClearButton={scanScreenController.GOTO_HOME}
        />
      )
    );
  }

  const getPrimaryButtonText = () => {
    if (
      errorModal.showRetryButton &&
      sendVPScreenController.openID4VPRetryCount < 3
    ) {
      return t('ScanScreen:status.retry');
    }
    return undefined;
  };

  const getTextButtonText = () => {
    return sendVPScreenController.isOVPViaDeepLink
      ? undefined
      : t('ScanScreen:status.accepted.home');
  };

  const faceVerificationController = sendVPScreenController.flowType.startsWith(
    'OpenID4VP',
  )
    ? sendVPScreenController
    : sendVcScreenController;

  const faceVerificationConsentOnClose =
    sendVPScreenController.flowType.startsWith('OpenID4VP')
      ? sendVPScreenController.DISMISS_POPUP
      : sendVcScreenController.DISMISS;

  return (
    <LinearGradient
      colors={[COLORS.darkBackground, COLORS.darkBackgroundEnd]}
      style={[styles.screen, {paddingTop: insets.top + 8}]}>
      <BannerNotificationContainer />
      <FaceVerificationAlertOverlay
        isVisible={faceVerificationController.isFaceVerificationConsent}
        onConfirm={faceVerificationController.FACE_VERIFICATION_CONSENT}
        close={faceVerificationConsentOnClose}
      />

      <View style={styles.header}>
        <Pressable
          testID="scanClose"
          accessibilityRole="button"
          accessibilityLabel={t('close')}
          onPress={scanScreenController.GOTO_HOME}
          style={({pressed}) => [
            styles.roundButton,
            pressed && styles.pressed,
          ]}>
          <Icon
            name="close"
            type="material-community"
            size={24}
            color={COLORS.darkText}
          />
        </Pressable>
        <Text style={styles.headerTitle} accessibilityRole="header">
          {t('scanVerifierTitle')}
        </Text>
        {scanScreenController.isScanning ? (
          <Pressable
            testID="scanTorch"
            accessibilityRole="button"
            accessibilityLabel={isTorchOn ? t('flashOff') : t('flashOn')}
            accessibilityState={{selected: isTorchOn}}
            onPress={() => setIsTorchOn(on => !on)}
            style={({pressed}) => [
              styles.roundButton,
              isTorchOn && styles.roundButtonOn,
              pressed && styles.pressed,
            ]}>
            <Icon
              name={isTorchOn ? 'flash' : 'flash-outline'}
              type="material-community"
              size={24}
              color={isTorchOn ? COLORS.darkBackground : COLORS.darkText}
            />
          </Pressable>
        ) : (
          <View style={styles.roundButtonPlaceholder} />
        )}
      </View>

      <Centered fill style={styles.content}>
        {loadQRScanner()}
        {scanScreenController.isQrLogin && (
          <QrLogin
            isVisible={scanScreenController.isQrLogin}
            service={scanScreenController.isQrRef}
          />
        )}
        <MessageOverlay
          isVisible={scanScreenController.isQrLoginstoring}
          title={t('loading')}
          progress
        />
      </Centered>

      {scanScreenController.isScanning && (
        <View style={styles.footer}>
          {isComingSoonVisible && (
            <View style={styles.comingSoon}>
              <Text style={styles.comingSoonText}>{t('comingSoon')}</Text>
            </View>
          )}
          <View style={styles.footerButtons}>
            <Pressable
              testID="scanFromPhotos"
              accessibilityRole="button"
              onPress={showComingSoon}
              style={({pressed}) => [
                styles.outlinePill,
                pressed && styles.pressed,
              ]}>
              <Icon
                name="image-outline"
                type="material-community"
                size={20}
                color={COLORS.darkText}
              />
              <Text
                style={styles.outlinePillText}
                numberOfLines={1}
                adjustsFontSizeToFit>
                {t('fromPhotos')}
              </Text>
            </Pressable>
            <Pressable
              testID="scanShowMyQr"
              accessibilityRole="button"
              onPress={showComingSoon}
              style={({pressed}) => [
                styles.primaryPill,
                styles.footerPill,
                pressed && styles.pressed,
              ]}>
              <Text
                style={styles.primaryPillText}
                numberOfLines={1}
                adjustsFontSizeToFit>
                {t('showMyQr')}
              </Text>
            </Pressable>
          </View>
        </View>
      )}
      {displayStorageLimitReachedError()}

      {sendVPScreenController.flowType.startsWith('OpenID4VP') &&
        sendVPScreenController.flowType !== VCShareFlowType.OPENID4VP &&
        sendVPScreenController.overlayDetails !== null && (
          <VPShareOverlay
            isVisible={sendVPScreenController.overlayDetails !== null}
            title={sendVPScreenController.overlayDetails.title}
            titleTestID={sendVPScreenController.overlayDetails.titleTestID}
            message={sendVPScreenController.overlayDetails.message}
            messageTestID={sendVPScreenController.overlayDetails.messageTestID}
            primaryButtonTestID={
              sendVPScreenController.overlayDetails.primaryButtonTestID
            }
            primaryButtonText={
              sendVPScreenController.overlayDetails.primaryButtonText
            }
            primaryButtonEvent={
              sendVPScreenController.overlayDetails.primaryButtonEvent
            }
            secondaryButtonTestID={
              sendVPScreenController.overlayDetails.secondaryButtonTestID
            }
            secondaryButtonText={
              sendVPScreenController.overlayDetails.secondaryButtonText
            }
            secondaryButtonEvent={
              sendVPScreenController.overlayDetails.secondaryButtonEvent
            }
            onCancel={sendVPScreenController.overlayDetails.onCancel}
          />
        )}
      <>
        <ErrorView
          isModal
          alignActionsOnEnd
          showClose={false}
          isVisible={showErrorModal}
          title={errorModal.title}
          message={errorModal.message}
          image={SvgImage.PermissionDenied()}
          primaryButtonTestID={'retry'}
          primaryButtonText={getPrimaryButtonText()}
          primaryButtonEvent={sendVPScreenController.RETRY}
          textButtonTestID={'home'}
          textButtonText={getTextButtonText()}
          textButtonEvent={handleTextButtonEvent}
          customImageStyles={{paddingBottom: 0, marginBottom: -6}}
          customStyles={{marginTop: '30%'}}
          testID={'vpShareError'}
        />

        <VerifyIdentityOverlay
          credential={sendVPScreenController.credentials}
          verifiableCredentialData={
            sendVPScreenController.verifiableCredentialsData
          }
          isVerifyingIdentity={sendVPScreenController.isVerifyingIdentity}
          onCancel={sendVPScreenController.CANCEL}
          onFaceValid={sendVPScreenController.FACE_VALID}
          onFaceInvalid={sendVPScreenController.FACE_INVALID}
          isInvalidIdentity={sendVPScreenController.isInvalidIdentity}
          onNavigateHome={sendVPScreenController.GO_TO_HOME}
          onRetryVerification={sendVPScreenController.RETRY_VERIFICATION}
          isLivenessEnabled={LIVENESS_CHECK}
        />
      </>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: {
    flex: 1,
    marginHorizontal: 16,
    fontFamily: 'Montserrat_700Bold',
    fontSize: 26,
    color: COLORS.darkText,
  },
  roundButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.darkSurface,
  },
  roundButtonOn: {
    backgroundColor: COLORS.darkText,
  },
  roundButtonPlaceholder: {
    width: 48,
  },
  content: {
    paddingHorizontal: 24,
  },
  stateWithAction: {
    alignItems: 'center',
  },
  stateMessage: {
    textAlign: 'center',
    marginHorizontal: 12,
    fontFamily: 'Montserrat_500Medium',
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.darkText,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  footerButtons: {
    flexDirection: 'row',
  },
  outlinePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
    marginRight: 12,
    paddingHorizontal: 12,
    borderRadius: 27,
    borderWidth: 1.5,
    borderColor: COLORS.darkBorder,
  },
  outlinePillText: {
    flexShrink: 1,
    marginLeft: 8,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 15,
    color: COLORS.darkText,
  },
  primaryPill: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
    marginTop: 20,
    paddingHorizontal: 28,
    borderRadius: 27,
    backgroundColor: COLORS.surface,
  },
  // Same padding as the outline pill, so the two footer buttons come out equal width.
  footerPill: {
    flex: 1,
    marginTop: 0,
    paddingHorizontal: 12,
  },
  primaryPillText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 16,
    color: COLORS.navy,
  },
  comingSoon: {
    alignSelf: 'center',
    marginBottom: 12,
    backgroundColor: COLORS.darkSurface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  comingSoonText: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 14,
    color: COLORS.darkText,
  },
  pressed: {
    opacity: 0.75,
  },
});
