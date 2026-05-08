import Storage, {MMKV} from '../shared/storage';
import {
  EventFrom,
  Receiver,
  send,
  sendParent,
  sendUpdate,
  StateFrom,
} from 'xstate';
import {createModel} from 'xstate/lib/model';
import {log} from 'xstate/lib/actions';
import {
  isIOS,
  MY_VCS_STORE_KEY,
  RECEIVED_VCS_STORE_KEY,
  SETTINGS_STORE_KEY,
  SHOW_FACE_AUTH_CONSENT_SHARE_FLOW,
  ENOENT,
} from '../shared/constants';
import {NativeModules} from 'react-native';
import {
  AUTH_TIMEOUT,
  decryptJson,
  ENCRYPTION_ID,
  encryptJson,
  HMAC_ALIAS,
  isHardwareKeystoreExists,
} from '../shared/cryptoutil/cryptoUtil';
import {VCMetadata} from '../shared/VCMetadata';
import {BiometricCancellationError} from '../shared/error/BiometricCancellationError';
import {TelemetryConstants} from '../shared/telemetry/TelemetryConstants';
import {
  sendErrorEvent,
  getErrorEventData,
} from '../shared/telemetry/TelemetryUtils';
import {Buffer} from 'buffer';
import {VC} from './VerifiableCredential/VCMetaMachine/vc';
import { isVCStorageInitialised } from '../shared/fileStorage';

export const keyinvalidatedString =
  'Key Invalidated due to biometric enrollment';
export const tamperedErrorMessageString = 'Data is tampered';

const {RNSecureKeystoreModule} = NativeModules;
const model = createModel(
  {
    encryptionKey: '',
  },
  {
    events: {
      KEY_RECEIVED: (key: string) => ({key}),
      READY: () => ({}),
      TRY_AGAIN: () => ({}),
      IGNORE: () => ({}),
      GET: (key: string) => ({key}),
      GET_VCS_DATA: (key: string) => ({key}),
      EXPORT: () => ({}),
      RESTORE_BACKUP: (data: {}) => ({data}),
      DECRYPT_ERROR: () => ({}),
      KEY_INVALIDATE_ERROR: () => ({}),
      BIOMETRIC_CANCELLED: (requester?: string) => ({requester}),
      SET: (key: string, value: unknown) => ({key, value}),
      APPEND: (key: string, value: unknown) => ({key, value}),
      PREPEND: (key: string, value: unknown) => ({key, value}),
      UPDATE: (key: string, value: string) => ({key, value}),
      REMOVE: (key: string, value: string) => ({key, value}),
      REMOVE_VC_METADATA: (key: string, value: string) => ({key, value}),
      REMOVE_ITEMS: (key: string, values: string[]) => ({key, values}),
      CLEAR: () => ({}),
      ERROR: (error: Error) => ({error}),
      STORE_RESPONSE: (response?: unknown, requester?: string) => ({
        response,
        requester,
      }),
      STORE_ERROR: (error: Error, requester?: string) => ({error, requester}),
      FETCH_ALL_WELLKNOWN_CONFIG: () => ({}),
    },
  },
);

export const StoreEvents = model.events;

export type StoreResponseEvent = EventFrom<typeof model, 'STORE_RESPONSE'>;

type ForwardedEvent = EventFrom<typeof model> & {requester: string};

