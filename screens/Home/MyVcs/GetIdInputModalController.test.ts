jest.mock('@xstate/react', () => ({
  useSelector: jest.fn(() => undefined),
}));

jest.mock('./GetVcModalMachine', () => ({
  GetVcModalEvents: {
    INPUT_ID: jest.fn(id => ({type: 'INPUT_ID', id})),
    VALIDATE_INPUT: jest.fn(() => ({type: 'VALIDATE_INPUT'})),
    ACTIVATE_ICON_COLOR: jest.fn(() => ({type: 'ACTIVATE_ICON_COLOR'})),
    DEACTIVATE_ICON_COLOR: jest.fn(() => ({type: 'DEACTIVATE_ICON_COLOR'})),
    INPUT_OTP: jest.fn(otp => ({type: 'INPUT_OTP', otp})),
    READY: jest.fn(input => ({type: 'READY', input})),
    DISMISS: jest.fn(() => ({type: 'DISMISS'})),
  },
  selectIsAcceptingOtpInput: jest.fn(),
  selectIsInvalid: jest.fn(),
  selectIsRequestingOtp: jest.fn(),
  selectOtpError: jest.fn(),
  selectId: jest.fn(),
  selectIdError: jest.fn(),
  selectIconColor: jest.fn(),
  selectIdInputRef: jest.fn(),
}));

import {useGetIdInputModal} from './GetIdInputModalController';

describe('useGetIdInputModal', () => {
  const mockSend = jest.fn();
  const mockService = {send: mockSend} as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return expected properties', () => {
    const result = useGetIdInputModal({service: mockService} as any);
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('idInputRef');
    expect(result).toHaveProperty('idError');
    expect(result).toHaveProperty('otpError');
    expect(result).toHaveProperty('iconColor');
    expect(result).toHaveProperty('isInvalid');
    expect(result).toHaveProperty('isAcceptingOtpInput');
    expect(result).toHaveProperty('isRequestingOtp');
  });

  it('INPUT_ID sends id event to service', () => {
    const result = useGetIdInputModal({service: mockService} as any);
    result.INPUT_ID('test-id');
    expect(mockSend).toHaveBeenCalled();
  });

  it('VALIDATE_INPUT sends event to service', () => {
    const result = useGetIdInputModal({service: mockService} as any);
    result.VALIDATE_INPUT();
    expect(mockSend).toHaveBeenCalled();
  });

  it('ACTIVATE_ICON_COLOR sends event to service', () => {
    const result = useGetIdInputModal({service: mockService} as any);
    result.ACTIVATE_ICON_COLOR();
    expect(mockSend).toHaveBeenCalled();
  });

  it('DEACTIVATE_ICON_COLOR sends event to service', () => {
    const result = useGetIdInputModal({service: mockService} as any);
    result.DEACTIVATE_ICON_COLOR();
    expect(mockSend).toHaveBeenCalled();
  });

  it('INPUT_OTP sends otp event to service', () => {
    const result = useGetIdInputModal({service: mockService} as any);
    result.INPUT_OTP('123456');
    expect(mockSend).toHaveBeenCalled();
  });

  it('READY sends input event to service', () => {
    const result = useGetIdInputModal({service: mockService} as any);
    result.READY({} as any);
    expect(mockSend).toHaveBeenCalled();
  });

  it('DISMISS sends event to service', () => {
    const result = useGetIdInputModal({service: mockService} as any);
    result.DISMISS();
    expect(mockSend).toHaveBeenCalled();
  });
});
