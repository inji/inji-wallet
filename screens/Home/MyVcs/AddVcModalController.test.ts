jest.mock('@xstate/react', () => ({
  useSelector: jest.fn(() => undefined),
}));

jest.mock('./AddVcModalMachine', () => ({
  AddVcModalEvents: {
    INPUT_OTP: jest.fn(otp => ({type: 'INPUT_OTP', otp})),
    RESEND_OTP: jest.fn(() => ({type: 'RESEND_OTP'})),
    DISMISS: jest.fn(() => ({type: 'DISMISS'})),
  },
  selectIsAcceptingOtpInput: jest.fn(),
  selectIsRequestingCredential: jest.fn(),
  selectOtpError: jest.fn(),
  selectIsAcceptingIdInput: jest.fn(),
  selectIsCancellingDownload: jest.fn(),
  selectIsPhoneNumber: jest.fn(),
  selectIsEmail: jest.fn(),
}));

import {useAddVcModal} from './AddVcModalController';

describe('useAddVcModal', () => {
  const mockSend = jest.fn();
  const mockService = {send: mockSend} as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('INPUT_OTP sends otp event to service', () => {
    const result = useAddVcModal({service: mockService} as any);
    result.INPUT_OTP('123456');
    expect(mockSend).toHaveBeenCalled();
  });

  it('RESEND_OTP sends event to service', () => {
    const result = useAddVcModal({service: mockService} as any);
    result.RESEND_OTP();
    expect(mockSend).toHaveBeenCalled();
  });

  it('DISMISS sends event to service', () => {
    const result = useAddVcModal({service: mockService} as any);
    result.DISMISS();
    expect(mockSend).toHaveBeenCalled();
  });
});
