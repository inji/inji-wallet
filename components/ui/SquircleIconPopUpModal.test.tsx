import React from 'react';
import {render} from '@testing-library/react-native';
import {SquircleIconPopUpModal} from './SquircleIconPopUpModal';

jest.mock('./svg', () => ({
  SvgImage: {SuccessLogo: () => 'SuccessLogo'},
}));

describe('SquircleIconPopUpModal', () => {
  const defaultProps = {
    message: 'Success!',
    testId: 'squircleModal',
  };

  it('should render with message', () => {
    const {toJSON} = render(<SquircleIconPopUpModal {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render without message', () => {
    const {toJSON} = render(
      <SquircleIconPopUpModal {...defaultProps} message="" />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should handle backdrop press', () => {
    const onPress = jest.fn();
    const {toJSON} = render(
      <SquircleIconPopUpModal {...defaultProps} onBackdropPress={onPress} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
