import React from 'react';
import {render} from '@testing-library/react-native';
import {GetIdInputModal} from './GetIdInputModal';

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

jest.mock('./GetIdInputModalController', () => ({
  useGetIdInputModal: () => ({
    id: '',
    idError: '',
    idInputRef: null,
    isRequestingOtp: false,
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
  isIOS: () => false,
  isAndroid: () => true,
}));

jest.mock('../../../shared/commonUtil', () => jest.fn(() => ({})));

jest.mock('../../../shared/hooks/useScreenHeight', () => ({
  useScreenHeight: () => ({isSmallScreen: false, screenHeight: 800}),
}));

jest.mock('../../../components/ui/ToolTip', () => ({
  CustomTooltip: () => 'Tooltip',
}));

describe('GetIdInputModal', () => {
  const defaultProps = {
    isVisible: true,
    onDismiss: jest.fn(),
    service: {} as any,
    arrowLeft: true,
  };

  it('should match snapshot', () => {
    const {toJSON} = render(<GetIdInputModal {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot when not visible', () => {
    const {toJSON} = render(
      <GetIdInputModal {...defaultProps} isVisible={false} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
