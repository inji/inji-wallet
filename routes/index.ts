import React from 'react';
import {
  NativeStackNavigationOptions,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import {AuthScreen} from '../screens/AuthScreen';
import {BiometricScreen} from '../screens/BiometricScreen';
import {WelcomeScreen} from '../screens/WelcomeScreen';
import {PasscodeScreen} from '../screens/PasscodeScreen';
import {MainLayout} from '../screens/MainLayout';
import {NotificationsScreen} from '../screens/NotificationsScreen';
import {SetupLanguageScreen} from '../screens/SetupLanguageScreen';
import {IntroSlidersScreen} from '../screens/Home/IntroSlidersScreen';
import {RequestLayout} from '../screens/Request/RequestLayout';
import {SplashScreen} from '../screens/SplashScreen';
import {RequestStackParamList} from './routesConstants';
import {KeyManagementScreen} from '../screens/Settings/KeyManagementScreen';
import AuthWebViewScreen from '../screens/AuthWebViewScreen';

export const baseRoutes: Screen[] = [
  {
    name: 'SplashScreen',
    component: SplashScreen,
    options: {
      headerShown: false,
    },
  },
  {
    name: 'KeyManagement',
    component: KeyManagementScreen,
    options: {
      headerShown: false,
    },
  },
  {
    name:'AuthView',
    component:AuthWebViewScreen,
    options:{
      headerShown:false,
    },
  },
  {
    name: 'Language',
    component: SetupLanguageScreen,
    options: {
      headerShown: false,
    },
  },
  {
    name: 'IntroSliders',
    component: IntroSlidersScreen,
    options: {
      headerShown: false,
    },
  },
  {
    name: 'Welcome',
    component: WelcomeScreen,
  },
  {
    name: 'Auth',
    component: AuthScreen,
  },
  {
    name: 'Passcode',
    component: PasscodeScreen,
  },
  {
    name: 'Biometric',
    component: BiometricScreen,
  },
  {
    name: 'Request',
    component: RequestLayout,
    options: {
      headerShown: false,
    },
  },
];

export const authRoutes: Screen[] = [
  {
    name: 'Main',
    component: MainLayout,
    options: {
      headerShown: false,
    },
  },
  {
    name: 'Notifications',
    component: NotificationsScreen,
  },
];

export type RootStackParamList = {
  Language: undefined;
  KeySetup: undefined;
  IntroSliders: undefined;
  Welcome: undefined;
  Auth: undefined;
  Passcode: {
    setup: boolean;
    message?: string;
  };
  Biometric: {
    setup: boolean;
  };
  Main: undefined;
  Notifications: undefined;
};

export interface Screen {
  name: string;
  component: React.FC<RootRouteProps>;
  options?: NativeStackNavigationOptions;
}

export type RootRouteProps = NativeStackScreenProps<RootStackParamList>;

export type PasscodeRouteProps = NativeStackScreenProps<
  RootStackParamList,
  'Passcode'
>;

export type BiometricRouteProps = NativeStackScreenProps<
  RootStackParamList,
  'Biometric'
>;

export type RequestRouteProps = NativeStackScreenProps<
  RequestStackParamList,
  'Request'
>;
