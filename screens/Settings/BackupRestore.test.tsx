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

jest.mock('./BackupRestoreController', () => ({
  useBackupRestoreScreen: () => ({
    isBackUpRestoring: false,
    BACKUP_RESTORE: jest.fn(),
    DISMISS: jest.fn(),
  }),
}));

jest.mock(
  './BackupRestoreToggle',
  () => ({
    BackupRestoreToggle: () => null,
  }),
  {virtual: true},
);

jest.mock('../../shared/constants', () => ({
  isIOS: () => false,
  isAndroid: () => true,
}));

import {BackupRestore} from './BackupRestore';

describe('BackupRestore', () => {
  it('should render backup restore option', () => {
    const {toJSON} = render(<BackupRestore />);
    expect(toJSON()).toMatchSnapshot();
  });
});
