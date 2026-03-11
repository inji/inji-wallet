jest.mock('@xstate/react', () => ({
  useSelector: jest.fn(() => undefined),
}));

jest.mock('./AddVcModalMachine', () => ({
  AddVcModalEvents: {
    WAIT: jest.fn(() => ({type: 'WAIT'})),
    CANCEL: jest.fn(() => ({type: 'CANCEL'})),
  },
  selectIsCancellingDownload: jest.fn(),
}));

import {useOtpVerificationModal} from './OtpVerificationModalController';

describe('useOtpVerificationModal', () => {
  const mockSend = jest.fn();
  const mockService = {send: mockSend} as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return expected properties', () => {
    const result = useOtpVerificationModal({service: mockService} as any);
    expect(result).toHaveProperty('isDownloadCancelled');
    expect(result).toHaveProperty('WAIT');
    expect(result).toHaveProperty('CANCEL');
  });

  it('WAIT sends event to service', () => {
    const result = useOtpVerificationModal({service: mockService} as any);
    result.WAIT();
    expect(mockSend).toHaveBeenCalled();
  });

  it('CANCEL sends event to service', () => {
    const result = useOtpVerificationModal({service: mockService} as any);
    result.CANCEL();
    expect(mockSend).toHaveBeenCalled();
  });
});
