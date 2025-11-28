import React from 'react';
import {BottomTabNavigationOptions} from '@react-navigation/bottom-tabs';
import {ScanLayout} from '../screens/Scan/ScanLayout';
import {HistoryScreen} from '../screens/History/HistoryScreen';
import i18n from '../i18n';
import {BOTTOM_TAB_ROUTES} from './routesConstants';
import {HomeScreenLayout} from '../screens/HomeScreenLayout';
import {Theme} from '../components/ui/styleUtils';
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
    headerTitleStyle: Theme.Styles.HistoryHeaderTitleStyle,
    title: i18n.t('MainLayout:history'),
  },
};

const settings: TabScreen = {
  name: BOTTOM_TAB_ROUTES.settings,
  component: SettingScreen,
  icon: 'settings',
  options: {
    headerTitleStyle: {
      fontSize: 26,
      fontFamily: 'Inter_600SemiBold',
      marginTop: 15,
    },
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
