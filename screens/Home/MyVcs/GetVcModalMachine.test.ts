import {
  GetVcModalEvents,
  selectId,
  selectIdInputRef,
  selectIdError,
  selectOtpError,
  selectIconColor,
  selectIsPhoneNumber,
  selectIsEmail,
  selectIsAcceptingIdInput,
  selectIsInvalid,
  selectIsAcceptingOtpInput,
  selectIsRequestingOtp,
  selectIsRequestingCredential,
} from './GetVcModalMachine';

const ms = (ctx: any = {}, matchVal?: string) => ({
  context: {
    id: '',
    idInputRef: null,
    idError: '',
    otpError: '',
    iconColor: '',
    phoneNumber: '',
    email: '',
    ...ctx,
  },
  matches: (v: string) => v === matchVal,
});

describe('GetVcModalMachine', () => {
  describe('selectors', () => {
    it('selectId', () => expect(selectId(ms({id: '789'}) as any)).toBe('789'));
    it('selectIdInputRef', () => {
      const ref = {current: null};
      expect(selectIdInputRef(ms({idInputRef: ref}) as any)).toBe(ref);
    });
    it('selectIdError', () =>
      expect(selectIdError(ms({idError: 'err'}) as any)).toBe('err'));
    it('selectOtpError', () =>
      expect(selectOtpError(ms({otpError: 'bad'}) as any)).toBe('bad'));
    it('selectIconColor', () =>
      expect(selectIconColor(ms({iconColor: 'blue'}) as any)).toBe('blue'));
    it('selectIsPhoneNumber', () =>
      expect(selectIsPhoneNumber(ms({phoneNumber: '999'}) as any)).toBe('999'));
    it('selectIsEmail', () =>
      expect(selectIsEmail(ms({email: 'x@y.com'}) as any)).toBe('x@y.com'));
    it('selectIsAcceptingIdInput true', () =>
      expect(selectIsAcceptingIdInput(ms({}, 'acceptingIdInput') as any)).toBe(
        true,
      ));
    it('selectIsAcceptingIdInput false', () =>
      expect(selectIsAcceptingIdInput(ms({}, 'idle') as any)).toBe(false));
    it('selectIsInvalid', () =>
      expect(selectIsInvalid(ms({}, 'acceptingIdInput.invalid') as any)).toBe(
        true,
      ));
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
        selectIsRequestingCredential(ms({}, 'requestingUinVid') as any),
      ).toBe(true));
    it('selectIsRequestingCredential false', () =>
      expect(selectIsRequestingCredential(ms({}, 'idle') as any)).toBe(false));
  });

  describe('events', () => {
    it('INPUT_ID', () => {
      const e = GetVcModalEvents.INPUT_ID('abc');
      expect(e.type).toBe('INPUT_ID');
      expect(e.id).toBe('abc');
    });
    it('INPUT_OTP', () => {
      const e = GetVcModalEvents.INPUT_OTP('5678');
      expect(e.type).toBe('INPUT_OTP');
      expect(e.otp).toBe('5678');
    });
    it('VALIDATE_INPUT', () =>
      expect(GetVcModalEvents.VALIDATE_INPUT()).toEqual({
        type: 'VALIDATE_INPUT',
      }));
    it('RESEND_OTP', () =>
      expect(GetVcModalEvents.RESEND_OTP()).toEqual({type: 'RESEND_OTP'}));
    it('ACTIVATE_ICON_COLOR', () =>
      expect(GetVcModalEvents.ACTIVATE_ICON_COLOR()).toEqual({
        type: 'ACTIVATE_ICON_COLOR',
      }));
    it('DEACTIVATE_ICON_COLOR', () =>
      expect(GetVcModalEvents.DEACTIVATE_ICON_COLOR()).toEqual({
        type: 'DEACTIVATE_ICON_COLOR',
      }));
    it('DISMISS', () =>
      expect(GetVcModalEvents.DISMISS()).toEqual({type: 'DISMISS'}));
    it('READY', () => {
      const ref = {current: null};
      const e = GetVcModalEvents.READY(ref as any);
      expect(e.type).toBe('READY');
      expect(e.idInputRef).toBe(ref);
    });
    it('GOT_ID', () => {
      const e = GetVcModalEvents.GOT_ID('id123');
      expect(e.type).toBe('GOT_ID');
      expect(e.id).toBe('id123');
    });
  });
});
