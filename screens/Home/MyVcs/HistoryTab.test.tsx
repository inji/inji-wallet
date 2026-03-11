import React from 'react';
import {render} from '@testing-library/react-native';
import {HistoryTab} from './HistoryTab';

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

jest.mock('../../../components/KebabPopUpController', () => ({
  useKebabPopUp: () => ({
    isShowActivities: true,
    activities: [
      {
        _vcKey: 'test-vc-key',
        timestamp: 1234567890,
        deviceName: 'TestDevice',
        type: 'shared',
      },
    ],
    DISMISS: jest.fn(),
  }),
}));

jest.mock('../../../shared/VCMetadata', () => ({
  VCMetadata: {
    fromVC: () => ({
      getVcKey: () => 'test-vc-key',
    }),
  },
}));

jest.mock('../../../components/ActivityLogText', () => ({
  ActivityLogText: (props: any) => {
    const {Text} = require('react-native');
    return <Text>ActivityLog</Text>;
  },
}));

describe('HistoryTab', () => {
  const defaultProps = {
    service: {} as any,
    vcMetadata: {id: 'test-id'} as any,
  };

  it('should match snapshot with activities', () => {
    const {toJSON} = render(<HistoryTab {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });
});
