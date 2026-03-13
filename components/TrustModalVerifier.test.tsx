import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';

jest.mock('./ui/AdaptiveImage', () => ({
  AdaptiveImage: (props: any) => null,
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => {
      if (opts && opts.returnObjects) {
        return ['Point 1', 'Point 2', 'Point 3'];
      }
      return key;
    },
    i18n: {changeLanguage: () => new Promise(() => {})},
  }),
  initReactI18next: {type: '3rdParty', init: () => {}},
}));

import {TrustModalVerifier} from './TrustModalVerifier';

describe('TrustModalVerifier', () => {
  const defaultProps = {
    isVisible: true,
    logo: 'https://example.com/logo.png',
    name: 'Test Issuer',
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  it('should match snapshot with issuer flowType', () => {
    const {toJSON} = render(<TrustModalVerifier {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with verifier flowType', () => {
    const {toJSON} = render(
      <TrustModalVerifier {...defaultProps} flowType="verifier" />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot without logo', () => {
    const {toJSON} = render(
      <TrustModalVerifier {...defaultProps} logo={null} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot without name', () => {
    const {toJSON} = render(<TrustModalVerifier {...defaultProps} name="" />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot when not visible', () => {
    const {toJSON} = render(
      <TrustModalVerifier {...defaultProps} isVisible={false} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should call onConfirm when confirm button is pressed', () => {
    const onConfirm = jest.fn();
    const {getByText} = render(
      <TrustModalVerifier {...defaultProps} onConfirm={onConfirm} />,
    );
    fireEvent.press(getByText('confirm'));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('should call onCancel when cancel button is pressed', () => {
    const onCancel = jest.fn();
    const {getByText} = render(
      <TrustModalVerifier {...defaultProps} onCancel={onCancel} />,
    );
    fireEvent.press(getByText('cancel'));
    expect(onCancel).toHaveBeenCalled();
  });
});
