import {interpret} from 'xstate';
import {AppState} from 'react-native';
import type {AppServices} from '../../../shared/GlobalContext';
import type {MdocResult} from '../../../shared/mdocPresentation/types';
import type {VC} from '../../VerifiableCredential/VCMetaMachine/vc';
import {createScanMachine} from './scanMachine';
import {createRequestMachine} from '../request/requestMachine';

jest.mock('../../../shared/commonUtil', () => ({logState: jest.fn()}));
jest.mock('../../../shared/mdocPresentation/MdocPresentation', () => ({
  MdocPresentation: {present: jest.fn(), cancel: jest.fn()},
}));
jest.mock('../../openID4VP/openID4VPMachine', () => {
  const {createMachine} = jest.requireActual('xstate');
  const machine = createMachine({
    predictableActionArguments: true,
    initial: 'idle',
    states: {idle: {}},
  });
  return {openID4VPMachine: machine, createOpenID4VPMachine: () => machine};
});
jest.mock('../../QrLogin/QrLoginMachine', () => {
  const {createMachine} = jest.requireActual('xstate');
  const machine = createMachine({
    predictableActionArguments: true,
    initial: 'idle',
    states: {idle: {}},
  });
  return {qrLoginMachine: machine, createQrLoginMachine: () => machine};
});
const settle = () => new Promise(resolve => setTimeout(resolve, 0));

function setup({
  olderAndroid = false,
  ios = false,
  receiveActive = false,
  receiveService = undefined as AppServices['request'] | undefined,
  bluetoothOn = true,
  bluetoothTurnsOnWhenAsked = true,
  credentials = [] as VC[],
} = {}) {
  const startConnection = jest.fn();
  const requestBluetooth = jest.fn();
  const logActivity = jest.fn();
  const readiness: string[] = [];
  const request = receiveService ?? {
    getSnapshot: () => ({
      value: receiveActive ? 'advertising' : 'inactive',
    }),
  };
  const refs = {
    request,
    store: {send: jest.fn()},
    activityLog: {send: logActivity},
    vcMeta: {getSnapshot: () => ({context: {myVcs: {}}})},
  } as unknown as AppServices;
  let finish!: (result: MdocResult) => void;
  const present = jest.fn(
    () =>
      new Promise<MdocResult>(resolve => {
        finish = resolve;
      }),
  );
  const cancel = jest.fn();
  const base = createScanMachine(refs, {
    present,
    cancel,
    getCredentials: () => credentials,
    prepareMdocForSharing: async () => 'filtered',
  });
  const overrides = {
    services: {
      monitorConnection: () => () => undefined,
      checkStorageAvailability: () => Promise.resolve(false),
      checkBluetoothPermission:
        () => (callback: (event: {type: string}) => void) => {
          readiness.push('permission');
          callback({type: 'BLUETOOTH_PERMISSION_ENABLED'});
        },
      checkNearByDevicesPermission:
        () => (callback: (event: {type: string}) => void) => {
          readiness.push('nearby');
          callback({type: 'NEARBY_ENABLED'});
        },
      checkBluetoothState:
        () => (callback: (event: {type: string}) => void) => {
          readiness.push('bluetooth');
          callback({
            type: bluetoothOn
              ? 'BLUETOOTH_STATE_ENABLED'
              : 'BLUETOOTH_STATE_DISABLED',
          });
        },
      requestBluetooth: () => (callback: (event: {type: string}) => void) => {
        requestBluetooth();
        callback({
          type: bluetoothTurnsOnWhenAsked
            ? 'BLUETOOTH_STATE_ENABLED'
            : 'BLUETOOTH_STATE_DISABLED',
        });
      },
      checkLocationStatus:
        () => (callback: (event: {type: string}) => void) => {
          readiness.push('location');
          callback({type: 'LOCATION_ENABLED'});
        },
      checkLocationPermission:
        () => (callback: (event: {type: string}) => void) => {
          readiness.push('locationPermission');
          callback({type: 'LOCATION_ENABLED'});
        },
      startConnection: () => {
        startConnection();
        return () => undefined;
      },
      disconnect: () => (callback: (event: {type: string}) => void) => {
        callback({type: 'DISCONNECT'});
      },
    },
    actions: {registerLoggers: () => undefined},
    guards: {
      uptoAndroid11: () => olderAndroid,
      isIOS: () => ios,
      isMdocOnIos: (context: {isMdocFlow: boolean}) =>
        ios && context.isMdocFlow,
    },
  };
  // Existing scan typegen cannot infer implementations returned by its options factories.
  const machine = base.withConfig(
    overrides as Parameters<typeof base.withConfig>[0],
  );
  const service = interpret(machine).start();
  return {
    readiness,
    service,
    present,
    cancel,
    startConnection,
    requestBluetooth,
    logActivity,
    finish: (result: MdocResult) => finish(result),
  };
}

