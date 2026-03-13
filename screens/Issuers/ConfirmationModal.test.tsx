import React from 'react';
import {render} from '@testing-library/react-native';
import {CancelDownloadModal} from './ConfirmationModal';

describe('CancelDownloadModal', () => {
  const defaultProps = {
    visible: true,
    onCancel: jest.fn(),
    onConfirm: jest.fn(),
  };

  it('should match snapshot when visible', () => {
    const {toJSON} = render(<CancelDownloadModal {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot when not visible', () => {
    const {toJSON} = render(
      <CancelDownloadModal {...defaultProps} visible={false} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