export const storeMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5SwC4HsBOYB0MUoEsA7KAUSIGMMBPAB0LSIGkxqBiJ0gTQH0AlUgGFSASQBqpACIBtAAwBdRKFppYBBkSUgAHogBMADj3YArAYDMAdnMBOQ5csA2AIzOTAGhDVErt9kcmzrKGznqyBgYm5gC+0Z6omDh4hCTkVHQaLOykfHwA8nxyikggKmoaWroIhsZmVrb2Tq4eXog2AaY2ACyWdjbBhgbOsfHoWLhgRGAYAIYpZJQ09ASMWRzc-EKiEjIKWmXqK5olVdYG2G4OoeYmlgb9ep7eCDYmjtgWJnp6zjaWvo49CMQAlxjAprN5mklplWGwcvlCnsSgcKidECYuu8vs4uuYAtZHBYDE9EJETKY3OZZLcTJi9OYgXEQWMcFhYGB8MQoABlMYzGBsCCMHDEABuaAA1jhQWy4Jz5nzMAKwAhxWgKHMjkUivtVIdGJUfLI-thZFjMRYrJaSa0Xu1sHo6V0TQFHHiTMDZdh2QruUrZoLphhMNhaAAbOYAM0wAFtsN7fVySAGVWqiBLNRodcjlPq0aAqt1jOFgrJbI47JYfqSEAZrJ0uq9ukMotYvayfWAZhB2ABxUgAFV1KPzRyNCFCJlk-kcljxLibekcjlrQVkM-M+IXRK6PxXHcSXZ77B5Q5HefK4-Rk6dM5X8-xuLsK9r-S6F2sNKaBmCRkP4xYCebAAIIAApgaQAByuzFJeBrHIWPh3rOj6Li+q52r+5wbu0PzmJEhjlgBcrAWBAiQTBF6lGOho3lO95zguz7Lphzz-M4HxYs4kRuE6jJdCRx69mwAgALJ5BI1GoteSG3tOqHMUur52i4FJEno873L8dw9EJQEieJkmkDwYiCDwYlDiBkggYOIHSbRiE6Mh5icdWPzOI4shOG2taBDYlI2PiNiRDc7SesyibdoZpASRIPAiIOsU8g5V50XJDGKU+ylsYge7mNgNwmDY-R3PO4ROvp0XsIIAAypAgUicE0WlTlVJlD5KRhtaMpYFx2E2ZxDBulhVcBPKDgUJkCDyYF5FBZ6pQhE5TsY87LgyFjdO0tZhB+5hdDxJrlnoeGyI4Y0iRNU08AiBRLQWzm3nO-jFS4tgVs4BG1kM2BNq4YRzncDJNrEzJEGgEBwFosp6q1E4ALS5QgSNCck3LQhkRxZHDy03nua7ro6056IdVineWo2RZ24LTFqqSLFjqysLjj1VFixj1hEXldG8XnBG+bz+GVh0hUM-xMqMR5Joq-IwKzslPXYM5dE2+IbtS-Q2G+-zYJYZhfUVNjOJYJqXc88Fs8heKFYb5UmtYhOyJxTYhdWxuVu6EWxEAA */
  model.createMachine(
    {
      predictableActionArguments: true,
      preserveActionOrder: true,
      tsTypes: {} as import('./store.typegen').Typegen0,
      schema: {
        context: model.initialContext,
        events: {} as EventFrom<typeof model>,
      },
      id: 'store',
      initial: 'checkFreshInstall',
      states: {
        checkFreshInstall: {
          invoke: {
            src: 'checkFreshInstall',
            onDone: [
              {
                cond: 'hasData',
                target: !isHardwareKeystoreExists
                  ? 'gettingEncryptionKey'
                  : 'checkEncryptionKey',
              },
              {
                target: 'clearIosKeys',
              },
            ],
          },
        },
        clearIosKeys: {
          invoke: {
            src: 'clearKeys',
            onDone: [
              {
                target: !isHardwareKeystoreExists
                  ? 'gettingEncryptionKey'
                  : 'checkEncryptionKey',
              },
            ],
          },
        },
        checkEncryptionKey: {
          invoke: {
            src: 'hasEncryptionKey',
          },
          on: {
            READY: {
              target: 'ready',
            },
            ERROR: {
              target: 'generatingEncryptionKey',
            },
          },
        },
        gettingEncryptionKey: {
          invoke: {
            src: 'getEncryptionKey',
          },
          on: {
            KEY_RECEIVED: {
              actions: ['setEncryptionKey'],
              target: 'ready',
            },
            ERROR: {
              target: 'checkStorageInitialisation',
            },
          },
        },
        checkStorageInitialisation: {
          invoke: {
            src: 'checkStorageInitialisedOrNot',
          },
          on: {
            ERROR: {
              target: 'failedReadingKey',
              actions: sendParent('ERROR'),
            },
            READY: {
              target: 'generatingEncryptionKey',
            },
          },
        },
        failedReadingKey: {
          on: {
            TRY_AGAIN: {
              target: 'gettingEncryptionKey',
            },
            IGNORE: {
              target: 'generatingEncryptionKey',
            },
          },
        },
        generatingEncryptionKey: {
          invoke: {
            src: 'generateEncryptionKey',
          },
          on: {
            KEY_RECEIVED: [
              {
                cond: 'isCustomSecureKeystore',
                target: ['ready'],
              },
              {
                actions: 'setEncryptionKey',
                target: 'resettingStorage',
              },
            ],

            ERROR: {
              actions: log('Generating encryption key failed'),
            },
          },
        },
        resettingStorage: {
          invoke: {
            src: 'clear',
            onDone: [
              {
                target: 'ready',
              },
            ],
            onError: [
              {
                actions: log('Resetting storage failed'),
              },
            ],
          },
        },
        ready: {
          entry: 'notifyParent',
          invoke: {
            src: 'store',
            id: '_store',
          },
          on: {
            GET: {
              actions: 'forwardStoreRequest',
            },
            GET_VCS_DATA: {
              actions: 'forwardStoreRequest',
            },
            EXPORT: {
              actions: 'forwardStoreRequest',
            },
            RESTORE_BACKUP: {
              actions: 'forwardStoreRequest',
            },
            SET: {
              actions: 'forwardStoreRequest',
            },
            APPEND: {
              actions: 'forwardStoreRequest',
            },
            PREPEND: {
              actions: 'forwardStoreRequest',
            },
            UPDATE: {
              actions: 'forwardStoreRequest',
            },
            REMOVE: {
              actions: 'forwardStoreRequest',
            },
            REMOVE_VC_METADATA: {
              actions: 'forwardStoreRequest',
            },
            REMOVE_ITEMS: {
              actions: 'forwardStoreRequest',
            },
            CLEAR: {
              actions: 'forwardStoreRequest',
            },
            FETCH_ALL_WELLKNOWN_CONFIG: {
              actions: 'forwardStoreRequest',
            },
            STORE_RESPONSE: {
              actions: [
                send(
                  (_, event) => model.events.STORE_RESPONSE(event.response),
                  {
                    to: (_, event) => event.requester,
                  },
                ),
                sendUpdate(),
              ],
            },
            DECRYPT_ERROR: {
              actions: sendParent('DECRYPT_ERROR'),
            },
            BIOMETRIC_CANCELLED: {
              actions: [
                send(
                  (_, event) =>
                    model.events.BIOMETRIC_CANCELLED(event.requester),
                  {
                    to: (_, event) => event.requester,
                  },
                ),
                sendUpdate(),
                sendParent('BIOMETRIC_CANCELLED'),
              ],
              target: 'checkFreshInstall',
            },
          },
        },
      },
      on: {
        STORE_ERROR: {
          actions: [
            send((_, event) => model.events.STORE_ERROR(event.error), {
              to: (_, event) => event.requester,
            }),
            sendUpdate(),
          ],
        },
        KEY_INVALIDATE_ERROR: {
          actions: sendParent('KEY_INVALIDATE_ERROR'),
        },
        BIOMETRIC_CANCELLED: {
          actions: [sendParent('BIOMETRIC_CANCELLED')],
          target: 'checkFreshInstall',
        },
      },
    },
    {
      actions: {
        notifyParent: sendParent(model.events.READY()),

        forwardStoreRequest: send(
          (_, event, meta) => ({
            ...event,
            requester: meta._event.origin,
          }),
          {to: '_store'},
        ),

        setEncryptionKey: model.assign({
          encryptionKey: (_, event) => event.key,
        }),
      },

      services: {
        clear: () => clear(),
        clearKeys: () => async _ => {
          if (isIOS()) {
            const {RNSecureKeystoreModule} = NativeModules;
            await RNSecureKeystoreModule.clearKeys();
          }
          return;
        },
        checkFreshInstall: () => async callback => {
          try {
            return await getItem('auth', null, '');
          } catch (e) {
            if (e instanceof BiometricCancellationError) {
              callback(model.events.BIOMETRIC_CANCELLED());
            } else {
              callback(model.events.STORE_ERROR(e));
            }
          }
        },
        hasEncryptionKey: () => async callback => {
          let hasSetCredentials;
          try {
            hasSetCredentials = await RNSecureKeystoreModule.hasAlias(
              ENCRYPTION_ID,
            );
          } catch (e) {
            hasSetCredentials = false;
          }
          if (hasSetCredentials) {
            try {
              const base64EncodedString =
                Buffer.from('Dummy').toString('base64');
              await RNSecureKeystoreModule.encryptData(
                ENCRYPTION_ID,
                base64EncodedString,
              );
            } catch (e) {
              if (e instanceof BiometricCancellationError) {
                callback(model.events.BIOMETRIC_CANCELLED());
              }
              sendErrorEvent(getErrorEventData('ENCRYPTION', '', e));

              if (e.message.includes(keyinvalidatedString)) {
                await clear();
                callback(model.events.KEY_INVALIDATE_ERROR());
                sendUpdate();
              } else {
                callback(model.events.STORE_ERROR(e));
              }
            }
            callback(model.events.READY());
          } else {
            sendErrorEvent(
              getErrorEventData(
                'ENCRYPTION',
                '',
                'Could not get the android Key alias',
              ),
            );
            callback(
              model.events.ERROR(
                new Error('Could not get the android Key alias'),
              ),
            );
          }
        },

        checkStorageInitialisedOrNot: () => async callback => {
          const isDirectoryExist = await isVCStorageInitialised();
          if (!isDirectoryExist) {
            callback(model.events.READY());
          } else {
            callback(
              model.events.ERROR(
                new Error(
                  'vc directory exists and decryption key is not available',
                ),
              ),
            );
          }
        },

        store: context => (callback, onReceive: Receiver<ForwardedEvent>) => {
          onReceive(async event => {
            try {
              let response: unknown;
              switch (event.type) {
                case 'GET': {
                  response = await getItem(
                    event.key,
                    null,
                    context.encryptionKey,
                  );
                  break;
                }
                case 'EXPORT': {
                  response = await backupAndExportData(context.encryptionKey);
                  break;
                }
                case 'GET_VCS_DATA': {
                  response = await getVCsData(event.key, context.encryptionKey);
                  break;
                }
                case 'RESTORE_BACKUP': {
                  // the backup data is in plain text
                  await restoreBackedUpData(event.data, context.encryptionKey);
                  break;
                }
                case 'SET': {
                  await setItem(event.key, event.value, context.encryptionKey);
                  response = event.value;
                  break;
                }
                case 'APPEND': {
                  await appendItem(
                    event.key,
                    event.value,
                    context.encryptionKey,
                  );
                  response = event.value;
                  break;
                }
                case 'PREPEND': {
                  await prependItem(
                    event.key,
                    event.value,
                    context.encryptionKey,
                  );

                  response = event.value;
                  break;
                }
                case 'UPDATE': {
                  await updateItem(
                    event.key,
                    event.value,
                    context.encryptionKey,
                  );

                  response = event.value;
                  break;
                }
                case 'REMOVE': {
                  await removeItem(
                    event.key,
                    event.value,
                    context.encryptionKey,
                  );
                  response = event.value;
                  break;
                }
                case 'REMOVE_VC_METADATA': {
                  await removeVCMetaData(
                    event.key,
                    event.value,
                    context.encryptionKey,
                  );
                  response = event.value;
                  break;
                }
                case 'REMOVE_ITEMS': {
                  await removeItems(
                    event.key,
                    event.values,
                    context.encryptionKey,
                  );
                  response = event.values;
                  break;
                }
                case 'CLEAR': {
                  await clear();
                  break;
                }
                case 'FETCH_ALL_WELLKNOWN_CONFIG': {
                  response = await fetchAllWellknownConfig(
                    context.encryptionKey,
                  );
                  break;
                }

                default:
                  return;
              }
              callback(model.events.STORE_RESPONSE(response, event.requester));
            } catch (e) {
              sendErrorEvent(
                getErrorEventData(
                  TelemetryConstants.FlowType.fetchData,
                  '',
                  e.message,
                  {e},
                ),
              );
              if (e.message.includes(keyinvalidatedString)) {
                await clear();
                callback(model.events.KEY_INVALIDATE_ERROR());
                sendUpdate();
              } else if (
                e.message.includes('JSON') ||
                e.message.includes('decrypt')
              ) {
                callback(model.events.DECRYPT_ERROR());
                sendUpdate();
              } else if (e instanceof BiometricCancellationError) {
                callback(model.events.BIOMETRIC_CANCELLED(event.requester));
                sendUpdate();
              } else {
                console.error(
                  `Error while performing the operation ${event.type} with storage - ${e}`,
                );
                callback(model.events.STORE_ERROR(e, event.requester));
              }
            }
          });
        },
        getEncryptionKey: () => async callback => {
          const existingCredentials = '';
          if (existingCredentials) {
            console.log('Credentials successfully loaded for user');
            callback(model.events.KEY_RECEIVED(existingCredentials.password));
          } else {
            sendErrorEvent(
              getErrorEventData(
                TelemetryConstants.FlowType.fetchData,
                '',
                'Could not get keychain credentials',
              ),
            );
            console.error('Credentials failed to load for user');
            callback(
              model.events.ERROR(
                new Error('Could not get keychain credentials.'),
              ),
            );
          }
        },
        generateEncryptionKey: () => async callback => {
          if (!isHardwareKeystoreExists) {
            callback(
              model.events.ERROR(
                new Error('Could not generate keychain credentials.'),
              ),
            );
          } else {
            const isBiometricsEnabled =
              await RNSecureKeystoreModule.hasBiometricsEnabled();
            await RNSecureKeystoreModule.generateKey(
              ENCRYPTION_ID,
              isBiometricsEnabled,
              AUTH_TIMEOUT,
            );
            await RNSecureKeystoreModule.generateHmacshaKey(HMAC_ALIAS);
            callback(model.events.KEY_RECEIVED(''));
          }
        },
      },

      guards: {
        hasData: (_, event: any) => {
          return event.data !== null;
        },
        isCustomSecureKeystore: () => isHardwareKeystoreExists,
      },
    },
  );

