import {Dimensions, Image} from 'react-native';
import {RootRouteProps} from '../routes';
import React, {useEffect} from 'react';
import {APPLICATION_THEME} from 'react-native-dotenv';
import {Column} from '../components/ui';
import {Theme} from '../components/ui/styleUtils';
import {useAppLayout} from './AppLayoutController';
import CredIssuerWalletLogo from '../assets/images/png/CredIssuerWalletLogo.svg';

const isPurpleTheme = APPLICATION_THEME?.toLowerCase() === 'purple';

// The logo's own viewBox aspect ratio (width/height), used to size it without distortion.
const LOGO_ASPECT_RATIO = 209 / 174;
const LOGO_WIDTH = Dimensions.get('screen').width * 0.6;

export const SplashScreen: React.FC<RootRouteProps> = props => {
  const controller = useAppLayout();
  useEffect(() => {
    setTimeout(() => {
      if (controller.isLanguagesetup) {
        props.navigation.navigate('Language');
      } else if (controller.isUnAuthorized) {
        props.navigation.navigate('Welcome');
      }
    }, 3000);
  }, [controller.isAuthorized || controller.isLanguagesetup]);
  return (
    <Column
      crossAlign="center"
      style={{
        flex: 1,
        justifyContent: 'center',
        height: Dimensions.get('screen').height,
        width: Dimensions.get('screen').width,
        backgroundColor: Theme.Colors.whiteBackgroundColor,
      }}>
      {isPurpleTheme ? (
        <Image
          resizeMode="stretch"
          style={{width: 400, height: 450}}
          source={require('../assets/images/png/purpleSplashScreen.png')}
        />
      ) : (
        <CredIssuerWalletLogo
          width={LOGO_WIDTH}
          height={LOGO_WIDTH / LOGO_ASPECT_RATIO}
        />
      )}
    </Column>
  );
};
