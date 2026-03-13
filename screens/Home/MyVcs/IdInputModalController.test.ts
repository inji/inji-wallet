jest.mock('@xstate/react', () => ({
  useSelector: jest.fn(() => undefined),
}));

jest.mock('./AddVcModalMachine', () => ({
  AddVcModalEvents: {
    SET_INDIVIDUAL_ID: jest.fn(id => ({type: 'SET_INDIVIDUAL_ID', id})),
    INPUT_ID: jest.fn(id => ({type: 'INPUT_ID', id})),
    SELECT_ID_TYPE: jest.fn(val => ({type: 'SELECT_ID_TYPE', val})),
    VALIDATE_INPUT: jest.fn(() => ({type: 'VALIDATE_INPUT'})),
    INPUT_OTP: jest.fn(otp => ({type: 'INPUT_OTP', otp})),
    READY: jest.fn(input => ({type: 'READY', input})),
    DISMISS: jest.fn(() => ({type: 'DISMISS'})),
  },
  selectId: jest.fn(),
  selectIdError: jest.fn(),
  selectIdInputRef: jest.fn(),
  selectIdType: jest.fn(),
  selectIsAcceptingOtpInput: jest.fn(),
  selectIsInvalid: jest.fn(),
  selectIsRequestingOtp: jest.fn(),
  selectOtpError: jest.fn(),
}));

import {useIdInputModal} from './IdInputModalController';

describe('useIdInputModal', () => {
  const mockSend = jest.fn();
  const mockService = {send: mockSend} as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return expected properties', () => {
    const result = useIdInputModal({service: mockService} as any);
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('idType');
    expect(result).toHaveProperty('idInputRef');
    expect(result).toHaveProperty('idError');
    expect(result).toHaveProperty('otpError');
    expect(result).toHaveProperty('isInvalid');
    expect(result).toHaveProperty('isAcceptingOtpInput');
    expect(result).toHaveProperty('isRequestingOtp');
  });

  it('SET_INDIVIDUAL_ID sends event to service', () => {
    const result = useIdInputModal({service: mockService} as any);
    result.SET_INDIVIDUAL_ID({id: '123', idType: 'UIN'} as any);
    expect(mockSend).toHaveBeenCalled();
  });

  it('INPUT_ID sends event to service', () => {
    const result = useIdInputModal({service: mockService} as any);
    result.INPUT_ID('test-id');
    expect(mockSend).toHaveBeenCalled();
  });

  it('SELECT_ID_TYPE sends event to service', () => {
    const result = useIdInputModal({service: mockService} as any);
    result.SELECT_ID_TYPE('UIN' as any);
    expect(mockSend).toHaveBeenCalled();
  });

  it('VALIDATE_INPUT sends event to service', () => {
    const result = useIdInputModal({service: mockService} as any);
    result.VALIDATE_INPUT();
    expect(mockSend).toHaveBeenCalled();
  });

  it('INPUT_OTP sends event to service', () => {
    const result = useIdInputModal({service: mockService} as any);
    result.INPUT_OTP('123456');
    expect(mockSend).toHaveBeenCalled();
  });

  it('READY sends event to service', () => {
    const result = useIdInputModal({service: mockService} as any);
    result.READY({} as any);
    expect(mockSend).toHaveBeenCalled();
  });

  it('DISMISS sends event to service', () => {
    const result = useIdInputModal({service: mockService} as any);
    result.DISMISS();
    expect(mockSend).toHaveBeenCalled();
  });
});
