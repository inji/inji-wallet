import React from 'react';
import {render} from '@testing-library/react-native';

jest.mock('../../components/ui/Modal', () => ({
  Modal: ({children, ...props}: any) => {
    const {View} = require('react-native');
    return (
      <View testID="modal" {...props}>
        {children}
      </View>
    );
  },
}));

jest.mock('../../components/MessageOverlay', () => ({
  MessageOverlay: () => null,
}));

jest.mock('../../components/ui/ToastItem', () => ({
  ToastItem: () => null,
}));

jest.mock('./MyVcs/OtpVerificationModal', () => ({
  OtpVerificationModal: () => null,
}));

jest.mock('./MyVcs/BindingVcWarningOverlay', () => ({
  BindingVcWarningOverlay: () => null,
}));

jest.mock('../../components/VC/VcDetailsContainer', () => ({
  VcDetailsContainer: () => {
    const {View} = require('react-native');
    return <View testID="vcDetailsContainer" />;
  },
}));

jest.mock('../../components/BannerNotificationContainer', () => ({
  BannerNotificationContainer: () => null,
}));

jest.mock('../../components/BannerNotification', () => ({
  BannerNotification: () => null,
  BannerStatus: {},
}));

jest.mock('../../components/HelpScreen', () => ({
  HelpScreen: () => null,
}));

jest.mock('../../components/KebabPopUp', () => ({
  KebabPopUp: () => null,
}));

jest.mock('../../components/ui/svg', () => ({
  SvgImage: {
    kebabIcon: () => 'kebabIcon',
  },
}));

jest.mock('../../shared/VCMetadata', () => ({
  VCMetadata: {fromVC: (v: any) => v},
}));

jest.mock('./MyVcs/WalletBinding', () => ({
  WalletBinding: () => null,
}));

jest.mock('./MyVcs/RemoveVcWarningOverlay', () => ({
  RemoveVcWarningOverlay: () => null,
}));

jest.mock('./MyVcs/HistoryTab', () => ({
  HistoryTab: () => null,
}));

jest.mock('../../shared/openId4VCI/Utils', () => ({
  getDetailedViewFields: () =>
    Promise.resolve({
      fields: [],
      wellknownFieldsFlag: false,
      matchingCredentialIssuerMetadata: null,
    }),
}));

jest.mock('../../components/VC/common/VCUtils', () => ({
  DETAIL_VIEW_DEFAULT_FIELDS: [],
  isVCLoaded: () => true,
}));

jest.mock('../../components/VC/common/VCProcessor', () => ({
  VCProcessor: {processForRendering: () => Promise.resolve({})},
}));

jest.mock('../../components/ui/HelpIcon', () => ({
  HelpIcon: () => 'HelpIcon',
}));

jest.mock('../../shared/vcRenderer/VcRenderer', () => ({
  __esModule: true,
  default: {getInstance: () => ({generateCredentialDisplayContent: jest.fn()})},
}));

jest.mock('../../shared/vcVerifier/VcVerifier', () => ({
  RevocationStatus: {
    TRUE: 'TRUE',
    FALSE: 'FALSE',
    UNDETERMINED: 'UNDETERMINED',
  },
}));

jest.mock('../../shared/commonUtil', () => jest.fn(() => ({})));

jest.mock('../../shared/constants', () => ({
  isIOS: () => false,
  isAndroid: () => true,
}));

jest.mock('../../components/ui/ActivityIndicator', () => ({
  ActivityIndicator: () => null,
}));

jest.mock('../../shared/telemetry/TelemetryConstants', () => ({
  TelemetryConstants: {FlowType: {vcActivation: 'vcActivation'}},
}));

const defaultViewVcControllerValues = {
  verifiableCredentialData: {
    face: 'mockFace',
    vcMetadata: {
      isVerified: true,
      isRevoked: 'FALSE',
      issuerHost: 'https://issuer.test',
      format: 'ldp_vc',
    },
    format: 'ldp_vc',
    credentialConfigurationId: 'testConfig',
  },
  credential: {credential: {}, type: 'test'},
  verificationStatus: {
    statusType: 'valid',
    isRevoked: 'FALSE',
    isExpired: false,
    vcType: 'Test',
    vcNumber: '123',
  },
  isVerificationInProgress: false,
  isVerificationCompleted: false,
  isAcceptingBindingOtp: false,
  isBindingWarning: false,
  isBindingError: false,
  isWalletBindingInProgress: false,
  isReverifyingVc: false,
  walletBindingError: '',
  walletBindingResponse: null,
  otpError: '',
  isCommunicationDetails: {phoneNumber: '', emailId: ''},
  toastVisible: false,
  message: '',
  showVerificationStatusBanner: false,
  addtoWallet: jest.fn(),
  inputOtp: jest.fn(),
  CONFIRM: jest.fn(),
  CANCEL: jest.fn(),
  DISMISS: jest.fn(),
  RESEND_OTP: jest.fn(),
  SHOW_VERIFICATION_STATUS_BANNER: jest.fn(),
  RESET_VERIFICATION_STATUS: jest.fn(),
};