export async function setItem(
  key: string,
  value: unknown,
  encryptionKey: string,
) {
  try {
    let encryptedData;
    if (key === SETTINGS_STORE_KEY) {
      const appId = value.appId;
      delete value.appId;
      const settings = {
        encryptedData: await encryptJson(encryptionKey, JSON.stringify(value)),
        appId,
      };
      encryptedData = JSON.stringify(settings);
    } else if (key === SHOW_FACE_AUTH_CONSENT_SHARE_FLOW) {
      encryptedData = JSON.stringify(value);
    } else {
      encryptedData = await encryptJson(encryptionKey, JSON.stringify(value));
    }
    await Storage.setItem(key, encryptedData, encryptionKey);
  } catch (e) {
    console.error('error setItem:', e);
    throw e;
  }
}

export async function backupAndExportData(encryptionKey: string) {
  return Storage.backupData(encryptionKey);
}

export async function restoreBackedUpData(data, encryptionKey) {
  await Storage.restoreBackUpData(data, encryptionKey);
}

export async function fetchAllWellknownConfig(encryptionKey: string) {
  return await Storage.fetchAllWellknownConfig(encryptionKey);
}

export async function getVCsData(key: string, encryptionKey: string) {
  try {
    let vcsData: Record<string, VC> = {};
    let tamperedVcsList: VCMetadata[] = [];

    const vcsMetadata: VCMetadata[] = await getItem(key, null, encryptionKey);

    for (let ind in vcsMetadata) {
      const vcKey = VCMetadata.fromVC(vcsMetadata[ind]).getVcKey();
      try {
        const vc = await getItem(vcKey, null, encryptionKey);
        vcsData[vcKey] = vc;
      } catch (e) {
        console.error(`error occurred while getting vc's data - ${vcKey}`, e);
        if (
          e.message.includes(tamperedErrorMessageString) ||
          e.message.includes(ENOENT)
        ) {
          tamperedVcsList = [...tamperedVcsList, vcsMetadata[ind]];
        } else {
          throw e;
        }
      }
    }
    return {vcsData, vcsMetadata, tamperedVcsList};
  } catch (e) {
    throw e;
  }
}

