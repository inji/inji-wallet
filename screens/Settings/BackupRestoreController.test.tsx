import React from 'react';

jest.mock('@xstate/react', () => ({
  useSelector: jest.fn(() => undefined),
}));

jest.mock('../../machines/backupAndRestore/restore/restoreMachine', () => ({
  RestoreEvents: {
    DOWNLOAD_UNSYNCED_BACKUP_FILES: jest.fn(() => ({
      type: 'DOWNLOAD_UNSYNCED_BACKUP_FILES',
    })),
    BACKUP_RESTORE: jest.fn(() => ({type: 'BACKUP_RESTORE'})),
    DISMISS: jest.fn(() => ({type: 'DISMISS'})),
    DISMISS_SHOW_RESTORE_IN_PROGRESS: jest.fn(() => ({
      type: 'DISMISS_SHOW_RESTORE_IN_PROGRESS',
    })),
  },
}));

jest.mock('../../machines/backupAndRestore/restore/restoreSelector', () => ({
  selectIsBackUpRestoring: jest.fn(),
  selectIsBackUpRestoreFailure: jest.fn(),
  selectIsBackUpRestoreSuccess: jest.fn(),
  selectErrorReason: jest.fn(),
  selectShowRestoreInProgress: jest.fn(),
}));

jest.mock('../../shared/GlobalContext', () => ({
  GlobalContext: React.createContext(null),
}));

import {useBackupRestoreScreen} from './BackupRestoreController';

describe('useBackupRestoreScreen', () => {
  const mockRestoreSend = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(React, 'useContext').mockReturnValue({
      appService: {
        children: new Map([['restore', {send: mockRestoreSend}]]),
      },
    });
  });

  it('should return expected properties', () => {
    const result = useBackupRestoreScreen();
    expect(result).toHaveProperty('isBackUpRestoring');
    expect(result).toHaveProperty('restoreErrorReason');
    expect(result).toHaveProperty('isBackUpRestoreSuccess');
    expect(result).toHaveProperty('isBackUpRestoreFailure');
    expect(result).toHaveProperty('showRestoreInProgress');
  });

  it('DOWNLOAD_UNSYNCED_BACKUP_FILES sends event', () => {
    const result = useBackupRestoreScreen();
    result.DOWNLOAD_UNSYNCED_BACKUP_FILES();
    expect(mockRestoreSend).toHaveBeenCalled();
  });

  it('BACKUP_RESTORE sends event', () => {
    const result = useBackupRestoreScreen();
    result.BACKUP_RESTORE();
    expect(mockRestoreSend).toHaveBeenCalled();
  });

  it('DISMISS sends event', () => {
    const result = useBackupRestoreScreen();
    result.DISMISS();
    expect(mockRestoreSend).toHaveBeenCalled();
  });

  it('DISMISS_SHOW_RESTORE_IN_PROGRESS sends event', () => {
    const result = useBackupRestoreScreen();
    result.DISMISS_SHOW_RESTORE_IN_PROGRESS();
    expect(mockRestoreSend).toHaveBeenCalled();
  });
});
