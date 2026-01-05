import React, {useRef} from 'react';
import AppIntroSlider from 'react-native-app-intro-slider';
import {
  Dimensions,
  ImageBackground,
  StatusBar,
  View,
  ScrollView,
} from 'react-native';
import {Centered, Column, Row, Text, Button} from '../../components/ui';
import {Theme} from '../../components/ui/styleUtils';
import {useTranslation} from 'react-i18next';
import {RootRouteProps} from '../../routes';
import {useWelcomeScreen} from '../WelcomeScreenController';
import LinearGradient from 'react-native-linear-gradient';
import {SvgImage} from '../../components/ui/svg';
import testIDProps from '../../shared/commonUtil';
import {INTRO_SLIDER_LOGO_MARGIN} from '../../shared/constants';
import {StaticAuthScreen} from '../IntroSliders/biometricIntro';
import {StaticScanScreen} from '../IntroSliders/quickAccessIntro';
import StaticBackupAndRestoreScreen from '../IntroSliders/backupRestoreIntro';
import {StaticHomeScreen} from '../IntroSliders/trustedDigitalWalletIntro';
import {StaticSendVcScreen} from '../IntroSliders/secureShareIntro';

export const IntroSlidersScreen: React.FC<RootRouteProps> = props => {
  const slider = useRef<AppIntroSlider>();

  const {t} = useTranslation('OnboardingOverlay');
  const controller = useWelcomeScreen(props);

  // Define slides with React components
  const slides = [
    {
      key: 'one',
      title: t('stepOneTitle'),
      text: t('stepOneText'),
      component: <StaticAuthScreen />,
    },
    {
      key: 'two',
      title: t('stepTwoTitle'),
      text: t('stepTwoText'),
      component: <StaticSendVcScreen />,
    },
    {
      key: 'three',
      title: t('stepThreeTitle'),
      text: t('stepThreeText'),
      component: <StaticHomeScreen />,
    },
    {
      key: 'four',
      title: t('stepFourTitle'),
      text: t('stepFourText'),
      component: <StaticScanScreen />,
    },
    {
      key: 'five',
      title: t('stepFiveTitle'),
      text: t('stepFiveText'),
      component: <StaticBackupAndRestoreScreen />,
    },
  ];

  const isPasscodeSet = controller.isPasscodeSet();

  const renderItem = ({item}) => {
    return (
      <ImageBackground source={require('./IntroBg.png')}>
        <Centered>
          <Row align="space-between" style={Theme.Styles.introSliderHeader}>
            <Column style={{marginLeft: INTRO_SLIDER_LOGO_MARGIN}}>
              {SvgImage.InjiSmallLogo()}
            </Column>

            {item.key !== 'five' && (
              <Button
                testID={
                  isPasscodeSet
                    ? `backButton-${item.key}`
                    : `skipButton-${item.key}`
                }
                type="plain"
                title={isPasscodeSet ? t('back') : t('skip')}
                onPress={isPasscodeSet ? controller.BACK : controller.NEXT}
                styles={{height: 40, maxWidth: 115}}
                titleStyle={{color: '#FFFFFF', fontWeight: '600'}}
              />
            )}
          </Row>
          <View style={{width: 300, height: 600}}>
            <Centered fill>{item.component}</Centered>
          </View>
          <Column
            testID={`introSlide-${item.key}`}
            style={Theme.OnboardingOverlayStyles.bottomContainer}
            crossAlign="center"
            backgroundColor={Theme.Colors.whiteText}
            width={Dimensions.get('screen').width}>
            <Text
              testID={`introTitle-${item.key}`}
              style={{paddingTop: 3}}
              size={'large'}
              weight="semibold"
              margin="0 0 18 0">
              {item.title}
            </Text>
            <ScrollView
              style={{
                maxHeight: 60,
                width: '100%',
                paddingHorizontal: 10,
                marginBottom: 400,
              }}
              showsVerticalScrollIndicator={true}
              persistentScrollbar={true}>
              <Text
                testID={`introText-${item.key}`}
                style={{paddingTop: 7}}
                size="large"
                color={Theme.Colors.GrayText}>
                {item.text}
              </Text>
            </ScrollView>
          </Column>
        </Centered>
      </ImageBackground>
    );
  };

  const renderNextButton = () => {
    return (
      <View {...testIDProps('nextButton')}>
        <LinearGradient
          colors={Theme.Colors.gradientBtn}
          start={Theme.LinearGradientDirection.start}
          end={Theme.LinearGradientDirection.end}
          style={Theme.Styles.introSliderButton}>
          <Text
            testID="next"
            style={{paddingTop: 3}}
            weight="semibold"
            align="center"
            color="#FFFFFF"
            margin="15 0 0 0">
            {t('next')}
          </Text>
        </LinearGradient>
      </View>
    );
  };

  const renderDoneButton = () => {
    const isPasscodeSet = controller.isPasscodeSet();
    const testId = isPasscodeSet ? 'goBack' : 'getStarted';
    const buttonText = isPasscodeSet ? t('goBack') : t('getStarted');
    return (
      <View {...testIDProps(testId)}>
        <LinearGradient
          colors={Theme.Colors.gradientBtn}
          style={Theme.Styles.introSliderButton}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}>
          <Text
            style={{paddingTop: 3}}
            weight="semibold"
            align="center"
            color="#FFFFFF"
            margin="15 0 0 0">
            {buttonText}
          </Text>
        </LinearGradient>
      </View>
    );
  };

  return (
    <Column style={{flex: 1}}>
      <StatusBar translucent={true} backgroundColor="transparent" />
      <AppIntroSlider
        data={slides}
        renderDoneButton={renderDoneButton}
        renderNextButton={renderNextButton}
        bottomButton
        ref={slider}
        activeDotStyle={{
          backgroundColor: Theme.Colors.Icon,
          width: 30,
          marginBottom: 10,
        }}
        dotStyle={{backgroundColor: Theme.Colors.dotColor, marginBottom: 10}}
        renderItem={renderItem}
        onDone={() =>
          controller.isPasscodeSet() ? controller.BACK() : controller.NEXT()
        }
      />
    </Column>
  );
};
