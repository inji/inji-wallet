import React from 'react';
import {render} from '@testing-library/react-native';
import {BackupAndRestoreBannerNotification} from './BackupAndRestoreBannerNotification';

// Mock controllers
jest.mock('../screens/backupAndRestore/BackupController', () => ({
  useBackupScreen: jest.fn(() => ({
    showBackupInProgress: false,
    isBackingUpSuccess: false,
    isBackingUpFailure: false,
    backupErrorReason: '',
    DISMISS: jest.fn(),
    DISMISS_SHOW_BACKUP_IN_PROGRESS: jest.fn(),
  })),
}));

jest.mock('../screens/Settings/BackupRestoreController', () => ({
  useBackupRestoreScreen: jest.fn(() => ({
    showRestoreInProgress: false,
    isBackUpRestoreSuccess: false,
    isBackUpRestoreFailure: false,
    restoreErrorReason: '',
    DISMISS: jest.fn(),
    DISMISS_SHOW_RESTORE_IN_PROGRESS: jest.fn(),
  })),
}));

// Mock BannerNotification
jest.mock('./BannerNotification', () => ({
  BannerNotification: jest.fn(() => null),
  BannerStatusType: {
    IN_PROGRESS: 'inProgress',
    SUCCESS: 'success',
    ERROR: 'error',
  },
}));

describe('BackupAndRestoreBannerNotification Component', () => {
  it('should match snapshot with no banners', () => {
    const {toJSON} = render(<BackupAndRestoreBannerNotification />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render backup failure banner', () => {
    const {
      useBackupScreen,
    } = require('../screens/backupAndRestore/BackupController');
    useBackupScreen.mockReturnValueOnce({
      showBackupInProgress: false,
      isBackingUpSuccess: false,
      isBackingUpFailure: true,
      backupErrorReason: 'networkError',
      DISMISS: jest.fn(),
      DISMISS_SHOW_BACKUP_IN_PROGRESS: jest.fn(),
    });
    const {toJSON} = render(<BackupAndRestoreBannerNotification />);
    expect(toJSON()).toMatchSnapshot();
    const {BannerNotification} = require('./BannerNotification');
    expect(BannerNotification).toHaveBeenCalledWith(
      expect.objectContaining({type: 'error'}),
      expect.anything(),
    );
  });

  it('should render restore failure banner', () => {
    const {
      useBackupRestoreScreen,
    } = require('../screens/Settings/BackupRestoreController');
    useBackupRestoreScreen.mockReturnValueOnce({
      showRestoreInProgress: false,
      isBackUpRestoreSuccess: false,
      isBackUpRestoreFailure: true,
      restoreErrorReason: 'networkError',
      DISMISS: jest.fn(),
      DISMISS_SHOW_RESTORE_IN_PROGRESS: jest.fn(),
    });
    const {toJSON} = render(<BackupAndRestoreBannerNotification />);
    expect(toJSON()).toMatchSnapshot();
    const {BannerNotification} = require('./BannerNotification');
    expect(BannerNotification).toHaveBeenCalledWith(
      expect.objectContaining({type: 'error'}),
      expect.anything(),
    );
  });

  it('should render backup in progress banner', () => {
    const {
      useBackupScreen,
    } = require('../screens/backupAndRestore/BackupController');
    useBackupScreen.mockReturnValueOnce({
      showBackupInProgress: true,
      isBackingUpSuccess: false,
      isBackingUpFailure: false,
      backupErrorReason: '',
      DISMISS: jest.fn(),
      DISMISS_SHOW_BACKUP_IN_PROGRESS: jest.fn(),
    });
    render(<BackupAndRestoreBannerNotification />);
    const {BannerNotification} = require('./BannerNotification');
    expect(BannerNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'inProgress',
        testId: 'dataBackupInProgress',
      }),
      expect.anything(),
    );
  });

  it('should render backup success banner', () => {
    const {
      useBackupScreen,
    } = require('../screens/backupAndRestore/BackupController');
    useBackupScreen.mockReturnValueOnce({
      showBackupInProgress: false,
      isBackingUpSuccess: true,
      isBackingUpFailure: false,
      backupErrorReason: '',
      DISMISS: jest.fn(),
      DISMISS_SHOW_BACKUP_IN_PROGRESS: jest.fn(),
    });
    render(<BackupAndRestoreBannerNotification />);
    const {BannerNotification} = require('./BannerNotification');
    expect(BannerNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'success',
        testId: 'dataBackupSuccessPopup',
      }),
      expect.anything(),
    );
  });

  it('should render restore in progress banner', () => {
    const {
      useBackupRestoreScreen,
    } = require('../screens/Settings/BackupRestoreController');
    useBackupRestoreScreen.mockReturnValueOnce({
      showRestoreInProgress: true,
      isBackUpRestoreSuccess: false,
      isBackUpRestoreFailure: false,
      restoreErrorReason: '',
      DISMISS: jest.fn(),
      DISMISS_SHOW_RESTORE_IN_PROGRESS: jest.fn(),
    });
    render(<BackupAndRestoreBannerNotification />);
    const {BannerNotification} = require('./BannerNotification');
    expect(BannerNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'inProgress',
        testId: 'restoreInProgress',
      }),
      expect.anything(),
    );
  });

  it('should render restore success banner', () => {
    const {
      useBackupRestoreScreen,
    } = require('../screens/Settings/BackupRestoreController');
    useBackupRestoreScreen.mockReturnValueOnce({
      showRestoreInProgress: false,
      isBackUpRestoreSuccess: true,
      isBackUpRestoreFailure: false,
      restoreErrorReason: '',
      DISMISS: jest.fn(),
      DISMISS_SHOW_RESTORE_IN_PROGRESS: jest.fn(),
    });
    render(<BackupAndRestoreBannerNotification />);
    const {BannerNotification} = require('./BannerNotification');
    expect(BannerNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'success',
        testId: 'restoreBackupSuccessPopup',
      }),
      expect.anything(),
    );
  });
});