let mockViewVcOverrides: any = {};

jest.mock('./ViewVcModalController', () => ({
  useViewVcModal: () => ({
    ...defaultViewVcControllerValues,
    ...mockViewVcOverrides,
  }),
}));

import {ViewVcModal} from './ViewVcModal';

describe('ViewVcModal', () => {
  const mockVcItemActor = {
    send: jest.fn(),
    getSnapshot: () => ({context: {isMachineInKebabPopupState: false}}),
  };

  const defaultProps = {
    isVisible: true,
    onDismiss: jest.fn(),
    vcItemActor: mockVcItemActor as any,
    activeTab: 0,
    flow: 'downloadedVc' as const,
  };

  beforeEach(() => {
    mockViewVcOverrides = {};
  });

  it('should render when visible', () => {
    const {toJSON} = render(<ViewVcModal {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render when not visible', () => {
    const {toJSON} = render(
      <ViewVcModal {...defaultProps} isVisible={false} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render with binding OTP state', () => {
    mockViewVcOverrides = {
      isAcceptingBindingOtp: true,
      isCommunicationDetails: {
        phoneNumber: '1234567890',
        emailId: 'test@test.com',
      },
    };
    const {toJSON} = render(<ViewVcModal {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render with binding warning', () => {
    mockViewVcOverrides = {isBindingWarning: true};
    const {toJSON} = render(<ViewVcModal {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render with verification in progress', () => {
    mockViewVcOverrides = {isVerificationInProgress: true};
    const {toJSON} = render(<ViewVcModal {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render with verification status banner', () => {
    mockViewVcOverrides = {showVerificationStatusBanner: true};
    const {toJSON} = render(<ViewVcModal {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render with binding error', () => {
    mockViewVcOverrides = {
      isBindingError: true,
      walletBindingError: 'Binding failed',
    };
    const {toJSON} = render(<ViewVcModal {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render with toast visible', () => {
    mockViewVcOverrides = {toastVisible: true, message: 'Copied!'};
    const {toJSON} = render(<ViewVcModal {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render with wallet binding in progress', () => {
    mockViewVcOverrides = {isWalletBindingInProgress: true};
    const {toJSON} = render(<ViewVcModal {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render with reverifying Vc', () => {
    mockViewVcOverrides = {isReverifyingVc: true};
    const {toJSON} = render(<ViewVcModal {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render with revoked status', () => {
    mockViewVcOverrides = {
      verificationStatus: {
        statusType: 'revoked',
        isRevoked: 'TRUE',
        isExpired: false,
        vcType: 'Test',
        vcNumber: '123',
      },
      verifiableCredentialData: {
        ...defaultViewVcControllerValues.verifiableCredentialData,
        vcMetadata: {
          ...defaultViewVcControllerValues.verifiableCredentialData.vcMetadata,
          isRevoked: 'TRUE',
        },
      },
    };
    const {toJSON} = render(<ViewVcModal {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render with expired status', () => {
    mockViewVcOverrides = {
      verificationStatus: {
        statusType: 'expired',
        isRevoked: 'FALSE',
        isExpired: true,
        vcType: 'Test',
        vcNumber: '123',
      },
    };
    const {toJSON} = render(<ViewVcModal {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render with verification completed', () => {
    mockViewVcOverrides = {isVerificationCompleted: true};
    const {toJSON} = render(<ViewVcModal {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render with walletBindingResponse', () => {
    mockViewVcOverrides = {
      walletBindingResponse: {
        walletBindingId: 'wbid1',
        keyId: 'kid1',
        thumbprint: 'thumb1',
      },
    };
    const {toJSON} = render(<ViewVcModal {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render with OTP error', () => {
    mockViewVcOverrides = {
      isAcceptingBindingOtp: true,
      otpError: 'Invalid OTP',
    };
    const {toJSON} = render(<ViewVcModal {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render with different flow type', () => {
    const {toJSON} = render(
      <ViewVcModal {...defaultProps} flow={'receivedVc' as any} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render with activeTab 1 (history)', () => {
    const {toJSON} = render(<ViewVcModal {...defaultProps} activeTab={1} />);
    expect(toJSON()).toMatchSnapshot();
  });
});
