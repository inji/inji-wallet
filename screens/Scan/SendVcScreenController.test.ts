const mockScanSend = jest.fn();

jest.mock('@xstate/react', () => ({
  useSelector: jest.fn(() => undefined),
}));
jest.mock(
  '../../machines/VerifiableCredential/VCMetaMachine/VCMetaSelectors',
  () => ({
    selectShareableVcsMetadata: jest.fn(),
  }),
);
jest.mock('../../machines/bleShare/scan/scanSelectors', () => ({
  selectCredential: jest.fn(),
  selectIsSelectingVc: jest.fn(),
  selectReceiverInfo: jest.fn(),
  selectVcName: jest.fn(),
  selectVerifiableCredentialData: jest.fn(),
  selectIsFaceVerificationConsent: jest.fn(),
}));
jest.mock('../../machines/bleShare/commonSelectors', () => ({
  selectIsCancelling: jest.fn(),
  selectIsInvalidIdentity: jest.fn(),
  selectIsVerifyingIdentity: jest.fn(),
}));
jest.mock('../../machines/bleShare/scan/scanMachine', () => ({
  ScanEvents: {
    CANCEL: jest.fn(() => ({type: 'CANCEL'})),
    ACCEPT_REQUEST: jest.fn(() => ({type: 'ACCEPT_REQUEST'})),
    FACE_VERIFICATION_CONSENT: jest.fn((v: boolean) => ({
      type: 'FACE_VERIFICATION_CONSENT',
      v,
    })),
    VERIFY_AND_ACCEPT_REQUEST: jest.fn(() => ({
      type: 'VERIFY_AND_ACCEPT_REQUEST',
    })),
    DISMISS: jest.fn(() => ({type: 'DISMISS'})),
    UPDATE_VC_NAME: jest.fn((n: string) => ({type: 'UPDATE_VC_NAME', n})),
    FACE_VALID: jest.fn(() => ({type: 'FACE_VALID'})),
    FACE_INVALID: jest.fn(() => ({type: 'FACE_INVALID'})),
    RETRY_VERIFICATION: jest.fn(() => ({type: 'RETRY_VERIFICATION'})),
    SELECT_VC: jest.fn(),
  },
}));
jest.mock('../../shared/Utils', () => ({
  VCShareFlowType: {SIMPLE_SHARE: 'SIMPLE_SHARE'},
}));
jest.mock('../../routes/routesConstants', () => ({
  BOTTOM_TAB_ROUTES: {home: 'Home'},
}));
jest.mock(
  '../../machines/VerifiableCredential/VCItemMachine/VCItemMachine',
  () => ({
    VCItemMachine: {},
  }),
);
jest.mock('../../components/ui/styleUtils', () => ({
  Theme: {BottomTabBarStyle: {tabBarStyle: {display: 'flex'}}},
}));
jest.mock('../../shared/GlobalContext', () => ({
  GlobalContext: {_currentValue: {appService: {children: new Map()}}},
}));

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({navigate: mockNavigate})),
  NavigationProp: {},
}));

const React = require('react');
jest.spyOn(React, 'useContext').mockReturnValue({
  appService: {
    children: new Map([
      ['scan', {send: mockScanSend}],
      ['vcMeta', {send: jest.fn()}],
    ]),
  },
});

import {useSendVcScreen} from './SendVcScreenController';

describe('SendVcScreenController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(React, 'useContext').mockReturnValue({
      appService: {
        children: new Map([
          ['scan', {send: mockScanSend}],
          ['vcMeta', {send: jest.fn()}],
        ]),
      },
    });
  });

  it('CANCEL sends event', () => {
    const result = useSendVcScreen();
    result.CANCEL();
    expect(mockScanSend).toHaveBeenCalled();
  });

  it('ACCEPT_REQUEST sends event', () => {
    const result = useSendVcScreen();
    result.ACCEPT_REQUEST();
    expect(mockScanSend).toHaveBeenCalled();
  });

  it('DISMISS sends event', () => {
    const result = useSendVcScreen();
    result.DISMISS();
    expect(mockScanSend).toHaveBeenCalled();
  });

  it('FACE_VALID sends event', () => {
    const result = useSendVcScreen();
    result.FACE_VALID();
    expect(mockScanSend).toHaveBeenCalled();
  });

  it('FACE_INVALID sends event', () => {
    const result = useSendVcScreen();
    result.FACE_INVALID();
    expect(mockScanSend).toHaveBeenCalled();
  });

  it('RETRY_VERIFICATION sends event', () => {
    const result = useSendVcScreen();
    result.RETRY_VERIFICATION();
    expect(mockScanSend).toHaveBeenCalled();
  });

  it('UPDATE_VC_NAME sends event', () => {
    const result = useSendVcScreen();
    result.UPDATE_VC_NAME('test-vc');
    expect(mockScanSend).toHaveBeenCalled();
  });

  it('VERIFY_AND_ACCEPT_REQUEST sends event', () => {
    const result = useSendVcScreen();
    result.VERIFY_AND_ACCEPT_REQUEST();
    expect(mockScanSend).toHaveBeenCalled();
  });

  it('GO_TO_HOME navigates to home', () => {
    const result = useSendVcScreen();
    result.GO_TO_HOME();
    expect(mockNavigate).toHaveBeenCalledWith('Home', {screen: 'HomeScreen'});
  });

  it('selectedIndex is initially null', () => {
    const result = useSendVcScreen();
    expect(result.selectedIndex).toBeNull();
  });

  it('FACE_VERIFICATION_CONSENT sends event', () => {
    const result = useSendVcScreen();
    result.FACE_VERIFICATION_CONSENT(true);
    expect(mockScanSend).toHaveBeenCalled();
  });
});
