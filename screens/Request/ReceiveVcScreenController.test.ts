import React from 'react';

jest.mock('@xstate/react', () => ({
  useSelector: jest.fn(() => undefined),
}));

jest.mock('../../machines/bleShare/request/selectors', () => ({
  selectCredential: jest.fn(),
  selectIsAccepting: jest.fn(),
  selectIsDisplayingIncomingVC: jest.fn(),
  selectIsReviewingInIdle: jest.fn(),
  selectIsSavingFailedInIdle: jest.fn(),
  selectSenderInfo: jest.fn(),
  selectVerifiableCredentialData: jest.fn(),
}));

jest.mock('../../machines/bleShare/commonSelectors', () => ({
  selectIsInvalidIdentity: jest.fn(),
  selectIsVerifyingIdentity: jest.fn(),
}));

jest.mock('../../machines/bleShare/request/requestMachine', () => ({
  RequestEvents: {
    ACCEPT: jest.fn(() => ({type: 'ACCEPT'})),
    ACCEPT_AND_VERIFY: jest.fn(() => ({type: 'ACCEPT_AND_VERIFY'})),
    REJECT: jest.fn(() => ({type: 'REJECT'})),
    GO_TO_RECEIVED_VC_TAB: jest.fn(() => ({type: 'GO_TO_RECEIVED_VC_TAB'})),
    RETRY_VERIFICATION: jest.fn(() => ({type: 'RETRY_VERIFICATION'})),
    CANCEL: jest.fn(() => ({type: 'CANCEL'})),
    DISMISS: jest.fn(() => ({type: 'DISMISS'})),
    FACE_VALID: jest.fn(() => ({type: 'FACE_VALID'})),
    FACE_INVALID: jest.fn(() => ({type: 'FACE_INVALID'})),
    RESET: jest.fn(() => ({type: 'RESET'})),
  },
}));

jest.mock('../../machines/activityLog', () => ({
  ActivityLogEvents: {
    STORE_INCOMING_VC_WELLKNOWN_CONFIG: jest.fn((issuer, wellknown) => ({
      type: 'STORE_INCOMING_VC_WELLKNOWN_CONFIG',
      issuer,
      wellknown,
    })),
  },
}));

jest.mock('../../shared/GlobalContext', () => ({
  GlobalContext: React.createContext(null),
}));

import {useReceiveVcScreen} from './ReceiveVcScreenController';

describe('useReceiveVcScreen', () => {
  const mockRequestSend = jest.fn();
  const mockActivitySend = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(React, 'useContext').mockReturnValue({
      appService: {
        children: new Map([
          ['request', {send: mockRequestSend}],
          ['activityLog', {send: mockActivitySend}],
        ]),
      },
    });
  });

  it('ACCEPT sends event to requestService', () => {
    const result = useReceiveVcScreen();
    result.ACCEPT();
    expect(mockRequestSend).toHaveBeenCalled();
  });

  it('ACCEPT_AND_VERIFY sends event', () => {
    const result = useReceiveVcScreen();
    result.ACCEPT_AND_VERIFY();
    expect(mockRequestSend).toHaveBeenCalled();
  });

  it('REJECT sends event', () => {
    const result = useReceiveVcScreen();
    result.REJECT();
    expect(mockRequestSend).toHaveBeenCalled();
  });

  it('GO_TO_RECEIVED_VC_TAB sends event', () => {
    const result = useReceiveVcScreen();
    result.GO_TO_RECEIVED_VC_TAB();
    expect(mockRequestSend).toHaveBeenCalled();
  });

  it('RETRY_VERIFICATION sends event', () => {
    const result = useReceiveVcScreen();
    result.RETRY_VERIFICATION();
    expect(mockRequestSend).toHaveBeenCalled();
  });

  it('CANCEL sends event', () => {
    const result = useReceiveVcScreen();
    result.CANCEL();
    expect(mockRequestSend).toHaveBeenCalled();
  });

  it('DISMISS sends event', () => {
    const result = useReceiveVcScreen();
    result.DISMISS();
    expect(mockRequestSend).toHaveBeenCalled();
  });

  it('FACE_VALID sends event', () => {
    const result = useReceiveVcScreen();
    result.FACE_VALID();
    expect(mockRequestSend).toHaveBeenCalled();
  });

  it('FACE_INVALID sends event', () => {
    const result = useReceiveVcScreen();
    result.FACE_INVALID();
    expect(mockRequestSend).toHaveBeenCalled();
  });

  it('RESET sends event', () => {
    const result = useReceiveVcScreen();
    result.RESET();
    expect(mockRequestSend).toHaveBeenCalled();
  });

  it('STORE_INCOMING_VC_WELLKNOWN_CONFIG sends to activityService', () => {
    const result = useReceiveVcScreen();
    result.STORE_INCOMING_VC_WELLKNOWN_CONFIG('issuer1', {config: true});
    expect(mockActivitySend).toHaveBeenCalled();
  });
});
