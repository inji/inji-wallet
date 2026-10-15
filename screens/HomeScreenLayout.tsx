import {
  createNativeStackNavigator,
  NativeStackHeaderProps,
} from '@react-navigation/native-stack';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Row} from '../components/ui';
import {Header} from '../components/ui/Header';
import {Theme} from '../components/ui/styleUtils';
import {RootRouteProps} from '../routes';
import {HomeScreen} from './Home/HomeScreen';
import {IssuersScreen} from './Issuers/IssuersScreen';
import {SvgImage} from '../components/ui/svg';
import {View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

/**
 * The logo (an opaque white rect baked into CredIssuerHorizontalLogo.svg) relies on its
 * surroundings being opaque white — but headerLeft/headerRight render into
 * react-native-screens' native iOS header, and setting `headerStyle.backgroundColor` on that
 * header was confirmed (on-device, after a full rebuild) to still leave it translucent/blurred.
 * A plain JS View's backgroundColor is never subject to that native chrome, so this replaces
 * headerLeft/headerRight/headerStyle/headerTitle wholesale with one fully custom `header` render
 * function — same approach IssuersScreen already uses below — giving the logo an
 * actually-opaque backdrop to sit on, on both platforms.
 */
const HomeScreenHeader: React.FC = () => {
  const insets = useSafeAreaInsets();

  const logo = (
    <View style={Theme.Styles.injiHomeLogo}>
      {SvgImage.InjiLogo(Theme.Styles.injiLogo)}
    </View>
  );

  return (
    // A fully custom `header` opts out of every default native-stack header behaviour, not
    // just headerStyle — including headerShadowVisible's default separator under the bar, on
    // both Android and iOS. Theme.elevation(2) puts that separator back explicitly, the same
    // way Header.tsx (Issuers' own custom header, just below) already replaces it.
    <View
      style={[
        Theme.elevation(2),
        {
          borderRadius: 0,
          backgroundColor: Theme.Colors.whiteBackgroundColor,
          paddingTop: insets.top,
        },
      ]}>
      <Row
        crossAlign="center"
        align="space-between"
        style={{paddingHorizontal: 4, paddingVertical: 10}}>
        {logo}
      </Row>
    </View>
  );
};

export const HomeScreenLayout: React.FC<RootRouteProps> = () => {
  const {t} = useTranslation('IssuersScreen');
  const {Navigator, Screen} = createNativeStackNavigator();

  const HomeScreenOptions = {
    header: () => <HomeScreenHeader />,
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
