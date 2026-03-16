import React from 'react';
import {render} from '@testing-library/react-native';

jest.mock('./BackupController', () => ({
  useBackupScreen: () => ({
    isBackupInProgress: false,
    isLoadingBackupDetails: false,
    lastBackupDetails: null,
    LAST_BACKUP_DETAILS: jest.fn(),
    DATA_BACKUP: jest.fn(),
  }),
}));

jest.mock('../Settings/BackupRestoreController', () => ({
  useBackupRestoreScreen: () => ({
    isBackUpRestoring: false,
    BACKUP_RESTORE: jest.fn(),
  }),
}));

jest.mock('react-native-elements', () => {
  const {View, TouchableOpacity, Text: RNText} = require('react-native');
  return {
    Icon: () => <View testID="icon" />,
    Button: (props: any) => (
      <TouchableOpacity testID={props.testID} onPress={props.onPress}>
        <RNText>{props.title}</RNText>
      </TouchableOpacity>
    ),
  };
});

jest.mock('../../components/AccountInformation', () => ({
  AccountInformation: () => null,
}));
jest.mock('../../components/SectionLayout', () => ({
  SectionLayout: (props: any) => {
    const {View} = require('react-native');
    return <View testID={props.testId}>{props.children}</View>;
  },
}));
jest.mock('../../components/ui/LoaderAnimation', () => ({
  LoaderAnimation: () => null,
}));
jest.mock('../../components/ui/Modal', () => ({
  Modal: (props: any) => {
    const {View} = require('react-native');
    return props.isVisible ? (
      <View testID={props.testID}>{props.children}</View>
    ) : null;
  },
}));
jest.mock('../../components/ui/Timestamp', () => ({Timestamp: () => null}));
jest.mock('../../components/ui/svg', () => ({
  SvgImage: {
    backUpAndRestoreIcon: () => 'BackupIcon',
    ICloudIcon: () => 'ICloudIcon',
    GoogleDriveIconSmall: () => 'GoogleDriveIcon',
    restoreIcon: () => 'RestoreIcon',
  },
}));
jest.mock('../../components/BannerNotificationContainer', () => ({
  BannerNotificationContainer: () => null,
}));
jest.mock('../../shared/commonUtil', () => ({
  __esModule: true,
  default: jest.fn(() => ({})),
  getAccountType: jest.fn(() => 'Google'),
  getDriveName: jest.fn(() => 'Google Drive'),
}));
jest.mock('../../components/HelpScreen', () => ({HelpScreen: () => null}));
jest.mock('../../shared/constants', () => ({
  isIOS: () => false,
  isAndroid: () => true,
}));
jest.mock('../../components/ui/HelpIcon', () => ({HelpIcon: () => null}));

import BackupAndRestoreScreen from './BackupAndRestoreScreen';

describe('BackupAndRestoreScreen', () => {
  const defaultProps = {
    isSigningIn: false,
    profileInfo: {email: 'test@test.com', picture: ''},
    onBackPress: jest.fn(),
    shouldTriggerAutoBackup: false,
  };

  it('should render default state', () => {
    const {toJSON} = render(<BackupAndRestoreScreen {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render loading state when signing in', () => {
    const {toJSON} = render(
      <BackupAndRestoreScreen {...defaultProps} isSigningIn={true} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
