import React from 'react';
import {render} from '@testing-library/react-native';

jest.mock('react-native-copilot', () => ({
  useCopilot: () => ({start: jest.fn()}),
  CopilotProvider: ({children}: any) => children,
  CopilotStep: ({children}: any) => children,
}));

jest.mock('../../shared/constants', () => ({
  GET_INDIVIDUAL_ID: jest.fn(),
  isIOS: () => false,
  isAndroid: () => true,
}));

jest.mock('../../components/VC/VcItemContainer', () => ({
  VcItemContainer: (props: any) => {
    const {View} = require('react-native');
    return <View testID="vcItemContainer" />;
  },
}));

jest.mock('./MyVcs/AddVcModal', () => ({
  AddVcModal: () => 'AddVcModal',
}));

jest.mock('./MyVcs/GetVcModal', () => ({
  GetVcModal: () => 'GetVcModal',
}));

jest.mock('../../components/MessageOverlay', () => ({
  MessageOverlay: (props: any) => {
    const {View} = require('react-native');
    return <View testID="messageOverlay" />;
  },
  ErrorMessageOverlay: () => null,
}));

jest.mock('../../components/BannerNotification', () => ({
  BannerNotification: () => null,
  BannerStatusType: {SUCCESS: 'success'},
}));

jest.mock('../../components/ui/Error', () => ({
  ErrorView: () => null,
}));

jest.mock('../../components/ui/svg', () => ({
  SvgImage: {
    DigitalIdentity: () => 'DigitalIdentity',
    PermissionDenied: () => 'PermissionDenied',
    NoInternetConnection: () => 'NoInternetConnection',
  },
}));

jest.mock('../../components/ui/SearchBar', () => ({
  SearchBar: () => null,
}));

jest.mock('../../shared/commonUtil', () => {
  const fn = jest.fn(() => ({}));
  fn.isTranslationKeyFound = (key: string, t: any) => false;
  return {__esModule: true, default: fn, isTranslationKeyFound: () => false};
});

jest.mock('../../shared/Utils', () => ({
  getVCsOrderedByPinStatus: (vcs: any) => vcs || [],
}));

jest.mock('../../shared/telemetry/TelemetryUtils', () => ({
  getErrorEventData: jest.fn(),
  sendErrorEvent: jest.fn(),
}));

jest.mock('../../shared/telemetry/TelemetryConstants', () => ({
  TelemetryConstants: {
    FlowType: {appOnboarding: 'appOnboarding', appLogin: 'appLogin'},
    ErrorId: {doesNotExist: 'doesNotExist', vcsAreTampered: 'vcsAreTampered'},
    ErrorMessage: {
      hardwareKeyStore: 'hardwareKeyStore',
      vcsAreTampered: 'vcsAreTampered',
    },
  },
}));

jest.mock('../../shared/VCMetadata', () => ({
  VCMetadata: {fromVC: (v: any) => v},
}));

import {MyVcsTab} from './MyVcsTab';

const defaultControllerValues = {
  vcMetadatas: [],
  vcData: {},
  isRefreshingVcs: false,
  isRequestSuccessful: false,
  showHardwareKeystoreNotExistsAlert: false,
  isBindingError: false,
  walletBindingError: '',
  isTampered: false,
  downloadFailedVcs: [],
  verificationErrorMessage: '',
  isNetworkOff: false,
  AddVcModalService: null,
  GetVcModalService: null,
  inProgressVcDownloads: new Set(),
  areAllVcsLoaded: true,
  isInitialDownloading: false,
  isOnboarding: false,
  reverificationSuccess: {status: false, vcKey: ''},
  reverificationfailure: {status: false, vcKey: ''},
  DISMISS: jest.fn(),
  GET_VC: jest.fn(),
  REFRESH: jest.fn(),
  VIEW_VC: jest.fn(),
  ACCEPT_HARDWARE_SUPPORT_NOT_EXISTS: jest.fn(),
  REMOVE_TAMPERED_VCS: jest.fn(),
  DELETE_VC: jest.fn(),
  RESET_VERIFY_ERROR: jest.fn(),
  TRY_AGAIN: jest.fn(),
  RESET_STORE_VC_ITEM_STATUS: jest.fn(),
  RESET_IN_PROGRESS_VCS_DOWNLOADED: jest.fn(),
  SET_STORE_VC_ITEM_STATUS: jest.fn(),
  SET_TOUR_GUIDE: jest.fn(),
  RESET_HIGHLIGHT: jest.fn(),
};

