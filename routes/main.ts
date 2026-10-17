import React from 'react';
import {BottomTabNavigationOptions} from '@react-navigation/bottom-tabs';
import {ScanLayout} from '../screens/Scan/ScanLayout';
import {HistoryScreen} from '../screens/History/HistoryScreen';
import i18n from '../i18n';
import {BOTTOM_TAB_ROUTES} from './routesConstants';
import {HomeScreenLayout} from '../screens/HomeScreenLayout';
import {SettingScreen} from '../screens/Settings/SettingScreen';

const home: TabScreen = {
  name: BOTTOM_TAB_ROUTES.home,
  component: HomeScreenLayout,
  icon: 'home',
  options: {
    headerTitle: '',
    headerShown: false,
  },
};
export const share: TabScreen = {
  name: BOTTOM_TAB_ROUTES.share,
  component: ScanLayout,
  icon: 'qr-code-scanner',
  options: {
    title: i18n.t('MainLayout:share'),
    headerShown: false,
  },
};

const history: TabScreen = {
  name: BOTTOM_TAB_ROUTES.history,
  component: HistoryScreen,
  icon: 'history',
  options: {
    title: i18n.t('MainLayout:history'),
    headerShown: false,
  },
};

const settings: TabScreen = {
  name: BOTTOM_TAB_ROUTES.settings,
  component: SettingScreen,
  icon: 'settings',
  options: {
    headerShown: false,
    title: i18n.t('MainLayout:settings'),
  },
};

export const mainRoutes: TabScreen[] = [];
mainRoutes.push(home);
mainRoutes.push(share);
mainRoutes.push(history);
mainRoutes.push(settings);

export interface TabScreen {
  name: string;
  icon: string;
  component: React.FC;
  options?: BottomTabNavigationOptions;
}