export async function getItem(
  key: string,
  defaultValue: unknown,
  encryptionKey: string,
) {
  try {
    const data = await Storage.getItem(key, encryptionKey);
    if (data != null) {
      let decryptedData;
      if (key === SETTINGS_STORE_KEY) {
        let parsedData = JSON.parse(data);
        if (parsedData.encryptedData) {
          decryptedData = await decryptJson(
            encryptionKey,
            parsedData.encryptedData,
          );
          parsedData.encryptedData = JSON.parse(decryptedData);
        }
        return parsedData;
      } else if (key === SHOW_FACE_AUTH_CONSENT_SHARE_FLOW) {
        return JSON.parse(data);
      }
      decryptedData = await decryptJson(encryptionKey, data);
      return JSON.parse(decryptedData);
    }
    if (data === null && VCMetadata.isVCKey(key)) {
      await removeItem(key, data, encryptionKey);
      sendErrorEvent(
        getErrorEventData(
          TelemetryConstants.FlowType.fetchData,
          TelemetryConstants.ErrorId.tampered,
          tamperedErrorMessageString,
        ),
      );
      throw new Error(tamperedErrorMessageString);
    } else {
      console.debug(
        `While getting item - ${key} from storage: data value is ${data} so returning the default value`,
      );
      return defaultValue;
    }
  } catch (e) {
    console.error(`Exception in getting item for ${key}: ${e}`);
    if (e.message === ENOENT) {
      await removeTamperedVcMetaData(key, encryptionKey);
      sendErrorEvent(
        getErrorEventData(
          TelemetryConstants.FlowType.fetchData,
          TelemetryConstants.ErrorId.tampered,
          e.message,
        ),
      );
      throw e;
    }
    if (
      e.message.includes(tamperedErrorMessageString) ||
      e.message.includes(keyinvalidatedString) ||
      e instanceof BiometricCancellationError ||
      e.message.includes('Key not found') // this error happens when previous get Item calls failed due to key invalidation and data and keys are deleted
    ) {
      sendErrorEvent(
        getErrorEventData(
          TelemetryConstants.FlowType.fetchData,
          TelemetryConstants.ErrorId.tampered,
          e.message,
        ),
      );
      throw e;
    }
    sendErrorEvent(
      getErrorEventData(
        TelemetryConstants.FlowType.fetchData,
        TelemetryConstants.ErrorId.tampered,
        `Exception in getting item for ${key}: ${e}`,
      ),
    );
    return defaultValue;
  }
}

