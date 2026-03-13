import React from 'react';
import {render} from '@testing-library/react-native';

jest.mock('react-native-elements', () => {
  const {View, TouchableOpacity, Text: RNText} = require('react-native');
  const MockCheckBox = (props: any) => <View testID="checkbox" />;
  const MockIcon = (props: any) => <View testID="icon" />;
  return {
    CheckBox: MockCheckBox,
    Icon: MockIcon,
    Button: (props: any) => (
      <TouchableOpacity testID={props.testID} onPress={props.onPress}>
        <RNText>{props.title}</RNText>
      </TouchableOpacity>
    ),
  };
});

jest.mock('../../../shared/VCMetadata', () => ({VCMetadata: jest.fn()}));
jest.mock('../../KebabPopUp', () => ({KebabPopUp: () => null}));
jest.mock('../../ui/svg', () => ({
  SvgImage: {
    selectedCheckBox: () => 'SelectedCheckBox',
    walletUnActivatedIcon: () => 'WalletUnActivated',
    walletActivatedIcon: () => 'WalletActivated',
  },
}));
jest.mock('../../VcItemContainerProfileImage', () => ({
  VcItemContainerProfileImage: () => null,
}));
jest.mock('../common/VCUtils', () => ({
  isVCLoaded: jest.fn(() => true),
  getCredentialType: jest.fn(() => 'MockCredentialType'),
  Display: jest.fn().mockImplementation(() => ({
    getTextColor: jest.fn((fallback: string) => fallback),
    getBackgroundColor: jest.fn((fallback: string) => fallback),
    getBackgroundImage: jest.fn((fallback: any) => fallback),
    getLogo: jest.fn(() => null),
  })),
  formatKeyLabel: jest.fn((key: string) => key),
}));
jest.mock('../common/VCItemField', () => ({VCItemFieldValue: () => null}));
jest.mock('../../../screens/Home/MyVcs/WalletBinding', () => ({
  WalletBinding: () => null,
}));
jest.mock('../../VCVerification', () => ({VCVerification: () => null}));
jest.mock('../../../shared/openId4VCI/Utils', () => ({
  isActivationNeeded: jest.fn(() => false),
}));
jest.mock('../../../shared/Utils', () => ({
  VCItemContainerFlowType: {VP_SHARE: 'VP_SHARE', OPENID4VP: 'OPENID4VP'},
}));
jest.mock('../../../shared/vcVerifier/VcVerifier', () => ({
  RevocationStatus: {REVOKED: 'REVOKED'},
}));
jest.mock('../../../screens/Home/MyVcs/RemoveVcWarningOverlay', () => ({
  RemoveVcWarningOverlay: () => null,
}));
jest.mock('../../../screens/Home/MyVcs/HistoryTab', () => ({
  HistoryTab: () => null,
}));
jest.mock('react-native-copilot', () => ({
  useCopilot: () => ({start: jest.fn(), copilotEvents: {on: jest.fn()}}),
}));
jest.mock('../../../shared/commonUtil', () => {
  const fn = jest.fn(() => ({}));
  return {__esModule: true, default: fn};
});

import {VCCardViewContent} from './VCCardViewContent';

