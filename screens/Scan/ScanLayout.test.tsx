import React from 'react';
import {render} from '@testing-library/react-native';

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: (props: any) => {
      const {View} = require('react-native');
      return <View testID="navigator">{props.children}</View>;
    },
    Screen: (props: any) => {
      const {View} = require('react-native');
      return <View testID={`screen-${props.name}`} />;
    },
  }),
}));

jest.mock('./ScanLayoutController', () => ({
  useScanLayout: () => ({
    statusOverlay: null,
    isAccepted: false,
    isInvalid: false,
    isFaceVerifiedInVPSharing: false,
    VP_SHARE_CLOSE_BANNER: jest.fn(),
    CLOSE_BANNER: jest.fn(),
    isStayInProgress: false,
    isBleError: false,
    isSendingVc: false,
    isSendingVP: false,
    isFaceIdentityVerified: false,
    credential: null,
    verifiableCredentialData: null,
    isVerifyingIdentity: false,
    CANCEL: jest.fn(),
    FACE_VALID: jest.fn(),
    FACE_INVALID: jest.fn(),
    isInvalidIdentity: false,
    GOTO_HOME: jest.fn(),
    RETRY_VERIFICATION: jest.fn(),
    isReviewing: false,
    flowType: '',
    openID4VPFlowType: '',
    vpVerifierName: '',
    DISMISS: jest.fn(),
    isVPSharingSuccess: false,
    GOTO_HISTORY: jest.fn(),
    errorStatusOverlay: null,
    onRetry: jest.fn(),
    isOVPViaDeepLink: false,
  }),
}));

jest.mock('./SendVPScreenController', () => ({
  useSendVPScreen: () => ({
    verifierLogoInTrustModal: null,
    verifierNameInTrustModal: null,
  }),
}));

jest.mock('./SendVcScreen', () => ({SendVcScreen: () => null}));
jest.mock('./ScanScreen', () => ({ScanScreen: () => null}));
jest.mock('./SendVPScreen', () => ({SendVPScreen: () => null}));
jest.mock('./SharingStatusModal', () => ({SharingStatusModal: () => null}));
jest.mock('../../components/ui/Loader', () => ({Loader: () => null}));
jest.mock('../VerifyIdentityOverlay', () => ({
  VerifyIdentityOverlay: () => null,
}));
jest.mock('../../components/ui/svg', () => ({
  SvgImage: {SuccessLogo: () => 'SuccessLogo', ErrorLogo: () => 'ErrorLogo'},
}));
jest.mock('../../components/BannerNotification', () => ({
  BannerStatusType: {SUCCESS: 'SUCCESS'},
}));
jest.mock('../../shared/constants', () => ({
  isIOS: () => false,
  LIVENESS_CHECK: false,
  isAndroid: () => true,
}));
jest.mock('../../shared/Utils', () => ({
  VCShareFlowType: {SIMPLE_SHARE: 'SIMPLE', OPENID4VP: 'OPENID4VP'},
}));
jest.mock('../../routes/routesConstants', () => ({
  SCAN_ROUTES: {
    SendVcScreen: 'SendVc',
    SendVPScreen: 'SendVP',
    ScanScreen: 'Scan',
  },
}));

jest.mock('react-native-elements', () => {
  const {View} = require('react-native');
  return {Icon: () => <View testID="icon" />};
});

import {ScanLayout} from './ScanLayout';

describe('ScanLayout', () => {
  it('should render default state', () => {
    const {toJSON} = render(<ScanLayout />);
    expect(toJSON()).toMatchSnapshot();
  });
});
