import {
  AddVcModalEvents,
  selectId,
  selectIdType,
  selectIdInputRef,
  selectIdError,
  selectOtpError,
  selectIsPhoneNumber,
  selectIsEmail,
  selectIsAcceptingIdInput,
  selectIsInvalid,
  selectIsAcceptingOtpInput,
  selectIsRequestingOtp,
  selectIsRequestingCredential,
  selectIsCancellingDownload,
} from './AddVcModalMachine';

const ms = (ctx: any = {}, matchVal?: string) => ({
  context: {
    displayId: '',
    idType: 'UIN',
    idInputRef: null,
    idError: '',
    otpError: '',
    phoneNumber: '',
    email: '',
    ...ctx,
  },
  matches: (v: string) => v === matchVal,
});

describe('AddVcModalMachine', () => {
  describe('selectors', () => {
    it('selectId', () =>
      expect(selectId(ms({displayId: '123'}) as any)).toBe('123'));
    it('selectIdType', () =>
      expect(selectIdType(ms({idType: 'VID'}) as any)).toBe('VID'));
    it('selectIdInputRef', () => {
      const ref = {current: null};
      expect(selectIdInputRef(ms({idInputRef: ref}) as any)).toBe(ref);
    });
    it('selectIdError', () =>
      expect(selectIdError(ms({idError: 'invalid'}) as any)).toBe('invalid'));
    it('selectOtpError', () =>
      expect(selectOtpError(ms({otpError: 'wrong'}) as any)).toBe('wrong'));
    it('selectIsPhoneNumber', () =>
      expect(selectIsPhoneNumber(ms({phoneNumber: '1234567890'}) as any)).toBe(
        '1234567890',
      ));
    it('selectIsEmail', () =>
      expect(selectIsEmail(ms({email: 'a@b.com'}) as any)).toBe('a@b.com'));
    it('selectIsAcceptingIdInput true', () =>
      expect(selectIsAcceptingIdInput(ms({}, 'acceptingIdInput') as any)).toBe(
        true,
      ));
    it('selectIsAcceptingIdInput false', () =>
      expect(selectIsAcceptingIdInput(ms({}, 'idle') as any)).toBe(false));
    it('selectIsInvalid true', () =>
      expect(selectIsInvalid(ms({}, 'acceptingIdInput.invalid') as any)).toBe(
        true,
      ));
    it('selectIsInvalid false', () =>
      expect(selectIsInvalid(ms({}, 'acceptingIdInput') as any)).toBe(false));
    it('selectIsAcceptingOtpInput', () =>
      expect(
        selectIsAcceptingOtpInput(ms({}, 'acceptingOtpInput') as any),
      ).toBe(true));
    it('selectIsRequestingOtp', () =>
      expect(
        selectIsRequestingOtp(ms({}, 'acceptingIdInput.requestingOtp') as any),
      ).toBe(true));
    it('selectIsRequestingCredential', () =>
      expect(
        selectIsRequestingCredential(ms({}, 'requestingCredential') as any),
      ).toBe(true));
    it('selectIsCancellingDownload', () =>
      expect(selectIsCancellingDownload(ms({}, 'cancelDownload') as any)).toBe(
        true,
      ));
  });

  describe('events', () => {
    it('SET_INDIVIDUAL_ID', () => {
      const e = AddVcModalEvents.SET_INDIVIDUAL_ID({
        id: 'uid123',
        idType: 'UIN',
      } as any);
      expect(e.type).toBe('SET_INDIVIDUAL_ID');
      expect(e.displayId).toBe('uid123');
      expect(e.idType).toBe('UIN');
    });
    it('INPUT_ID', () => {
      const e = AddVcModalEvents.INPUT_ID('456');
      expect(e.type).toBe('INPUT_ID');
      expect(e.id).toBe('456');
    });
    it('INPUT_OTP', () => {
      const e = AddVcModalEvents.INPUT_OTP('1234');
      expect(e.type).toBe('INPUT_OTP');
      expect(e.otp).toBe('1234');
    });
    it('RESEND_OTP', () =>
      expect(AddVcModalEvents.RESEND_OTP()).toEqual({type: 'RESEND_OTP'}));
    it('VALIDATE_INPUT', () =>
      expect(AddVcModalEvents.VALIDATE_INPUT()).toEqual({
        type: 'VALIDATE_INPUT',
      }));
    it('DISMISS', () =>
      expect(AddVcModalEvents.DISMISS()).toEqual({type: 'DISMISS'}));
    it('CANCEL', () =>
      expect(AddVcModalEvents.CANCEL()).toEqual({type: 'CANCEL'}));
    it('WAIT', () => expect(AddVcModalEvents.WAIT()).toEqual({type: 'WAIT'}));
    it('READY', () => {
      const ref = {current: null};
      const e = AddVcModalEvents.READY(ref as any);
      expect(e.type).toBe('READY');
      expect(e.idInputRef).toBe(ref);
    });
    it('SELECT_ID_TYPE', () => {
      const e = AddVcModalEvents.SELECT_ID_TYPE('VID' as any);
      expect(e.type).toBe('SELECT_ID_TYPE');
      expect(e.idType).toBe('VID');
    });
  });
});
