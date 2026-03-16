import React from 'react';

const mockNavigate = jest.fn();
const mockAddListener = jest.fn(() => jest.fn());

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({
    navigate: mockNavigate,
    addListener: mockAddListener,
  })),
}));

jest.mock('@xstate/react', () => ({
  useSelector: jest.fn(() => undefined),
}));

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(() => ({t: (key: string) => key})),
}));

jest.mock('../../components/MessageOverlay', () => ({}));

jest.mock('../../machines/bleShare/scan/scanSelectors', () => ({
  selectIsConnecting: jest.fn(),
  selectIsConnectingTimeout: jest.fn(),
  selectIsInvalid: jest.fn(),
  selectIsLocationDenied: jest.fn(),
  selectIsLocationDisabled: jest.fn(),
  selectIsQrLoginDone: jest.fn(),
  selectIsScanning: jest.fn(),
  selectIsSendingVc: jest.fn(),
  selectIsSendingVcTimeout: jest.fn(),
  selectIsSent: jest.fn(),
  selectIsDone: jest.fn(),
  selectFlowType: jest.fn(),
  selectIsFaceIdentityVerified: jest.fn(),
  selectCredential: jest.fn(),
  selectVerifiableCredentialData: jest.fn(),
  selectIsSendingVPTimeout: jest.fn(),
  selectIsSendingVP: jest.fn(),
  selectIsQrLoginDoneViaDeeplink: jest.fn(),
  selectOpenID4VPFlowType: jest.fn(),
  selectIsSendingVPSuccess: jest.fn(),
  selectIsOVPViaDeepLink: jest.fn(),
}));

jest.mock('../../machines/bleShare/commonSelectors', () => ({
  selectBleError: jest.fn(),
  selectIsAccepted: jest.fn(),
  selectIsDisconnected: jest.fn(),
  selectIsExchangingDeviceInfo: jest.fn(),
  selectIsExchangingDeviceInfoTimeout: jest.fn(),
  selectIsHandlingBleError: jest.fn(),
  selectIsInvalidIdentity: jest.fn(),
  selectIsOffline: jest.fn(),
  selectIsRejected: jest.fn(),
  selectIsReviewing: jest.fn(),
  selectIsVerifyingIdentity: jest.fn(),
}));

jest.mock('../../machines/bleShare/scan/scanMachine', () => ({
  ScanEvents: {
    DISMISS: jest.fn(() => ({type: 'DISMISS'})),
    CANCEL: jest.fn(() => ({type: 'CANCEL'})),
    FACE_VALID: jest.fn(() => ({type: 'FACE_VALID'})),
    FACE_INVALID: jest.fn(() => ({type: 'FACE_INVALID'})),
    CLOSE_BANNER: jest.fn(() => ({type: 'CLOSE_BANNER'})),
    STAY_IN_PROGRESS: jest.fn(() => ({type: 'STAY_IN_PROGRESS'})),
    RETRY: jest.fn(() => ({type: 'RETRY'})),
    GOTO_HISTORY: jest.fn(() => ({type: 'GOTO_HISTORY'})),
    RETRY_VERIFICATION: jest.fn(() => ({type: 'RETRY_VERIFICATION'})),
    SCREEN_FOCUS: jest.fn(() => ({type: 'SCREEN_FOCUS'})),
    SCREEN_BLUR: jest.fn(() => ({type: 'SCREEN_BLUR'})),
    QRLOGIN_VIA_DEEP_LINK: jest.fn(code => ({
      type: 'QRLOGIN_VIA_DEEP_LINK',
      code,
    })),
    OVP_VIA_DEEP_LINK: jest.fn(req => ({type: 'OVP_VIA_DEEP_LINK', req})),
    RESET: jest.fn(() => ({type: 'RESET'})),
  },
}));

jest.mock('../../routes/routesConstants', () => ({
  BOTTOM_TAB_ROUTES: {home: 'Home', history: 'History'},
  SCAN_ROUTES: {
    ScanScreen: 'ScanScreen',
    SendVcScreen: 'SendVcScreen',
    SendVPScreen: 'SendVPScreen',
  },
}));

