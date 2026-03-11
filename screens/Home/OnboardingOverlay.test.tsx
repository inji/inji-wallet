import React from 'react';
import {render} from '@testing-library/react-native';

jest.mock('react-native-app-intro-slider', () => {
  const React = require('react');
  const {View} = require('react-native');
  return React.forwardRef((props: any, ref: any) => (
    <View testID="appIntroSlider">
      {props.data?.map((item: any, i: number) => (
        <View key={item.key || i}>{props.renderItem?.({item})}</View>
      ))}
    </View>
  ));
});

jest.mock('react-native-elements', () => {
  const {View, TouchableOpacity, Text} = require('react-native');
  return {
    Icon: (props: any) => <View testID="icon" />,
    Overlay: ({children, ...props}: any) => (
      <View testID="overlay" {...props}>
        {children}
      </View>
    ),
    Button: (props: any) => (
      <TouchableOpacity testID={props.testID} onPress={props.onPress}>
        <Text>{props.title}</Text>
      </TouchableOpacity>
    ),
  };
});

jest.mock('../../shared/constants', () => ({
  isIOS: () => false,
  isAndroid: () => true,
}));

import {OnboardingOverlay} from './OnboardingOverlay';

describe('OnboardingOverlay', () => {
  it('should render when visible', () => {
    const {toJSON} = render(
      <OnboardingOverlay
        isVisible={true}
        onDone={jest.fn()}
        onAddVc={jest.fn()}
      />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render when not visible', () => {
    const {toJSON} = render(
      <OnboardingOverlay
        isVisible={false}
        onDone={jest.fn()}
        onAddVc={jest.fn()}
      />,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
