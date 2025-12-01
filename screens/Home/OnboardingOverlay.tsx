import React, {useRef} from 'react';
import AppIntroSlider from 'react-native-app-intro-slider';
import { ScrollView, View} from 'react-native';
import {Icon, Overlay} from 'react-native-elements';
import {Button, Column, Text} from '../../components/ui';
import {Theme} from '../../components/ui/styleUtils';
import {useTranslation} from 'react-i18next';
import {SafeAreaView} from "react-native-safe-area-context";

export const OnboardingOverlay: React.FC<OnboardingProps> = props => {
  const slider = useRef<AppIntroSlider>();

  const {t} = useTranslation('OnboardingOverlay');

  const slides = [
    {
      key: 'one',
      title: t('stepOneTitle'),
      text: t('stepOneText'),
    },
    {
      key: 'two',
      title: t('stepTwoTitle'),
      text: t('stepTwoText'),
    },
    {
      key: 'three',
      title: t('stepThreeTitle'),
      text: t('stepThreeText'),
      footer: (
        <Button
          margin="24 0 0 0"
          raised
          type="outline"
          title={t('stepThreeButton')}
          onPress={props.onAddVc}
        />
      ),
    },
  ];

  const renderItem = ({item}) => {
    return (
      <View style={Theme.OnboardingOverlayStyles.slide}>
          <ScrollView showsVerticalScrollIndicator={true}>
            <Text style={Theme.OnboardingOverlayStyles.sliderTitle}>
              {item.title}
            </Text>
            <Text style={Theme.OnboardingOverlayStyles.text}>{item.text}</Text>
            {item.footer}
          </ScrollView>
      </View>
    );
  };

  const renderPagination = (activeIndex: number) => {
    return (
      <View style={Theme.OnboardingOverlayStyles.paginationContainer}>
        <SafeAreaView>
          <View style={Theme.OnboardingOverlayStyles.paginationDots}>
            {slides.length > 1 &&
              slides.map((_, i) => (
                <Icon
                  key={i}
                  color={Theme.Colors.OnboardingCircleIcon}
                  size={10}
                  name="circle"
                  style={{opacity: i === activeIndex ? 1 : 0.6, margin: 2}}
                />
              ))}
          </View>
        </SafeAreaView>
      </View>
    );
  };

  return (
    <Overlay
      isVisible={props.isVisible}
      overlayStyle={Theme.OnboardingOverlayStyles.overlay}
      transparent
      onBackdropPress={props.onDone}>
      <Column fill align="flex-end">
        <Icon
          name="close"
          color={Theme.Colors.OnboardingCloseIcon}
          onPress={props.onDone}
          containerStyle={Theme.OnboardingOverlayStyles.closeIcon}
        />
        <View style={Theme.OnboardingOverlayStyles.slider}>
          <AppIntroSlider
            renderItem={renderItem}
            data={slides}
            style={Theme.OnboardingOverlayStyles.appSlider}
            ref={slider}
            renderPagination={renderPagination}
          />
        </View>
      </Column>
    </Overlay>
  );
};

interface OnboardingProps {
  isVisible: boolean;
  onDone: () => void;
  onAddVc: () => void;
}
