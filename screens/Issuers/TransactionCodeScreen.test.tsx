import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';

jest.mock('react-native-elements', () => {
  const {
    View,
    TouchableOpacity,
    Text: RNText,
    TextInput,
  } = require('react-native');
  return {
    Icon: (props: any) => (
      <TouchableOpacity testID="icon" onPress={props.onPress}>
        <View />
      </TouchableOpacity>
    ),
    Input: (props: any) => (
      <View testID="input">
        <TextInput
          testID="textInput"
          value={props.value}
          onChangeText={props.onChangeText}
          placeholder={props.placeholder}
          secureTextEntry={props.secureTextEntry}
        />
      </View>
    ),
    Button: (props: any) => (
      <TouchableOpacity testID={props.testID} onPress={props.onPress}>
        <RNText>{props.title}</RNText>
      </TouchableOpacity>
    ),
  };
});

jest.mock('../../components/ui/svg', () => ({
  SvgImage: {OtpVerificationIcon: () => 'OtpVerificationIcon'},
}));
jest.mock('../../shared/constants', () => ({
  isIOS: () => false,
  isAndroid: () => true,
}));
jest.mock('../../shared/hooks/useScreenHeight', () => ({
  useScreenHeight: () => ({isSmallScreen: false, screenHeight: 800}),
}));
jest.mock('../../components/PinInput', () => ({
  PinInput: (props: any) => {
    const {View} = require('react-native');
    return <View testID={props.testID} />;
  },
}));
jest.mock('../../components/ui/Modal', () => ({
  Modal: (props: any) => {
    const {View} = require('react-native');
    return props.isVisible ? (
      <View testID="modal">{props.children}</View>
    ) : null;
  },
}));
jest.mock('./ConfirmationModal', () => ({CancelDownloadModal: () => null}));

import {TransactionCodeModal} from './TransactionCodeScreen';

describe('TransactionCodeModal', () => {
  const defaultProps = {
    visible: true,
    onDismiss: jest.fn(),
    onVerify: jest.fn(),
    inputMode: 'numeric' as const,
    length: 4,
  };

  it('should render with PinInput for numeric mode with length <= 6', () => {
    const {toJSON} = render(<TransactionCodeModal {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render with text Input for text mode', () => {
    const {toJSON} = render(
      <TransactionCodeModal {...defaultProps} inputMode="text" length={10} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should not render when not visible', () => {
    const {toJSON} = render(
      <TransactionCodeModal {...defaultProps} visible={false} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render with error prop', () => {
    const {toJSON} = render(
      <TransactionCodeModal {...defaultProps} error="Invalid code" />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render with description', () => {
    const {toJSON} = render(
      <TransactionCodeModal
        {...defaultProps}
        description="Enter the transaction code"
      />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render numeric mode with length > 6 as text input', () => {
    const {toJSON} = render(
      <TransactionCodeModal {...defaultProps} inputMode="numeric" length={8} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
