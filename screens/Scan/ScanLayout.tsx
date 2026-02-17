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
import {VCShareFlowType} from '../../shared/Utils';
import {VerifyIdentityOverlay} from '../VerifyIdentityOverlay';
import {SvgImage} from '../../components/ui/svg';
import {View, I18nManager} from 'react-native';
import {Text} from './../../components/ui';
import {BannerStatusType} from '../../components/BannerNotification';
import {isIOS, LIVENESS_CHECK} from '../../shared/constants';
import {SendVPScreen} from './SendVPScreen';
import { useSendVPScreen } from './SendVPScreenController';

const ScanStack = createNativeStackNavigator();

export const ScanLayout: React.FC = () => {
  const {t} = useTranslation('ScanScreen');
  const controller = useScanLayout();
  const sendVPScreenController = useSendVPScreen();
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
      <ScanStack.Navigator initialRouteName="ScanScreen">
        {controller.isReviewing &&
          controller.flowType === VCShareFlowType.SIMPLE_SHARE && (
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
          )}
        {controller.openID4VPFlowType === VCShareFlowType.OPENID4VP ? (
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
        ) : (
          <ScanStack.Screen
            name={SCAN_ROUTES.ScanScreen}
            component={ScanScreen}
            options={{
              title: t('MainLayout:share'),
              headerTitleAlign: 'left',
              headerTitleStyle: Theme.Styles.scanLayoutHeaderTitle,
            }}
          />
        )}
      </ScanStack.Navigator>
       
      <SharingStatusModal
        isVisible={controller.isAccepted || controller.isVPSharingSuccess}
        testId={'sharingSuccessModal'}
        buttonStatus={
          controller.isOVPViaDeepLink ? 'none' : 'homeAndHistoryIcons'
        }
        title={t('status.accepted.title')}
        message={t('status.accepted.message')}
        additionalMessage={
          controller.isOVPViaDeepLink && isIOS()
            ? t('status.accepted.additionalMessage')
            : ''
        }
        image={SvgImage.SuccessLogo()}
        goToHome={controller.GOTO_HOME}
        goToHistory={controller.GOTO_HISTORY}
        verifierLogo={controller.openID4VPFlowType == VCShareFlowType.OPENID4VP ? sendVPScreenController.verifierLogoInTrustModal ?? undefined : undefined}
        verifierName={controller.openID4VPFlowType == VCShareFlowType.OPENID4VP ? sendVPScreenController.verifierNameInTrustModal ?? t('unknownVerifier') : undefined}
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
