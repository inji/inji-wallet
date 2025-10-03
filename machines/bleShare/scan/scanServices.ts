import {isLocationEnabled} from 'react-native-device-info';
import  { isMinimumStorageLimitReached } from '../../../shared/storage';
import BluetoothStateManager from 'react-native-bluetooth-state-manager';
import {
  check,
  checkMultiple,
  PERMISSIONS,
  PermissionStatus,
  requestMultiple,
  RESULTS,
} from 'react-native-permissions';
import {subscribe} from '../../../shared/openIdBLE/walletEventHandler';
import {
  requestLocationPermission,
  checkLocationPermissionStatus,
} from '../../../shared/location';
import {isIOS} from '../../../shared/constants';

import {wallet, EventTypes, VerificationStatus} from '../../../shared/tuvali';
import {WalletDataEvent} from '../../../shared/tuvali/types/events';

export const ScanServices = (model: any) => {
  return {
    checkBluetoothPermission: () => async callback => {
      // wait a bit for animation to finish when app becomes active
      await new Promise(resolve => setTimeout(resolve, 250));
      try {
        // Passing Granted for android since permission status is always granted even if its denied.
        let response: PermissionStatus = RESULTS.GRANTED;

        if (isIOS()) {
          response = await check(PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL);
        }

        if (response === RESULTS.GRANTED) {
          callback(model.events.BLUETOOTH_PERMISSION_ENABLED());
        } else {
          callback(model.events.BLUETOOTH_PERMISSION_DENIED());
        }
      } catch (e) {
        console.error(e);
      }
    },

    checkBluetoothState: () => callback => {
      const subscription = BluetoothStateManager.onStateChange(state => {
        if (state === 'PoweredOn') {
          callback(model.events.BLUETOOTH_STATE_ENABLED());
        } else {
          callback(model.events.BLUETOOTH_STATE_DISABLED());
        }
      }, true);
      return () => subscription.remove();
    },

    requestBluetooth: () => callback => {
      BluetoothStateManager.requestToEnable()
        .then(() => callback(model.events.BLUETOOTH_STATE_ENABLED()))
        .catch(() => callback(model.events.BLUETOOTH_STATE_DISABLED()));
    },

    requestToEnableLocationPermission: () => callback => {
      requestLocationPermission(
        () => callback(model.events.LOCATION_ENABLED()),
        () => callback(model.events.LOCATION_DISABLED()),
      );
    },

    monitorConnection: () => callback => {
      const walletErrorCodePrefix = 'TVW';
      const subscription = wallet.handleDataEvents(event => {
        if (event.type === EventTypes.onDisconnected) {
          callback({type: 'DISCONNECT'});
        }
        if (
          event.type === EventTypes.onError &&
          event.code.includes(walletErrorCodePrefix)
        ) {
          callback({
            type: 'BLE_ERROR',
            bleError: {message: event.message, code: event.code},
          });
          console.error('BLE Exception: ' + event.message);
        }
      });

      return () => subscription.remove();
    },

    checkNearByDevicesPermission: () => callback => {
      checkMultiple([
        PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
        PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
      ])
        .then(response => {
          if (
            response[PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE] ===
              RESULTS.GRANTED &&
            response[PERMISSIONS.ANDROID.BLUETOOTH_CONNECT] === RESULTS.GRANTED
          ) {
            callback(model.events.NEARBY_ENABLED());
          } else {
            callback(model.events.NEARBY_DISABLED());
          }
        })
        .catch(err => {
          callback(model.events.NEARBY_DISABLED());
        });
    },

    requestNearByDevicesPermission: () => callback => {
      requestMultiple([
        PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
        PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
      ])
        .then(response => {
          if (
            response[PERMISSIONS.ANDROID.BLUETOOTH_SCAN] === RESULTS.GRANTED &&
            response[PERMISSIONS.ANDROID.BLUETOOTH_CONNECT] === RESULTS.GRANTED
          ) {
            callback(model.events.NEARBY_ENABLED());
          } else {
            callback(model.events.NEARBY_DISABLED());
          }
        })
        .catch(err => {
          callback(model.events.NEARBY_DISABLED());
        });
    },

    checkLocationPermission: () => callback => {
      checkLocationPermissionStatus(
        () => callback(model.events.LOCATION_ENABLED()),
        () => callback(model.events.LOCATION_DISABLED()),
      );
    },

    checkLocationStatus: () => async callback => {
      const isEnabled: boolean = await isLocationEnabled();
      if (isEnabled) {
        callback(model.events.LOCATION_ENABLED());
      } else {
        callback(model.events.LOCATION_DISABLED());
      }
    },

    startConnection: (context: any) => callback => {
      wallet.startConnection(context.openId4VpUri);
      const statusCallback = (event: WalletDataEvent) => {
        if (event.type === EventTypes.onSecureChannelEstablished) {
          callback({type: 'CONNECTED'});
        }
      };

      const subscription = subscribe(statusCallback);
      return () => subscription?.remove();
    },

    sendVc: context => callback => {
      const statusCallback = (event: WalletDataEvent) => {
        if (event.type === EventTypes.onDataSent) {
          callback({type: 'VC_SENT'});
        } else if (event.type === EventTypes.onVerificationStatusReceived) {
          callback({
            type:
              event.status === VerificationStatus.ACCEPTED
                ? 'VC_ACCEPTED'
                : 'VC_REJECTED',
          });
        }
      };
      const { processedCredential, ...rest } = context.selectedVc;
      const payload = JSON.stringify(rest);
      wallet.sendData(
        payload
      );
      const subscription = subscribe(statusCallback);
      return () => subscription?.remove();
    },

    disconnect: () => () => {
      try {
        console.log('inside wallet disconnect');
        wallet.disconnect();
      } catch (e) {
        // pass
      }
    },

    checkStorageAvailability: () => async () => {
      return Promise.resolve(isMinimumStorageLimitReached('minStorageRequiredForAuditEntry'));
    },
  };
};
