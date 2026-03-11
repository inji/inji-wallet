import React from 'react';
import {render} from '@testing-library/react-native';
import {BindingVcWarningOverlay} from './BindingVcWarningOverlay';

jest.mock('../../../components/ui/svg', () => ({
  SvgImage: {
    WarningLogo: () => 'WarningLogo',
  },
}));

describe('BindingVcWarningOverlay', () => {
  const defaultProps = {
    isVisible: true,
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  it('should match snapshot when visible', () => {
    const {toJSON} = render(<BindingVcWarningOverlay {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot when not visible', () => {
    const {toJSON} = render(
      <BindingVcWarningOverlay {...defaultProps} isVisible={false} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
