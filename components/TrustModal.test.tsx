import React from 'react';
import {render} from '@testing-library/react-native';
import {TrustModal} from './TrustModal';

// Mock useTranslation hook
const mockT = jest.fn((key: string) => {
  if (key === 'infoPoints' || key === 'verifierInfoPoints') {
    return ['Point 1', 'Point 2', 'Point 3'];
  }
  return key;
});

jest.mock('react-i18next', () => ({
  ...jest.requireActual('react-i18next'),
  useTranslation: () => ({
    t: mockT,
    i18n: {changeLanguage: jest.fn()},
  }),
}));

// Mock ui components
jest.mock('./ui', () => ({
  Button: jest.fn(() => null),
  Column: ({children}: {children: React.ReactNode}) => <>{children}</>,
  Row: ({children}: {children: React.ReactNode}) => <>{children}</>,
  Text: ({children}: {children: React.ReactNode}) => <>{children}</>,
}));

// Mock react-native components
jest.mock('react-native', () => {
  const ReactNative = jest.requireActual('react-native');
  return {
    ...ReactNative,
    Modal: ({children}: {children: React.ReactNode}) => <>{children}</>,
    View: ({children}: {children: React.ReactNode}) => <>{children}</>,
    ScrollView: ({children}: {children: React.ReactNode}) => <>{children}</>,
    Image: jest.fn(() => null),
  };
});

describe('TrustModal Component', () => {
  const defaultProps = {
    isVisible: true,
    logo: 'https://example.com/logo.png',
    name: 'Test Issuer',
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  it('should match snapshot with issuer flow', () => {
    const {toJSON} = render(<TrustModal {...defaultProps} flowType="issuer" />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with verifier flow', () => {
    const {toJSON} = render(
      <TrustModal {...defaultProps} flowType="verifier" />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot when not visible', () => {
    const {toJSON} = render(<TrustModal {...defaultProps} isVisible={false} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot without logo', () => {
    const {toJSON} = render(
      <TrustModal {...defaultProps} logo={undefined} flowType="issuer" />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot without name', () => {
    const {toJSON} = render(
      <TrustModal {...defaultProps} name={''} flowType="issuer" />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot without logo and name', () => {
    const {toJSON} = render(
      <TrustModal
        isVisible={true}
        logo={undefined}
        name={''}
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
        flowType="issuer"
      />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with long name', () => {
    const {toJSON} = render(
      <TrustModal
        {...defaultProps}
        name="Very Long Issuer Name That Should Wrap Properly"
        flowType="verifier"
      />,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
