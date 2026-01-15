import React from 'react';
import {Column, Text} from '../../components/ui';
import {Theme} from '../../components/ui/styleUtils';
import {useTranslation} from 'react-i18next';
import {View, Image, Platform} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const QRScannerComponent: React.FC = () => {
  const {t} = useTranslation('ScanScreen');

  return (
    <Column crossAlign="center">
      <Column style={Theme.CameraEnabledStyles.scannerContainer}>
        <View
          testID="qrScannerView"
          style={[
            Theme.CameraEnabledStyles.scannerContainer,
            Theme.IntroSliderStyles.quickAccessIntroQrScanner,
            {position: 'relative', overflow: 'visible'},
          ]}>
          <Image
            testID="qrScannerImage"
            source={require('../../assets/ClipPathGroup.png')}
            style={{
              width: '100%',
              height: '100%',
              resizeMode: 'cover',
            }}
          />
          <View
            style={{
              position: 'absolute',
              top: Theme.IntroSliderStyles.quickAccessIntroQrScanner.height / 4,
              left: -12,
              right: -12,
              zIndex: 2,
              overflow: 'visible',
            }}>
            <View
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 1,
                height: 5,
                borderRadius: 3,
                backgroundColor: Theme.Colors.linearGradientEnd + '26',
                ...Platform.select({
                  ios: {
                    shadowColor: Theme.Colors.linearGradientEnd,
                    shadowOpacity: 0.2,
                    shadowRadius: 3,
                    shadowOffset: {width: 0, height: 1},
                  },
                  android: {
                    elevation: 2,
                  },
                }),
              }}
            />
            <LinearGradient
              colors={[
                Theme.Colors.linearGradientStart,
                Theme.Colors.linearGradientEnd,
              ]}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                height: 3.5,
                borderRadius: 2,
              }}
            />
          </View>
        </View>
        <Column fill align="flex-start" style={{marginTop: 24}}>
          <Text
            testID="scanningGuideText"
            align="center"
            style={Theme.CameraEnabledStyles.holdPhoneSteadyText}>
            {t('scanningGuide')}
          </Text>
        </Column>
      </Column>
    </Column>
  );
};

export const StaticScanScreen: React.FC = () => {
  const {t} = useTranslation('ScanScreen');

  return (
    <View
      testID="staticScanScreen"
      style={Theme.IntroSliderStyles.quickAccessIntroOuterView}>
      <View
        testID="introScreenNotch"
        style={Theme.IntroSliderStyles.introScreenNotch}
      />
      <Column
        padding={[10, 25, 0, 32]}
        fill
        align="flex-start"
        style={Theme.IntroSliderStyles.quickAccessIntroOuterColumn}>
        <Column backgroundColor={Theme.Colors.whiteBackgroundColor}>
          <Text
            testID="shareText"
            align="left"
            style={{paddingBottom: 10, paddingLeft: 5, paddingTop: 10}}
            weight="bold"
            size="large"
            color={Theme.Colors.blackIcon}>
            {t('MainLayout:share') || 'Share'}
          </Text>
        </Column>
        <QRScannerComponent />
      </Column>
    </View>
  );
};
