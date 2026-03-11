import React from 'react';
import {render} from '@testing-library/react-native';
import {SharingStatusModal} from './SharingStatusModal';

jest.mock('../../components/ui/Modal', () => ({
  Modal: ({children, ...props}: any) => {
    const {View} = require('react-native');
    return (
      <View testID="modal" {...props}>
        {children}
      </View>
    );
  },
}));

jest.mock('../../components/ui/svg', () => ({
  SvgImage: {
    SuccessHomeIcon: () => 'SuccessHomeIcon',
    SuccessHistoryIcon: () => 'SuccessHistoryIcon',
  },
}));

jest.mock('../../shared/commonUtil', () => jest.fn(() => ({})));

jest.mock('../../shared/constants', () => ({
  isIOS: () => false,
  isAndroid: () => true,
}));

const RealDate = global.Date;
const FIXED_DATE = new RealDate('2025-01-15T12:30:00');

beforeEach(() => {
  const MockDate = function (...args: any[]) {
    if (args.length === 0) return FIXED_DATE;
    return new RealDate(...args);
  } as any;
  MockDate.now = RealDate.now;
  MockDate.parse = RealDate.parse;
  MockDate.UTC = RealDate.UTC;
  MockDate.prototype = RealDate.prototype;
  global.Date = MockDate;
});

afterEach(() => {
  global.Date = RealDate;
});

describe('SharingStatusModal', () => {
  const defaultProps = {
    isVisible: true,
    testId: 'sharingStatus',
    title: 'Shared Successfully',
    message: 'Your credential has been shared',
    image: React.createElement('View', {testID: 'statusImage'}),
    goToHome: jest.fn(),
    goToHistory: jest.fn(),
  };

  it('should match snapshot with home and history buttons', () => {
    const {toJSON} = render(
      <SharingStatusModal
        {...defaultProps}
        buttonStatus="homeAndHistoryIcons"
      />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with no buttons', () => {
    const {toJSON} = render(
      <SharingStatusModal {...defaultProps} buttonStatus="none" />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with gradient and clear buttons', () => {
    const {toJSON} = render(
      <SharingStatusModal
        {...defaultProps}
        gradientButtonTitle="Retry"
        clearButtonTitle="Home"
        onGradientButton={jest.fn()}
        onClearButton={jest.fn()}
      />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with verifier info', () => {
    const {toJSON} = render(
      <SharingStatusModal
        {...defaultProps}
        verifierName="Test Verifier"
        buttonStatus="homeAndHistoryIcons"
      />,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
