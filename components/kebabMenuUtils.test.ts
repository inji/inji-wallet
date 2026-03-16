import React from 'react';
import {render} from '@testing-library/react-native';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({t: (key: string) => key}),
}));
jest.mock('./ui/svg', () => ({
  SvgImage: {
    OutlinedPinIcon: jest.fn(() => 'PinIcon'),
    OutlinedScheduleIcon: jest.fn(() => 'ScheduleIcon'),
    ReverifyIcon: jest.fn(() => 'ReverifyIcon'),
    outlinedDeleteIcon: jest.fn(() => 'DeleteIcon'),
    OutlinedShareIcon: jest.fn(() => 'ShareIcon'),
    OutlinedShareWithSelfieIcon: jest.fn(() => 'ShareSelfieIcon'),
    OutlinedShieldedIcon: jest.fn(() => 'ShieldIcon'),
  },
}));
jest.mock('./KebabPopUpController', () => ({
  useKebabPopUp: jest.fn(() => ({
    SELECT_VC_ITEM: jest.fn(),
    GOTO_SCANSCREEN: jest.fn(),
    PIN_CARD: jest.fn(),
    SHOW_ACTIVITY: jest.fn(),
    REVERIFY_VC: jest.fn(),
    REMOVE: jest.fn(),
    ADD_WALLET_BINDING_ID: jest.fn(),
    walletBindingResponse: null,
  })),
}));
jest.mock('../shared/openId4VCI/Utils', () => ({
  isActivationNeeded: jest.fn(
    (issuer: string) => issuer === 'Mosip' || issuer === 'MosipOtp',
  ),
}));
jest.mock('../shared/Utils', () => ({
  VCShareFlowType: {
    SIMPLE_SHARE: 'simple share',
    MINI_VIEW_SHARE: 'mini view share',
    MINI_VIEW_SHARE_WITH_SELFIE: 'mini view share with selfie',
    MINI_VIEW_QR_LOGIN: 'mini view qr login',
  },
}));

import {getKebabMenuOptions} from './kebabMenuUtils';
import {useKebabPopUp} from './KebabPopUpController';

describe('kebabMenuUtils', () => {
  const mockService = {send: jest.fn()};
  const baseProps = {
    service: mockService,
    vcMetadata: {
      isPinned: false,
      issuer: 'TestIssuer',
      isVerified: false,
      isExpired: false,
    },
    vcHasImage: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return base menu items for unverified VC', () => {
    const result = getKebabMenuOptions(baseProps);
    expect(result.length).toBe(4);
    expect(result[0].testID).toBe('pinOrUnPinCard');
    expect(result[1].testID).toBe('viewActivityLog');
    expect(result[2].testID).toBe('reverify');
    expect(result[3].testID).toBe('removeFromWallet');
  });

  it('should show unPinCard label when isPinned is true', () => {
    const props = {
      ...baseProps,
      vcMetadata: {...baseProps.vcMetadata, isPinned: true},
    };
    const result = getKebabMenuOptions(props);
    expect(result[0].label).toBe('unPinCard');
  });

  it('should show pinCard label when isPinned is false', () => {
    const result = getKebabMenuOptions(baseProps);
    expect(result[0].label).toBe('pinCard');
  });

  it('should add share option when VC is verified', () => {
    const props = {
      ...baseProps,
      vcMetadata: {...baseProps.vcMetadata, isVerified: true},
    };
    const result = getKebabMenuOptions(props);
    const shareItem = result.find(item => item.testID === 'shareVcFromKebab');
    expect(shareItem).toBeDefined();
    expect(shareItem.label).toBe('share');
  });

  it('should add share with selfie and activation when VC is verified and has image', () => {
    const props = {
      ...baseProps,
      vcMetadata: {...baseProps.vcMetadata, isVerified: true, issuer: 'Mosip'},
      vcHasImage: true,
    };
    const result = getKebabMenuOptions(props);
    const selfieItem = result.find(
      item => item.testID === 'shareVcWithSelfieFromKebab',
    );
    const activationItem = result.find(
      item => item.testID === 'pendingActivationOrActivated',
    );
    expect(selfieItem).toBeDefined();
    expect(activationItem).toBeDefined();
  });

  it('should remove activation option when VC is expired', () => {
    const props = {
      ...baseProps,
      vcMetadata: {
        ...baseProps.vcMetadata,
        isVerified: true,
        isExpired: true,
        issuer: 'Mosip',
      },
      vcHasImage: true,
    };
    const result = getKebabMenuOptions(props);
    const activationItem = result.find(
      item => item.testID === 'pendingActivationOrActivated',
    );
    expect(activationItem).toBeUndefined();
  });

  it('should show activation disabled label when wallet binding missing for Mosip issuer', () => {
    (useKebabPopUp as jest.Mock).mockReturnValue({
      SELECT_VC_ITEM: jest.fn(),
      GOTO_SCANSCREEN: jest.fn(),
      PIN_CARD: jest.fn(),
      SHOW_ACTIVITY: jest.fn(),
      REVERIFY_VC: jest.fn(),
      REMOVE: jest.fn(),
      ADD_WALLET_BINDING_ID: jest.fn(),
      walletBindingResponse: null,
    });
    const props = {
      ...baseProps,
      vcMetadata: {...baseProps.vcMetadata, isVerified: true, issuer: 'Mosip'},
      vcHasImage: true,
    };
    const result = getKebabMenuOptions(props);
    const activationItem = result.find(
      item => item.testID === 'pendingActivationOrActivated',
    );
    expect(activationItem).toBeDefined();
    expect(activationItem.label).toBe(
      'WalletBinding:offlineAuthenticationDisabled',
    );
  });

  it('should show credential activated when binding exists and not activation needed', () => {
    (useKebabPopUp as jest.Mock).mockReturnValue({
      SELECT_VC_ITEM: jest.fn(),
      GOTO_SCANSCREEN: jest.fn(),
      PIN_CARD: jest.fn(),
      SHOW_ACTIVITY: jest.fn(),
      REVERIFY_VC: jest.fn(),
      REMOVE: jest.fn(),
      ADD_WALLET_BINDING_ID: jest.fn(),
      walletBindingResponse: {walletBindingId: 'test'},
    });
    const props = {
      ...baseProps,
      vcMetadata: {
        ...baseProps.vcMetadata,
        isVerified: true,
        issuer: 'OtherIssuer',
      },
      vcHasImage: true,
    };
    const result = getKebabMenuOptions(props);
    const activationItem = result.find(
      item => item.testID === 'pendingActivationOrActivated',
    );
    expect(activationItem).toBeDefined();
    expect(activationItem.label).toBe('WalletBinding:credentialActivated');
  });
});
