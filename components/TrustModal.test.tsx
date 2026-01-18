import React from 'react';
import {render} from '@testing-library/react-native';
import {TrustModal} from './TrustModal';

// Mock useTranslation hook
const mockT = jest.fn((key: string, options) => {
  if (key.endsWith('infoPoints')) {
    return ['Point 1', 'Point 2', 'Point 3'];
  }

  if (key === 'successfullyTrustedSubtitle') {
    return `Redirecting in ${options?.seconds} seconds…`;
  }

  return key;
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mockT,
    i18n: {changeLanguage: jest.fn()},
  }),
  // ✅ prevents i18next.use(initReactI18next) crash
  initReactI18next: {
    type: '3rdParty',
    init: jest.fn(),
  },
}));

// --------------------
// UI mock
// --------------------
jest.mock('./ui', () => ({
  Button: jest.fn(() => null),
}));

// --------------------
// React Native mock
// --------------------
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Modal: ({children}: any) => <>{children}</>,
    View: ({children}: any) => <>{children}</>,
    Image: jest.fn(() => null),
    Text: ({children}: any) => <>{children}</>,
  };
});

describe('TrustModal', () => {
  const baseProps = {
    isVisible: true,
    logo: 'https://example.com/logo.png',
    name: 'Test Issuer',
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  it('matches snapshot in idle state', () => {
    const {toJSON} = render(<TrustModal {...baseProps} consentStatus="idle" />);

    expect(toJSON()).toMatchSnapshot();
  });

  it('matches snapshot in loading state', () => {
    const {toJSON} = render(
      <TrustModal {...baseProps} consentStatus="loading" />,
    );

    expect(toJSON()).toMatchSnapshot();
  });

  it('matches snapshot in success state', () => {
    const {toJSON} = render(
      <TrustModal {...baseProps} consentStatus="success" />,
    );

    expect(toJSON()).toMatchSnapshot();
  });

  it('matches snapshot without logo', () => {
    const {toJSON} = render(
      <TrustModal {...baseProps} logo={undefined} consentStatus="idle" />,
    );

    expect(toJSON()).toMatchSnapshot();
  });

  it('matches snapshot without name', () => {
    const {toJSON} = render(
      <TrustModal {...baseProps} name="" consentStatus="idle" />,
    );

    expect(toJSON()).toMatchSnapshot();
  });

  it('matches snapshot without logo and name', () => {
    const {toJSON} = render(
      <TrustModal
        isVisible
        logo={undefined}
        name=""
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
        consentStatus="idle"
      />,
    );

    expect(toJSON()).toMatchSnapshot();
  });

  it('matches snapshot with long issuer name', () => {
    const {toJSON} = render(
      <TrustModal
        {...baseProps}
        name="Very Long Issuer Name That Should Wrap Properly"
        consentStatus="idle"
      />,
    );

    expect(toJSON()).toMatchSnapshot();
  });
});