jest.mock('../../shared/Utils', () => ({
  VCShareFlowType: {SIMPLE_SHARE: 'SIMPLE_SHARE', OPENID4VP: 'OPENID4VP'},
}));

jest.mock('../../components/ui/styleUtils', () => ({
  Theme: {
    BottomTabBarStyle: {tabBarStyle: {display: 'flex'}},
  },
}));

jest.mock('../../machines/app', () => ({
  APP_EVENTS: {
    RESET_LINKCODE: jest.fn(() => ({type: 'RESET_LINKCODE'})),
    RESET_AUTHORIZATION_REQUEST: jest.fn(() => ({
      type: 'RESET_AUTHORIZATION_REQUEST',
    })),
  },
  selectAuthorizationRequest: jest.fn(),
  selectIsLinkCode: jest.fn(),
}));

jest.mock('../../machines/openID4VP/openID4VPSelectors', () => ({
  selectIsFaceVerifiedInVPSharing: jest.fn(),
  selectVerifierNameInVPSharing: jest.fn(),
}));

jest.mock('../../machines/openID4VP/openID4VPMachine', () => ({
  OpenID4VPEvents: {
    CLOSE_BANNER: jest.fn(() => ({type: 'CLOSE_BANNER'})),
  },
}));

jest.mock(
  '../../machines/VerifiableCredential/VCMetaMachine/VCMetaSelectors',
  () => ({
    selectShareableVcsMetadata: jest.fn(),
  }),
);

jest.mock('../../shared/GlobalContext', () => ({
  GlobalContext: React.createContext(null),
}));

import {useScanLayout} from './ScanLayoutController';

