import {interpret} from 'xstate';
import {VCItemEvents, VCItemMachine} from './VCItemMachine';
import {isReverifyingVc} from './VCItemSelectors';
import {VCMetadata} from '../../../shared/VCMetadata';
import {RevocationStatus} from '../../../shared/vcVerifier/VcVerifier';

jest.mock('../../../screens/Home/HomeScreenController', () => ({
  getHomeMachineService: jest.fn(),
}));
jest.mock('./VCItemServices', () => ({VCItemServices: () => ({})}));
jest.mock('../../../shared/openId4VCI/Utils', () => ({
  getVcVerificationDetails: jest.fn(),
}));
jest.mock('../../../shared/keystore/SecureKeystore', () => ({
  getBindingCertificateConstant: jest.fn(),
}));
jest.mock('../../../shared/cryptoutil/cryptoUtil', () => ({
  isHardwareKeystoreExists: false,
}));
jest.mock('../../backupAndRestore/backup/backupMachine', () => ({
  BackupEvents: {DATA_BACKUP: () => ({type: 'DATA_BACKUP'})},
}));

const vcMetadata = new VCMetadata({
  id: 'card',
  timestamp: '1',
  isVerified: true,
  isRevoked: RevocationStatus.FALSE,
  isExpired: false,
});

function startCard(verifyCredential: () => Promise<unknown>) {
  const spies = {
    storeContext: jest.fn(),
    updateVcMetadata: jest.fn(),
    sendReverificationSuccessToVcMeta: jest.fn(),
    sendReverificationFailureToVcMeta: jest.fn(),
    logStatusChangedOnReverification: jest.fn(),
  };
  const machine = VCItemMachine.withConfig({
    services: {verifyCredential} as any,
    actions: {...spies, requestVcContext: jest.fn()} as any,
  }).withContext({
    ...VCItemMachine.context,
    vcMetadata,
  });
  const service = interpret(machine).start({
    vcUtilitiesState: 'idle',
    verifyState: 'idle',
  } as any);
  return {service, spies};
}

const backToIdle = (service: any) =>
  new Promise<any>(resolve => {
    service.onTransition((state: any) => {
      if (
        state.matches('vcUtilitiesState.idle') &&
        state.history?.matches('vcUtilitiesState.reverificationState')
      ) {
        resolve(state);
      }
    });
  });

describe('VCItemMachine background "Check Card Status"', () => {
  it('records an expired card without showing a banner', async () => {
    const {service, spies} = startCard(() =>
      Promise.resolve({
        isVerified: true,
        verificationErrorCode: 'ERR_VC_EXPIRED',
        isRevoked: RevocationStatus.FALSE,
      }),
    );
    const idle = backToIdle(service);
    service.send(VCItemEvents.REVERIFY_VC_IN_BACKGROUND());
    const state = await idle;

    expect(state.context.vcMetadata.isExpired).toBe(true);
    expect(state.context.isReverifyingInBackground).toBe(false);
    expect(spies.storeContext).toHaveBeenCalled();
    expect(spies.updateVcMetadata).toHaveBeenCalled();
    expect(spies.logStatusChangedOnReverification).toHaveBeenCalled();
    expect(spies.sendReverificationSuccessToVcMeta).not.toHaveBeenCalled();
  });

  it('records a revoked card without showing a banner', async () => {
    const {service, spies} = startCard(() =>
      Promise.resolve({
        isVerified: true,
        verificationErrorCode: '',
        isRevoked: RevocationStatus.TRUE,
      }),
    );
    const idle = backToIdle(service);
    service.send(VCItemEvents.REVERIFY_VC_IN_BACKGROUND());
    const state = await idle;

    expect(state.context.vcMetadata.isRevoked).toBe(RevocationStatus.TRUE);
    expect(spies.sendReverificationSuccessToVcMeta).not.toHaveBeenCalled();
  });

  it('keeps the card as it was when the network drops', async () => {
    const {service, spies} = startCard(() =>
      Promise.reject(new Error('ERR_NETWORK')),
    );
    const idle = backToIdle(service);
    service.send(VCItemEvents.REVERIFY_VC_IN_BACKGROUND());
    const state = await idle;

    expect(state.context.vcMetadata).toBe(vcMetadata);
    expect(state.context.isReverifyingInBackground).toBe(false);
    expect(spies.storeContext).not.toHaveBeenCalled();
    expect(spies.updateVcMetadata).not.toHaveBeenCalled();
    expect(spies.sendReverificationFailureToVcMeta).not.toHaveBeenCalled();
  });

  it('marks the card unverified, without a banner, when verification fails', async () => {
    const {service, spies} = startCard(() =>
      Promise.reject(new Error('ERR_SIGNATURE_VERIFICATION_FAILED')),
    );
    const idle = backToIdle(service);
    service.send(VCItemEvents.REVERIFY_VC_IN_BACKGROUND());
    const state = await idle;

    expect(state.context.vcMetadata.isVerified).toBe(false);
    expect(spies.updateVcMetadata).toHaveBeenCalled();
    expect(spies.sendReverificationFailureToVcMeta).not.toHaveBeenCalled();
  });

  it('still shows the banner for "Check Card Status" from the card menu', async () => {
    const {service, spies} = startCard(() =>
      Promise.resolve({
        isVerified: true,
        verificationErrorCode: '',
        isRevoked: RevocationStatus.FALSE,
      }),
    );
    const idle = backToIdle(service);
    service.send(VCItemEvents.KEBAB_POPUP());
    service.send(VCItemEvents.REVERIFY_VC());
    expect(isReverifyingVc(service.getSnapshot())).toBe(true);
    await idle;

    expect(spies.sendReverificationSuccessToVcMeta).toHaveBeenCalled();
  });

  it('does not show the "In Progress" overlay while checking in the background', () => {
    const {service} = startCard(() => new Promise(() => {}));
    service.send(VCItemEvents.REVERIFY_VC_IN_BACKGROUND());

    const state = service.getSnapshot();
    expect(state.matches('vcUtilitiesState.reverificationState')).toBe(true);
    expect(isReverifyingVc(state)).toBe(false);
  });
});
