import React from 'react';
import {render} from '@testing-library/react-native';
import {FaceVerificationAlertOverlay} from './FaceVerificationAlertOverlay';

jest.mock('../../components/ui/svg', () => ({
  SvgImage: {
    ShareWithSelfie: () => 'ShareWithSelfie',
    CheckedIcon: () => 'CheckedIcon',
    UnCheckedIcon: () => 'UnCheckedIcon',
  },
}));

describe('FaceVerificationAlertOverlay', () => {
  const defaultProps = {
    isVisible: true,
    onConfirm: jest.fn(),
    close: jest.fn(),
  };

  it('should match snapshot when visible', () => {
    const {toJSON} = render(<FaceVerificationAlertOverlay {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot when not visible', () => {
    const {toJSON} = render(
      <FaceVerificationAlertOverlay {...defaultProps} isVisible={false} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with QR login variant', () => {
    const {toJSON} = render(
      <FaceVerificationAlertOverlay {...defaultProps} isQrLogin={true} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
