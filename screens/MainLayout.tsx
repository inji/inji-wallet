import React, {useContext, useEffect} from 'react';
import {
  BottomTabNavigationOptions,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import {mainRoutes, share} from '../routes/main';
import {Theme} from '../components/ui/styleUtils';
import {useTranslation} from 'react-i18next';
import {Column} from '../components/ui';

import {GlobalContext} from '../shared/GlobalContext';
import {ScanEvents} from '../machines/bleShare/scan/scanMachine';
import testIDProps from '../shared/commonUtil';
import {SvgImage} from '../components/ui/svg';
import {COPILOT_ANDROID_STATUS_BAR_VISIBLE, isIOS} from '../shared/constants';
import {CopilotProvider} from 'react-native-copilot';
import {View} from 'react-native';
import {CopilotTooltip} from '../components/CopilotTooltip';
import {Copilot} from '../components/ui/Copilot';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from '@xstate/react';
import {selectAuthorizationRequest, selectIsLinkCode} from '../machines/app';
import {BOTTOM_TAB_ROUTES} from '../routes/routesConstants';
import {COPILOT_OVERLAY_PROPS, roundedSvgMaskPath} from '../shared/copilotMask';
import {RevampTabBar} from '../components/revamp/RevampTabBar';

const {Navigator, Screen} = createBottomTabNavigator();

export const MainLayout: React.FC = () => {
  const {t} = useTranslation('MainLayout');

  const {appService} = useContext(GlobalContext);
  const scanService = appService.children.get('scan');

  const options: BottomTabNavigationOptions = {
    tabBarShowLabel: true,
    tabBarActiveTintColor: Theme.Colors.IconBg,
    ...Theme.BottomTabBarStyle,
  };
  const navigation = useNavigation<ScanLayoutNavigation>();

  const linkCode = useSelector(appService, selectIsLinkCode);

  const authorizationRequest = useSelector(
    appService,
    selectAuthorizationRequest,
  );

  useEffect(() => {
    if (linkCode !== '' || authorizationRequest !== '') {
      navigation.navigate(BOTTOM_TAB_ROUTES.share);
    }
  }, [linkCode, authorizationRequest]);

  return (
    <CopilotProvider
      // Shared look of the overlay; first, so the props below always win.
      {...COPILOT_OVERLAY_PROPS}
      stopOnOutsideClick
      // Whether the status bar correction is needed depends on the Android version —
      // see COPILOT_ANDROID_STATUS_BAR_VISIBLE. Not a fixed true/false: either constant
      // is wrong on half the devices.
      androidStatusBarVisible={COPILOT_ANDROID_STATUS_BAR_VISIBLE}
      tooltipComponent={CopilotTooltip}
      tooltipStyle={Theme.Styles.copilotStyle}
      stepNumberComponent={() => null}
      svgMaskPath={roundedSvgMaskPath}
      animated>
      <Navigator
        initialRouteName={mainRoutes[0].name}
        tabBar={props => <RevampTabBar {...props} />}
        screenOptions={({route}) => ({
          tabBarAccessibilityLabel: route.name,
          ...options,
        })}>
        {mainRoutes.map((route, index) => (
          <Screen
            key={route.name}
            name={route.name}
            component={route.component}
            listeners={{
              tabPress: e => {
                if (route.name == share.name) {
                  scanService?.send(ScanEvents.RESET());
                }
              },
            }}
            options={{
              ...route.options,
              title: t(route.name),
              tabBarIcon: ({focused}) => (
                <Column
                  {...testIDProps(route.name + 'Icon')}
                  align="center"
                  crossAlign="center"
                  style={[
                    // bottomTabIconStyle used to apply here only `focused`, sizing the icon
                    // container off screen dimensions with its own padding — since Home is
                    // focused by default, that gave Home's container extra size/padding the
                    // other (unfocused) tabs didn't have. Dropped: the fixed 30x30 gradient
                    // box below already governs the active-state look on its own.
                    // Icon and label are separate siblings in the tab bar's own layout (the
                    // label is rendered by react-navigation, not here) — this is the icon's
                    // own container, so a bottom margin on it is what actually pushes the
                    // label down. A marginTop on tabBarLabelStyle (theme) had no visible effect.
                    {marginBottom: 5},
                  ]}>
                  {route.name === 'home' ? (
                    focused ? (
                      <LinearGradient
                        colors={Theme.Colors.GradientColorsLight}
                        start={Theme.LinearGradientDirection.start}
                        end={Theme.LinearGradientDirection.end}
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 8,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                        <View>{SvgImage[`${route.name}`](focused)}</View>
                      </LinearGradient>
                    ) : (
                      <View>{SvgImage[`${route.name}`](focused)}</View>
                    )
                  ) : (
                    <Copilot
                      title={t(`copilot:${route.name}Title`)}
                      description={t(`copilot:${route.name}Message`)}
                      // `home` (index 0) renders no Copilot, so the tab steps start at index 1
                      // and occupy 2..4, after the download FAB at 1.
                      order={1 + index}
                      targetStyle={Theme.Styles.tabBarIconCopilot}>
                      <>
                        {focused ? (
                          <LinearGradient
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: 8,
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                            colors={Theme.Colors.GradientColorsLight}
                            start={Theme.LinearGradientDirection.start}
                            end={Theme.LinearGradientDirection.end}>
                            {SvgImage[`${route.name}`](focused)}
                          </LinearGradient>
                        ) : (
                          <View>{SvgImage[`${route.name}`](focused)}</View>
                        )}
                      </>
                    </Copilot>
                  )}
                </Column>
              ),
              tabBarAccessibilityLabel: isIOS() ? t(route.name) : route.name,
              tabBarTestID: route.name,
            }}
          />
        ))}
      </Navigator>
    </CopilotProvider>
  );
};
