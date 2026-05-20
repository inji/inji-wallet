import React from 'react';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({navigate: mockNavigate})),
}));

jest.mock('@xstate/react', () => ({
  useSelector: jest.fn(() => undefined),
}));

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(() => ({t: (key: string) => key})),
}));

jest.mock('../../components/ui/styleUtils', () => ({
  Theme: {
    BottomTabBarStyle: {tabBarStyle: {display: 'flex'}},
  },
}));

jest.mock('../../machines/bleShare/commonSelectors', () => ({
  selectIsCancelling: jest.fn(),
}));

jest.mock('../../machines/bleShare/scan/scanMachine', () => ({
  ScanEvents: {
    DISMISS: jest.fn(() => ({type: 'DISMISS'})),
    RESET: jest.fn(() => ({type: 'RESET'})),
  },
}));

jest.mock('../../machines/bleShare/scan/scanSelectors', () => ({
  selectFlowType: jest.fn(),
  selectIsSendingVPError: jest.fn(),
}));

jest.mock('../../machines/openID4VP/openID4VPSelectors', () => ({
  selectIsAuthorization: jest.fn(),
  selectAreAllVCsChecked: jest.fn(),
  selectCredentials: jest.fn(),
  selectIsError: jest.fn(),
  selectIsFaceVerificationConsent: jest.fn(),
  selectIsGetVCsSatisfyingAuthRequest: jest.fn(),
  selectIsGetVPSharingConsent: jest.fn(),
  selectIsInvalidIdentity: jest.fn(),
  selectIsOVPViaDeeplink: jest.fn(),
  selectIsSelectingVcs: jest.fn(),
  selectIsSharingVP: jest.fn(),
  selectIsShowLoadingScreen: jest.fn(),
  selectIsVerifyingIdentity: jest.fn(),
  selectOpenID4VPRetryCount: jest.fn(),
  selectPurpose: jest.fn(),
  selectRequestedClaimsByVerifier: jest.fn(),
  selectSelectedVCs: jest.fn(),
  selectShowConfirmationPopup: jest.fn(),
  selectshowTrustConsentModal: jest.fn(),
  selectVCsMatchingAuthRequest: jest.fn(() => ({})),
  selectVerifiableCredentialsData: jest.fn(),
  selectVerifierLogoInTrustModal: jest.fn(),
  selectVerifierNameInTrustModal: jest.fn(),
  selectVerifierNameInVPSharing: jest.fn(),
}));

jest.mock('../../machines/openID4VP/openID4VPMachine', () => ({
  OpenID4VPEvents: {
    CONFIRM: jest.fn(() => ({type: 'CONFIRM'})),
    CANCEL: jest.fn(() => ({type: 'CANCEL'})),
    GO_BACK: jest.fn(() => ({type: 'GO_BACK'})),
    DISMISS_POPUP: jest.fn(() => ({type: 'DISMISS_POPUP'})),
    CLOSE_BANNER: jest.fn(() => ({type: 'CLOSE_BANNER'})),
    RETRY: jest.fn(() => ({type: 'RETRY'})),
    FACE_VALID: jest.fn(() => ({type: 'FACE_VALID'})),
    FACE_INVALID: jest.fn(() => ({type: 'FACE_INVALID'})),
    RETRY_VERIFICATION: jest.fn(() => ({type: 'RETRY_VERIFICATION'})),
    RESET_ERROR: jest.fn(() => ({type: 'RESET_ERROR'})),
    FACE_VERIFICATION_CONSENT: jest.fn(checked => ({
      type: 'FACE_VERIFICATION_CONSENT',
      checked,
    })),
    ACCEPT_REQUEST: jest.fn((vcs, disclosures) => ({
      type: 'ACCEPT_REQUEST',
      vcs,
      disclosures,
    })),
    VERIFY_AND_ACCEPT_REQUEST: jest.fn((vcs, disclosures) => ({
      type: 'VERIFY_AND_ACCEPT_REQUEST',
      vcs,
      disclosures,
    })),
    VERIFIER_TRUST_CONSENT_GIVEN: jest.fn(() => ({
      type: 'VERIFIER_TRUST_CONSENT_GIVEN',
    })),
    RESET_RETRY_COUNT: jest.fn(() => ({type: 'RESET_RETRY_COUNT'})),
  },
}));

jest.mock('../../machines/QrLogin/QrLoginSelectors', () => ({
  selectMyVcs: jest.fn(() => ({})),
}));

jest.mock(
  '../../machines/VerifiableCredential/VCItemMachine/VCItemMachine',
  () => ({}),
);

jest.mock(
  '../../machines/VerifiableCredential/VCMetaMachine/VCMetaSelectors',
  () => ({
    selectShareableVcs: jest.fn(() => []),
  }),
);

jest.mock('../../routes/routesConstants', () => ({
  BOTTOM_TAB_ROUTES: {home: 'Home'},
}));

jest.mock('../../shared/GlobalContext', () => ({
  GlobalContext: React.createContext(null),
}));

jest.mock('../../shared/Utils', () => ({
  formatTextWithGivenLimit: jest.fn(name => name),
}));

