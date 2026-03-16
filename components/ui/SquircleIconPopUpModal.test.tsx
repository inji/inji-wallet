import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {Dimensions} from 'react-native';
import {SquircleIconPopUpModal} from './SquircleIconPopUpModal';

jest.mock('./svg', () => ({
  SvgImage: {SuccessLogo: () => 'SuccessLogo'},
}));

describe('SquircleIconPopUpModal', () => {
  beforeEach(() => {
    jest.spyOn(Dimensions, 'get').mockReturnValue({
      width: 375,
      height: 667,
      scale: 2,
      fontScale: 2,
    } as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

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

  it('should call onBackdropPress when backdrop is pressed', () => {
    const onPress = jest.fn();
    const {getByLabelText} = render(
      <SquircleIconPopUpModal {...defaultProps} onBackdropPress={onPress} />,
    );
    fireEvent(getByLabelText('squircleModal'), 'touchStart');
    expect(onPress).toHaveBeenCalled();
  });

  it('should display the message text', () => {
    const {getByText} = render(<SquircleIconPopUpModal {...defaultProps} />);
    expect(getByText('Success!')).toBeTruthy();
  });
});