describe('VCCardViewContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultProps = {
    credential: {
      credentialSubject: {name: 'Test User'},
      disclosedKeys: ['name'],
    },
    verifiableCredentialData: {
      face: undefined,
      vcMetadata: {isExpired: false, format: 'ldp_vc'},
    },
    wellknown: {
      display: [
        {
          name: 'TestVC',
          locale: 'en',
          text_color: '#000',
          background_color: '#FFF',
        },
      ],
    },
    selectable: false,
    selected: false,
    service: {send: jest.fn()},
    onPress: jest.fn(),
    flow: undefined,
    walletBindingResponse: null,
    KEBAB_POPUP: jest.fn(),
    DISMISS: jest.fn(),
    isKebabPopUp: false,
    vcMetadata: {isPinned: false, issuerHost: 'test'},
    isInitialLaunch: false,
    isPinned: false,
    onDisclosuresChange: jest.fn(),
    fields: [],
    generatedOn: '',
    isDownloading: false,
  } as any;

  it('should render basic card content', () => {
    const {toJSON} = render(<VCCardViewContent {...defaultProps} />);
    expect(toJSON()).toBeDefined();
  });

  it('should render with selectable and selected', () => {
    const {toJSON} = render(
      <VCCardViewContent {...defaultProps} selectable={true} selected={true} />,
    );
    expect(toJSON()).toBeDefined();
  });

  it('should render with VP_SHARE flow and selectable', () => {
    const {toJSON} = render(
      <VCCardViewContent
        {...defaultProps}
        flow="VP_SHARE"
        selectable={true}
        selected={false}
      />,
    );
    expect(toJSON()).toBeDefined();
  });

  it('should render with VP_SHARE flow, selected, and disclosed keys', () => {
    const {toJSON} = render(
      <VCCardViewContent
        {...defaultProps}
        flow="VP_SHARE"
        selectable={true}
        selected={true}
        credential={{
          credentialSubject: {name: 'Test User', age: '30'},
          disclosedKeys: ['name', 'age'],
        }}
      />,
    );
    expect(toJSON()).toBeDefined();
  });

  it('should render pinned card', () => {
    const {toJSON} = render(
      <VCCardViewContent {...defaultProps} isPinned={true} />,
    );
    expect(toJSON()).toBeDefined();
  });

  it('should render with kebab popup visible', () => {
    const {toJSON} = render(
      <VCCardViewContent {...defaultProps} isKebabPopUp={true} />,
    );
    expect(toJSON()).toBeDefined();
  });

  it('should render with wallet binding response', () => {
    const {toJSON} = render(
      <VCCardViewContent
        {...defaultProps}
        walletBindingResponse={{walletBindingId: 'wbi123'}}
      />,
    );
    expect(toJSON()).toBeDefined();
  });

  it('should render with expired VC metadata', () => {
    const {isActivationNeeded} = require('../../../shared/openId4VCI/Utils');
    const {toJSON} = render(
      <VCCardViewContent
        {...defaultProps}
        verifiableCredentialData={{
          face: undefined,
          vcMetadata: {isExpired: true, format: 'ldp_vc'},
        }}
      />,
    );
    const tree = JSON.stringify(toJSON());
    // Expired VCs should not show activation icons
    expect(tree).not.toContain('WalletUnActivated');
    expect(tree).not.toContain('WalletActivated');
    expect(toJSON()).toBeDefined();
    // Activation check is skipped for expired VCs due to short-circuit evaluation
    expect(isActivationNeeded).not.toHaveBeenCalled();
  });

  it('should render with isInitialLaunch true', () => {
    const {toJSON} = render(
      <VCCardViewContent {...defaultProps} isInitialLaunch={true} />,
    );
    expect(toJSON()).toBeDefined();
  });

  it('should render when activation is needed', () => {
    const {isActivationNeeded} = require('../../../shared/openId4VCI/Utils');
    isActivationNeeded.mockReturnValueOnce(true);
    const {toJSON} = render(
      <VCCardViewContent {...defaultProps} walletBindingResponse={null} />,
    );
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('WalletUnActivated');
    expect(tree).not.toContain('WalletActivated');
    expect(isActivationNeeded).toHaveBeenCalled();
    expect(toJSON()).toBeDefined();
  });

  it('should render with face image in verifiable credential', () => {
    const {toJSON} = render(
      <VCCardViewContent
        {...defaultProps}
        verifiableCredentialData={{
          face: 'base64FaceImage',
          vcMetadata: {isExpired: false, format: 'ldp_vc'},
        }}
      />,
    );
    expect(toJSON()).toBeDefined();
  });

  it('should render with no wellknown display', () => {
    const {toJSON} = render(
      <VCCardViewContent {...defaultProps} wellknown={null} />,
    );
    expect(toJSON()).toBeDefined();
  });

  it('should render with OPENID4VP flow', () => {
    const {toJSON} = render(
      <VCCardViewContent
        {...defaultProps}
        flow="OPENID4VP"
        selectable={true}
        selected={true}
      />,
    );
    expect(toJSON()).toBeDefined();
  });

  it('should render with fields populated', () => {
    const {toJSON} = render(
      <VCCardViewContent
        {...defaultProps}
        fields={[
          {label: 'Name', value: 'Test User'},
          {label: 'DOB', value: '1990-01-01'},
        ]}
      />,
    );
    expect(toJSON()).toBeDefined();
  });

  it('should render with generatedOn date', () => {
    const {toJSON} = render(
      <VCCardViewContent
        {...defaultProps}
        generatedOn="2024-01-15T10:30:00Z"
      />,
    );
    expect(toJSON()).toBeDefined();
  });

  it('should render downloading state', () => {
    const {toJSON} = render(
      <VCCardViewContent {...defaultProps} isDownloading={true} />,
    );
    expect(toJSON()).toBeDefined();
  });

  it('should render when VC is not loaded', () => {
    const {isVCLoaded} = require('../common/VCUtils');
    isVCLoaded.mockReturnValueOnce(false);
    const {toJSON} = render(<VCCardViewContent {...defaultProps} />);
    expect(isVCLoaded).toHaveBeenCalled();
    expect(toJSON()).toBeDefined();
  });

  it('should render with revoked VC', () => {
    const {isActivationNeeded} = require('../../../shared/openId4VCI/Utils');
    const {toJSON} = render(
      <VCCardViewContent
        {...defaultProps}
        verifiableCredentialData={{
          face: undefined,
          vcMetadata: {
            isExpired: false,
            format: 'ldp_vc',
            isRevoked: 'REVOKED',
          },
        }}
      />,
    );
    const tree = JSON.stringify(toJSON());
    // Revoked but not expired — activation icons still rendered
    expect(tree).toContain('WalletActivated');
    expect(toJSON()).toBeDefined();
    // Activation check still runs for non-expired revoked VC
    expect(isActivationNeeded).toHaveBeenCalled();
  });

  it('should render VP_SHARE flow with no selection', () => {
    const {toJSON} = render(
      <VCCardViewContent
        {...defaultProps}
        flow="VP_SHARE"
        selectable={true}
        selected={false}
        credential={{
          credentialSubject: {name: 'User', email: 'user@test.com'},
          disclosedKeys: ['name', 'email'],
        }}
      />,
    );
    expect(toJSON()).toBeDefined();
  });
});