export async function appendItem(
  key: string,
  value: unknown,
  encryptionKey: string,
) {
  try {
    const list = await getItem(key, [], encryptionKey);
    await setItem(key, [...list, value], encryptionKey);
  } catch (e) {
    console.error('error appendItem:', e);
    throw e;
  }
}

export async function prependItem(
  key: string,
  value: unknown,
  encryptionKey: string,
) {
  try {
    const list = await getItem(key, [], encryptionKey);
    const newList = Array.isArray(value)
      ? [...value, ...list]
      : [value, ...list];

    await setItem(key, newList, encryptionKey);
  } catch (e) {
    console.error('error prependItem:', e);
    throw e;
  }
}

export async function updateItem(
  key: string,
  value: string,
  encryptionKey: string,
) {
  // Used for updating VC metadata in the list. Prepends the passed vcmetadata in value
  try {
    const list = (await getItem(key, [], encryptionKey)) as Object[];
    const updatedMetaData = VCMetadata.fromVcMetadataString(value);
    const newList = [
      value,
      ...list.map(metadataObj => {
        const metaData = new VCMetadata(metadataObj);
        if (metaData.getVcKey() !== updatedMetaData.getVcKey()) {
          return JSON.stringify(metaData);
        }
      }),
    ].filter(value => value != undefined && value !== null);

    await setItem(key, newList, encryptionKey);
  } catch (e) {
    console.error('error prependItem:', e);
    throw e;
  }
}