describe('useScanLayout', () => {
  const mockScanSend = jest.fn();
  const mockOpenID4VPSend = jest.fn();
  const mockAppSend = jest.fn();
  const mockVcMetaSend = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(React, 'useContext').mockReturnValue({
      appService: {
        send: mockAppSend,
        children: new Map([
          [
            'scan',
            {
              send: mockScanSend,
              getSnapshot: () => ({
                context: {
                  OpenId4VPRef: {send: mockOpenID4VPSend},
                },
              }),
            },
          ],
          ['vcMeta', {send: mockVcMetaSend}],
        ]),
      },
    });
  });

  it('DISMISS sends event to scanService', () => {
    const result = useScanLayout();
    result.DISMISS();
    expect(mockScanSend).toHaveBeenCalledWith({type: 'DISMISS'});
  });

  it('CANCEL sends event to scanService', () => {
    const result = useScanLayout();
    result.CANCEL();
    expect(mockScanSend).toHaveBeenCalledWith({type: 'CANCEL'});
  });

  it('FACE_VALID sends event to scanService', () => {
    const result = useScanLayout();
    result.FACE_VALID();
    expect(mockScanSend).toHaveBeenCalledWith({type: 'FACE_VALID'});
  });

  it('FACE_INVALID sends event to scanService', () => {
    const result = useScanLayout();
    result.FACE_INVALID();
    expect(mockScanSend).toHaveBeenCalledWith({type: 'FACE_INVALID'});
  });

  it('CLOSE_BANNER sends event to scanService', () => {
    const result = useScanLayout();
    result.CLOSE_BANNER();
    expect(mockScanSend).toHaveBeenCalledWith({type: 'CLOSE_BANNER'});
  });

  it('VP_SHARE_CLOSE_BANNER sends event to openID4VPService', () => {
    const result = useScanLayout();
    result.VP_SHARE_CLOSE_BANNER();
    expect(mockOpenID4VPSend).toHaveBeenCalledWith({type: 'CLOSE_BANNER'});
  });

  it('GOTO_HOME sends DISMISS and navigates', () => {
    jest.useFakeTimers();
    const result = useScanLayout();
    result.GOTO_HOME();
    expect(mockScanSend).toHaveBeenCalledWith({type: 'DISMISS'});
    jest.advanceTimersByTime(10);
    expect(mockNavigate).toHaveBeenCalledWith('Home');
    jest.useRealTimers();
  });

  it('GOTO_HISTORY sends event and navigates', () => {
    const result = useScanLayout();
    result.GOTO_HISTORY();
    expect(mockScanSend).toHaveBeenCalledWith({type: 'GOTO_HISTORY'});
    expect(mockNavigate).toHaveBeenCalledWith('History');
  });

  it('onRetry sends RETRY to scanService', () => {
    const result = useScanLayout();
    result.onRetry();
    expect(mockScanSend).toHaveBeenCalledWith({type: 'RETRY'});
  });

  it('RETRY_VERIFICATION sends event after timeout', () => {
    jest.useFakeTimers();
    const result = useScanLayout();
    result.RETRY_VERIFICATION();
    jest.advanceTimersByTime(10);
    expect(mockScanSend).toHaveBeenCalledWith({type: 'RETRY_VERIFICATION'});
    jest.useRealTimers();
  });

  it('statusOverlay should be null when no state flags', () => {
    const result = useScanLayout();
    expect(result.statusOverlay).toBeNull();
  });

  it('errorStatusOverlay should be null when no error flags', () => {
    const result = useScanLayout();
    expect(result.errorStatusOverlay).toBeNull();
  });

  it('isStayInProgress should be falsy by default', () => {
    const result = useScanLayout();
    expect(result.isStayInProgress).toBeFalsy();
  });

  it('onStayInProgress sends STAY_IN_PROGRESS to scanService', () => {
    const {useSelector} = require('@xstate/react');
    const {
      selectIsConnectingTimeout,
    } = require('../../machines/bleShare/scan/scanSelectors');
    useSelector.mockImplementation((service: any, selector: any) => {
      if (selector === selectIsConnectingTimeout) return true;
      return undefined;
    });
    const result = useScanLayout();
    expect(result.statusOverlay).toBeDefined();
    expect(result.statusOverlay.onStayInProgress).toBeDefined();
    result.statusOverlay.onStayInProgress();
    expect(mockScanSend).toHaveBeenCalledWith({type: 'STAY_IN_PROGRESS'});
  });

  it('statusOverlay with isConnecting returns inProgress overlay', () => {
    const {useSelector} = require('@xstate/react');
    const {
      selectIsConnecting,
    } = require('../../machines/bleShare/scan/scanSelectors');
    useSelector.mockImplementation((service: any, selector: any) => {
      if (selector === selectIsConnecting) return true;
      return undefined;
    });
    const result = useScanLayout();
    expect(result.statusOverlay).not.toBeNull();
    expect(result.statusOverlay?.progress).toBe(true);
    useSelector.mockImplementation(() => undefined);
  });

  it('statusOverlay with isConnectingTimeout returns timeout overlay', () => {
    const {useSelector} = require('@xstate/react');
    const {
      selectIsConnectingTimeout,
    } = require('../../machines/bleShare/scan/scanSelectors');
    useSelector.mockImplementation((service: any, selector: any) => {
      if (selector === selectIsConnectingTimeout) return true;
      return undefined;
    });
    const result = useScanLayout();
    expect(result.statusOverlay).not.toBeNull();
    expect(result.isStayInProgress).toBeTruthy();
    useSelector.mockImplementation(() => undefined);
  });

  it('statusOverlay with isExchangingDeviceInfo returns exchanging overlay', () => {
    const {useSelector} = require('@xstate/react');
    const {
      selectIsExchangingDeviceInfo,
    } = require('../../machines/bleShare/commonSelectors');
    useSelector.mockImplementation((service: any, selector: any) => {
      if (selector === selectIsExchangingDeviceInfo) return true;
      return undefined;
    });
    const result = useScanLayout();
    expect(result.statusOverlay).not.toBeNull();
    useSelector.mockImplementation(() => undefined);
  });

  it('statusOverlay with isSendingVc returns sharing overlay', () => {
    const {useSelector} = require('@xstate/react');
    const {
      selectIsSendingVc,
    } = require('../../machines/bleShare/scan/scanSelectors');
    useSelector.mockImplementation((service: any, selector: any) => {
      if (selector === selectIsSendingVc) return true;
      return undefined;
    });
    const result = useScanLayout();
    expect(result.statusOverlay).not.toBeNull();
    expect(result.statusOverlay?.progress).toBe(true);
    useSelector.mockImplementation(() => undefined);
  });

  it('statusOverlay with isSent returns sent overlay', () => {
    const {useSelector} = require('@xstate/react');
    const {
      selectIsSent,
    } = require('../../machines/bleShare/scan/scanSelectors');
    useSelector.mockImplementation((service: any, selector: any) => {
      if (selector === selectIsSent) return true;
      return undefined;
    });
    const result = useScanLayout();
    expect(result.statusOverlay).not.toBeNull();
    useSelector.mockImplementation(() => undefined);
  });

  it('statusOverlay with isAccepted returns accepted overlay', () => {
    const {useSelector} = require('@xstate/react');
    const {
      selectIsAccepted,
    } = require('../../machines/bleShare/commonSelectors');
    useSelector.mockImplementation((service: any, selector: any) => {
      if (selector === selectIsAccepted) return true;
      return undefined;
    });
    const result = useScanLayout();
    expect(result.statusOverlay).not.toBeNull();
    useSelector.mockImplementation(() => undefined);
  });

  it('statusOverlay with isOffline returns offline overlay', () => {
    const {useSelector} = require('@xstate/react');
    const {
      selectIsOffline,
    } = require('../../machines/bleShare/commonSelectors');
    useSelector.mockImplementation((service: any, selector: any) => {
      if (selector === selectIsOffline) return true;
      return undefined;
    });
    const result = useScanLayout();
    expect(result.statusOverlay).not.toBeNull();
    useSelector.mockImplementation(() => undefined);
  });

  it('errorStatusOverlay with isRejected returns rejected overlay', () => {
    const {useSelector} = require('@xstate/react');
    const {
      selectIsRejected,
    } = require('../../machines/bleShare/commonSelectors');
    useSelector.mockImplementation((service: any, selector: any) => {
      if (selector === selectIsRejected) return true;
      return undefined;
    });
    const result = useScanLayout();
    expect(result.errorStatusOverlay).not.toBeNull();
    useSelector.mockImplementation(() => undefined);
  });

  it('errorStatusOverlay with isDisconnected returns disconnected overlay', () => {
    const {useSelector} = require('@xstate/react');
    const {
      selectIsDisconnected,
    } = require('../../machines/bleShare/commonSelectors');
    useSelector.mockImplementation((service: any, selector: any) => {
      if (selector === selectIsDisconnected) return true;
      return undefined;
    });
    const result = useScanLayout();
    expect(result.errorStatusOverlay).not.toBeNull();
    useSelector.mockImplementation(() => undefined);
  });

  it('errorStatusOverlay with isBleError returns ble error overlay', () => {
    const {useSelector} = require('@xstate/react');
    const {
      selectIsHandlingBleError,
      selectBleError,
    } = require('../../machines/bleShare/commonSelectors');
    useSelector.mockImplementation((service: any, selector: any) => {
      if (selector === selectIsHandlingBleError) return true;
      if (selector === selectBleError) return {code: 'TVW_CON_001'};
      return undefined;
    });
    const result = useScanLayout();
    expect(result.errorStatusOverlay).not.toBeNull();
    useSelector.mockImplementation(() => undefined);
  });

  it('isSendingVc and isSendingVP are false by default', () => {
    const result = useScanLayout();
    expect(result.isSendingVc).toBeFalsy();
    expect(result.isSendingVP).toBeFalsy();
  });

  it('flowType and openID4VPFlowType are undefined by default', () => {
    const result = useScanLayout();
    expect(result.flowType).toBeUndefined();
    expect(result.openID4VPFlowType).toBeUndefined();
  });
});
