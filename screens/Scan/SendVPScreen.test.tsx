import React from 'react';
import {render} from '@testing-library/react-native';

jest.mock('./SendVPScreenController', () => {
  const defaultValues = {
    vcsMatchingAuthRequest: {},
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
    inputDescriptorIdToSelectedVcKeys: {},
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
    vpVerifierName: '',
    showConfirmationPopup: false,
    openID4VPRetryCount: 0,
    RETRY: jest.fn(),
    RESET_RETRY_COUNT: jest.fn(),
    CHECK_ALL: jest.fn(),
    UNCHECK_ALL: jest.fn(),
    isStartPermissionCheck: false,
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

jest.mock('./ScanScreenController', () => ({
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

jest.mock('../../shared/hooks/useOvpErrorModal', () => ({
  useOvpErrorModal: () => [
    {
      show: false,
      title: '',
      message: '',
      additionalMessage: '',
      showRetryButton: false,
    },
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

jest.mock('react-native-linear-gradient', () => 'LinearGradient');
jest.mock('../../components/ui/Error', () => ({ErrorView: () => null}));
jest.mock('../../components/ui/Loader', () => ({
  Loader: () => null,
  LoaderSkeleton: () => null,
}));
jest.mock('../VerifyIdentityOverlay', () => ({
  VerifyIdentityOverlay: () => null,
}));
jest.mock('./VPShareOverlay', () => ({VPShareOverlay: () => null}));
jest.mock('./FaceVerificationAlertOverlay', () => ({
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
      vcsMatchingAuthRequest: {
        desc1: [{vcMetadata: JSON.stringify({isPinned: false})}],
      },
      purpose: 'Identity verification',
      vpVerifierName: 'TestVerifier',
    });
    const {toJSON} = render(<SendVPScreen {...navProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render authorization flow with consent share button', () => {
    mockController.__setMockOverrides({
      isAuthorizationFlow: true,
      vcsMatchingAuthRequest: {
        desc1: [{vcMetadata: JSON.stringify({isPinned: false})}],
      },
      purpose: 'Authorization',
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
      vcsMatchingAuthRequest: {
        desc1: [{vcMetadata: JSON.stringify({isPinned: false})}],
      },
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
      vcsMatchingAuthRequest: {
        desc1: [{vcMetadata: JSON.stringify({isPinned: false})}],
      },
      isFaceVerificationConsent: true,
    });
    const {toJSON} = render(<SendVPScreen {...navProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render with all VCs checked', () => {
    mockController.__setMockOverrides({
      vcsMatchingAuthRequest: {
        desc1: [{vcMetadata: JSON.stringify({isPinned: false})}],
      },
      areAllVCsChecked: true,
    });
    const {toJSON} = render(<SendVPScreen {...navProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render with cancelling state', () => {
    mockController.__setMockOverrides({
      vcsMatchingAuthRequest: {
        desc1: [{vcMetadata: JSON.stringify({isPinned: false})}],
      },
      isCancelling: true,
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
      vcsMatchingAuthRequest: {
        desc1: [{vcMetadata: JSON.stringify({isPinned: false})}],
      },
      isVerifyingIdentity: true,
      credentials: [{id: 'vc1'}],
      verifiableCredentialsData: [{credential: 'data'}],
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
      vcsMatchingAuthRequest: {
        desc1: [{vcMetadata: JSON.stringify({isPinned: false})}],
      },
      checkIfAnyVCHasImage: jest.fn(() => true),
      checkIfAllVCsHasImage: jest.fn(() => false),
      getSelectedVCs: jest.fn(() => ({vc1: {}})),
    });
    const {toJSON} = render(<SendVPScreen {...navProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render non-authorization flow with all VCs having images', () => {
    mockController.__setMockOverrides({
      isAuthorizationFlow: false,
      vcsMatchingAuthRequest: {
        desc1: [{vcMetadata: JSON.stringify({isPinned: false})}],
      },
      checkIfAnyVCHasImage: jest.fn(() => true),
      checkIfAllVCsHasImage: jest.fn(() => true),
      getSelectedVCs: jest.fn(() => ({vc1: {}})),
    });
    const {toJSON} = render(<SendVPScreen {...navProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render with multiple input descriptors and cards selected', () => {
    mockController.__setMockOverrides({
      vcsMatchingAuthRequest: {
        desc1: [{vcMetadata: JSON.stringify({isPinned: false})}],
        desc2: [{vcMetadata: JSON.stringify({isPinned: true})}],
      },
      inputDescriptorIdToSelectedVcKeys: {
        desc1: ['key1'],
        desc2: ['key2'],
      },
      purpose: 'Multi-credential verification',
    });
    const {toJSON} = render(<SendVPScreen {...navProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render authorization flow purpose text', () => {
    mockController.__setMockOverrides({
      isAuthorizationFlow: true,
      vcsMatchingAuthRequest: {
        desc1: [{vcMetadata: JSON.stringify({isPinned: false})}],
      },
      purpose: 'Authorization purpose',
      vpVerifierName: 'AuthVerifier',
    });
    const {toJSON} = render(<SendVPScreen {...navProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render with confirmation popup overlay', () => {
    mockController.__setMockOverrides({
      vcsMatchingAuthRequest: {
        desc1: [{vcMetadata: JSON.stringify({isPinned: false})}],
      },
      showConfirmationPopup: true,
      isOVPViaDeepLink: true,
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
      vcsMatchingAuthRequest: {
        desc1: [{vcMetadata: JSON.stringify({isPinned: false})}],
      },
      isInvalidIdentity: true,
      credentials: [{id: 'vc1'}],
      verifiableCredentialsData: [{credential: 'data'}],
    });
    const {toJSON} = render(<SendVPScreen {...navProps} />);
    expect(toJSON()).toMatchSnapshot();
  });
});
