import React from 'react';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import {
  NativeStackNavigationOptions,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import {authRoutes, baseRoutes} from '../routes';
import {useAppLayout} from './AppLayoutController';
import {StatusBar} from 'react-native';
import {GestureHandlerRootView} from "react-native-gesture-handler";

const {Navigator, Screen} = createNativeStackNavigator();
export const AppLayout: React.FC = () => {
  const navigationRef = useNavigationContainerRef();

  const controller = useAppLayout();
  const options: NativeStackNavigationOptions = {
    title: '',
    headerTitleAlign: 'center',
    headerShadowVisible: false,
    headerBackVisible: false,
  };

  return (
      <GestureHandlerRootView>
        <NavigationContainer ref={navigationRef}>
          <StatusBar animated={true} barStyle="dark-content" />
          <Navigator initialRouteName={baseRoutes[0].name} screenOptions={options}>
            {baseRoutes.map(route => (
              <Screen key={route.name} {...route} />
            ))}
            {controller.isAuthorized &&
              authRoutes.map(route => <Screen key={route.name} {...route} />)}
          </Navigator>
        </NavigationContainer>
      </GestureHandlerRootView>
  );
};
