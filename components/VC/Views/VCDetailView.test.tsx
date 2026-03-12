import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';

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

jest.mock('react-native-svg/css', () => ({SvgCss: () => null}));
jest.mock('react-native-vector-icons/FontAwesome', () => 'FontAwesomeIcon');
jest.mock('react-native-vector-icons/Feather', () => 'FeatherIcon');
jest.mock('../../../shared/VCMetadata', () => ({VCMetadata: jest.fn()}));
jest.mock('../../ui/svg', () => ({
  SvgImage: {
    WalletUnActivatedLargeIcon: () => 'WalletUnActivatedLargeIcon',
    WalletActivatedLargeIcon: () => 'WalletActivatedLargeIcon',
  },
}));
jest.mock('../common/VCUtils', () => ({
  isVCLoaded: jest.fn(() => true),
  getCredentialType: jest.fn(() => 'MockType'),
  Display: jest.fn().mockImplementation(() => ({
    getTextColor: jest.fn((f: string) => f),
    getBackgroundColor: jest.fn((f: string) => f),
    getBackgroundImage: jest.fn((f: any) => f),
    getLogo: jest.fn(() => null),
  })),
  formatKeyLabel: jest.fn((key: string) => key),
  fieldItemIterator: jest.fn(() => []),
  DETAIL_VIEW_DEFAULT_FIELDS: [],
  DETAIL_VIEW_BOTTOM_SECTION_FIELDS: [],
  BOTTOM_SECTION_FIELDS_WITH_DETAILED_ADDRESS_FIELDS: [],
}));
jest.mock('../common/VCItemField', () => ({VCItemFieldValue: () => null}));
jest.mock('../../../shared/openId4VCI/Utils', () => ({
  isActivationNeeded: jest.fn(() => false),
  getDetailedViewFields: jest.fn(() =>
    Promise.resolve({fields: [], matchingCredentialIssuerMetadata: null}),
  ),
}));
jest.mock('../../QrCodeOverlay', () => ({QrCodeOverlay: () => null}));
jest.mock('./ShareableInfoModal', () => ({ShareableInfoModal: () => null}));
jest.mock('../../../shared/VCFormat', () => ({VCFormat: {}}));
jest.mock('../../../shared/constants', () => ({
  QR_IMAGE_ID: 'qr',
  isAndroid: () => true,
  isIOS: () => false,
}));
jest.mock('../../ui/ActivityIndicator', () => ({
  ActivityIndicator: () => null,
}));
jest.mock('../../../shared/commonUtil', () => {
  const fn = jest.fn(() => ({}));
  return {__esModule: true, default: fn};
});
jest.mock('react-native-vector-icons/Feather', () => 'FeatherIcon');

import {VCDetailView, DisclosureInfoNote} from './VCDetailView';

describe('VCDetailView', () => {
  const defaultProps = {
    fields: [{name: 'Full Name', value: 'Test User'}],
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
    wellknownFieldsFlag: true,
    credential: {credentialSubject: {name: 'Test User'}, disclosedKeys: []},
    verifiableCredentialData: {
      face: undefined,
      vcMetadata: {format: 'ldp_vc', issuerHost: 'test'},
    },
    walletBindingResponse: null,
    credentialWrapper: {credential: {credentialSubject: {}}, format: 'ldp_vc'},
    activeTab: 0,
    vcHasImage: false,
    svgTemplate: null,
    svgRendererError: null,
    loadingSvg: false,
    onBinding: jest.fn(),
  } as any;

  it('should render VCDetailView', () => {
    const {toJSON} = render(<VCDetailView {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render DisclosureInfoNote', () => {
    const {toJSON} = render(<DisclosureInfoNote />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render ActivityIndicator when loadingSvg is true', () => {
    const {toJSON} = render(
      <VCDetailView {...defaultProps} loadingSvg={true} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render SVG template when svgTemplate is provided', () => {
    const {toJSON} = render(
      <VCDetailView
        {...defaultProps}
        svgTemplate={['<svg viewBox="0 0 300 200"></svg>']}
      />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should show wallet unactivated section when activation is needed', () => {
    const {isActivationNeeded} = require('../../../shared/openId4VCI/Utils');
    isActivationNeeded.mockReturnValue(true);

    const {getByText} = render(
      <VCDetailView
        {...defaultProps}
        vcHasImage={true}
        walletBindingResponse={null}
        verifiableCredentialData={{
          face: undefined,
          vcMetadata: {
            format: 'ldp_vc',
            issuerHost: 'test',
            isExpired: false,
            isVerified: true,
          },
          issuer: 'test-issuer',
        }}
      />,
    );
    expect(getByText('offlineAuthDisabledHeader')).toBeTruthy();
    expect(getByText('enableVerification')).toBeTruthy();

    isActivationNeeded.mockReturnValue(false);
  });

  it('should show wallet activated section when walletBindingResponse exists', () => {
    const {isActivationNeeded} = require('../../../shared/openId4VCI/Utils');
    isActivationNeeded.mockReturnValue(true);

    const {getByText} = render(
      <VCDetailView
        {...defaultProps}
        vcHasImage={true}
        walletBindingResponse={{walletBindingId: 'abc'}}
        verifiableCredentialData={{
          face: undefined,
          vcMetadata: {format: 'ldp_vc', issuerHost: 'test', isExpired: false},
          issuer: 'test-issuer',
        }}
      />,
    );
    expect(getByText('profileAuthenticated')).toBeTruthy();

    isActivationNeeded.mockReturnValue(false);
  });

  it('should call onBinding when enable verification button is pressed', () => {
    const {isActivationNeeded} = require('../../../shared/openId4VCI/Utils');
    isActivationNeeded.mockReturnValue(true);
    const onBinding = jest.fn();

    const {getByText} = render(
      <VCDetailView
        {...defaultProps}
        vcHasImage={true}
        walletBindingResponse={null}
        onBinding={onBinding}
        verifiableCredentialData={{
          face: undefined,
          vcMetadata: {
            format: 'ldp_vc',
            issuerHost: 'test',
            isExpired: false,
            isVerified: true,
          },
          issuer: 'test-issuer',
        }}
      />,
    );
    fireEvent.press(getByText('enableVerification'));
    expect(onBinding).toHaveBeenCalled();

    isActivationNeeded.mockReturnValue(false);
  });
});
