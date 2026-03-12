import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {StatusInfoModal} from './StatusInfoModal';

jest.mock('../../ui/svg', () => ({
  SvgImage: {
    statusValidIcon: () => 'ValidIcon',
    statusPendingIcon: () => 'PendingIcon',
    statusExpiredIcon: () => 'ExpiredIcon',
    statusRevokedIcon: () => 'RevokedIcon',
  },
}));

jest.mock('./VCUtils', () => ({
  VC_STATUS_KEYS: ['valid', 'pending', 'expired', 'revoked'],
}));

jest.mock('../../../shared/commonUtil', () => ({
  __esModule: true,
  default: (id: string) => ({testID: id}),
}));

describe('StatusInfoModal', () => {
  const defaultProps = {
    isVisible: true,
    onClose: jest.fn(),
  };

  it('should match snapshot when visible', () => {
    const {toJSON} = render(<StatusInfoModal {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot when not visible', () => {
    const {toJSON} = render(
      <StatusInfoModal {...defaultProps} isVisible={false} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should call onClose when close button is pressed', () => {
    const onClose = jest.fn();
    const {getByTestId} = render(
      <StatusInfoModal isVisible={true} onClose={onClose} />,
    );
    fireEvent.press(getByTestId('closeStatusInfoModal'));
    expect(onClose).toHaveBeenCalled();
  });
});
