import {t} from 'xstate';
import {MainBottomTabParamList} from './routeTypes';

export const BOTTOM_TAB_ROUTES = {
  home: 'home' as keyof MainBottomTabParamList,
  share: 'share' as keyof MainBottomTabParamList,
  history: 'history' as keyof MainBottomTabParamList,
  settings: 'settings' as keyof MainBottomTabParamList,
};

export const SCAN_ROUTES = {
  ScanScreen: 'ScanScreen' as keyof ScanStackParamList,
  SendVcScreen: 'SendVcScreen' as keyof ScanStackParamList,
  SendVPScreen: 'SendVPScreen' as keyof ScanStackParamList,
};

export const AUTH_ROUTES = {
  AuthView: 'AuthView' as keyof AuthStackParamList,
};

export type ScanStackParamList = {
  ScanScreen: undefined;
  SendVcScreen: undefined;
  SendVPScreen: undefined;
};

export type AuthStackParamList = {
  authorizationEndpoint: string;
  clientId: string;
  redirectUri: string;
};
