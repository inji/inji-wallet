jest.mock('@xstate/react', () => ({
  useSelector: jest.fn(() => undefined),
}));

jest.mock('./GetVcModalMachine', () => ({
  GetVcModalEvents: {
    INPUT_OTP: jest.fn(otp => ({type: 'INPUT_OTP', otp})),
    RESEND_OTP: jest.fn(() => ({type: 'RESEND_OTP'})),
    DISMISS: jest.fn(() => ({type: 'DISMISS'})),
  },
  selectIsAcceptingOtpInput: jest.fn(),
  selectIsRequestingCredential: jest.fn(),
  selectOtpError: jest.fn(),
  selectIsAcceptingIdInput: jest.fn(),
  selectIsPhoneNumber: jest.fn(),
  selectIsEmail: jest.fn(),
}));

import {useGetVcModal} from './GetVcModalController';

describe('useGetVcModal', () => {
  const mockSend = jest.fn();
  const mockService = {send: mockSend} as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return expected properties', () => {
    const result = useGetVcModal({service: mockService} as any);
    expect(result).toHaveProperty('isRequestingCredential');
    expect(result).toHaveProperty('otpError');
    expect(result).toHaveProperty('phoneNumber');
    expect(result).toHaveProperty('email');
    expect(result).toHaveProperty('isAcceptingUinInput');
    expect(result).toHaveProperty('isAcceptingOtpInput');
    expect(result).toHaveProperty('INPUT_OTP');
    expect(result).toHaveProperty('RESEND_OTP');
    expect(result).toHaveProperty('DISMISS');
  });

  it('INPUT_OTP sends otp event to service', () => {
    const result = useGetVcModal({service: mockService} as any);
    result.INPUT_OTP('123456');
    expect(mockSend).toHaveBeenCalled();
  });

  it('RESEND_OTP sends event to service', () => {
    const result = useGetVcModal({service: mockService} as any);
    result.RESEND_OTP();
    expect(mockSend).toHaveBeenCalled();
  });

  it('DISMISS sends event to service', () => {
    const result = useGetVcModal({service: mockService} as any);
    result.DISMISS();
    expect(mockSend).toHaveBeenCalled();
  });
});
