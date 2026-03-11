import React from 'react';
import {render} from '@testing-library/react-native';

jest.mock('./ReceiveVcScreenController', () => {
  const defaultValues = {
    isDisplayingIncomingVC: true,
    isAccepting: false,
    credential: {credential: {credentialSubject: {name: 'Test'}}},
    verifiableCredentialData: {
      face: undefined,
      vcMetadata: {format: 'ldp_vc', issuerHost: 'test'},
      credentialConfigurationId: 'id1',
    },
    senderInfo: {name: 'Sender', deviceName: 'Phone'},
    GO_TO_RECEIVED_VC_TAB: jest.fn(),
    isSavingFailedInIdle: false,
    RESET: jest.fn(),
    STORE_INCOMING_VC_WELLKNOWN_CONFIG: jest.fn(),
  };
  let overrides = {};
  return {
    __setMockOverrides: (o: any) => {
      overrides = o;
    },
    __resetMockOverrides: () => {
      overrides = {};
    },
    useReceiveVcScreen: () => ({...defaultValues, ...overrides}),
  };
});

jest.mock('../../shared/hooks/useOverlayVisibleAfterTimeout', () => ({
  useOverlayVisibleAfterTimeout: jest.fn(() => false),
}));

jest.mock('react-native-elements', () => {
  const {View, TouchableOpacity, Text: RNText} = require('react-native');
  return {
    Button: (props: any) => (
      <TouchableOpacity testID={props.testID} onPress={props.onPress}>
        <RNText>{props.title}</RNText>
      </TouchableOpacity>
    ),
    Icon: () => <View testID="icon" />,
  };
});

jest.mock('../../components/DeviceInfoList', () => ({
  DeviceInfoList: () => null,
}));
jest.mock('../../components/VC/VcDetailsContainer', () => ({
  VcDetailsContainer: () => null,
}));
jest.mock('../../components/MessageOverlay', () => ({
  MessageOverlay: () => null,
}));
jest.mock('../Scan/SharingStatusModal', () => ({
  SharingStatusModal: () => null,
}));
jest.mock('../../components/ui/svg', () => ({
  SvgImage: {ErrorLogo: () => 'ErrorLogo'},
}));
jest.mock('../../components/VC/common/VCUtils', () => ({
  DETAIL_VIEW_DEFAULT_FIELDS: [],
}));
jest.mock('../../shared/openId4VCI/Utils', () => ({
  getDetailedViewFields: jest.fn(() =>
    Promise.resolve({
      fields: [],
      matchingCredentialIssuerMetadata: null,
      wellknownResponse: {},
    }),
  ),
}));
jest.mock('../../components/VC/common/VCProcessor', () => ({
  VCProcessor: {
    processForRendering: jest.fn(() =>
      Promise.resolve({credentialSubject: {}}),
    ),
  },
}));
jest.mock('../../shared/vcRenderer/VcRenderer', () => ({
  __esModule: true,
  default: {getInstance: () => ({generateCredentialDisplayContent: jest.fn()})},
}));

import {ReceiveVcScreen} from './ReceiveVcScreen';

const mockRecvController = require('./ReceiveVcScreenController');

describe('ReceiveVcScreen', () => {
  beforeEach(() => {
    mockRecvController.__resetMockOverrides();
    jest.clearAllMocks();
  });

  it('should render incoming VC display', () => {
    const {toJSON} = render(<ReceiveVcScreen />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render accepting state', () => {
    mockRecvController.__setMockOverrides({
      isAccepting: true,
    });
    const {toJSON} = render(<ReceiveVcScreen />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render with face image', () => {
    mockRecvController.__setMockOverrides({
      verifiableCredentialData: {
        face: 'base64FaceImage',
        vcMetadata: {format: 'ldp_vc', issuerHost: 'test'},
        credentialConfigurationId: 'id1',
      },
    });
    const {toJSON} = render(<ReceiveVcScreen />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render saving failed state', () => {
    mockRecvController.__setMockOverrides({
      isSavingFailedInIdle: true,
    });
    const {toJSON} = render(<ReceiveVcScreen />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render when not displaying incoming VC', () => {
    mockRecvController.__setMockOverrides({
      isDisplayingIncomingVC: false,
    });
    const {toJSON} = render(<ReceiveVcScreen />);
    expect(toJSON()).toMatchSnapshot();
  });
});
