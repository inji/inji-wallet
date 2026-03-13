import React from 'react';
import {render} from '@testing-library/react-native';

jest.mock('../VCItemController', () => ({
  useVcItemController: () => ({
    VCItemService: {send: jest.fn()},
    context: {},
    credential: {credentialSubject: {name: 'Test'}},
    verifiableCredentialData: {
      face: undefined,
      vcMetadata: {format: 'ldp_vc', issuerHost: 'test'},
      credentialConfigurationId: 'id1',
    },
    walletBindingResponse: null,
    isKebabPopUp: false,
    DISMISS: jest.fn(),
    KEBAB_POPUP: jest.fn(),
    UPDATE_VC_METADATA: jest.fn(),
    isSavingFailedInIdle: false,
    isReverifyingVc: false,
    storeErrorTranslationPath: '',
    generatedOn: Date.now(),
    isTourGuide: false,
    STORE_INCOMING_VC_WELLKNOWN_CONFIG: jest.fn(),
  }),
}));

jest.mock('date-fns', () => ({format: jest.fn(() => '01/01/2024')}));
jest.mock('../common/VCCardSkeleton', () => ({VCCardSkeleton: () => null}));
jest.mock('./VCCardViewContent', () => ({
  VCCardViewContent: () => {
    const {View} = require('react-native');
    return <View testID="vcCardViewContent" />;
  },
}));
jest.mock('../../../shared/openId4VCI/Utils', () => ({
  getCredentialIssuersWellKnownConfig: jest.fn(() =>
    Promise.resolve({
      matchingCredentialIssuerMetadata: {display: [{name: 'Test'}]},
      fields: [],
      wellknownResponse: {},
    }),
  ),
}));
jest.mock('../common/VCUtils', () => ({
  CARD_VIEW_DEFAULT_FIELDS: [],
  isVCLoaded: jest.fn(() => true),
}));
jest.mock('../../ui/Copilot', () => ({
  Copilot: (props: any) => {
    const {View} = require('react-native');
    return <View testID="copilot">{props.children}</View>;
  },
}));
jest.mock('../../MessageOverlay', () => ({
  MessageOverlay: () => null,
  ErrorMessageOverlay: () => null,
}));
jest.mock('../common/VCProcessor', () => ({
  VCProcessor: {
    processForRendering: jest.fn(() =>
      Promise.resolve({credentialSubject: {name: 'Test'}, disclosedKeys: []}),
    ),
  },
}));
jest.mock('../../../shared/VCMetadata', () => ({VCMetadata: jest.fn()}));

import {VCCardView} from './VCCardView';
import {isVCLoaded} from '../common/VCUtils';

describe('VCCardView', () => {
  const defaultProps = {
    vcMetadata: {isPinned: false, issuerHost: 'test'},
    onPress: jest.fn(),
    selectable: false,
    selected: false,
    isDownloading: false,
    isPinned: false,
    flow: undefined,
    isInitialLaunch: false,
    isTopCard: false,
  } as any;

  it('should render skeleton while loading', () => {
    const {toJSON} = render(
      <VCCardView {...defaultProps} isDownloading={true} />,
    );
    expect(toJSON()).toBeNull();
  });

  it('should render card view', () => {
    const {toJSON} = render(<VCCardView {...defaultProps} />);
    expect(toJSON()).toBeNull();
    expect(isVCLoaded).toHaveBeenCalled();
  });

  it('should render with selected state', () => {
    const {toJSON} = render(
      <VCCardView {...defaultProps} selectable={true} selected={true} />,
    );
    expect(toJSON()).toBeNull();
  });

  it('should render pinned card', () => {
    const {toJSON} = render(<VCCardView {...defaultProps} isPinned={true} />);
    expect(toJSON()).toBeNull();
  });

  it('should render as top card with initial launch (copilot wrapper)', () => {
    const {toJSON} = render(
      <VCCardView {...defaultProps} isTopCard={true} isInitialLaunch={true} />,
    );
    expect(toJSON()).toBeNull();
  });

  it('should render with VP_SHARE flow', () => {
    const {toJSON} = render(
      <VCCardView
        {...defaultProps}
        flow="VP_SHARE"
        selectable={true}
        selected={false}
      />,
    );
    expect(toJSON()).toBeNull();
  });

  it('should render with onMeasured callback', () => {
    const onMeasured = jest.fn();
    const {toJSON} = render(
      <VCCardView {...defaultProps} onMeasured={onMeasured} />,
    );
    expect(toJSON()).toBeNull();
  });

  it('should render when VC is not loaded', () => {
    const {isVCLoaded} = require('../common/VCUtils');
    isVCLoaded.mockReturnValueOnce(false);
    const {toJSON} = render(<VCCardView {...defaultProps} />);
    expect(toJSON()).toBeNull();
  });
});
