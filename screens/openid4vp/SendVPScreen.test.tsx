import React from 'react';
import {render} from '@testing-library/react-native';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({top: 0, bottom: 0, left: 0, right: 0}),
  SafeAreaProvider: ({children}: any) => children,
  SafeAreaConsumer: ({children}: any) => children({}),
}));

jest.mock(
  '../../components/openid4vp/matchingVc/MatchingVcListContainer',
  () => ({
    MatchingVcListContainer: () => null,
  }),
);
jest.mock('../../components/openid4vp/verifier/VerifierInfo', () => ({
  VerifierInfo: () => null,
}));
jest.mock(
  '../../components/openid4vp/overlay/WhyWeNeedDocumentsOverlay',
  () => ({
    WhyWeNeedDocumentsOverlay: () => null,
  }),
);
jest.mock('../../components/ui/backButton/BackButton', () => ({
  BackButton: () => null,
}));
jest.mock('../../shared/openID4VP/OpenID4VPHelper', () => ({
  claimPathPointersToJsonPath: jest.fn((path: string[]) => path.join('.')),
}));

jest.mock('./SendVPScreenController', () => {
  const defaultValues = {
    error: null,
    noCredentialsMatchingVPRequest: false,
    requestedClaimsByVerifier: [],
    getAdditionalMessage: jest.fn(() => ''),
    generateAndStoreLogMessage: jest.fn(),
    isOVPViaDeepLink: false,
    showLoadingScreen: false,
    showTrustConsentModal: false,
    verifierLogoInTrustModal: null,
    verifierNameInTrustModal: null,
    VERIFIER_TRUST_CONSENT_GIVEN: jest.fn(),
    CANCEL: jest.fn(),
    purpose: '',
    isAuthorizationFlow: false,
    areAllVCsChecked: false,
    credentialRequestIdToSelectedVcKeys: {},
    getSelectedVCs: jest.fn(() => ({})),
    checkIfAnyVCHasImage: jest.fn(() => false),
    checkIfAllVCsHasImage: jest.fn(() => false),
    VERIFY_AND_ACCEPT_REQUEST: jest.fn(),
    ACCEPT_REQUEST: jest.fn(),
    isCancelling: false,
    credentials: [],
    verifiableCredentialsData: [],
    isVerifyingIdentity: false,
    FACE_VALID: jest.fn(),
    FACE_INVALID: jest.fn(),
    isInvalidIdentity: false,
    GO_TO_HOME: jest.fn(),
    RETRY_VERIFICATION: jest.fn(),
    overlayDetails: null,
    isFaceVerificationConsent: false,
    FACE_VERIFICATION_CONSENT: jest.fn(),
    DISMISS_POPUP: jest.fn(),
    DISMISS: jest.fn(),
    SELECT_VC_ITEM: jest.fn(() => jest.fn()),
    SELECT_VC_ITEMS: jest.fn(() => jest.fn()),
    DESELECT_VC_ITEMS: jest.fn(() => jest.fn()),
    TOGGLE_VC_ITEMS: jest.fn(() => jest.fn()),
    vpVerifierName: '',
    showConfirmationPopup: false,
    openID4VPRetryCount: 0,
    RETRY: jest.fn(),
    RESET_RETRY_COUNT: jest.fn(),
    CHECK_ALL: jest.fn(),
    UNCHECK_ALL: jest.fn(),
    isStartPermissionCheck: false,
    matchingVcsResult: null,
    isDcqlFlow: false,
    successfullySatisfiedCredentialRequest: jest.fn(() => false),
  };
  let overrides = {};
  return {
    __setMockOverrides: (o: any) => {
      overrides = o;
    },
    __resetMockOverrides: () => {
      overrides = {};
    },
    useSendVPScreen: () => ({...defaultValues, ...overrides}),
  };
});

jest.mock('../Scan/ScanScreenController', () => ({
  useScanScreen: () => ({
    isStartPermissionCheck: false,
    authorizationRequest: '',
    isNoSharableVCs: false,
    START_PERMISSION_CHECK: jest.fn(),
  }),
}));

