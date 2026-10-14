import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {RootStackParamList} from './index';
import {ScanStackParamList} from './routesConstants';

export type MainBottomTabParamList = {
  home: {activeTab?: number; openVcKey?: string} | undefined;
  share: undefined;
  history: undefined;
};

export type MainRouteProps = BottomTabScreenProps<
  MainBottomTabParamList & RootStackParamList
>;

export type HomeRouteProps = BottomTabScreenProps<
  MainBottomTabParamList & RootStackParamList,
  'home'
>;

export type ScanLayoutProps = BottomTabScreenProps<
  ScanStackParamList & MainBottomTabParamList
>;
