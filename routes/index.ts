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
import {SplashScreen} from '../screens/SplashScreen';
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
    name: 'AuthView',
    component: AuthWebViewScreen,
  },
  {
    name: 'Language',
    component: SetupLanguageScreen,
    options: {
      headerShown: false,
    },
  },
  {
    name: 'Welcome',
    component: WelcomeScreen,
    options: {
      headerShown: false,
    },
  },
  {
    name: 'Auth',
    component: AuthScreen,
    options: {
      headerShown: false,
    },
  },
  {
    name: 'Passcode',
    component: PasscodeScreen,
    options: {
      headerShown: false,
    },
  },
  {
    name: 'Biometric',
    component: BiometricScreen,
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
