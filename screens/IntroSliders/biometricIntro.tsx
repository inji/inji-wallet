import React from 'react';
import {useTranslation} from 'react-i18next';
import {Column, Text, Button} from '../../components/ui';
import {Theme} from '../../components/ui/styleUtils';
import {SvgImage} from '../../components/ui/svg';
import {View, ScrollView} from 'react-native';

export const StaticAuthScreen: React.FC = () => {
  const {t} = useTranslation('AuthScreen');

  return (
    <Column
      fill
      padding={[0, 5, 0, 5]}
      backgroundColor={Theme.Colors.whiteBackgroundColor}
      style={Theme.IntroSliderStyles.biometricIntroOuterColumn}>
      <View
        testID="notchView"
        style={Theme.IntroSliderStyles.biometricIntroNotch}></View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{flexGrow: 1}}>
        <Column
          align="space-between"
          fill
          padding={[0, 20, 0, 20]}
          backgroundColor={Theme.Colors.whiteBackgroundColor}
          style={{
            borderRadius: 30,
            overflow: 'hidden',
          }}>
          <Column crossAlign="center">
            {SvgImage.fingerprintIcon(66)}
            <Column margin="30 0 0 0">
              <Text
                testID="header"
                style={Theme.TextStyles.header}
                align="center">
                {t('header')}
              </Text>
              <Text
                testID="description"
                align="center"
                weight="semibold"
                color={Theme.Colors.GrayText}
                margin="6 0">
                {t('Description')}
              </Text>
              <Text
                testID="passwordTypeDescription"
                align="center"
                weight="semibold"
                color={Theme.Colors.GrayText}
                margin="6 0">
                {t('PasswordTypeDescription')}
              </Text>
            </Column>
          </Column>
          <View testID="spacerView" style={{height: 100}}></View>
          <Column>
            <Button
              testID="useBiometricsButton"
              title={t('useBiometrics')}
              type="gradient"
              margin="0 0 8 0"
              onPress={() => {}}
            />
            <Button
              testID="usePasscodeButton"
              type="clear"
              title={t('usePasscode')}
              disabled={false}
              onPress={() => {}}
            />
          </Column>
          {/* height increased to enable force scroll */}
          <View testID="footerSpacerView" style={{height: 200}}></View>
        </Column>
      </ScrollView>
    </Column>
  );
};
