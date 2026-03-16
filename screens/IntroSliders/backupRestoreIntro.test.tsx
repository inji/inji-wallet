import React from 'react';
import {render} from '@testing-library/react-native';

jest.mock('../../components/AccountInformation', () => ({
  AccountInformation: () => null,
}));

jest.mock('../../components/SectionLayout', () => ({
  SectionLayout: ({children}: any) => {
    const {View} = require('react-native');
    return <View testID="sectionLayout">{children}</View>;
  },
}));

jest.mock('../../components/ui/svg', () => ({
  SvgImage: {
    DataBackupIcon: () => 'DataBackupIcon',
    CloudUploadDoneIcon: () => 'CloudUploadDoneIcon',
    CloudUploadIcon: () => 'CloudUploadIcon',
    LastBackupIcon: () => 'LastBackupIcon',
    GoogleDriveIcon: () => 'GoogleDriveIcon',
    ICloudIcon: () => 'ICloudIcon',
    backUpAndRestoreIcon: () => 'backUpAndRestoreIcon',
    GoogleDriveIconSmall: () => 'GoogleDriveIconSmall',
    restoreIcon: () => 'restoreIcon',
  },
}));

jest.mock('../../components/ui/backButton/BackButton', () => ({
  BackButton: () => null,
}));

jest.mock('../../components/HelpScreen', () => ({
  HelpScreen: () => null,
}));

jest.mock('react-native-elements', () => {
  const {View, TouchableOpacity, Text} = require('react-native');
  return {
    Icon: (props: any) => <View testID="icon" />,
    Button: (props: any) => (
      <TouchableOpacity testID={props.testID} onPress={props.onPress}>
        <Text>{props.title}</Text>
      </TouchableOpacity>
    ),
  };
});

jest.mock('../../shared/constants', () => ({
  isIOS: () => false,
  isAndroid: () => true,
  GMAIL: 'Gmail',
  GOOGLE_DRIVE_NAME: 'Google Drive',
}));

import StaticBackupAndRestoreScreen from './backupRestoreIntro';

describe('StaticBackupAndRestoreScreen', () => {
  it('should render backup restore intro', () => {
    const {toJSON} = render(<StaticBackupAndRestoreScreen />);
    expect(toJSON()).toMatchSnapshot();
  });
});