jest.mock('../../shared/GlobalContext', () => {
  const React = require('react');
  return {
    GlobalContext: React.createContext({
      appService: {send: jest.fn()},
    }),
  };
});

const defaultErrorModal = {
  show: false,
  title: '',
  message: '',
  additionalMessage: '',
  showRetryButton: false,
  matchingVcsResult: null,
};
let mockErrorModalOverrides: Record<string, any> = {};
jest.mock('../../shared/hooks/useOvpErrorModal', () => ({
  useOvpErrorModal: () => [
    {...defaultErrorModal, ...mockErrorModalOverrides},
    jest.fn(),
  ],
}));

jest.mock('react-native-elements', () => {
  const {View, TouchableOpacity, Text: RNText} = require('react-native');
  return {
    Icon: (props: any) => <View testID="icon" />,
    Button: (props: any) => (
      <TouchableOpacity testID={props.testID} onPress={props.onPress}>
        <RNText>{props.title}</RNText>
      </TouchableOpacity>
    ),
    CheckBox: () => <View testID="checkbox" />,
  };
});

jest.mock('../../components/VC/VcItemContainer', () => ({
  VcItemContainer: () => null,
}));

jest.mock('../../components/ui/svg', () => ({
  SvgImage: {PermissionDenied: () => 'PermissionDenied'},
}));

jest.mock(
  '../../components/openid4vp/missingClaimsView/MissingClaimsView',
  () => ({
    MissingClaimsView: ({claims}: {claims: string[]}) => {
      const {Text} = require('react-native');
      return <Text testID="missingClaimsView">{claims.join(',')}</Text>;
    },
  }),
);

jest.mock('react-native-linear-gradient', () => 'LinearGradient');
jest.mock('../../components/ui/Error', () => ({
  ErrorView: ({additionalContent}: any) => additionalContent || null,
}));
jest.mock('react-native-copilot', () => ({
  CopilotProvider: ({children}: any) => children,
  useCopilot: () => ({start: jest.fn()}),
}));
jest.mock('../../components/DeeplinkBanner', () => ({
  DeeplinkBanner: () => null,
}));
jest.mock('../../components/ui/Loader', () => ({
  Loader: () => null,
  LoaderSkeleton: () => null,
}));
jest.mock('../VerifyIdentityOverlay', () => ({
  VerifyIdentityOverlay: () => null,
}));
jest.mock('../Scan/VPShareOverlay', () => ({VPShareOverlay: () => null}));
jest.mock('../Scan/FaceVerificationAlertOverlay', () => ({
  FaceVerificationAlertOverlay: () => null,
}));
jest.mock('../../components/TrustModalVerifier', () => ({
  TrustModalVerifier: () => null,
}));

jest.mock('../../shared/openID4VP/OpenID4VP', () => ({
  __esModule: true,
  default: {sendErrorToVerifier: jest.fn()},
}));

jest.mock('../../machines/app', () => ({
  APP_EVENTS: {RESET_AUTHORIZATION_REQUEST: jest.fn(() => ({type: 'RESET'}))},
}));

jest.mock('../../shared/constants', () => ({
  isIOS: () => false,
  isAndroid: () => true,
  LIVENESS_CHECK: false,
  OVP_ERROR_MESSAGES: {NO_MATCHING_VCS: 'no_matching', DECLINED: 'declined'},
  OVP_ERROR_CODE: {NO_MATCHING_VCS: '1', DECLINED: '2'},
}));

jest.mock('../../shared/telemetry/TelemetryUtils', () => ({
  getImpressionEventData: jest.fn(),
  sendImpressionEvent: jest.fn(),
}));

jest.mock('../../shared/telemetry/TelemetryConstants', () => ({
  TelemetryConstants: {
    FlowType: {senderVcShare: 'svc'},
    Screens: {vcList: 'vcList'},
  },
}));