export async function removeItem(
  key: string,
  value: string,
  encryptionKey: string,
) {
  try {
    if (value === null && VCMetadata.isVCKey(key)) {
      await Storage.removeItem(key);
      await removeTamperedVcMetaData(key, encryptionKey);
    } else if (key === MY_VCS_STORE_KEY) {
      const data = await Storage.getItem(key, encryptionKey);
      let list: Object[] = [];

      if (data !== null) {
        const decryptedData = await decryptJson(encryptionKey, data);
        list = JSON.parse(decryptedData) as Object[];
      }

      const newList = list.filter((vcMetadataObject: Object) => {
        return new VCMetadata(vcMetadataObject).getVcKey() !== value;
      });

      await setItem(key, newList, encryptionKey);
      await Storage.removeItem(value);
      await MMKV.removeItem(value);
    }
  } catch (e) {
    console.error('error removeItem:', e);
    sendErrorEvent(
      getErrorEventData(
        TelemetryConstants.FlowType.remove,
        TelemetryConstants.ErrorId.failure,
        e.message,
      ),
    );
    throw e;
  }
}

export async function removeVCMetaData(
  key: string,
  vcKey: string,
  encryptionKey: string,
) {
  try {
    const data = await Storage.getItem(key, encryptionKey);
    let list: Object[] = [];

    if (data != null) {
      const decryptedData = await decryptJson(encryptionKey, data);
      list = JSON.parse(decryptedData) as Object[];
    }

    const newList = list.filter((vcMetadataObject: Object) => {
      return new VCMetadata(vcMetadataObject).getVcKey() !== vcKey;
    });

    await setItem(key, newList, encryptionKey);
  } catch (e) {
    console.error('error remove VC metadata:', e);
    sendErrorEvent(
      getErrorEventData(
        TelemetryConstants.FlowType.removeVcMetadata,
        TelemetryConstants.ErrorId.failure,
        e.message,
      ),
    );
    throw e;
  }
}