jest.mock('../../shared/VCMetadata', () => ({
  VCMetadata: {
    fromVcMetadataString: jest.fn(() => ({getVcKey: () => 'vc-key-1'})),
  },
}));

jest.mock('../../components/VPShareActivityLogEvent', () => ({
  VPShareActivityLog: {
    getLogFromObject: jest.fn(obj => obj),
  },
}));

jest.mock('../../machines/activityLog', () => ({
  ActivityLogEvents: {
    LOG_ACTIVITY: jest.fn(log => ({type: 'LOG_ACTIVITY', log})),
  },
}));

jest.mock('../../shared/constants', () => ({
  isIOS: jest.fn(() => false),
}));

jest.mock('../../components/VC/common/VCUtils', () => ({
  getFaceAttribute: jest.fn(() => null),
}));

import {useSendVPScreen} from './SendVPScreenController';

describe('useSendVPScreen', () => {
  const mockScanSend = jest.fn();
  const mockOpenID4VPSend = jest.fn();
  const mockVcMetaSend = jest.fn();
  const mockActivitySend = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(React, 'useContext').mockReturnValue({
      appService: {
        children: new Map([
          [
            'scan',
            {
              send: mockScanSend,
              getSnapshot: () => ({
                context: {OpenId4VPRef: {send: mockOpenID4VPSend}},
              }),
            },
          ],
          ['vcMeta', {send: mockVcMetaSend}],
          ['activityLog', {send: mockActivitySend}],
        ]),
      },
    });
    jest.spyOn(React, 'useRef').mockReturnValue({current: false});
    jest.spyOn(React, 'useCallback').mockImplementation(fn => fn);
  });

  it('DISMISS sends event to scanService', () => {
    const result = useSendVPScreen({});
    result.DISMISS();
    expect(mockScanSend).toHaveBeenCalled();
  });

  it('DISMISS_POPUP sends event to openID4VPService', () => {
    const result = useSendVPScreen({});
    result.DISMISS_POPUP();
    expect(mockOpenID4VPSend).toHaveBeenCalled();
  });

  it('RETRY sends event to openID4VPService', () => {
    const result = useSendVPScreen({});
    result.RETRY();
    expect(mockOpenID4VPSend).toHaveBeenCalled();
  });

  it('FACE_VALID sends event to openID4VPService', () => {
    const result = useSendVPScreen({});
    result.FACE_VALID();
    expect(mockOpenID4VPSend).toHaveBeenCalled();
  });

  it('FACE_INVALID sends event to openID4VPService', () => {
    const result = useSendVPScreen({});
    result.FACE_INVALID();
    expect(mockOpenID4VPSend).toHaveBeenCalled();
  });

  it('RETRY_VERIFICATION sends event', () => {
    const result = useSendVPScreen({});
    result.RETRY_VERIFICATION();
    expect(mockOpenID4VPSend).toHaveBeenCalled();
  });

  it('GO_TO_HOME resets and navigates', () => {
    jest.useFakeTimers();
    const result = useSendVPScreen({});
    result.GO_TO_HOME();
    expect(mockOpenID4VPSend).toHaveBeenCalled();
    expect(mockScanSend).toHaveBeenCalled();
    jest.advanceTimersByTime(10);
    expect(mockNavigate).toHaveBeenCalledWith('Home', {screen: 'HomeScreen'});
    jest.useRealTimers();
  });

  it('CANCEL sends event to openID4VPService', () => {
    const result = useSendVPScreen({});
    result.CANCEL();
    expect(mockOpenID4VPSend).toHaveBeenCalled();
  });

  it('FACE_VERIFICATION_CONSENT sends event', () => {
    const result = useSendVPScreen({});
    result.FACE_VERIFICATION_CONSENT(true);
    expect(mockOpenID4VPSend).toHaveBeenCalled();
  });

  it('ACCEPT_REQUEST sends event with selected VCs', () => {
    const result = useSendVPScreen({});
    result.ACCEPT_REQUEST({});
    expect(mockOpenID4VPSend).toHaveBeenCalled();
  });

  it('VERIFY_AND_ACCEPT_REQUEST sends event', () => {
    const result = useSendVPScreen({});
    result.VERIFY_AND_ACCEPT_REQUEST({});
    expect(mockOpenID4VPSend).toHaveBeenCalled();
  });

  it('VERIFIER_TRUST_CONSENT_GIVEN sends event', () => {
    const result = useSendVPScreen({});
    result.VERIFIER_TRUST_CONSENT_GIVEN();
    expect(mockOpenID4VPSend).toHaveBeenCalled();
  });

  it('RESET_RETRY_COUNT sends event', () => {
    const result = useSendVPScreen({});
    result.RESET_RETRY_COUNT();
    expect(mockOpenID4VPSend).toHaveBeenCalled();
  });

  it('SELECT_VC_ITEM returns a curried function', () => {
    const result = useSendVPScreen({});
    const selectFn = result.SELECT_VC_ITEM('vc-key', 'desc-1');
    expect(typeof selectFn).toBe('function');
  });

  it('overlayDetails should be null by default', () => {
    const result = useSendVPScreen({});
    expect(result.overlayDetails).toBeNull();
  });
});
