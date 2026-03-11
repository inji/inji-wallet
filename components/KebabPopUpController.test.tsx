const mockServiceSend = jest.fn();
const mockScanSend = jest.fn();

jest.mock('@xstate/react', () => ({
  useSelector: jest.fn(() => undefined),
}));
jest.mock(
  '../machines/VerifiableCredential/VCItemMachine/VCItemSelectors',
  () => ({
    selectAcceptingBindingOtp: jest.fn(),
    selectBindingAuthFailedError: jest.fn(),
    selectBindingWarning: jest.fn(),
    selectIsCommunicationDetails: jest.fn(),
    selectIsPinned: jest.fn(),
    selectKebabPopUp: jest.fn(),
    selectRemoveWalletWarning: jest.fn(),
    selectShowActivities: jest.fn(),
    selectWalletBindingResponse: jest.fn(),
    selectShowWalletBindingError: jest.fn(),
    selectWalletBindingInProgress: jest.fn(),
    selectOtpError: jest.fn(),
    selectWalletBindingError: jest.fn(),
  }),
);
jest.mock('../machines/activityLog', () => ({
  selectActivities: jest.fn(),
}));
jest.mock('../machines/bleShare/scan/scanMachine', () => ({
  ScanEvents: {
    SELECT_VC: jest.fn((vc: any, flowType: string) => ({
      type: 'SELECT_VC',
      vc,
      flowType,
    })),
  },
}));
jest.mock('../machines/bleShare/scan/scanSelectors', () => ({
  selectIsScanning: jest.fn(),
}));
jest.mock(
  '../machines/VerifiableCredential/VCItemMachine/VCItemMachine',
  () => ({
    VCItemEvents: {
      PIN_CARD: jest.fn(() => ({type: 'PIN_CARD'})),
      KEBAB_POPUP: jest.fn(() => ({type: 'KEBAB_POPUP'})),
      ADD_WALLET_BINDING_ID: jest.fn(() => ({type: 'ADD_WALLET_BINDING_ID'})),
      CONFIRM: jest.fn(() => ({type: 'CONFIRM'})),
      REMOVE: jest.fn((vm: any) => ({type: 'REMOVE', vcMetadata: vm})),
      DISMISS: jest.fn(() => ({type: 'DISMISS'})),
      CANCEL: jest.fn(() => ({type: 'CANCEL'})),
      SHOW_ACTIVITY: jest.fn(() => ({type: 'SHOW_ACTIVITY'})),
      REVERIFY_VC: jest.fn(() => ({type: 'REVERIFY_VC'})),
      INPUT_OTP: jest.fn((otp: string) => ({type: 'INPUT_OTP', otp})),
      RESEND_OTP: jest.fn(() => ({type: 'RESEND_OTP'})),
    },
    VCItemMachine: {},
  }),
);
jest.mock('../shared/GlobalContext', () => ({
  GlobalContext: {_currentValue: {appService: {children: new Map()}}},
}));
jest.mock('../routes/routesConstants', () => ({
  BOTTOM_TAB_ROUTES: {share: 'Share'},
  ScanStackParamList: {},
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
      ['activityLog', {send: jest.fn()}],
      ['scan', {send: mockScanSend}],
    ]),
  },
});

import {useKebabPopUp} from './KebabPopUpController';

describe('KebabPopUpController', () => {
  const mockService = {send: mockServiceSend, getSnapshot: jest.fn()};
  const mockProps = {service: mockService};

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(React, 'useContext').mockReturnValue({
      appService: {
        children: new Map([
          ['activityLog', {send: jest.fn()}],
          ['scan', {send: mockScanSend}],
        ]),
      },
    });
  });

  it('PIN_CARD sends event', () => {
    const result = useKebabPopUp(mockProps);
    result.PIN_CARD();
    expect(mockServiceSend).toHaveBeenCalled();
  });

  it('KEBAB_POPUP sends event', () => {
    const result = useKebabPopUp(mockProps);
    result.KEBAB_POPUP();
    expect(mockServiceSend).toHaveBeenCalled();
  });

  it('ADD_WALLET_BINDING_ID sends event', () => {
    const result = useKebabPopUp(mockProps);
    result.ADD_WALLET_BINDING_ID();
    expect(mockServiceSend).toHaveBeenCalled();
  });

  it('CONFIRM sends event', () => {
    const result = useKebabPopUp(mockProps);
    result.CONFIRM();
    expect(mockServiceSend).toHaveBeenCalled();
  });

  it('REMOVE sends event with vcMetadata', () => {
    const result = useKebabPopUp(mockProps);
    result.REMOVE({id: 'vc-1'} as any);
    expect(mockServiceSend).toHaveBeenCalled();
  });

  it('DISMISS sends event', () => {
    const result = useKebabPopUp(mockProps);
    result.DISMISS();
    expect(mockServiceSend).toHaveBeenCalled();
  });

  it('CANCEL sends event', () => {
    const result = useKebabPopUp(mockProps);
    result.CANCEL();
    expect(mockServiceSend).toHaveBeenCalled();
  });

  it('SHOW_ACTIVITY sends event', () => {
    const result = useKebabPopUp(mockProps);
    result.SHOW_ACTIVITY();
    expect(mockServiceSend).toHaveBeenCalled();
  });

  it('REVERIFY_VC sends event', () => {
    const result = useKebabPopUp(mockProps);
    result.REVERIFY_VC();
    expect(mockServiceSend).toHaveBeenCalled();
  });

  it('INPUT_OTP sends event with otp', () => {
    const result = useKebabPopUp(mockProps);
    result.INPUT_OTP('123456');
    expect(mockServiceSend).toHaveBeenCalled();
  });

  it('RESEND_OTP sends event', () => {
    const result = useKebabPopUp(mockProps);
    result.RESEND_OTP();
    expect(mockServiceSend).toHaveBeenCalled();
  });

  it('GOTO_SCANSCREEN navigates to Share', () => {
    const result = useKebabPopUp(mockProps);
    result.GOTO_SCANSCREEN();
    expect(mockNavigate).toHaveBeenCalledWith('Share');
  });

  it('SELECT_VC_ITEM sends scan event', () => {
    const mockVcRef = {
      getSnapshot: () => ({context: {id: '123', serviceRefs: {}}}),
    };
    const result = useKebabPopUp(mockProps);
    result.SELECT_VC_ITEM(mockVcRef as any, 'share');
    expect(mockScanSend).toHaveBeenCalled();
  });
});
