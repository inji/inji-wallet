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

jest.mock('./SendVcScreenController', () => ({
  useSendVcScreen: () => ({
    shareableVcsMetadata: [],
    selectedIndex: null,
    isCancelling: false,
    isVerifyingIdentity: false,
    isInvalidIdentity: false,
    isFaceVerificationConsent: false,
    credential: null,
    verifiableCredentialData: [{}],
    SELECT_VC_ITEM: () => jest.fn(),
    ACCEPT_REQUEST: jest.fn(),
    VERIFY_AND_ACCEPT_REQUEST: jest.fn(),
    CANCEL: jest.fn(),
    FACE_VALID: jest.fn(),
    FACE_INVALID: jest.fn(),
    GO_TO_HOME: jest.fn(),
    RETRY_VERIFICATION: jest.fn(),
    FACE_VERIFICATION_CONSENT: jest.fn(),
    DISMISS: jest.fn(),
  }),
}));

jest.mock('../../shared/GlobalContext', () => {
  const React = require('react');
  return {
    GlobalContext: React.createContext({
      appService: {
        getSnapshot: () => ({context: {serviceRefs: {}}}),
      },
    }),
  };
});

jest.mock(
  '../../machines/VerifiableCredential/VCItemMachine/VCItemMachine',
  () => ({
    createVCItemMachine: jest.fn(),
  }),
);

jest.mock('@xstate/react', () => ({
  useInterpret: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('../VerifyIdentityOverlay', () => ({
  VerifyIdentityOverlay: () => null,
}));

jest.mock('./FaceVerificationAlertOverlay', () => ({
  FaceVerificationAlertOverlay: () => null,
}));

jest.mock('../../components/VC/VcItemContainer', () => ({
  VcItemContainer: () => null,
}));

jest.mock('../../shared/Utils', () => ({
  getVCsOrderedByPinStatus: (vcs: any) => vcs || [],
  VCItemContainerFlowType: {VC_SHARE: 'VC_SHARE'},
}));

jest.mock('../../shared/telemetry/TelemetryUtils', () => ({
  getImpressionEventData: jest.fn(),
  sendImpressionEvent: jest.fn(),
}));

jest.mock('../../shared/telemetry/TelemetryConstants', () => ({
  TelemetryConstants: {
    FlowType: {senderVcShare: 'senderVcShare'},
    Screens: {vcList: 'vcList'},
  },
}));

jest.mock('../../shared/constants', () => ({
  isIOS: () => false,
  isAndroid: () => true,
  LIVENESS_CHECK: false,
}));

import {SendVcScreen} from './SendVcScreen';

describe('SendVcScreen', () => {
  it('should render empty state', () => {
    const {toJSON} = render(<SendVcScreen />);
    expect(toJSON()).toMatchSnapshot();
  });
});