export async function removeTamperedVcMetaData(
  key: string,
  encryptionKey: string,
) {
  try {
    const myVcsMetadata = await Storage.getItem(
      MY_VCS_STORE_KEY,
      encryptionKey,
    );
    let myVcsDecryptedMetadata: Object[] = [];

    if (myVcsMetadata != null) {
      const decryptedData = await decryptJson(encryptionKey, myVcsMetadata);
      myVcsDecryptedMetadata = JSON.parse(decryptedData) as Object[];
    }

    const isTamperedVcInMyVCs = myVcsDecryptedMetadata?.filter(
      (vcMetadataObject: Object) => {
        return new VCMetadata(vcMetadataObject).getVcKey() === key;
      },
    ).length;
    if (isTamperedVcInMyVCs) {
      await removeVCMetaData(MY_VCS_STORE_KEY, key, encryptionKey);
    } else {
      await removeVCMetaData(RECEIVED_VCS_STORE_KEY, key, encryptionKey);
    }
  } catch (e) {
    console.error('error while removing VC item metadata:', e);
    sendErrorEvent(
      getErrorEventData(
        TelemetryConstants.FlowType.remove,
        TelemetryConstants.ErrorId.tampered,
        e.message,
      ),
    );
    throw e;
  }
}

export async function clear() {
  try {
    console.warn('clearing entire storage');
    if (isHardwareKeystoreExists) {
      RNSecureKeystoreModule.clearKeys();
    }
    await Storage.clear();
  } catch (e) {
    console.error('error clear:', e);
    throw e;
  }
}
export async function removeItems(
  key: string,
  values: string[],
  encryptionKey: string,
) {
  try {
    const data = await Storage.getItem(key, encryptionKey);
    let list: Object[] = [];

    if (data !== null) {
      const decryptedData = await decryptJson(encryptionKey, data);
      list = JSON.parse(decryptedData) as Object[];
    }

    const newList = list.filter(
      (vcMetadataObject: Object) =>
        !values.includes(new VCMetadata(vcMetadataObject).getVcKey()),
    );

    await setItem(key, newList, encryptionKey);
  } catch (e) {
    console.error('error removeItems:', e);
    sendErrorEvent(
      getErrorEventData(
        TelemetryConstants.FlowType.remove,
        TelemetryConstants.ErrorId.failure,
        e.message,
      ),
    );
    throw e;
  }
}

type State = StateFrom<typeof storeMachine>;
