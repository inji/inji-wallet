const mockSetupSend = jest.fn();
const mockBackupSend = jest.fn();

jest.mock('@xstate/react', () => ({
  useSelector: jest.fn(() => undefined),
  useInterpret: jest.fn(() => ({send: mockSetupSend})),
}));
jest.mock(
  '../../machines/backupAndRestore/backupAndRestoreSetup/backupAndRestoreSetupMachine',
  () => ({
    BackupAndRestoreSetupEvents: {
      HANDLE_BACKUP_AND_RESTORE: jest.fn(() => ({
        type: 'HANDLE_BACKUP_AND_RESTORE',
      })),
      PROCEED: jest.fn(() => ({type: 'PROCEED'})),
      GO_BACK: jest.fn(() => ({type: 'GO_BACK'})),
      RECONFIGURE_ACCOUNT: jest.fn(() => ({type: 'RECONFIGURE_ACCOUNT'})),
      TRY_AGAIN: jest.fn(() => ({type: 'TRY_AGAIN'})),
      OPEN_SETTINGS: jest.fn(() => ({type: 'OPEN_SETTINGS'})),
      DISMISS: jest.fn(() => ({type: 'DISMISS'})),
    },
    backupAndRestoreSetupMachine: {
      context: {serviceRefs: {}},
      withContext: jest.fn(function (ctx: any) {
        return this;
      }),
    },
  }),
);
jest.mock(
  '../../machines/backupAndRestore/backupAndRestoreSetup/backupAndRestoreSetupSelectors',
  () => ({
    selectIsCloudSignedInFailed: jest.fn(),
    selectIsLoading: jest.fn(),
    selectIsNetworkError: jest.fn(),
    selectIsSigningIn: jest.fn(),
    selectIsSigningFailure: jest.fn(),
    selectIsSigningInSuccessful: jest.fn(),
    selectProfileInfo: jest.fn(),
    selectShouldTriggerAutoBackup: jest.fn(),
    selectShowAccountSelectionConfirmation: jest.fn(),
  }),
);
jest.mock('../../machines/backupAndRestore/backup/backupMachine', () => ({
  BackupEvents: {
    TRY_AGAIN: jest.fn(() => ({type: 'TRY_AGAIN'})),
    DISMISS: jest.fn(() => ({type: 'DISMISS'})),
  },
}));
jest.mock('../../machines/backupAndRestore/backup/backupSelector', () => ({
  selectIsNetworkError: jest.fn(),
}));
jest.mock('../../shared/GlobalContext', () => ({
  GlobalContext: {_currentValue: {appService: {children: new Map()}}},
}));

const React = require('react');
jest.spyOn(React, 'useRef').mockReturnValue({current: {}});
jest.spyOn(React, 'useContext').mockReturnValue({
  appService: {
    children: new Map([
      ['settings', {send: jest.fn()}],
      ['backup', {send: mockBackupSend}],
      ['store', {send: jest.fn()}],
    ]),
  },
});

import {useBackupAndRestoreSetup} from './BackupAndRestoreSetupController';

describe('BackupAndRestoreSetupController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(React, 'useRef').mockReturnValue({current: {}});
    jest.spyOn(React, 'useContext').mockReturnValue({
      appService: {
        children: new Map([
          ['settings', {send: jest.fn()}],
          ['backup', {send: mockBackupSend}],
          ['store', {send: jest.fn()}],
        ]),
      },
    });
  });

  it('BACKUP_AND_RESTORE sends event', () => {
    const result = useBackupAndRestoreSetup();
    result.BACKUP_AND_RESTORE();
    expect(mockSetupSend).toHaveBeenCalled();
  });

  it('PROCEED_ACCOUNT_SELECTION sends PROCEED event', () => {
    const result = useBackupAndRestoreSetup();
    result.PROCEED_ACCOUNT_SELECTION();
    expect(mockSetupSend).toHaveBeenCalled();
  });

  it('GO_BACK sends GO_BACK event', () => {
    const result = useBackupAndRestoreSetup();
    result.GO_BACK();
    expect(mockSetupSend).toHaveBeenCalled();
  });

  it('RECONFIGURE_ACCOUNT sends event', () => {
    const result = useBackupAndRestoreSetup();
    result.RECONFIGURE_ACCOUNT();
    expect(mockSetupSend).toHaveBeenCalled();
  });

  it('TRY_AGAIN calls setup service when no network error during setup', () => {
    const result = useBackupAndRestoreSetup();
    result.TRY_AGAIN();
    // When isNetworkErrorDuringAccountSetup is false, should send to backupService
    expect(mockBackupSend).toHaveBeenCalled();
  });

  it('OPEN_SETTINGS sends event', () => {
    const result = useBackupAndRestoreSetup();
    result.OPEN_SETTINGS();
    expect(mockSetupSend).toHaveBeenCalled();
  });

  it('DISMISS sends event', () => {
    const result = useBackupAndRestoreSetup();
    result.DISMISS();
    expect(mockSetupSend).toHaveBeenCalled();
  });
});
