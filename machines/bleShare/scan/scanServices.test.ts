jest.mock('react-native-device-info', () => ({
  isLocationEnabled: jest.fn().mockResolvedValue(true),
}));
jest.mock('../../../shared/storage', () => ({
  isMinimumStorageLimitReached: jest.fn().mockResolvedValue(false),
}));
jest.mock('react-native-bluetooth-state-manager', () => ({
  getState: jest.fn().mockResolvedValue('PoweredOn'),
  onStateChange: jest.fn(() => ({remove: jest.fn()})),
  requestToEnable: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('react-native-permissions', () => ({
  check: jest.fn().mockResolvedValue('granted'),
  checkMultiple: jest.fn().mockResolvedValue({}),
  requestMultiple: jest.fn().mockResolvedValue({}),
  PERMISSIONS: {
    ANDROID: {
      BLUETOOTH_SCAN: 'bt_scan',
      BLUETOOTH_CONNECT: 'bt_connect',
      BLUETOOTH_ADVERTISE: 'bt_adv',
      ACCESS_FINE_LOCATION: 'fine_loc',
    },
    IOS: {BLUETOOTH: 'bt'},
  },
  RESULTS: {GRANTED: 'granted', DENIED: 'denied', BLOCKED: 'blocked'},
}));
jest.mock('../../../shared/openIdBLE/walletEventHandler', () => ({
  subscribe: jest.fn(),
}));
jest.mock('../../../shared/location', () => ({
  requestLocationPermission: jest.fn().mockResolvedValue('granted'),
  checkLocationPermissionStatus: jest.fn().mockResolvedValue('granted'),
}));
jest.mock('../../../shared/constants', () => ({
  isIOS: jest.fn(() => false),
}));

const mockHandleDataEvents = jest.fn();
const mockStartConnection = jest.fn();
const mockSendData = jest.fn();
const mockDisconnect = jest.fn();

jest.mock('../../../shared/tuvali', () => ({
  wallet: {
    startConnection: mockStartConnection,
    sendData: mockSendData,
    disconnect: mockDisconnect,
    handleDataEvents: mockHandleDataEvents,
  },
  EventTypes: {
    onDisconnected: 'onDisconnected',
    onError: 'onError',
    onSecureChannelEstablished: 'onSecureChannelEstablished',
    onDataSent: 'onDataSent',
    onVerificationStatusReceived: 'onVerificationStatusReceived',
  },
  VerificationStatus: {
    ACCEPTED: 'ACCEPTED',
    REJECTED: 'REJECTED',
  },
}));
jest.mock('../../../shared/tuvali/types/events', () => ({}));

import {ScanServices} from './scanServices';

describe('ScanServices', () => {
  const mockModel = {
    events: {
      BLUETOOTH_PERMISSION_ENABLED: jest.fn(() => ({
        type: 'BLUETOOTH_PERMISSION_ENABLED',
      })),
      BLUETOOTH_PERMISSION_DENIED: jest.fn(() => ({
        type: 'BLUETOOTH_PERMISSION_DENIED',
      })),
      BLUETOOTH_STATE_ENABLED: jest.fn(() => ({
        type: 'BLUETOOTH_STATE_ENABLED',
      })),
      BLUETOOTH_STATE_DISABLED: jest.fn(() => ({
        type: 'BLUETOOTH_STATE_DISABLED',
      })),
      LOCATION_ENABLED: jest.fn(() => ({type: 'LOCATION_ENABLED'})),
      LOCATION_DISABLED: jest.fn(() => ({type: 'LOCATION_DISABLED'})),
      NEARBY_ENABLED: jest.fn(() => ({type: 'NEARBY_ENABLED'})),
      NEARBY_DISABLED: jest.fn(() => ({type: 'NEARBY_DISABLED'})),
    },
  };
  let services: ReturnType<typeof ScanServices>;

  beforeEach(() => {
    jest.clearAllMocks();
    services = ScanServices(mockModel);
  });

  it('should return all expected service definitions', () => {
    const expectedServices = [
      'checkBluetoothPermission',
      'checkBluetoothState',
      'requestBluetooth',
      'requestToEnableLocationPermission',
      'monitorConnection',
      'checkNearByDevicesPermission',
      'requestNearByDevicesPermission',
      'checkLocationPermission',
      'checkLocationStatus',
      'startConnection',
      'sendVc',
      'disconnect',
      'checkStorageAvailability',
    ];
    for (const name of expectedServices) {
      expect(services).toHaveProperty(name);
    }
  });

  it('checkStorageAvailability resolves', async () => {
    const fn = services.checkStorageAvailability();
    await expect(fn()).resolves.not.toThrow();
  });

  it('checkBluetoothPermission calls BLUETOOTH_PERMISSION_ENABLED on Android (granted)', async () => {
    const callback = jest.fn();
    const fn = services.checkBluetoothPermission();
    await fn(callback);
    expect(callback).toHaveBeenCalledWith({
      type: 'BLUETOOTH_PERMISSION_ENABLED',
    });
  });

  it('checkBluetoothPermission calls BLUETOOTH_PERMISSION_DENIED on iOS when denied', async () => {
    const {isIOS} = require('../../../shared/constants');
    isIOS.mockReturnValue(true);
    const {check} = require('react-native-permissions');
    check.mockResolvedValueOnce('denied');
    const callback = jest.fn();
    const fn = services.checkBluetoothPermission();
    await fn(callback);
    expect(callback).toHaveBeenCalledWith({
      type: 'BLUETOOTH_PERMISSION_DENIED',
    });
  });

  it('checkBluetoothState subscribes and calls BLUETOOTH_STATE_ENABLED', () => {
    const BluetoothStateManager = require('react-native-bluetooth-state-manager');
    let stateHandler: Function;
    BluetoothStateManager.onStateChange.mockImplementation((cb: Function) => {
      stateHandler = cb;
      return {remove: jest.fn()};
    });
    const callback = jest.fn();
    const cleanup = services.checkBluetoothState()(callback);
    stateHandler!('PoweredOn');
    expect(callback).toHaveBeenCalledWith({type: 'BLUETOOTH_STATE_ENABLED'});
    stateHandler!('PoweredOff');
    expect(callback).toHaveBeenCalledWith({type: 'BLUETOOTH_STATE_DISABLED'});
    expect(typeof cleanup).toBe('function');
  });

  it('requestBluetooth calls ENABLED on success', async () => {
    const BluetoothStateManager = require('react-native-bluetooth-state-manager');
    BluetoothStateManager.requestToEnable.mockResolvedValueOnce(undefined);
    const callback = jest.fn();
    services.requestBluetooth()(callback);
    await new Promise(r => setTimeout(r, 10));
    expect(callback).toHaveBeenCalledWith({type: 'BLUETOOTH_STATE_ENABLED'});
  });

  it('requestBluetooth calls DISABLED on failure', async () => {
    const BluetoothStateManager = require('react-native-bluetooth-state-manager');
    BluetoothStateManager.requestToEnable.mockRejectedValueOnce(
      new Error('denied'),
    );
    const callback = jest.fn();
    services.requestBluetooth()(callback);
    await new Promise(r => setTimeout(r, 10));
    expect(callback).toHaveBeenCalledWith({type: 'BLUETOOTH_STATE_DISABLED'});
  });

  it('requestToEnableLocationPermission calls LOCATION_ENABLED on success', () => {
    const {requestLocationPermission} = require('../../../shared/location');
    requestLocationPermission.mockImplementation((onEnabled: Function) => {
      onEnabled();
    });
    const callback = jest.fn();
    services.requestToEnableLocationPermission()(callback);
    expect(callback).toHaveBeenCalledWith({type: 'LOCATION_ENABLED'});
  });

  it('requestToEnableLocationPermission calls LOCATION_DISABLED on failure', () => {
    const {requestLocationPermission} = require('../../../shared/location');
    requestLocationPermission.mockImplementation(
      (_: Function, onDisabled: Function) => {
        onDisabled();
      },
    );
    const callback = jest.fn();
    services.requestToEnableLocationPermission()(callback);
    expect(callback).toHaveBeenCalledWith({type: 'LOCATION_DISABLED'});
  });

  it('checkLocationPermission calls LOCATION_ENABLED', () => {
    const {checkLocationPermissionStatus} = require('../../../shared/location');
    checkLocationPermissionStatus.mockImplementation((onEnabled: Function) => {
      onEnabled();
    });
    const callback = jest.fn();
    services.checkLocationPermission()(callback);
    expect(callback).toHaveBeenCalledWith({type: 'LOCATION_ENABLED'});
  });

  it('checkLocationStatus calls LOCATION_ENABLED when enabled', async () => {
    const callback = jest.fn();
    const fn = services.checkLocationStatus();
    await fn(callback);
    expect(callback).toHaveBeenCalledWith({type: 'LOCATION_ENABLED'});
  });

  it('checkLocationStatus calls LOCATION_DISABLED when not enabled', async () => {
    const {isLocationEnabled} = require('react-native-device-info');
    isLocationEnabled.mockResolvedValueOnce(false);
    const callback = jest.fn();
    const fn = services.checkLocationStatus();
    await fn(callback);
    expect(callback).toHaveBeenCalledWith({type: 'LOCATION_DISABLED'});
  });

  it('checkNearByDevicesPermission calls NEARBY_ENABLED when granted', async () => {
    const {checkMultiple} = require('react-native-permissions');
    checkMultiple.mockResolvedValueOnce({
      bt_adv: 'granted',
      bt_connect: 'granted',
    });
    const callback = jest.fn();
    services.checkNearByDevicesPermission()(callback);
    await new Promise(r => setTimeout(r, 10));
    expect(callback).toHaveBeenCalledWith({type: 'NEARBY_ENABLED'});
  });

  it('checkNearByDevicesPermission calls NEARBY_DISABLED when not granted', async () => {
    const {checkMultiple} = require('react-native-permissions');
    checkMultiple.mockResolvedValueOnce({
      bt_adv: 'denied',
      bt_connect: 'denied',
    });
    const callback = jest.fn();
    services.checkNearByDevicesPermission()(callback);
    await new Promise(r => setTimeout(r, 10));
    expect(callback).toHaveBeenCalledWith({type: 'NEARBY_DISABLED'});
  });

  it('checkNearByDevicesPermission calls NEARBY_DISABLED on error', async () => {
    const {checkMultiple} = require('react-native-permissions');
    checkMultiple.mockRejectedValueOnce(new Error('fail'));
    const callback = jest.fn();
    services.checkNearByDevicesPermission()(callback);
    await new Promise(r => setTimeout(r, 10));
    expect(callback).toHaveBeenCalledWith({type: 'NEARBY_DISABLED'});
  });

  it('requestNearByDevicesPermission calls NEARBY_ENABLED when granted', async () => {
    const {requestMultiple} = require('react-native-permissions');
    requestMultiple.mockResolvedValueOnce({
      bt_scan: 'granted',
      bt_connect: 'granted',
    });
    const callback = jest.fn();
    services.requestNearByDevicesPermission()(callback);
    await new Promise(r => setTimeout(r, 10));
    expect(callback).toHaveBeenCalledWith({type: 'NEARBY_ENABLED'});
  });

  it('requestNearByDevicesPermission calls NEARBY_DISABLED when denied', async () => {
    const {requestMultiple} = require('react-native-permissions');
    requestMultiple.mockResolvedValueOnce({
      bt_scan: 'denied',
      bt_connect: 'denied',
    });
    const callback = jest.fn();
    services.requestNearByDevicesPermission()(callback);
    await new Promise(r => setTimeout(r, 10));
    expect(callback).toHaveBeenCalledWith({type: 'NEARBY_DISABLED'});
  });

  it('requestNearByDevicesPermission calls NEARBY_DISABLED on error', async () => {
    const {requestMultiple} = require('react-native-permissions');
    requestMultiple.mockRejectedValueOnce(new Error('fail'));
    const callback = jest.fn();
    services.requestNearByDevicesPermission()(callback);
    await new Promise(r => setTimeout(r, 10));
    expect(callback).toHaveBeenCalledWith({type: 'NEARBY_DISABLED'});
  });

  it('monitorConnection detects disconnection', () => {
    let eventHandler: Function;
    mockHandleDataEvents.mockImplementation((cb: Function) => {
      eventHandler = cb;
      return {remove: jest.fn()};
    });
    const callback = jest.fn();
    const cleanup = services.monitorConnection()(callback);
    eventHandler!({type: 'onDisconnected'});
    expect(callback).toHaveBeenCalledWith({type: 'DISCONNECT'});
    expect(typeof cleanup).toBe('function');
  });

  it('monitorConnection detects BLE error with TVW prefix', () => {
    let eventHandler: Function;
    mockHandleDataEvents.mockImplementation((cb: Function) => {
      eventHandler = cb;
      return {remove: jest.fn()};
    });
    const callback = jest.fn();
    services.monitorConnection()(callback);
    eventHandler!({type: 'onError', code: 'TVW_001', message: 'BLE fail'});
    expect(callback).toHaveBeenCalledWith({
      type: 'BLE_ERROR',
      bleError: {message: 'BLE fail', code: 'TVW_001'},
    });
  });

  it('startConnection starts wallet and subscribes', () => {
    const {subscribe} = require('../../../shared/openIdBLE/walletEventHandler');
    subscribe.mockReturnValue({remove: jest.fn()});
    const context = {openId4VpUri: 'openid4vp://test'};
    const callback = jest.fn();
    const cleanup = services.startConnection(context)(callback);
    expect(mockStartConnection).toHaveBeenCalledWith('openid4vp://test');
    expect(subscribe).toHaveBeenCalled();
    expect(typeof cleanup).toBe('function');
  });

  it('startConnection calls CONNECTED on secure channel', () => {
    const {subscribe} = require('../../../shared/openIdBLE/walletEventHandler');
    let statusCb: Function;
    subscribe.mockImplementation((cb: Function) => {
      statusCb = cb;
      return {remove: jest.fn()};
    });
    const context = {openId4VpUri: 'openid4vp://test'};
    const callback = jest.fn();
    services.startConnection(context)(callback);
    statusCb!({type: 'onSecureChannelEstablished'});
    expect(callback).toHaveBeenCalledWith({type: 'CONNECTED'});
  });

  it('sendVc sends data and subscribes for events', () => {
    const {subscribe} = require('../../../shared/openIdBLE/walletEventHandler');
    subscribe.mockReturnValue({remove: jest.fn()});
    const context = {selectedVc: {id: 'vc1', processedCredential: 'proc'}};
    const callback = jest.fn();
    const cleanup = services.sendVc(context)(callback);
    expect(mockSendData).toHaveBeenCalledWith(JSON.stringify({id: 'vc1'}));
    expect(typeof cleanup).toBe('function');
  });

  it('sendVc calls VC_SENT on data sent', () => {
    const {subscribe} = require('../../../shared/openIdBLE/walletEventHandler');
    let statusCb: Function;
    subscribe.mockImplementation((cb: Function) => {
      statusCb = cb;
      return {remove: jest.fn()};
    });
    const context = {selectedVc: {id: 'vc1', processedCredential: 'proc'}};
    const callback = jest.fn();
    services.sendVc(context)(callback);
    statusCb!({type: 'onDataSent'});
    expect(callback).toHaveBeenCalledWith({type: 'VC_SENT'});
  });

  it('sendVc calls VC_ACCEPTED on accepted verification', () => {
    const {subscribe} = require('../../../shared/openIdBLE/walletEventHandler');
    let statusCb: Function;
    subscribe.mockImplementation((cb: Function) => {
      statusCb = cb;
      return {remove: jest.fn()};
    });
    const context = {selectedVc: {id: 'vc1', processedCredential: 'proc'}};
    const callback = jest.fn();
    services.sendVc(context)(callback);
    statusCb!({type: 'onVerificationStatusReceived', status: 'ACCEPTED'});
    expect(callback).toHaveBeenCalledWith({type: 'VC_ACCEPTED'});
  });

  it('sendVc calls VC_REJECTED on rejected verification', () => {
    const {subscribe} = require('../../../shared/openIdBLE/walletEventHandler');
    let statusCb: Function;
    subscribe.mockImplementation((cb: Function) => {
      statusCb = cb;
      return {remove: jest.fn()};
    });
    const context = {selectedVc: {id: 'vc1', processedCredential: 'proc'}};
    const callback = jest.fn();
    services.sendVc(context)(callback);
    statusCb!({type: 'onVerificationStatusReceived', status: 'REJECTED'});
    expect(callback).toHaveBeenCalledWith({type: 'VC_REJECTED'});
  });

  it('disconnect calls wallet.disconnect', () => {
    services.disconnect()();
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('disconnect does not throw on error', () => {
    mockDisconnect.mockImplementationOnce(() => {
      throw new Error('disconnect fail');
    });
    expect(() => services.disconnect()()).not.toThrow();
  });
});