let mockControllerOverrides: any = {};

jest.mock('./MyVcsTabController', () => ({
  useMyVcsTab: () => ({
    ...defaultControllerValues,
    ...mockControllerOverrides,
  }),
}));

describe('MyVcsTab', () => {
  const defaultProps = {
    isVisible: true,
    isViewingVc: false,
  } as any;

  beforeEach(() => {
    mockControllerOverrides = {};
    jest.clearAllMocks();
  });

  it('should render empty state with no VCs', () => {
    const {toJSON} = render(<MyVcsTab {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render when not visible', () => {
    const {toJSON} = render(<MyVcsTab {...defaultProps} isVisible={false} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render VCs when vcMetadatas has items', () => {
    const vcMeta1 = {getVcKey: () => 'vc1', isPinned: false};
    const vcMeta2 = {getVcKey: () => 'vc2', isPinned: true};
    mockControllerOverrides = {
      vcMetadatas: [vcMeta1, vcMeta2],
      vcData: {
        vc1: {
          vcMetadata: {credentialType: 'NationalID'},
          verifiableCredential: {credentialSubject: {name: 'Alice'}},
        },
        vc2: {
          vcMetadata: {credentialType: 'DrivingLicense'},
          verifiableCredential: {credentialSubject: {name: 'Bob'}},
        },
      },
    };
    const {getAllByTestId} = render(<MyVcsTab {...defaultProps} />);
    expect(getAllByTestId('vcItemContainer').length).toBe(2);
  });

  it('should render isRequestSuccessful banner', () => {
    mockControllerOverrides = {isRequestSuccessful: true};
    const {toJSON} = render(<MyVcsTab {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render hardware keystore alert overlay', () => {
    mockControllerOverrides = {showHardwareKeystoreNotExistsAlert: true};
    const {toJSON} = render(<MyVcsTab {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render binding error overlay', () => {
    mockControllerOverrides = {
      isBindingError: true,
      walletBindingError: 'binding failed',
    };
    const {toJSON} = render(<MyVcsTab {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render tampered VCs overlay', () => {
    mockControllerOverrides = {isTampered: true};
    const {toJSON} = render(<MyVcsTab {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render download failed VCs error', () => {
    mockControllerOverrides = {
      downloadFailedVcs: [{idType: 'UIN', displayId: '12345'}],
    };
    const {toJSON} = render(<MyVcsTab {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render verification error overlay', () => {
    mockControllerOverrides = {verificationErrorMessage: 'ERR_GENERIC'};
    const {toJSON} = render(<MyVcsTab {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render network off error', () => {
    mockControllerOverrides = {isNetworkOff: true};
    const {toJSON} = render(<MyVcsTab {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render with inProgressVcDownloads', () => {
    const vcMeta = {getVcKey: () => 'vc1', isPinned: false};
    mockControllerOverrides = {
      vcMetadatas: [vcMeta],
      vcData: {vc1: null},
      inProgressVcDownloads: new Set(['vc1']),
      areAllVcsLoaded: false,
    };
    const {getAllByTestId} = render(<MyVcsTab {...defaultProps} />);
    expect(getAllByTestId('vcItemContainer').length).toBe(1);
  });

  it('should render AddVcModal when AddVcModalService is set', () => {
    mockControllerOverrides = {AddVcModalService: {}};
    const {toJSON} = render(<MyVcsTab {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render GetVcModal when GetVcModalService is set', () => {
    mockControllerOverrides = {GetVcModalService: {}};
    const {toJSON} = render(<MyVcsTab {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });
});
