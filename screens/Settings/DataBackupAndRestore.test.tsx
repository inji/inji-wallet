import React from 'react';
import {render} from '@testing-library/react-native';

jest.mock('react-native-elements', () => {
  const {View} = require('react-native');
  const MockListItem = (props: any) => <View {...props}>{props.children}</View>;
  MockListItem.Content = (props: any) => (
    <View {...props}>{props.children}</View>
  );
  MockListItem.Title = (props: any) => <View {...props}>{props.children}</View>;
  return {
    Icon: (props: any) => <View testID="icon" />,
    ListItem: MockListItem,
  };
});

jest.mock('../backupAndRestore/BackupAndRestoreSetupController', () => ({
  useBackupAndRestoreSetup: () => ({
    showAccountSelectionConfirmation: false,
    isLoading: false,
    isSigningInSuccessful: false,
    isSigningIn: false,
    isSigningInFailed: false,
    isCloudSignInFailed: false,
    isNetworkError: false,
    profileInfo: null,
    shouldTriggerAutoBackup: false,
    BACKUP_AND_RESTORE: jest.fn(),
    RECONFIGURE_ACCOUNT: jest.fn(),
    OPEN_SETTINGS: jest.fn(),
    GO_BACK: jest.fn(),
    PROCEED_ACCOUNT_SELECTION: jest.fn(),
    TRY_AGAIN: jest.fn(),
    DISMISS: jest.fn(),
  }),
}));

jest.mock('../backupAndRestore/BackupAndRestoreScreen', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../backupAndRestore/AccountSelectionConfirmation', () => ({
  AccountSelectionConfirmation: () => null,
}));

jest.mock('../../components/ui/Error', () => ({
  ErrorView: () => null,
}));

jest.mock('../../components/ui/Loader', () => ({
  Loader: () => null,
}));

jest.mock('../../components/ui/svg', () => ({
  SvgImage: {
    backUpAndRestoreIcon: () => 'backUpAndRestoreIcon',
    PermissionDenied: () => 'PermissionDenied',
    NoInternetConnection: () => 'NoInternetConnection',
  },
}));

jest.mock('../../shared/commonUtil', () => {
  const fn = jest.fn(() => ({}));
  fn.getDriveName = () => 'Google Drive';
  return {__esModule: true, default: fn, getDriveName: () => 'Google Drive'};
});

jest.mock('../../shared/hooks/useOverlayVisibleAfterTimeout', () => ({
  useOverlayVisibleAfterTimeout: (val: any) => val,
}));

jest.mock('../../shared/constants', () => ({
  isIOS: () => false,
  isAndroid: () => true,
}));

import {DataBackupAndRestore} from './DataBackupAndRestore';

describe('DataBackupAndRestore', () => {
  it('should render backup and restore option', () => {
    const {toJSON} = render(<DataBackupAndRestore />);
    expect(toJSON()).toMatchSnapshot();
  });
});
