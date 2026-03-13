import React from 'react';
import {render} from '@testing-library/react-native';
import {RemoveVcWarningOverlay} from './RemoveVcWarningOverlay';

jest.mock('../../../components/ui/svg', () => ({
  SvgImage: {
    WarningLogo: () => 'WarningLogo',
  },
}));

jest.mock('../../../components/KebabPopUpController', () => ({
  useKebabPopUp: () => ({
    isRemoveWalletWarning: true,
    CONFIRM: jest.fn(),
    CANCEL: jest.fn(),
  }),
}));

describe('RemoveVcWarningOverlay', () => {
  const defaultProps = {
    testID: 'removeVcWarning',
    service: {} as any,
    vcMetadata: {} as any,
  };

  it('should match snapshot when visible', () => {
    const {toJSON} = render(<RemoveVcWarningOverlay {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });
});
