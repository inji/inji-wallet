import React from 'react';
import {render} from '@testing-library/react-native';
import {DownloadingVcModal} from './DownloadingVcModal';

jest.mock('../../../components/ui/Modal', () => ({
  Modal: ({children, ...props}: any) => {
    const {View} = require('react-native');
    return (
      <View testID="modal" {...props}>
        {children}
      </View>
    );
  },
}));

describe('DownloadingVcModal', () => {
  const defaultProps = {
    isVisible: true,
    onDismiss: jest.fn(),
  };

  it('should match snapshot when visible', () => {
    const {toJSON} = render(<DownloadingVcModal {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot when not visible', () => {
    const {toJSON} = render(
      <DownloadingVcModal {...defaultProps} isVisible={false} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
