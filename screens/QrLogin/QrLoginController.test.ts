const mockServiceSend = jest.fn();
const mockService = {send: mockServiceSend, getSnapshot: jest.fn()};

jest.mock('@xstate/react', () => ({
  useSelector: jest.fn(() => undefined),
}));
jest.mock('../../machines/QrLogin/QrLoginMachine', () => ({
  QrLoginEvents: {
    TOGGLE_CONSENT_CLAIM: jest.fn((v, c) => ({
      type: 'TOGGLE_CONSENT_CLAIM',
      value: v,
      claim: c,
    })),
    SELECT_VC: jest.fn(vc => ({type: 'SELECT_VC', vc})),
    FACE_VERIFICATION_CONSENT: jest.fn(v => ({
      type: 'FACE_VERIFICATION_CONSENT',
      value: v,
    })),
    DISMISS: jest.fn(() => ({type: 'DISMISS'})),
    SCANNING_DONE: jest.fn(qr => ({type: 'SCANNING_DONE', qr})),
    CONFIRM: jest.fn(() => ({type: 'CONFIRM'})),
    VERIFY: jest.fn(() => ({type: 'VERIFY'})),
    CANCEL: jest.fn(() => ({type: 'CANCEL'})),
    FACE_VALID: jest.fn(() => ({type: 'FACE_VALID'})),
    FACE_INVALID: jest.fn(() => ({type: 'FACE_INVALID'})),
    RETRY_VERIFICATION: jest.fn(() => ({type: 'RETRY_VERIFICATION'})),
  },
}));
jest.mock('../../machines/QrLogin/QrLoginSelectors', () => ({
  selectClientName: jest.fn(),
  selectErrorMessage: jest.fn(),
  selectEssentialClaims: jest.fn(),
  selectIsFaceVerificationConsent: jest.fn(),
  selectIsInvalidIdentity: jest.fn(),
  selectIsisVerifyingIdentity: jest.fn(),
  selectIsLinkTransaction: jest.fn(),
  selectIsloadMyVcs: jest.fn(),
  selectIsRequestConsent: jest.fn(),
  selectIsSendingAuthenticate: jest.fn(),
  selectIsSendingConsent: jest.fn(),
  selectIsSharing: jest.fn(),
  selectIsShowError: jest.fn(),
  selectIsShowingVcList: jest.fn(),
  selectIsVerifyingSuccesful: jest.fn(),
  selectIsWaitingForData: jest.fn(),
  selectLinkTransactionResponse: jest.fn(),
  selectLogoUrl: jest.fn(),
  selectDomainName: jest.fn(),
  selectVoluntaryClaims: jest.fn(),
  selectCredential: jest.fn(),
  selectVerifiableCredentialData: jest.fn(),
  selectIsQrLoginViaDeepLink: jest.fn(),
}));
jest.mock(
  '../../machines/VerifiableCredential/VCMetaMachine/VCMetaSelectors',
  () => ({
    selectBindedVcsMetadata: jest.fn(),
  }),
);
jest.mock('../../shared/GlobalContext', () => ({
  GlobalContext: {_currentValue: {appService: {children: new Map()}}},
}));
jest.mock('../../routes/routesConstants', () => ({
  BOTTOM_TAB_ROUTES: {home: 'Home'},
}));

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({navigate: mockNavigate})),
  NavigationProp: {},
}));

const React = require('react');
jest.spyOn(React, 'useContext').mockReturnValue({
  appService: {children: new Map([['vcMeta', {send: jest.fn()}]])},
});

import {useQrLogin} from './QrLoginController';

