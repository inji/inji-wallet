import React from 'react';
import {useApp} from './AppController';
import {StoreEvents} from '../machines/store';
import {APP_EVENTS} from '../machines/app';

jest.mock('@xstate/react', () => ({
  useSelector: jest.fn(() => undefined),
}));

jest.mock('../machines/store', () => ({
  StoreEvents: {
    IGNORE: jest.fn(() => ({type: 'IGNORE'})),
    TRY_AGAIN: jest.fn(() => ({type: 'TRY_AGAIN'})),
  },
}));

jest.mock('../machines/app', () => ({
  APP_EVENTS: {
    RESET_KEY_INVALIDATE_ERROR_DISMISS: jest.fn(() => ({
      type: 'RESET_KEY_INVALIDATE_ERROR_DISMISS',
    })),
  },
}));

jest.mock('../shared/GlobalContext', () => ({
  GlobalContext: React.createContext(null),
}));

describe('useApp', () => {
  const mockStoreSend = jest.fn();
  const mockAppSend = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(React, 'useContext').mockReturnValue({
      appService: {
        send: mockAppSend,
        children: new Map([['store', {send: mockStoreSend}]]),
      },
    });
  });

  it('ignoreDecrypt sends DECRYPT_ERROR_DISMISS', () => {
    const result = useApp();
    result.ignoreDecrypt();
    expect(mockAppSend).toHaveBeenCalledWith('DECRYPT_ERROR_DISMISS');
  });

  it('IGNORE sends StoreEvents.IGNORE to storeService', () => {
    const result = useApp();
    result.IGNORE();
    expect(mockStoreSend).toHaveBeenCalled();
  });

  it('TRY_AGAIN sends StoreEvents.TRY_AGAIN to storeService', () => {
    const result = useApp();
    result.TRY_AGAIN();
    expect(mockStoreSend).toHaveBeenCalled();
  });

  it('RESET sends APP_EVENTS.RESET_KEY_INVALIDATE_ERROR_DISMISS', () => {
    const result = useApp();
    result.RESET();
    expect(mockAppSend).toHaveBeenCalled();
  });
});
