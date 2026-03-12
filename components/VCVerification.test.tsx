import React from 'react';
import {render} from '@testing-library/react-native';
import {VCVerification} from './VCVerification';
import {VCMetadata} from '../shared/VCMetadata';
import {Display} from './VC/common/VCUtils';

jest.mock('../shared/vcVerifier/VcVerifier', () => ({
  RevocationStatus: {
    TRUE: 'TRUE',
    FALSE: 'FALSE',
    UNDETERMINED: 'UNDETERMINED',
  },
}));

// Mock SvgImage
jest.mock('./ui/svg', () => ({
  SvgImage: {
    statusValidIcon: () => 'StatusValidIcon',
    statusPendingIcon: () => 'StatusPendingIcon',
    statusExpiredIcon: () => 'StatusExpiredIcon',
    statusRevokedIcon: () => 'StatusRevokedIcon',
  },
}));

// Mock the Display class
const mockDisplay = {
  getTextColor: jest.fn((defaultColor: string) => defaultColor),
} as unknown as Display;

describe('VCVerification Component', () => {
  it('should render for verified and valid credential', () => {
    const vcMetadata = new VCMetadata({
      isVerified: true,
      isExpired: false,
    });

    const {toJSON} = render(
      <VCVerification vcMetadata={vcMetadata} display={mockDisplay} />,
    );

    expect(toJSON()).toMatchSnapshot();
  });

  it('should render for verified but expired credential', () => {
    const vcMetadata = new VCMetadata({
      isVerified: true,
      isExpired: true,
    });

    const {toJSON} = render(
      <VCVerification vcMetadata={vcMetadata} display={mockDisplay} />,
    );

    expect(toJSON()).toMatchSnapshot();
  });

  it('should render for pending/unverified credential', () => {
    const vcMetadata = new VCMetadata({
      isVerified: false,
      isExpired: false,
    });

    const {toJSON} = render(
      <VCVerification vcMetadata={vcMetadata} display={mockDisplay} />,
    );

    expect(toJSON()).toMatchSnapshot();
  });

  it('should render verification status text', () => {
    const vcMetadata = new VCMetadata({
      isVerified: true,
      isExpired: false,
    });

    const {getByText} = render(
      <VCVerification vcMetadata={vcMetadata} display={mockDisplay} />,
    );

    expect(getByText('valid')).toBeTruthy();
  });

  it('should call getTextColor from display prop', () => {
    const vcMetadata = new VCMetadata({
      isVerified: true,
      isExpired: false,
    });

    render(<VCVerification vcMetadata={vcMetadata} display={mockDisplay} />);

    expect(mockDisplay.getTextColor).toHaveBeenCalled();
  });

  it('should render for revoked credential', () => {
    const vcMetadata = new VCMetadata({
      isVerified: true,
      isExpired: false,
      isRevoked: 'TRUE',
    });

    const {getByText} = render(
      <VCVerification vcMetadata={vcMetadata} display={mockDisplay} />,
    );

    expect(getByText('revoked')).toBeTruthy();
  });

  it('should render for undetermined revocation status', () => {
    const vcMetadata = new VCMetadata({
      isVerified: true,
      isExpired: false,
      isRevoked: 'UNDETERMINED',
    });

    const {getByText} = render(
      <VCVerification vcMetadata={vcMetadata} display={mockDisplay} />,
    );

    expect(getByText('pending')).toBeTruthy();
  });
});
