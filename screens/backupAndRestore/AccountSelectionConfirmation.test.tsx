import React from 'react';
import {render} from '@testing-library/react-native';

jest.mock('../../components/ui/Modal', () => ({
  Modal: ({children, ...props}: any) => {
    const {View} = require('react-native');
    return (
      <View testID="modal" {...props}>
        {children}
      </View>
    );
  },
}));

jest.mock('../../components/ui/svg', () => ({
  SvgImage: {
    DataBackupIcon: () => 'DataBackupIcon',
    GoogleDriveIcon: () => 'GoogleDriveIcon',
    ICloudIcon: () => 'ICloudIcon',
  },
}));

jest.mock('../../shared/constants', () => ({
  isIOS: () => false,
  isAndroid: () => true,
  DRIVE_NAME_MATCHER: {},
}));

jest.mock('../../shared/commonUtil', () => ({
  __esModule: true,
  default: jest.fn(() => ({})),
  getDriveName: () => 'Google Drive',
}));

import {AccountSelectionConfirmation} from './AccountSelectionConfirmation';

describe('AccountSelectionConfirmation', () => {
  it('should render when visible', () => {
    const {toJSON} = render(
      <AccountSelectionConfirmation
        isVisible={true}
        onProceed={jest.fn()}
        goBack={jest.fn()}
      />,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
