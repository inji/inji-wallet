import {interpret} from 'xstate';
import {VCItemEvents, VCItemMachine} from './VCItemMachine';
import {VCMetadata} from '../../../shared/VCMetadata';
import {RevocationStatus} from '../../../shared/vcVerifier/VcVerifier';
import {
  checkCardInBackground,
  queueBackgroundStatusCheck,
} from './backgroundStatusChecks';

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

const verified = {
  isVerified: true,
  verificationErrorCode: '',
  isRevoked: RevocationStatus.FALSE,
};

function startCard(id: string, verifyCredential: () => Promise<unknown>) {
  const machine = VCItemMachine.withConfig({
    services: {verifyCredential} as any,
    actions: {
      storeContext: jest.fn(),
      updateVcMetadata: jest.fn(),
      logStatusChangedOnReverification: jest.fn(),
      requestVcContext: jest.fn(),
      setPinCard: jest.fn(),
    } as any,
  }).withContext({
    ...VCItemMachine.context,
    vcMetadata: new VCMetadata({id, timestamp: '1', isVerified: true}),
  });
  return interpret(machine).start({
    vcUtilitiesState: 'idle',
    verifyState: 'idle',
  } as any);
}

const flush = () => new Promise(resolve => setTimeout(resolve, 0));

describe('background card status checks', () => {
  it('checks one card at a time, leaving the others idle and responsive', async () => {
    let finishFirst: (value: unknown) => void = () => undefined;
    const first = startCard(
      'first',
      () => new Promise(resolve => (finishFirst = resolve)),
    );
    const secondCheck = jest.fn(() => Promise.resolve(verified));
    const second = startCard('second', secondCheck);

    queueBackgroundStatusCheck(async () => {
      await checkCardInBackground(first as any, 60_000);
    });
    queueBackgroundStatusCheck(async () => {
      await checkCardInBackground(second as any, 60_000);
    });
    await flush();

    expect(
      first.getSnapshot().matches('vcUtilitiesState.reverificationState'),
    ).toBe(true);
    expect(second.getSnapshot().matches('vcUtilitiesState.idle')).toBe(true);
    expect(secondCheck).not.toHaveBeenCalled();

    second.send(VCItemEvents.KEBAB_POPUP());
    expect(second.getSnapshot().matches('vcUtilitiesState.kebabPopUp')).toBe(
      true,
    );
    second.send(VCItemEvents.DISMISS());

    finishFirst(verified);
    await flush();
    await flush();

    expect(first.getSnapshot().matches('vcUtilitiesState.idle')).toBe(true);
    expect(secondCheck).toHaveBeenCalledTimes(1);
  });

  it('skips a card that is busy when its turn comes', async () => {
    const check = jest.fn(() => Promise.resolve(verified));
    const card = startCard('busy', check);
    card.send(VCItemEvents.KEBAB_POPUP());
    const onStart = jest.fn();

    const checked = await checkCardInBackground(card as any, 60_000, onStart);

    expect(checked).toBe(false);
    expect(onStart).not.toHaveBeenCalled();
    expect(check).not.toHaveBeenCalled();
  });

  it('drops a queued check that is cancelled before its turn', async () => {
    let finishFirst: () => void = () => undefined;
    queueBackgroundStatusCheck(
      () => new Promise<void>(resolve => (finishFirst = resolve)),
    );
    const cancelled = jest.fn(() => Promise.resolve());
    const cancel = queueBackgroundStatusCheck(cancelled);

    cancel();
    finishFirst();
    await flush();

    expect(cancelled).not.toHaveBeenCalled();
  });

  it('lets go of a card that never finishes, so the next one gets its turn', async () => {
    jest.useFakeTimers();
    try {
      const stuck = startCard(
        'stuck',
        () => new Promise<never>(() => undefined),
      );
      const run = checkCardInBackground(stuck as any, 1000);

      jest.advanceTimersByTime(1000);

      await expect(run).resolves.toBe(true);
    } finally {
      jest.useRealTimers();
    }
  });
});
