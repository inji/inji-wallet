import React from 'react';
import {render} from '@testing-library/react-native';

jest.mock('./QrLoginController', () => ({
  useQrLogin: () => ({
    isShowingVcList: false,
    isWaitingForData: false,
    isLoadingMyVcs: false,
    isLinkTransaction: false,
    isSendingConsent: false,
    isSendingAuthenticate: false,
    isShowingError: false,
    isVerifyingIdentity: false,
    isInvalidIdentity: false,
    isRequestConsent: false,
    isVerifyingSuccesful: false,
    isFaceVerificationConsent: false,
    error: '',
    selectCredential: null,
    verifiableCredentialData: [],
    DISMISS: jest.fn(),
    CANCEL: jest.fn(),
    FACE_VALID: jest.fn(),
    FACE_INVALID: jest.fn(),
    GO_TO_HOME: jest.fn(),
    RETRY_VERIFICATION: jest.fn(),
    FACE_VERIFICATION_CONSENT: jest.fn(),
    CONFIRM: jest.fn(),
  }),
}));

jest.mock('./MyBindedVcs', () => ({
  MyBindedVcs: () => null,
}));

jest.mock('./QrLoginSuccessMessage', () => ({
  QrLoginSuccess: () => null,
}));

jest.mock('./QrConsent', () => ({
  QrConsent: () => null,
}));

jest.mock('../VerifyIdentityOverlay', () => ({
  VerifyIdentityOverlay: () => null,
}));

jest.mock('../../components/MessageOverlay', () => ({
  MessageOverlay: () => null,
}));

jest.mock('../Scan/FaceVerificationAlertOverlay', () => ({
  FaceVerificationAlertOverlay: () => null,
}));

jest.mock('../../shared/constants', () => ({
  isIOS: () => false,
  isAndroid: () => true,
  LIVENESS_CHECK: false,
}));

import {QrLogin} from './QrLogin';

describe('QrLogin', () => {
  it('should render', () => {
    const {toJSON} = render(<QrLogin isVisible={true} service={{} as any} />);
    expect(toJSON()).toMatchSnapshot();
  });
});
