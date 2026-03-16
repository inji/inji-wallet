import React from 'react';
import {render} from '@testing-library/react-native';
import {IdInputModal} from './IdInputModal';

jest.mock('../../../components/ui/Modal', () => ({
  Modal: ({children, ...props}: any) => {
    const {View} = require('react-native');
    return (
      <View testID="modal" {...props}>
        {children}
      </View>
    );
  },
}));

jest.mock('./IdInputModalController', () => ({
  useIdInputModal: () => ({
    id: '',
    idType: 'UIN',
    idError: '',
    idInputRef: null,
    isRequestingOtp: false,
    SET_INDIVIDUAL_ID: jest.fn(),
    SELECT_ID_TYPE: jest.fn(),
    INPUT_ID: jest.fn(),
    VALIDATE_INPUT: jest.fn(),
    READY: jest.fn(),
  }),
}));

jest.mock('../../../components/MessageOverlay', () => ({
  MessageOverlay: (props: any) => {
    const {View} = require('react-native');
    return props.isVisible ? <View testID="messageOverlay" /> : null;
  },
}));

jest.mock('../../../shared/constants', () => ({
  individualId: {id: '', idType: 'UIN'},
  isIOS: () => false,
  isAndroid: () => true,
  GET_INDIVIDUAL_ID: jest.fn(),
}));

jest.mock('../../../shared/commonUtil', () => jest.fn(() => ({})));

jest.mock('../../../shared/hooks/useScreenHeight', () => ({
  useScreenHeight: () => ({isSmallScreen: false, screenHeight: 800}),
}));

jest.mock('../../../components/ui/ToolTip', () => ({
  CustomTooltip: () => 'Tooltip',
}));

jest.mock('@react-native-picker/picker', () => {
  const React = require('react');
  const Picker = (props: any) =>
    React.createElement('View', props, props.children);
  Picker.Item = (props: any) => React.createElement('View', props);
  return {Picker};
});

describe('IdInputModal', () => {
  const defaultProps = {
    isVisible: true,
    onDismiss: jest.fn(),
    service: {} as any,
    onPress: jest.fn(),
  };

  it('should match snapshot', () => {
    const {toJSON} = render(<IdInputModal {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot when not visible', () => {
    const {toJSON} = render(
      <IdInputModal {...defaultProps} isVisible={false} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
