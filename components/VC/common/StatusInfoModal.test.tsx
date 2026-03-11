import React from 'react';
import {render} from '@testing-library/react-native';
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

jest.mock('../../../shared/commonUtil', () => jest.fn(() => ({})));

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
});
