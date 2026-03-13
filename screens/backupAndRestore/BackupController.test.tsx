import React from 'react';

jest.mock('@xstate/react', () => ({
  useSelector: jest.fn(() => undefined),
}));

jest.mock('../../machines/backupAndRestore/backup/backupMachine', () => ({
  BackupEvents: {
    DATA_BACKUP: jest.fn(isAuto => ({type: 'DATA_BACKUP', isAuto})),
    LAST_BACKUP_DETAILS: jest.fn(() => ({type: 'LAST_BACKUP_DETAILS'})),
    DISMISS: jest.fn(() => ({type: 'DISMISS'})),
    DISMISS_SHOW_BACKUP_IN_PROGRESS: jest.fn(() => ({
      type: 'DISMISS_SHOW_BACKUP_IN_PROGRESS',
    })),
  },
}));

jest.mock('../../machines/backupAndRestore/backup/backupSelector', () => ({
  selectIsBackingUpSuccess: jest.fn(),
  selectIsBackingUpFailure: jest.fn(),
  selectIsBackupInprogress: jest.fn(),
  selectBackupErrorReason: jest.fn(),
  lastBackupDetails: jest.fn(),
  selectIsLoadingBackupDetails: jest.fn(),
  selectShowBackupInProgress: jest.fn(),
}));

jest.mock('../../shared/GlobalContext', () => ({
  GlobalContext: React.createContext(null),
}));

import {useBackupScreen} from './BackupController';

describe('useBackupScreen', () => {
  const mockBackupSend = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(React, 'useContext').mockReturnValue({
      appService: {
        children: new Map([['backup', {send: mockBackupSend}]]),
      },
    });
  });

  it('should return expected properties', () => {
    const result = useBackupScreen();
    expect(result).toHaveProperty('lastBackupDetails');
    expect(result).toHaveProperty('isLoadingBackupDetails');
    expect(result).toHaveProperty('backupErrorReason');
    expect(result).toHaveProperty('isBackingUpSuccess');
    expect(result).toHaveProperty('isBackingUpFailure');
    expect(result).toHaveProperty('isBackupInProgress');
    expect(result).toHaveProperty('showBackupInProgress');
  });

  it('DATA_BACKUP sends event to backupService', () => {
    const result = useBackupScreen();
    result.DATA_BACKUP(false);
    expect(mockBackupSend).toHaveBeenCalled();
  });

  it('LAST_BACKUP_DETAILS sends event to backupService', () => {
    const result = useBackupScreen();
    result.LAST_BACKUP_DETAILS();
    expect(mockBackupSend).toHaveBeenCalled();
  });

  it('DISMISS sends event to backupService', () => {
    const result = useBackupScreen();
    result.DISMISS();
    expect(mockBackupSend).toHaveBeenCalled();
  });

  it('DISMISS_SHOW_BACKUP_IN_PROGRESS sends event', () => {
    const result = useBackupScreen();
    result.DISMISS_SHOW_BACKUP_IN_PROGRESS();
    expect(mockBackupSend).toHaveBeenCalled();
  });

  it('DATA_BACKUP with auto backup flag', () => {
    const result = useBackupScreen();
    result.DATA_BACKUP(true);
    expect(mockBackupSend).toHaveBeenCalled();
  });
});