jest.mock('../../shared/Utils', () => ({
  VCItemContainerFlowType: {VP_SHARE: 'vp'},
}));
jest.mock('../../shared/VCMetadata', () => ({
  VCMetadata: {fromVcMetadataString: jest.fn(() => ({getVcKey: () => 'key1'}))},
}));

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
  useNavigation: () => ({navigate: jest.fn(), goBack: jest.fn()}),
}));

import {SendVPScreen} from './SendVPScreen';

const mockController = require('./SendVPScreenController');

describe('SendVPScreen', () => {
  const navProps = {
    navigation: {setOptions: jest.fn(), goBack: jest.fn(), navigate: jest.fn()},
    route: {params: {}},
  } as any;

  beforeEach(() => {
    mockController.__resetMockOverrides();
    mockErrorModalOverrides = {};
    jest.clearAllMocks();
  });

  it('should render empty state', () => {
    const {toJSON} = render(<SendVPScreen {...navProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render loading screen for authorization flow', () => {
    mockController.__setMockOverrides({
      showLoadingScreen: true,
      isAuthorizationFlow: true,
    });
    const {toJSON} = render(<SendVPScreen {...navProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render loading screen for non-authorization flow', () => {
    mockController.__setMockOverrides({
      showLoadingScreen: true,
      isAuthorizationFlow: false,
    });
    const {toJSON} = render(<SendVPScreen {...navProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render with matching VCs and purpose', () => {
    mockController.__setMockOverrides({
      purpose: 'Identity verification',
      vpVerifierName: 'TestVerifier',
      matchingVcsResult: {success: true, matchingVCs: {}},
    });
    const {toJSON} = render(<SendVPScreen {...navProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render authorization flow with consent share button', () => {
    mockController.__setMockOverrides({
      isAuthorizationFlow: true,
      purpose: 'Authorization',
      matchingVcsResult: {success: true, matchingVCs: {}},
    });
    const {toJSON} = render(<SendVPScreen {...navProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render trust consent modal', () => {
    mockController.__setMockOverrides({
      showTrustConsentModal: true,
      verifierNameInTrustModal: 'Trusted Verifier',
    });
    const {toJSON} = render(<SendVPScreen {...navProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render with overlay details', () => {
    mockController.__setMockOverrides({
      matchingVcsResult: {success: true, matchingVCs: {}},
      overlayDetails: {
        title: 'Success',
        titleTestID: 'successTitle',
        message: 'VP shared',
        messageTestID: 'successMsg',
        primaryButtonTestID: 'btn1',
        primaryButtonText: 'OK',
        primaryButtonEvent: jest.fn(),
      },
    });
    const {toJSON} = render(<SendVPScreen {...navProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render with face verification consent', () => {
    mockController.__setMockOverrides({
      isFaceVerificationConsent: true,
      matchingVcsResult: {success: true, matchingVCs: {}},
    });
    const {toJSON} = render(<SendVPScreen {...navProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render with all VCs checked', () => {
    mockController.__setMockOverrides({
      areAllVCsChecked: true,
      matchingVcsResult: {success: true, matchingVCs: {}},
    });
    const {toJSON} = render(<SendVPScreen {...navProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render with cancelling state', () => {
    mockController.__setMockOverrides({
      isCancelling: true,
      matchingVcsResult: {success: true, matchingVCs: {}},
    });
    const {toJSON} = render(<SendVPScreen {...navProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render error modal for non-authorization flow', () => {
    mockController.__setMockOverrides({
      error: {message: 'VP request error'},
      noCredentialsMatchingVPRequest: true,
      isAuthorizationFlow: false,
    });
    const {toJSON} = render(<SendVPScreen {...navProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render with verifying identity state', () => {
    mockController.__setMockOverrides({
      isVerifyingIdentity: true,
      credentials: [{id: 'vc1'}],
      verifiableCredentialsData: [{credential: 'data'}],
      matchingVcsResult: {success: true, matchingVCs: {}},
    });
    const {toJSON} = render(<SendVPScreen {...navProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render with OVP deep link and retry count', () => {
    mockController.__setMockOverrides({
      isOVPViaDeepLink: true,
      openID4VPRetryCount: 1,
      error: {message: 'timeout'},
      noCredentialsMatchingVPRequest: false,
    });
    const {toJSON} = render(<SendVPScreen {...navProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render non-authorization flow share actions with images', () => {
    mockController.__setMockOverrides({
      isAuthorizationFlow: false,
      checkIfAnyVCHasImage: jest.fn(() => true),
      checkIfAllVCsHasImage: jest.fn(() => false),
      getSelectedVCs: jest.fn(() => ({vc1: {}})),
      matchingVcsResult: {success: true, matchingVCs: {}},
    });
    const {toJSON} = render(<SendVPScreen {...navProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render non-authorization flow with all VCs having images', () => {
    mockController.__setMockOverrides({
      isAuthorizationFlow: false,
      checkIfAnyVCHasImage: jest.fn(() => true),
      checkIfAllVCsHasImage: jest.fn(() => true),
      getSelectedVCs: jest.fn(() => ({vc1: {}})),
      matchingVcsResult: {success: true, matchingVCs: {}},
    });
    const {toJSON} = render(<SendVPScreen {...navProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render with multiple input descriptors and cards selected', () => {
    mockController.__setMockOverrides({
      credentialRequestIdToSelectedVcKeys: {
        desc1: ['key1'],
        desc2: ['key2'],
      },
      purpose: 'Multi-credential verification',
      matchingVcsResult: {success: true, matchingVCs: {}},
    });
    const {toJSON} = render(<SendVPScreen {...navProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render authorization flow purpose text', () => {
    mockController.__setMockOverrides({
      isAuthorizationFlow: true,
      purpose: 'Authorization purpose',
      vpVerifierName: 'AuthVerifier',
      matchingVcsResult: {success: true, matchingVCs: {}},
    });
    const {toJSON} = render(<SendVPScreen {...navProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render with confirmation popup overlay', () => {
    mockController.__setMockOverrides({
      showConfirmationPopup: true,
      isOVPViaDeepLink: true,
      matchingVcsResult: {success: true, matchingVCs: {}},
      overlayDetails: {
        title: 'Confirm',
        titleTestID: 'confirmTitle',
        message: 'Are you sure?',
        messageTestID: 'confirmMsg',
        primaryButtonTestID: 'btn1',
        primaryButtonText: 'Yes',
        primaryButtonEvent: jest.fn(),
        secondaryButtonTestID: 'btn2',
        secondaryButtonText: 'No',
        secondaryButtonEvent: jest.fn(),
      },
    });
    const {toJSON} = render(<SendVPScreen {...navProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render with invalid identity state', () => {
    mockController.__setMockOverrides({
      isInvalidIdentity: true,
      credentials: [{id: 'vc1'}],
      verifiableCredentialsData: [{credential: 'data'}],
      matchingVcsResult: {success: true, matchingVCs: {}},
    });
    const {toJSON} = render(<SendVPScreen {...navProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render MissingClaimsView when errorModal has matchingVcsResult with requestedClaims', () => {
    mockErrorModalOverrides = {
      show: true,
      title: 'No matching credentials found!',
      message: 'No credentials found.',
      matchingVcsResult: {
        requestedClaims: new Set(['claim_a', 'claim_b', 'claim_c', 'claim_d']),
        matchingVCs: {},
        success: false,
      },
    };
    const {getByTestId} = render(<SendVPScreen {...navProps} />);
    expect(getByTestId('missingClaimsView')).toBeTruthy();
  });

  it('should not render MissingClaimsView when matchingVcsResult has no requestedClaims', () => {
    mockErrorModalOverrides = {
      show: true,
      title: 'No matching credentials found!',
      message: 'No credentials found.',
      matchingVcsResult: {
        requestedClaims: new Set<string>(),
        matchingVCs: {},
        success: false,
      },
    };
    const {queryByTestId} = render(<SendVPScreen {...navProps} />);
    expect(queryByTestId('missingClaimsView')).toBeNull();
  });
});
