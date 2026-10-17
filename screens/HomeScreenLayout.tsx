import {
  createNativeStackNavigator,
  NativeStackHeaderProps,
} from '@react-navigation/native-stack';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Header} from '../components/ui/Header';
import {RootRouteProps} from '../routes';
import {HomeScreen} from './Home/HomeScreen';
import {IssuersScreen} from './Issuers/IssuersScreen';

export const HomeScreenLayout: React.FC<RootRouteProps> = () => {
  const {t} = useTranslation('IssuersScreen');
  const {Navigator, Screen} = createNativeStackNavigator();

  // The home screen draws its own header (WalletHeader) as part of the page.
  const HomeScreenOptions = {
    headerShown: false,
  };

  return (
    <Navigator>
      <Screen
        key={'HomeScreen'}
        name={'HomeScreen'}
        component={HomeScreen}
        options={HomeScreenOptions}
      />
      <Screen
        key={'Issuers'}
        name={'IssuersScreen'}
        component={IssuersScreen}
        options={{
          header: ({navigation}: NativeStackHeaderProps) => (
            <Header
              goBack={navigation.goBack}
              title={t('title')}
              testID="issuersScreenHeader"
            />
          ),
        }}
      />
    </Navigator>
  );
};
