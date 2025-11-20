import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';
import {HeaderBackButton} from '@react-navigation/elements';
import {RequestScreen} from './RequestScreen';
import {useRequestLayout} from './RequestLayoutController';
import {Message} from '../../components/Message';
import {ReceiveVcScreen} from './ReceiveVcScreen';
import {ReceivedCardsModal} from '../Settings/ReceivedCardsModal';
import {useReceivedVcsTab} from '../Home/ReceivedVcsTabController';
import {REQUEST_ROUTES} from '../../routes/routesConstants';
import {SquircleIconPopUpModal} from '../../components/ui/SquircleIconPopUpModal';
import {BannerNotificationContainer} from '../../components/BannerNotificationContainer';
import {SharingStatusModal} from '../Scan/SharingStatusModal';
import {SvgImage} from '../../components/ui/svg';
import {I18nManager} from 'react-native';
import {Theme} from '../../components/ui/styleUtils';
import LinearGradient from 'react-native-linear-gradient';

const RequestStack = createNativeStackNavigator();

export const RequestLayout: React.FC = () => {
  const {t} = useTranslation('RequestScreen');
  const controller = useRequestLayout();
  const receivedCardsController = useReceivedVcsTab();
  const bleErrorCode = controller.bleError.code;

  return (
    <React.Fragment>
      <RequestStack.Navigator
        initialRouteName="RequestScreen"
        screenListeners={{
          state: () => {
            if (controller.isAccepted) {
              controller.RESET();
            }
          },
        }}
        screenOptions={{
          headerTitleAlign: 'center',
          headerShadowVisible: false,
        }}>
        {!controller.isDone && (
          <RequestStack.Screen
            name={REQUEST_ROUTES.ReceiveVcScreen}
            component={ReceiveVcScreen}
            options={{
              title: t('incomingVc'),
              headerLeft: () =>
                !I18nManager.isRTL && (
                  <LinearGradient
                    start={Theme.LinearGradientDirection.start}
                    end={Theme.LinearGradientDirection.end}
                    colors={Theme.Colors.GradientColorsLight}
                    style={Theme.Styles.BackButtonBgGradient}>
                    <HeaderBackButton
                      onPress={() => {
                        controller.RESET();
                      }}
                      style={Theme.Styles.IconContainer}
                      tintColor={Theme.Colors.Icon}
                    />
                  </LinearGradient>
                ),
              headerRight: () =>
                I18nManager.isRTL && (
                  <LinearGradient
                    start={Theme.LinearGradientDirection.start}
                    end={Theme.LinearGradientDirection.end}
                    colors={Theme.Colors.GradientColorsLight}
                    style={Theme.Styles.BackButtonBgGradient}>
                    <HeaderBackButton
                      onPress={() => {
                        controller.RESET();
                      }}
                      style={Theme.Styles.IconContainer}
                      tintColor={Theme.Colors.Icon}
                    />
                  </LinearGradient>
                ),
            }}
          />
        )}
        <RequestStack.Screen
          name={REQUEST_ROUTES.RequestScreen}
          component={RequestScreen}
          options={{
            title: t('receiveCard'),
            headerLeft: () =>
              !I18nManager.isRTL && (
                <LinearGradient
                  start={Theme.LinearGradientDirection.start}
                  end={Theme.LinearGradientDirection.end}
                  colors={Theme.Colors.GradientColorsLight}
                  style={Theme.Styles.BackButtonBgGradient}>
                  <HeaderBackButton
                    onPress={() => {
                      controller.GOTO_HOME();
                    }}
                    style={Theme.Styles.IconContainer}
                    tintColor={Theme.Colors.Icon}
                  />
                </LinearGradient>
              ),
            headerRight: () =>
              I18nManager.isRTL && (
                <LinearGradient
                  start={Theme.LinearGradientDirection.start}
                  end={Theme.LinearGradientDirection.end}
                  colors={Theme.Colors.GradientColorsLight}
                  style={Theme.Styles.BackButtonBgGradient}>
                  <HeaderBackButton
                    onPress={() => {
                      controller.GOTO_HOME();
                    }}
                    style={Theme.Styles.IconContainer}
                    tintColor={Theme.Colors.Icon}
                  />
                </LinearGradient>
              ),
          }}
        />
      </RequestStack.Navigator>

      <ReceivedCardsModal
        isVisible={controller.isNavigatingToReceivedCards}
        controller={receivedCardsController}
        onDismiss={controller.DISMISS}
      />
      {controller.isAccepted && (
        <SquircleIconPopUpModal
          message={t('status.accepted.message')}
          onBackdropPress={controller.DISMISS}
          testId={'vcAcceptedPopUp'}
        />
      )}

      {controller.isRejected && (
        <Message
          title={t('status.rejected.title')}
          message={t('status.rejected.message')}
          onBackdropPress={controller.DISMISS}
        />
      )}

      {controller.errorStatusOverlay && (
        <SharingStatusModal
          isVisible={controller.errorStatusOverlay !== null}
          testId={'sharingErrorModal'}
          image={SvgImage.ErrorLogo()}
          title={controller.errorStatusOverlay.title}
          message={controller.errorStatusOverlay.message}
          gradientButtonTitle={t('common:ok')}
          onGradientButton={controller.RESET}
        />
      )}
    </React.Fragment>
  );
};
