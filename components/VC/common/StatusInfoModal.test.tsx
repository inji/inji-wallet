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

  it('should render when visible', () => {
    const {getByTestId} = render(<StatusInfoModal {...defaultProps} />);
    expect(getByTestId('statusInfoModal')).toBeTruthy();
  });

  it('should not render when not visible', () => {
    const {getByTestId} = render(
      <StatusInfoModal {...defaultProps} isVisible={false} />,
    );
    expect(getByTestId('statusInfoModal').props.isVisible).toBe(false);
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
