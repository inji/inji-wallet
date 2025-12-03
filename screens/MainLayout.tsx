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
import {isIOS} from '../shared/constants';
import {CopilotProvider} from 'react-native-copilot';
import {View} from 'react-native';
import {CopilotTooltip} from '../components/CopilotTooltip';
import {Copilot} from '../components/ui/Copilot';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from '@xstate/react';
import {selectAuthorizationRequest, selectIsLinkCode} from '../machines/app';
import {BOTTOM_TAB_ROUTES} from '../routes/routesConstants';

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
      stopOnOutsideClick
      androidStatusBarVisible
      tooltipComponent={CopilotTooltip}
      tooltipStyle={Theme.Styles.copilotStyle}
      stepNumberComponent={() => null}
      animated>
      <Navigator
        initialRouteName={mainRoutes[0].name}
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
                  style={focused ? Theme.Styles.bottomTabIconStyle : null}>
                  {route.name === 'home' ? (
                    focused ? (
                      <LinearGradient
                        colors={Theme.Colors.GradientColorsLight}
                        start={Theme.LinearGradientDirection.start}
                        end={Theme.LinearGradientDirection.end}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
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
                      order={2 + index}
                      targetStyle={Theme.Styles.tabBarIconCopilot}
                      children={
                        <>
                          {focused ? (
                            <LinearGradient
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: 10,
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
                      }
                    />
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
