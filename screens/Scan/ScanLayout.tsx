import React from 'react';
import {useTranslation} from 'react-i18next';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SendVcScreen} from './SendVcScreen';
import {useScanLayout} from './ScanLayoutController';
import {ScanScreen} from './ScanScreen';
import {SCAN_ROUTES} from '../../routes/routesConstants';
import {SharingStatusModal} from './SharingStatusModal';
import {Theme} from '../../components/ui/styleUtils';
import {Icon} from 'react-native-elements';
import {Loader} from '../../components/ui/Loader';
import {VerifyIdentityOverlay} from '../VerifyIdentityOverlay';
import {SvgImage} from '../../components/ui/svg';
import {View, I18nManager} from 'react-native';
import {Text} from './../../components/ui';
import {BannerStatusType} from '../../components/BannerNotification';
import {LIVENESS_CHECK} from '../../shared/constants';
import {SendVPScreen} from './SendVPScreen';
import { useSendVPScreen } from './SendVPScreenController';
import {useSendVcScreen} from './SendVcScreenController';
import {ShareSuccessScreen} from './ShareSuccessScreen';
import {VCMetadata} from '../../shared/VCMetadata';

const ScanStack = createNativeStackNavigator();

export const ScanLayout: React.FC = () => {
  const {t} = useTranslation('ScanScreen');
  const controller = useScanLayout();
  const sendVPScreenController = useSendVPScreen();
  const sendVcScreenController = useSendVcScreen();

  // Online shares name the verifier from its request; Bluetooth shares name the receiving device.
  const sharedWithName = controller.isVPSharingSuccess
    ? sendVPScreenController.verifierNameInTrustModal ?? t('unknownVerifier')
    : sendVcScreenController.receiverInfo?.name ||
      sendVcScreenController.receiverInfo?.deviceName ||
      t('unknownVerifier');
  const sharedCards = controller.isVPSharingSuccess
    ? Object.values(sendVPScreenController.userSelectedVCs ?? {})
        .flat()
        .map(vc => ({
          vcMetadata: vc.vcMetadata,
          selectedDisclosures:
            sendVPScreenController.userSelectedDisclosuresByVc?.[
              VCMetadata.fromVcMetadataString(vc.vcMetadata).getVcKey()
            ],
        }))
    : sendVcScreenController.selectedVc?.vcMetadata
    ? [{vcMetadata: sendVcScreenController.selectedVc.vcMetadata}]
    : [];
  if (
    controller.statusOverlay != null &&
    !controller.isAccepted &&
    !controller.isInvalid
  ) {
    const onClosingBanner = controller.isFaceVerifiedInVPSharing
      ? controller.VP_SHARE_CLOSE_BANNER
      : controller.CLOSE_BANNER;

    return (
      <Loader
        title={controller.statusOverlay?.title}
        hint={controller.statusOverlay?.hint}
        onCancel={controller.statusOverlay?.onButtonPress}
        onStayInProgress={controller.statusOverlay?.onStayInProgress}
        isHintVisible={
          controller.isStayInProgress ||
          controller.isBleError ||
          controller.isSendingVc ||
          controller.isSendingVP
        }
        onRetry={controller.statusOverlay?.onRetry}
        showBanner={
          controller.isFaceIdentityVerified ||
          controller.isFaceVerifiedInVPSharing
        }
        bannerMessage={t('ScanScreen:postFaceCapture:captureSuccessMessage')}
        onBannerClose={onClosingBanner}
        bannerType={BannerStatusType.SUCCESS}
        bannerTestID={'faceVerificationSuccess'}
      />
    );
  }

  return (
    <React.Fragment>
      <VerifyIdentityOverlay
        credential={controller.credential}
        verifiableCredentialData={controller.verifiableCredentialData}
        isVerifyingIdentity={controller.isVerifyingIdentity}
        onCancel={controller.CANCEL}
        onFaceValid={controller.FACE_VALID}
        onFaceInvalid={controller.FACE_INVALID}
        isInvalidIdentity={controller.isInvalidIdentity}
        onNavigateHome={controller.GOTO_HOME}
        onRetryVerification={controller.RETRY_VERIFICATION}
        isLivenessEnabled={LIVENESS_CHECK}
      />
      {/*
        All three screens are registered unconditionally, always — not gated behind the same
        controller.isReviewing/flowType/openID4VPFlowType values that ScanLayoutController's own
        useEffect (below) uses to decide when to navigate to them.

        That effect fires from a useNavigation() resolved one level up (against MainLayout's tab
        navigator, since this hook runs before this component renders its own ScanStack.Navigator
        below it), so a navigate('SendVPScreen'/'SendVcScreen') dispatched from it has to be
        resolved by drilling down into this stack's *own* registered route list. Conditionally
        registering a screen on the identical state the effect reacts to raced that dispatch
        against this render: react-navigation could resolve the navigate before the conditional
        Screen had (re)registered, and — unlike a queued action — a NAVIGATE to an unregistered
        route is simply dropped, not retried. That is what "liveness check doesn't come up" was:
        openID4VPMachine kept progressing (checkFaceAuthConsent, ...) while the screen meant to
        host it never mounted, logging "The action 'NAVIGATE' ... was not handled by any
        navigator. Do you have a screen named 'SendVPScreen'?".

        Registering every screen up front removes the race — react-navigation only mounts a
        registered Screen once it is actually pushed via navigate(), so this has no eager-render
        cost, same as the equivalent fix in AppLayout.tsx for Main/Notifications.
      */}
      <ScanStack.Navigator initialRouteName="ScanScreen">
        <ScanStack.Screen
          name={SCAN_ROUTES.ScanScreen}
          component={ScanScreen}
          options={{
            // ScanScreen draws its own dark header.
            headerShown: false,
            title: t('MainLayout:share'),
            headerTitleAlign: 'left',
            headerTitleStyle: Theme.Styles.scanLayoutHeaderTitle,
          }}
        />
        <ScanStack.Screen
          name={SCAN_ROUTES.SendVcScreen}
          component={SendVcScreen}
          options={{
            title: t('sharingVc'),
            headerTitleAlign: 'center',
            headerTitle: props => (
              <View style={Theme.Styles.sendVcHeaderContainer}>
                <Text style={Theme.Styles.scanLayoutHeaderTitle}>
                  {props.children}
                </Text>
              </View>
            ),
            headerBackVisible: false,
            headerRight: () =>
              !I18nManager.isRTL && (
                <Icon
                  name="close"
                  color={Theme.Colors.blackIcon}
                  onPress={controller.CANCEL}
                />
              ),
            headerLeft: () =>
              I18nManager.isRTL && (
                <Icon
                  name="close"
                  color={Theme.Colors.blackIcon}
                  onPress={controller.CANCEL}
                />
              ),
          }}
        />
        <ScanStack.Screen
          name={SCAN_ROUTES.SendVPScreen}
          component={SendVPScreen}
          options={{
            title: t('SendVPScreen:requester'),
            headerTitle: props => (
              <View style={Theme.Styles.sendVPHeaderContainer}>
                <Text style={Theme.Styles.sendVPHeaderTitle}>
                  {props.children}
                </Text>
                {controller.vpVerifierName && (
                  <Text style={Theme.Styles.sendVPHeaderSubTitle}>
                    {controller.vpVerifierName}
                  </Text>
                )}
              </View>
            ),
            headerBackVisible: false,
            headerRight: () =>
              !I18nManager.isRTL && (
                <Icon
                  name="close"
                  color={Theme.Colors.blackIcon}
                  onPress={controller.DISMISS}
                />
              ),
            headerLeft: () =>
              I18nManager.isRTL && (
                <Icon
                  name="close"
                  color={Theme.Colors.blackIcon}
                  onPress={controller.DISMISS}
                />
              ),
          }}
        />
      </ScanStack.Navigator>
       
      <ShareSuccessScreen
        isVisible={controller.isAccepted || controller.isVPSharingSuccess}
        verifierName={sharedWithName}
        sharedCards={sharedCards}
        wasAcceptedByVerifier={controller.isAccepted}
        isViaDeepLink={controller.isOVPViaDeepLink}
        goToHome={controller.GOTO_HOME}
        goToHistory={controller.GOTO_HISTORY}
      />

      {controller.errorStatusOverlay && (
        <SharingStatusModal
          isVisible={controller.errorStatusOverlay !== null}
          testId={'walletSideSharingErrorModal'}
          image={SvgImage.ErrorLogo()}
          title={controller.errorStatusOverlay.title}
          message={controller.errorStatusOverlay.message}
          gradientButtonTitle={t('status.bleError.retry')}
          clearButtonTitle={t('status.bleError.home')}
          onGradientButton={controller.onRetry}
          onClearButton={controller.GOTO_HOME}
        />
      )}
    </React.Fragment>
  );
};