describe('scan mdoc integration', () => {
  const initialAppState = AppState.currentState;
  const flows: ReturnType<typeof setup>[] = [];
  const start = (options = {}) => {
    const flow = setup(options);
    flows.push(flow);
    return flow;
  };
  afterEach(() => {
    flows.splice(0).forEach(flow => flow.service.stop());
    AppState.currentState = initialAppState;
  });

  it('can start mdoc after Back leaves Bluetooth QR and native cleanup completes', async () => {
    let finishDisconnect: () => void = () => {
      throw new Error('Receive cleanup has not started');
    };
    const receiveMachine = createRequestMachine({} as AppServices).withConfig({
      services: {
        monitorConnection: () => () => undefined,
        advertiseDevice: () => () => undefined,
        disconnect: () => callback => {
          finishDisconnect = () => callback({type: 'DISCONNECT'});
        },
      },
      actions: {registerLoggers: () => undefined},
    });
    const receiver = interpret(receiveMachine).start('waitingForConnection');
    const flow = start({receiveService: receiver});
    try {
      receiver.send('SCREEN_BLUR');
      flow.service.send('PRESENT_MDOC');
      expect(flow.service.state.matches('mdocBusy')).toBe(true);
      expect(flow.present).not.toHaveBeenCalled();

      finishDisconnect();
      flow.service.send('PRESENT_MDOC');
      await settle();
      flow.service.send({type: 'STORE_RESPONSE', response: true});

      expect(receiver.state.matches('inactive')).toBe(true);
      expect(flow.service.state.matches('presentingMdoc')).toBe(true);
      expect(flow.present).toHaveBeenCalledTimes(1);
    } finally {
      receiver.stop();
    }
  });

  it.each([{olderAndroid: false}, {olderAndroid: true}, {ios: true}])(
    'reuses readiness and starts mdoc instead of a Tuvali VC connection (%p)',
    async options => {
      const flow = start(options);
      flow.service.send('PRESENT_MDOC');
      await settle();
      flow.service.send({type: 'STORE_RESPONSE', response: true});
      expect(flow.service.state.matches('presentingMdoc')).toBe(true);
      expect(flow.present).toHaveBeenCalledTimes(1);
      expect(flow.startConnection).not.toHaveBeenCalled();
      expect(flow.service.children.has('MdocPresentation')).toBe(true);
      expect(flow.readiness).toEqual(
        'olderAndroid' in options && options.olderAndroid
          ? ['permission', 'bluetooth', 'location', 'locationPermission']
          : 'ios' in options && options.ios
          ? ['permission', 'bluetooth']
          : ['nearby', 'permission', 'bluetooth'],
      );
    },
  );

  it('explains Bluetooth is off on Android before asking the system to turn it on', async () => {
    const flow = start({bluetoothOn: false});
    flow.service.send('PRESENT_MDOC');
    await settle();

    flow.service.send({type: 'STORE_RESPONSE', response: true});

    expect(flow.service.state.matches('bluetoothDenied')).toBe(true);
    expect(flow.requestBluetooth).not.toHaveBeenCalled();
  });

  it('shows the code once the holder turns Bluetooth on from the explanation', async () => {
    const flow = start({bluetoothOn: false});
    flow.service.send('PRESENT_MDOC');
    await settle();
    flow.service.send({type: 'STORE_RESPONSE', response: true});

    flow.service.send('REQUEST_BLUETOOTH');

    expect(flow.requestBluetooth).toHaveBeenCalledTimes(1);
    expect(flow.service.state.matches('presentingMdoc')).toBe(true);
  });

  it('comes back to the explanation when the holder refuses the system Bluetooth prompt', async () => {
    const flow = start({bluetoothOn: false, bluetoothTurnsOnWhenAsked: false});
    flow.service.send('PRESENT_MDOC');
    await settle();
    flow.service.send({type: 'STORE_RESPONSE', response: true});

    flow.service.send('REQUEST_BLUETOOTH');

    expect(flow.service.state.matches('bluetoothDenied')).toBe(true);
    expect(flow.present).not.toHaveBeenCalled();
  });

  it('stops at Bluetooth-off readiness on iOS instead of re-requesting permission', async () => {
    const flow = start({ios: true, bluetoothOn: false});
    flow.service.send('PRESENT_MDOC');
    await settle();
    flow.service.send({type: 'STORE_RESPONSE', response: true});
    expect(flow.service.state.matches('bluetoothDenied')).toBe(true);
    expect(flow.readiness).toEqual(['permission', 'bluetooth']);
    expect(flow.present).not.toHaveBeenCalled();
  });

  it.each([
    [{status: 'completed', confirmedByReader: true}, 1],
    [{status: 'completed', confirmedByReader: false}, 0],
    [{status: 'failed', failure: 'connectionLost'}, 0],
  ] as const)(
    'logs every sent share to history but counts the success banner only after confirmed delivery (%p)',
    async (result, expectedCount) => {
      const docType = 'org.iso.18013.5.1.mDL';
      const namespace = 'org.iso.18013.5.1';
      const vc = {
        vcMetadata: {
          id: 'one',
          format: 'mso_mdoc',
          isExpired: false,
          isRevoked: 'FALSE',
        },
        verifiableCredential: {
          processedCredential: {
            issuerAuth: [{}, {}, {docType}],
            nameSpaces: {
              [namespace]: [
                {elementIdentifier: 'given_name', elementValue: 'Kiran'},
              ],
            },
          },
        },
      } as VC;
      const flow = start({credentials: [vc]});
      flow.service.send('PRESENT_MDOC');
      await settle();
      flow.service.send({type: 'STORE_RESPONSE', response: true});
      const child = flow.service.children.get('MdocPresentation');
      child?.send({
        type: 'REQUEST_RECEIVED',
        request: {
          requestNumber: 1,
          documents: [
            {
              docType,
              nameSpaces: {[namespace]: {given_name: false}},
              readerTrust: {status: 'notSigned'},
            },
          ],
        },
      });
      child?.send('SHARE');
      await settle();
      flow.finish(result);
      await settle();
      expect(flow.logActivity).toHaveBeenCalledTimes(1);
      child?.send('DONE');
      expect(flow.service.state.context.mdocSharedDetailCount).toBe(
        expectedCount,
      );
      flow.service.send('DISMISS_MDOC_BANNER');
      expect(flow.service.state.context.mdocSharedDetailCount).toBe(0);
    },
  );

  it('shows busy while Receive card is active and does not touch Bluetooth', () => {
    const flow = start({receiveActive: true});
    flow.service.send('PRESENT_MDOC');
    expect(flow.service.state.matches('mdocBusy')).toBe(true);
    expect(flow.present).not.toHaveBeenCalled();
    expect(flow.startConnection).not.toHaveBeenCalled();
  });

  it('retains the legacy connection path after Bluetooth readiness', async () => {
    const flow = start();
    flow.service.send('SCREEN_FOCUS');
    await settle();
    flow.service.send({type: 'STORE_RESPONSE', response: true});
    flow.service.send({type: 'SCAN', params: 'OPENID4VP://connect:test'});
    flow.service.send('START_PERMISSION_CHECK');
    expect(flow.startConnection).toHaveBeenCalledTimes(1);
    expect(flow.present).not.toHaveBeenCalled();
  });

  it('forwards background cancellation and keeps the child until native finishes', async () => {
    const flow = start();
    flow.service.send('PRESENT_MDOC');
    await settle();
    flow.service.send({type: 'STORE_RESPONSE', response: true});
    AppState.currentState = 'background';
    flow.service.send('APP_INACTIVE');
    flow.service.send('SCREEN_FOCUS');
    expect(flow.cancel).toHaveBeenCalledTimes(1);
    expect(flow.service.state.matches('presentingMdoc')).toBe(true);
    flow.finish({status: 'cancelled'});
    await settle();
    const child = flow.service.children.get('MdocPresentation');
    expect(child?.getSnapshot().context.outcome).toBe('sessionEnded');
    child?.send('DONE');
    expect(flow.service.state.context.isMdocFlow).toBe(false);
  });

  it('keeps sharing alive while iOS authentication temporarily makes the app inactive', async () => {
    const flow = start({ios: true});
    flow.service.send('PRESENT_MDOC');
    await settle();
    flow.service.send({type: 'STORE_RESPONSE', response: true});
    const child = flow.service.children.get('MdocPresentation');
    child?.send({type: 'PROGRESS', progress: 'sendingResponse'});

    AppState.currentState = 'inactive';
    flow.service.send('APP_INACTIVE');
    AppState.currentState = 'active';
    flow.service.send('APP_ACTIVE');

    expect(flow.cancel).not.toHaveBeenCalled();
    expect(child?.getSnapshot().matches('presenting.sending')).toBe(true);

    flow.finish({status: 'completed', confirmedByReader: true});
    await settle();
    expect(child?.getSnapshot().context.outcome).toBe('shared');
  });

  it('remembers that nothing was shared when the holder leaves the code screen', async () => {
    const flow = start();
    flow.service.send('PRESENT_MDOC');
    await settle();
    flow.service.send({type: 'STORE_RESPONSE', response: true});

    flow.service.send('DISMISS');
    flow.finish({status: 'cancelled'});
    await settle();

    expect(flow.service.state.context.mdocEndedWithoutSharing).toBe(true);
  });

  it('forgets the nothing-shared notice once the holder dismisses it', async () => {
    const flow = start();
    flow.service.send('PRESENT_MDOC');
    await settle();
    flow.service.send({type: 'STORE_RESPONSE', response: true});
    flow.service.send('DISMISS');
    flow.finish({status: 'cancelled'});
    await settle();

    flow.service.send('DISMISS_MDOC_BANNER');

    expect(flow.service.state.context.mdocEndedWithoutSharing).toBe(false);
  });

  it('forgets an earlier nothing-shared notice when a new session starts', async () => {
    const flow = start();
    flow.service.send('PRESENT_MDOC');
    await settle();
    flow.service.send({type: 'STORE_RESPONSE', response: true});
    flow.service.send('DISMISS');
    flow.finish({status: 'cancelled'});
    await settle();
    flow.service.send({type: 'STORE_RESPONSE', response: true});

    flow.service.send('PRESENT_MDOC');

    expect(flow.service.state.context.mdocEndedWithoutSharing).toBe(false);
  });

  it('waits for cancellation on screen blur before returning to inactive', async () => {
    const flow = start();
    flow.service.send('PRESENT_MDOC');
    await settle();
    flow.service.send({type: 'STORE_RESPONSE', response: true});
    flow.service.send('SCREEN_BLUR');
    expect(flow.cancel).toHaveBeenCalledTimes(1);
    expect(flow.service.state.matches('presentingMdoc')).toBe(true);
    flow.finish({status: 'cancelled'});
    await settle();
    expect(flow.service.state.matches('inactive')).toBe(true);
    expect(flow.service.state.context.isMdocFlow).toBe(false);
    expect(flow.service.children.has('MdocPresentation')).toBe(false);
  });
});
