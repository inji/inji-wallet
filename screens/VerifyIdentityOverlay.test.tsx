import React from 'react';
import {render} from '@testing-library/react-native';

jest.mock('../components/FaceScanner/FaceScanner', () => ({
  FaceScanner: () => null,
}));

jest.mock('../components/ui/Modal', () => ({
  Modal: ({children, ...props}: any) => {
    const {View} = require('react-native');
    return (
      <View testID="modal" {...props}>
        {children}
      </View>
    );
  },
}));

jest.mock('../components/ui/Error', () => ({
  ErrorView: () => null,
}));

jest.mock('../components/ui/svg', () => ({
  SvgImage: {
    PermissionDenied: () => 'PermissionDenied',
  },
}));

jest.mock('../shared/constants', () => ({
  isIOS: () => false,
  isAndroid: () => true,
}));

import {VerifyIdentityOverlay} from './VerifyIdentityOverlay';

describe('VerifyIdentityOverlay', () => {
  const defaultProps = {
    credential: [{credentialSubject: {}}] as any,
    verifiableCredentialData: [{face: 'mockFace'}],
    isVerifyingIdentity: true,
    onCancel: jest.fn(),
    onFaceValid: jest.fn(),
    onFaceInvalid: jest.fn(),
    isInvalidIdentity: false,
    onNavigateHome: jest.fn(),
    onRetryVerification: jest.fn(),
    isLivenessEnabled: false,
  };

  it('should render when verifying identity', () => {
    const {toJSON} = render(<VerifyIdentityOverlay {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render when not verifying', () => {
    const {toJSON} = render(
      <VerifyIdentityOverlay {...defaultProps} isVerifyingIdentity={false} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