describe('QrLoginController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(React, 'useContext').mockReturnValue({
      appService: {children: new Map([['vcMeta', {send: jest.fn()}]])},
    });
  });

  it('returns expected properties', () => {
    const result = useQrLogin({service: mockService} as any);
    expect(result).toHaveProperty('isFaceVerificationConsent');
    expect(result).toHaveProperty('linkTransactionResponse');
    expect(result).toHaveProperty('shareableVcsMetadata');
    expect(result).toHaveProperty('domainName');
    expect(result).toHaveProperty('logoUrl');
    expect(result).toHaveProperty('essentialClaims');
    expect(result).toHaveProperty('voluntaryClaims');
    expect(result).toHaveProperty('clientName');
    expect(result).toHaveProperty('error');
    expect(result).toHaveProperty('isWaitingForData');
    expect(result).toHaveProperty('selectedIndex');
    expect(result).toHaveProperty('DISMISS');
    expect(result).toHaveProperty('CONFIRM');
    expect(result).toHaveProperty('VERIFY');
    expect(result).toHaveProperty('CANCEL');
    expect(result).toHaveProperty('GO_TO_HOME');
  });

  it('DISMISS sends DISMISS event', () => {
    const result = useQrLogin({service: mockService} as any);
    result.DISMISS();
    expect(mockServiceSend).toHaveBeenCalled();
  });

  it('CONFIRM sends CONFIRM event', () => {
    const result = useQrLogin({service: mockService} as any);
    result.CONFIRM();
    expect(mockServiceSend).toHaveBeenCalled();
  });

  it('VERIFY sends VERIFY event', () => {
    const result = useQrLogin({service: mockService} as any);
    result.VERIFY();
    expect(mockServiceSend).toHaveBeenCalled();
  });

  it('CANCEL sends CANCEL event', () => {
    const result = useQrLogin({service: mockService} as any);
    result.CANCEL();
    expect(mockServiceSend).toHaveBeenCalled();
  });

  it('FACE_VALID sends FACE_VALID event', () => {
    const result = useQrLogin({service: mockService} as any);
    result.FACE_VALID();
    expect(mockServiceSend).toHaveBeenCalled();
  });

  it('FACE_INVALID sends FACE_INVALID event', () => {
    const result = useQrLogin({service: mockService} as any);
    result.FACE_INVALID();
    expect(mockServiceSend).toHaveBeenCalled();
  });

  it('RETRY_VERIFICATION sends event', () => {
    const result = useQrLogin({service: mockService} as any);
    result.RETRY_VERIFICATION();
    expect(mockServiceSend).toHaveBeenCalled();
  });

  it('SCANNING_DONE sends event with qr code', () => {
    const result = useQrLogin({service: mockService} as any);
    result.SCANNING_DONE('qr-code-123');
    expect(mockServiceSend).toHaveBeenCalled();
  });

  it('SELECT_CONSENT sends toggle event', () => {
    const result = useQrLogin({service: mockService} as any);
    result.SELECT_CONSENT(true, 'email');
    expect(mockServiceSend).toHaveBeenCalled();
  });

  it('FACE_VERIFICATION_CONSENT sends event', () => {
    const result = useQrLogin({service: mockService} as any);
    result.FACE_VERIFICATION_CONSENT(true);
    expect(mockServiceSend).toHaveBeenCalled();
  });

  it('GO_TO_HOME navigates to home', () => {
    const result = useQrLogin({service: mockService} as any);
    result.GO_TO_HOME();
    expect(mockNavigate).toHaveBeenCalledWith('Home', {screen: 'HomeScreen'});
  });

  it('selectedIndex is initially null', () => {
    const result = useQrLogin({service: mockService} as any);
    expect(result.selectedIndex).toBeNull();
  });

  it('SELECT_VC_ITEM returns a function that sends SELECT_VC', () => {
    const result = useQrLogin({service: mockService} as any);
    const selectFn = result.SELECT_VC_ITEM(0);
    expect(typeof selectFn).toBe('function');
    const mockVcRef = {getSnapshot: () => ({context: {id: '123'}})};
    selectFn(mockVcRef as any);
    expect(mockServiceSend).toHaveBeenCalled();
  });
});
