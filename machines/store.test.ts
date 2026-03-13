jest.unmock('./store');

jest.mock('../shared/storage', () => {
  const mockStorage = {
    setItem: jest.fn().mockResolvedValue(undefined),
    getItem: jest.fn().mockResolvedValue(null),
    removeItem: jest.fn().mockResolvedValue(undefined),
    clear: jest.fn().mockResolvedValue(undefined),
    backupData: jest.fn().mockResolvedValue({backup: 'data'}),
    restoreBackUpData: jest.fn().mockResolvedValue(undefined),
    fetchAllWellknownConfig: jest.fn().mockResolvedValue({}),
  };
  return {
    __esModule: true,
    default: mockStorage,
    MMKV: {
      removeItem: jest.fn(),
      getItem: jest.fn(),
      setItem: jest.fn(),
      clearStore: jest.fn(),
    },
  };
});

jest.mock('../shared/cryptoutil/cryptoUtil', () => ({
  encryptJson: jest.fn((_key: string, data: string) =>
    Promise.resolve('encrypted_' + data),
  ),
  decryptJson: jest.fn((_key: string, data: string) => {
    if (data.startsWith('encrypted_')) {
      return Promise.resolve(data.replace('encrypted_', ''));
    }
    return Promise.resolve(data);
  }),
  ENCRYPTION_ID: 'encryption_id',
  HMAC_ALIAS: 'hmac_alias',
  AUTH_TIMEOUT: 30,
  isHardwareKeystoreExists: false,
}));

jest.mock('../shared/constants', () => ({
  isIOS: jest.fn(() => false),
  MY_VCS_STORE_KEY: 'myVCs',
  RECEIVED_VCS_STORE_KEY: 'receivedVCs',
  SETTINGS_STORE_KEY: 'settings',
  SHOW_FACE_AUTH_CONSENT_SHARE_FLOW: 'faceAuthConsent',
  ENOENT: 'ENOENT',
}));

jest.mock('../shared/VCMetadata', () => {
  class MockVCMetadata {
    id: string;
    requestId: string;
    constructor(obj?: any) {
      this.id = obj?.id || '';
      this.requestId = obj?.requestId || '';
    }
    getVcKey() {
      return `vc_${this.id}_${this.requestId}`;
    }
    static isVCKey(key: string) {
      return key.startsWith('vc_');
    }
    static fromVC(obj: any) {
      return new MockVCMetadata(obj);
    }
    static fromVcMetadataString(str: string) {
      try {
        return new MockVCMetadata(JSON.parse(str));
      } catch {
        return new MockVCMetadata({});
      }
    }
  }
  return {VCMetadata: MockVCMetadata};
});

jest.mock('../shared/telemetry/TelemetryUtils', () => ({
  sendErrorEvent: jest.fn(),
  getErrorEventData: jest.fn((...args: any[]) => ({args})),
}));

jest.mock('../shared/telemetry/TelemetryConstants', () => ({
  TelemetryConstants: {
    FlowType: {
      fetchData: 'fetchData',
      remove: 'remove',
      removeVcMetadata: 'removeVcMetadata',
    },
    ErrorId: {
      tampered: 'tampered',
      failure: 'failure',
    },
  },
}));

jest.mock('../shared/error/BiometricCancellationError', () => ({
  BiometricCancellationError: class BiometricCancellationError extends Error {
    constructor(msg?: string) {
      super(msg || 'BiometricCancellation');
      this.name = 'BiometricCancellationError';
    }
  },
}));

jest.mock('../shared/fileStorage', () => ({
  isVCStorageInitialised: jest.fn().mockResolvedValue(false),
}));

import {
  StoreEvents,
  setItem,
  getItem,
  appendItem,
  prependItem,
  updateItem,
  removeItem,
  removeVCMetaData,
  removeTamperedVcMetaData,
  clear,
  removeItems,
  backupAndExportData,
  restoreBackedUpData,
  fetchAllWellknownConfig,
  getVCsData,
  keyinvalidatedString,
  tamperedErrorMessageString,
} from './store';

const Storage = require('../shared/storage').default;
const {MMKV} = require('../shared/storage');
const {encryptJson, decryptJson} = require('../shared/cryptoutil/cryptoUtil');
const {sendErrorEvent} = require('../shared/telemetry/TelemetryUtils');

describe('StoreEvents', () => {
  it('should create KEY_RECEIVED event', () => {
    const event = StoreEvents.KEY_RECEIVED('testKey');
    expect(event).toEqual({type: 'KEY_RECEIVED', key: 'testKey'});
  });

  it('should create READY event', () => {
    expect(StoreEvents.READY()).toEqual({type: 'READY'});
  });

  it('should create GET event', () => {
    const event = StoreEvents.GET('storageKey');
    expect(event).toEqual({type: 'GET', key: 'storageKey'});
  });

  it('should create GET_VCS_DATA event', () => {
    const event = StoreEvents.GET_VCS_DATA('vcsKey');
    expect(event).toEqual({type: 'GET_VCS_DATA', key: 'vcsKey'});
  });

  it('should create SET event', () => {
    const event = StoreEvents.SET('key1', {data: 'value'});
    expect(event).toEqual({type: 'SET', key: 'key1', value: {data: 'value'}});
  });

  it('should create APPEND event', () => {
    const event = StoreEvents.APPEND('key1', 'item');
    expect(event).toEqual({type: 'APPEND', key: 'key1', value: 'item'});
  });

  it('should create PREPEND event', () => {
    const event = StoreEvents.PREPEND('key1', 'item');
    expect(event).toEqual({type: 'PREPEND', key: 'key1', value: 'item'});
  });

  it('should create UPDATE event', () => {
    const event = StoreEvents.UPDATE('key1', 'newValue');
    expect(event).toEqual({type: 'UPDATE', key: 'key1', value: 'newValue'});
  });

  it('should create REMOVE event', () => {
    const event = StoreEvents.REMOVE('key1', 'value1');
    expect(event).toEqual({type: 'REMOVE', key: 'key1', value: 'value1'});
  });

  it('should create REMOVE_VC_METADATA event', () => {
    const event = StoreEvents.REMOVE_VC_METADATA('key1', 'vc1');
    expect(event).toEqual({
      type: 'REMOVE_VC_METADATA',
      key: 'key1',
      value: 'vc1',
    });
  });

  it('should create REMOVE_ITEMS event', () => {
    const event = StoreEvents.REMOVE_ITEMS('key1', ['v1', 'v2']);
    expect(event).toEqual({
      type: 'REMOVE_ITEMS',
      key: 'key1',
      values: ['v1', 'v2'],
    });
  });

  it('should create CLEAR event', () => {
    expect(StoreEvents.CLEAR()).toEqual({type: 'CLEAR'});
  });

  it('should create EXPORT event', () => {
    expect(StoreEvents.EXPORT()).toEqual({type: 'EXPORT'});
  });

  it('should create RESTORE_BACKUP event', () => {
    const data = {backup: 'data'};
    expect(StoreEvents.RESTORE_BACKUP(data)).toEqual({
      type: 'RESTORE_BACKUP',
      data,
    });
  });

  it('should create ERROR event', () => {
    const error = new Error('test');
    expect(StoreEvents.ERROR(error)).toEqual({type: 'ERROR', error});
  });

  it('should create STORE_RESPONSE event', () => {
    expect(StoreEvents.STORE_RESPONSE({data: 'x'}, 'req1')).toEqual({
      type: 'STORE_RESPONSE',
      response: {data: 'x'},
      requester: 'req1',
    });
  });

  it('should create STORE_ERROR event', () => {
    const error = new Error('oops');
    expect(StoreEvents.STORE_ERROR(error, 'req1')).toEqual({
      type: 'STORE_ERROR',
      error,
      requester: 'req1',
    });
  });

  it('should create FETCH_ALL_WELLKNOWN_CONFIG event', () => {
    expect(StoreEvents.FETCH_ALL_WELLKNOWN_CONFIG()).toEqual({
      type: 'FETCH_ALL_WELLKNOWN_CONFIG',
    });
  });

  it('should create TRY_AGAIN event', () => {
    expect(StoreEvents.TRY_AGAIN()).toEqual({type: 'TRY_AGAIN'});
  });

  it('should create IGNORE event', () => {
    expect(StoreEvents.IGNORE()).toEqual({type: 'IGNORE'});
  });

  it('should create DECRYPT_ERROR event', () => {
    expect(StoreEvents.DECRYPT_ERROR()).toEqual({type: 'DECRYPT_ERROR'});
  });

  it('should create KEY_INVALIDATE_ERROR event', () => {
    expect(StoreEvents.KEY_INVALIDATE_ERROR()).toEqual({
      type: 'KEY_INVALIDATE_ERROR',
    });
  });

  it('should create BIOMETRIC_CANCELLED event', () => {
    const event = StoreEvents.BIOMETRIC_CANCELLED('settings');
    expect(event).toEqual({
      type: 'BIOMETRIC_CANCELLED',
      requester: 'settings',
    });
  });
});

describe('store exported constants', () => {
  it('keyinvalidatedString has expected value', () => {
    expect(keyinvalidatedString).toBe(
      'Key Invalidated due to biometric enrollment',
    );
  });

  it('tamperedErrorMessageString has expected value', () => {
    expect(tamperedErrorMessageString).toBe('Data is tampered');
  });
});

describe('setItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('encrypts and stores a regular value', async () => {
    await setItem('myKey', {hello: 'world'}, 'enc123');
    expect(encryptJson).toHaveBeenCalledWith(
      'enc123',
      JSON.stringify({hello: 'world'}),
    );
    expect(Storage.setItem).toHaveBeenCalledWith(
      'myKey',
      expect.any(String),
      'enc123',
    );
  });

  it('handles SETTINGS_STORE_KEY specially (separates appId)', async () => {
    const value = {appId: 'app1', theme: 'dark', lang: 'en'};
    await setItem('settings', value, 'enc123');
    expect(encryptJson).toHaveBeenCalled();
    expect(Storage.setItem).toHaveBeenCalledWith(
      'settings',
      expect.any(String),
      'enc123',
    );
    // Verify the stored data has appId at top level
    const storedData = JSON.parse(Storage.setItem.mock.calls[0][1]);
    expect(storedData.appId).toBe('app1');
    expect(storedData.encryptedData).toBeDefined();
  });

  it('handles SHOW_FACE_AUTH_CONSENT_SHARE_FLOW as plain JSON', async () => {
    await setItem('faceAuthConsent', {consent: true}, 'enc123');
    expect(encryptJson).not.toHaveBeenCalled();
    expect(Storage.setItem).toHaveBeenCalledWith(
      'faceAuthConsent',
      JSON.stringify({consent: true}),
      'enc123',
    );
  });

  it('throws when Storage.setItem fails', async () => {
    Storage.setItem.mockRejectedValueOnce(new Error('disk full'));
    await expect(setItem('key', 'val', 'enc')).rejects.toThrow('disk full');
  });

  it('throws when encryptJson fails', async () => {
    encryptJson.mockRejectedValueOnce(new Error('enc fail'));
    await expect(setItem('key', 'val', 'enc')).rejects.toThrow('enc fail');
  });
});

describe('getItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns defaultValue when Storage returns null for non-VC key', async () => {
    Storage.getItem.mockResolvedValueOnce(null);
    const result = await getItem('someKey', 'default', 'enc');
    expect(result).toBe('default');
  });

  it('decrypts and parses data for regular keys', async () => {
    Storage.getItem.mockResolvedValueOnce('encrypted_"hello"');
    const result = await getItem('regularKey', null, 'enc');
    expect(decryptJson).toHaveBeenCalledWith('enc', 'encrypted_"hello"');
    expect(result).toBe('hello');
  });

  it('handles SETTINGS_STORE_KEY with encryptedData field', async () => {
    const stored = JSON.stringify({
      appId: 'app1',
      encryptedData: 'encrypted_{"theme":"dark"}',
    });
    Storage.getItem.mockResolvedValueOnce(stored);
    const result = await getItem('settings', null, 'enc');
    expect(result.appId).toBe('app1');
  });

  it('handles SETTINGS_STORE_KEY without encryptedData', async () => {
    const stored = JSON.stringify({appId: 'app1'});
    Storage.getItem.mockResolvedValueOnce(stored);
    const result = await getItem('settings', null, 'enc');
    expect(result.appId).toBe('app1');
  });

  it('handles SHOW_FACE_AUTH_CONSENT_SHARE_FLOW as plain JSON', async () => {
    Storage.getItem.mockResolvedValueOnce(JSON.stringify({consent: true}));
    const result = await getItem('faceAuthConsent', null, 'enc');
    expect(result).toEqual({consent: true});
    expect(decryptJson).not.toHaveBeenCalled();
  });

  it('throws tampered error for null VC key data', async () => {
    Storage.getItem.mockResolvedValueOnce(null);
    await expect(getItem('vc_123_req1', null, 'enc')).rejects.toThrow(
      'Data is tampered',
    );
    expect(sendErrorEvent).toHaveBeenCalled();
  });

  it('throws ENOENT error and removes tampered metadata', async () => {
    Storage.getItem.mockRejectedValueOnce(new Error('ENOENT'));
    await expect(getItem('vc_x_y', null, 'enc')).rejects.toThrow('ENOENT');
  });

  it('rethrows keyinvalidated error', async () => {
    Storage.getItem.mockRejectedValueOnce(
      new Error('Key Invalidated due to biometric enrollment'),
    );
    await expect(getItem('someKey', null, 'enc')).rejects.toThrow(
      'Key Invalidated due to biometric enrollment',
    );
  });

  it('rethrows tampered error', async () => {
    Storage.getItem.mockRejectedValueOnce(new Error('Data is tampered'));
    await expect(getItem('someKey', null, 'enc')).rejects.toThrow(
      'Data is tampered',
    );
  });

  it('rethrows Key not found error', async () => {
    Storage.getItem.mockRejectedValueOnce(new Error('Key not found'));
    await expect(getItem('anyKey', null, 'enc')).rejects.toThrow(
      'Key not found',
    );
  });

  it('returns defaultValue on generic error', async () => {
    Storage.getItem.mockRejectedValueOnce(new Error('random error'));
    const result = await getItem('someKey', 'fallback', 'enc');
    expect(result).toBe('fallback');
    expect(sendErrorEvent).toHaveBeenCalled();
  });
});

describe('appendItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('appends value to existing list', async () => {
    Storage.getItem.mockResolvedValueOnce('encrypted_["a","b"]');
    await appendItem('myKey', 'c', 'enc');
    expect(encryptJson).toHaveBeenCalledWith(
      'enc',
      JSON.stringify(['a', 'b', 'c']),
    );
    expect(Storage.setItem).toHaveBeenCalled();
  });

  it('creates new list when key has no data', async () => {
    Storage.getItem.mockResolvedValueOnce(null);
    await appendItem('newKey', 'first', 'enc');
    expect(encryptJson).toHaveBeenCalledWith('enc', JSON.stringify(['first']));
  });

  it('throws when underlying setItem fails', async () => {
    Storage.getItem.mockResolvedValueOnce('encrypted_[]');
    Storage.setItem.mockRejectedValueOnce(new Error('write fail'));
    await expect(appendItem('key', 'v', 'enc')).rejects.toThrow('write fail');
  });
});

describe('prependItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('prepends a single value to existing list', async () => {
    Storage.getItem.mockResolvedValueOnce('encrypted_["b","c"]');
    await prependItem('myKey', 'a', 'enc');
    expect(encryptJson).toHaveBeenCalledWith(
      'enc',
      JSON.stringify(['a', 'b', 'c']),
    );
  });

  it('prepends an array value to existing list', async () => {
    Storage.getItem.mockResolvedValueOnce('encrypted_["c"]');
    await prependItem('myKey', ['a', 'b'], 'enc');
    expect(encryptJson).toHaveBeenCalledWith(
      'enc',
      JSON.stringify(['a', 'b', 'c']),
    );
  });

  it('throws when getItem fails with key invalidation', async () => {
    Storage.getItem.mockRejectedValueOnce(
      new Error('Key Invalidated due to biometric enrollment'),
    );
    await expect(prependItem('key', 'v', 'enc')).rejects.toThrow(
      'Key Invalidated',
    );
  });
});

describe('updateItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('prepends updated metadata and filters old entry', async () => {
    const existing = [
      {id: 'a', requestId: 'r1'},
      {id: 'b', requestId: 'r2'},
    ];
    Storage.getItem.mockResolvedValueOnce(
      'encrypted_' + JSON.stringify(existing),
    );
    const updatedMeta = JSON.stringify({id: 'a', requestId: 'r1'});
    await updateItem('myVCs', updatedMeta, 'enc');
    expect(Storage.setItem).toHaveBeenCalled();
  });

  it('throws when getItem fails with key invalidation', async () => {
    Storage.getItem.mockRejectedValueOnce(
      new Error('Key Invalidated due to biometric enrollment'),
    );
    await expect(updateItem('key', 'val', 'enc')).rejects.toThrow(
      'Key Invalidated',
    );
  });
});

describe('removeItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('removes VC key item directly when value is null', async () => {
    Storage.getItem.mockResolvedValueOnce(null);
    await removeItem('vc_x_y', null, 'enc');
    expect(Storage.removeItem).toHaveBeenCalledWith('vc_x_y');
  });

  it('removes from myVCs list when key is MY_VCS_STORE_KEY', async () => {
    const list = [
      {id: 'a', requestId: 'r1'},
      {id: 'b', requestId: 'r2'},
    ];
    Storage.getItem.mockResolvedValueOnce('encrypted_' + JSON.stringify(list));
    await removeItem('myVCs', 'vc_a_r1', 'enc');
    expect(Storage.removeItem).toHaveBeenCalledWith('vc_a_r1');
    expect(MMKV.removeItem).toHaveBeenCalledWith('vc_a_r1');
  });

  it('handles empty data for myVCs key', async () => {
    Storage.getItem.mockResolvedValueOnce(null);
    await removeItem('myVCs', 'vc_x_y', 'enc');
    expect(Storage.setItem).toHaveBeenCalled();
  });

  it('throws on error and sends telemetry', async () => {
    Storage.getItem.mockRejectedValueOnce(new Error('disk error'));
    await expect(removeItem('myVCs', 'val', 'enc')).rejects.toThrow(
      'disk error',
    );
    expect(sendErrorEvent).toHaveBeenCalled();
  });
});

describe('removeVCMetaData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('filters VC metadata from list', async () => {
    const list = [
      {id: 'a', requestId: 'r1'},
      {id: 'b', requestId: 'r2'},
    ];
    Storage.getItem.mockResolvedValueOnce('encrypted_' + JSON.stringify(list));
    await removeVCMetaData('myVCs', 'vc_a_r1', 'enc');
    expect(Storage.setItem).toHaveBeenCalled();
  });

  it('handles null data', async () => {
    Storage.getItem.mockResolvedValueOnce(null);
    await removeVCMetaData('myVCs', 'vc_a_r1', 'enc');
    expect(Storage.setItem).toHaveBeenCalled();
  });

  it('throws on error and sends telemetry', async () => {
    Storage.getItem.mockRejectedValueOnce(new Error('fail'));
    await expect(removeVCMetaData('myVCs', 'vc_a_r1', 'enc')).rejects.toThrow(
      'fail',
    );
    expect(sendErrorEvent).toHaveBeenCalled();
  });
});

describe('removeTamperedVcMetaData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('removes from myVCs when tampered VC found there', async () => {
    const myVcs = [{id: 'a', requestId: 'r1'}];
    // First call: getItem for MY_VCS_STORE_KEY (Storage.getItem for myVCs)
    Storage.getItem
      .mockResolvedValueOnce('encrypted_' + JSON.stringify(myVcs))
      // Second call: getItem inside removeVCMetaData for myVCs
      .mockResolvedValueOnce('encrypted_' + JSON.stringify(myVcs));
    await removeTamperedVcMetaData('vc_a_r1', 'enc');
    expect(Storage.getItem).toHaveBeenCalled();
  });

  it('removes from receivedVCs when not in myVCs', async () => {
    const myVcs = [{id: 'b', requestId: 'r2'}];
    Storage.getItem
      .mockResolvedValueOnce('encrypted_' + JSON.stringify(myVcs))
      .mockResolvedValueOnce('encrypted_[]');
    await removeTamperedVcMetaData('vc_x_y', 'enc');
    expect(Storage.getItem).toHaveBeenCalled();
  });

  it('handles null myVcs metadata', async () => {
    Storage.getItem
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce('encrypted_[]');
    await removeTamperedVcMetaData('vc_x_y', 'enc');
    expect(Storage.getItem).toHaveBeenCalled();
  });

  it('throws on error and sends telemetry', async () => {
    Storage.getItem.mockRejectedValueOnce(new Error('fail'));
    await expect(removeTamperedVcMetaData('vc_x_y', 'enc')).rejects.toThrow(
      'fail',
    );
    expect(sendErrorEvent).toHaveBeenCalled();
  });
});

describe('clear', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls Storage.clear', async () => {
    await clear();
    expect(Storage.clear).toHaveBeenCalled();
  });

  it('throws when Storage.clear fails', async () => {
    Storage.clear.mockRejectedValueOnce(new Error('clear fail'));
    await expect(clear()).rejects.toThrow('clear fail');
  });
});

describe('removeItems', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('removes multiple items from list', async () => {
    const list = [
      {id: 'a', requestId: 'r1'},
      {id: 'b', requestId: 'r2'},
      {id: 'c', requestId: 'r3'},
    ];
    Storage.getItem.mockResolvedValueOnce('encrypted_' + JSON.stringify(list));
    await removeItems('myVCs', ['vc_a_r1', 'vc_c_r3'], 'enc');
    expect(Storage.setItem).toHaveBeenCalled();
  });

  it('handles null data', async () => {
    Storage.getItem.mockResolvedValueOnce(null);
    await removeItems('myVCs', ['vc_a_r1'], 'enc');
    expect(Storage.setItem).toHaveBeenCalled();
  });

  it('throws on error and sends telemetry', async () => {
    Storage.getItem.mockRejectedValueOnce(new Error('fail'));
    await expect(removeItems('key', ['v'], 'enc')).rejects.toThrow('fail');
    expect(sendErrorEvent).toHaveBeenCalled();
  });
});

describe('backupAndExportData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('delegates to Storage.backupData', async () => {
    const result = await backupAndExportData('enc');
    expect(Storage.backupData).toHaveBeenCalledWith('enc');
    expect(result).toEqual({backup: 'data'});
  });
});

describe('restoreBackedUpData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('delegates to Storage.restoreBackUpData', async () => {
    await restoreBackedUpData({data: 'backup'}, 'enc');
    expect(Storage.restoreBackUpData).toHaveBeenCalledWith(
      {data: 'backup'},
      'enc',
    );
  });
});

describe('fetchAllWellknownConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('delegates to Storage.fetchAllWellknownConfig', async () => {
    const result = await fetchAllWellknownConfig('enc');
    expect(Storage.fetchAllWellknownConfig).toHaveBeenCalledWith('enc');
    expect(result).toEqual({});
  });
});

describe('getVCsData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns vcsData, vcsMetadata, and empty tamperedVcsList', async () => {
    const metadata = [{id: 'a', requestId: 'r1'}];
    const vcData = {credential: 'data'};
    // First getItem call returns VC metadata list
    Storage.getItem.mockResolvedValueOnce(
      'encrypted_' + JSON.stringify(metadata),
    );
    // Second getItem call for VC data
    Storage.getItem.mockResolvedValueOnce(
      'encrypted_' + JSON.stringify(vcData),
    );
    const result = await getVCsData('myVCs', 'enc');
    expect(result.vcsMetadata).toEqual(metadata);
    expect(result.tamperedVcsList).toEqual([]);
    expect(result.vcsData).toBeDefined();
  });

  it('adds to tamperedVcsList when VC data throws tampered error', async () => {
    const metadata = [{id: 'a', requestId: 'r1'}];
    Storage.getItem.mockResolvedValueOnce(
      'encrypted_' + JSON.stringify(metadata),
    );
    // VC data fetch throws tampered error
    Storage.getItem.mockResolvedValueOnce(null);
    // null VC key triggers tampered error in getItem... let's mock it differently
    // Actually the second getItem will call getItem('vc_a_r1', null, 'enc')
    // which with null data and VCMetadata.isVCKey returning true => throws tampered
    // But that then calls removeItem internally which also calls Storage
    // Let's just check it handles errors
    const result = await getVCsData('myVCs', 'enc');
    expect(result.tamperedVcsList.length).toBe(1);
  });

  it('rethrows non-tampered errors', async () => {
    const metadata = [{id: 'a', requestId: 'r1'}];
    Storage.getItem.mockResolvedValueOnce(
      'encrypted_' + JSON.stringify(metadata),
    );
    Storage.getItem.mockRejectedValueOnce(
      new Error('Key Invalidated due to biometric enrollment'),
    );
    await expect(getVCsData('myVCs', 'enc')).rejects.toThrow('Key Invalidated');
  });

  it('handles empty metadata list', async () => {
    Storage.getItem.mockResolvedValueOnce('encrypted_' + JSON.stringify([]));
    const result = await getVCsData('myVCs', 'enc');
    expect(result.vcsData).toEqual({});
    expect(result.vcsMetadata).toEqual([]);
    expect(result.tamperedVcsList).toEqual([]);
  });
});

describe('storeMachine definition', () => {
  let storeMachine: any;

  beforeAll(() => {
    storeMachine = require('./store').storeMachine;
  });

  it('should be defined with id "store"', () => {
    expect(storeMachine).toBeDefined();
    expect(storeMachine.id).toBe('store');
  });

  it('should have initial state "checkFreshInstall"', () => {
    expect(storeMachine.initial).toBe('checkFreshInstall');
  });

  it('should have all expected states', () => {
    const expectedStates = [
      'checkFreshInstall',
      'clearIosKeys',
      'checkEncryptionKey',
      'gettingEncryptionKey',
      'checkStorageInitialisation',
      'failedReadingKey',
      'generatingEncryptionKey',
      'resettingStorage',
      'ready',
    ];
    for (const state of expectedStates) {
      expect(storeMachine.states).toHaveProperty(state);
    }
  });

  it('ready state should handle all store events', () => {
    const readyState = storeMachine.states.ready;
    const expectedEvents = [
      'GET',
      'GET_VCS_DATA',
      'EXPORT',
      'RESTORE_BACKUP',
      'SET',
      'APPEND',
      'PREPEND',
      'UPDATE',
      'REMOVE',
      'REMOVE_VC_METADATA',
      'REMOVE_ITEMS',
      'CLEAR',
      'FETCH_ALL_WELLKNOWN_CONFIG',
      'STORE_RESPONSE',
      'DECRYPT_ERROR',
      'BIOMETRIC_CANCELLED',
    ];
    for (const evt of expectedEvents) {
      expect(readyState.on).toHaveProperty(evt);
    }
  });

  it('failedReadingKey should handle TRY_AGAIN and IGNORE', () => {
    const failedState = storeMachine.states.failedReadingKey;
    expect(failedState.on).toHaveProperty('TRY_AGAIN');
    expect(failedState.on).toHaveProperty('IGNORE');
  });

  it('checkEncryptionKey should handle READY and ERROR', () => {
    const checkState = storeMachine.states.checkEncryptionKey;
    expect(checkState.on).toHaveProperty('READY');
    expect(checkState.on).toHaveProperty('ERROR');
  });

  it('generatingEncryptionKey should handle KEY_RECEIVED and ERROR', () => {
    const genState = storeMachine.states.generatingEncryptionKey;
    expect(genState.on).toHaveProperty('KEY_RECEIVED');
    expect(genState.on).toHaveProperty('ERROR');
  });

  it('gettingEncryptionKey should handle KEY_RECEIVED and ERROR', () => {
    const getState = storeMachine.states.gettingEncryptionKey;
    expect(getState.on).toHaveProperty('KEY_RECEIVED');
    expect(getState.on).toHaveProperty('ERROR');
  });

  it('should have global STORE_ERROR and KEY_INVALIDATE_ERROR handlers', () => {
    expect(storeMachine.on).toHaveProperty('STORE_ERROR');
    expect(storeMachine.on).toHaveProperty('KEY_INVALIDATE_ERROR');
  });

  it('should have global BIOMETRIC_CANCELLED handler', () => {
    expect(storeMachine.on).toHaveProperty('BIOMETRIC_CANCELLED');
  });
});

describe('storeMachine transitions with withConfig', () => {
  let storeMachine: any;

  beforeAll(() => {
    storeMachine = require('./store').storeMachine;
  });

  const getConfiguredMachine = (guardOverrides: Record<string, any> = {}) => {
    return storeMachine.withConfig({
      services: {
        checkFreshInstall: async () => null,
        clearKeys: async () => {},
        hasEncryptionKey: () => async (cb: any) => {},
        getEncryptionKey: () => async (cb: any) => {},
        checkStorageInitialisedOrNot: () => async (cb: any) => {},
        generateEncryptionKey: () => async (cb: any) => {},
        clear: async () => {},
        store: () => () => {},
      } as any,
      actions: {
        notifyParent: () => {},
        forwardStoreRequest: () => {},
        setEncryptionKey: () => {},
      } as any,
      guards: {
        hasData: () => true,
        isCustomSecureKeystore: () => false,
        ...guardOverrides,
      },
    });
  };

  it('checkEncryptionKey transitions to ready on READY', () => {
    const machine = getConfiguredMachine();
    const next = machine.transition('checkEncryptionKey', {type: 'READY'});
    expect(next.value).toBe('ready');
  });

  it('checkEncryptionKey transitions to generatingEncryptionKey on ERROR', () => {
    const machine = getConfiguredMachine();
    const next = machine.transition('checkEncryptionKey', {type: 'ERROR'});
    expect(next.value).toBe('generatingEncryptionKey');
  });

  it('gettingEncryptionKey transitions to ready on KEY_RECEIVED', () => {
    const machine = getConfiguredMachine();
    const next = machine.transition('gettingEncryptionKey', {
      type: 'KEY_RECEIVED',
      key: 'test-key',
    } as any);
    expect(next.value).toBe('ready');
  });

  it('gettingEncryptionKey transitions to checkStorageInitialisation on ERROR', () => {
    const machine = getConfiguredMachine();
    const next = machine.transition('gettingEncryptionKey', {type: 'ERROR'});
    expect(next.value).toBe('checkStorageInitialisation');
  });

  it('failedReadingKey transitions to gettingEncryptionKey on TRY_AGAIN', () => {
    const machine = getConfiguredMachine();
    const next = machine.transition('failedReadingKey', {type: 'TRY_AGAIN'});
    expect(next.value).toBe('gettingEncryptionKey');
  });

  it('failedReadingKey transitions to generatingEncryptionKey on IGNORE', () => {
    const machine = getConfiguredMachine();
    const next = machine.transition('failedReadingKey', {type: 'IGNORE'});
    expect(next.value).toBe('generatingEncryptionKey');
  });

  it('generatingEncryptionKey with isCustomSecureKeystore guard true goes to ready', () => {
    const machine = getConfiguredMachine({isCustomSecureKeystore: () => true});
    const next = machine.transition('generatingEncryptionKey', {
      type: 'KEY_RECEIVED',
      key: '',
    } as any);
    expect(next.value).toBe('ready');
  });

  it('generatingEncryptionKey with isCustomSecureKeystore false goes to resettingStorage', () => {
    const machine = getConfiguredMachine({isCustomSecureKeystore: () => false});
    const next = machine.transition('generatingEncryptionKey', {
      type: 'KEY_RECEIVED',
      key: 'enc-key',
    } as any);
    expect(next.value).toBe('resettingStorage');
  });

  it('ready state handles GET event', () => {
    const machine = getConfiguredMachine();
    const next = machine.transition('ready', {type: 'GET', key: 'test'} as any);
    expect(next.value).toBe('ready');
  });

  it('ready state handles SET event', () => {
    const machine = getConfiguredMachine();
    const next = machine.transition('ready', {
      type: 'SET',
      key: 'k',
      value: 'v',
    } as any);
    expect(next.value).toBe('ready');
  });

  it('ready state handles APPEND event', () => {
    const machine = getConfiguredMachine();
    const next = machine.transition('ready', {
      type: 'APPEND',
      key: 'k',
      value: 'v',
    } as any);
    expect(next.value).toBe('ready');
  });

  it('ready state handles PREPEND event', () => {
    const machine = getConfiguredMachine();
    const next = machine.transition('ready', {
      type: 'PREPEND',
      key: 'k',
      value: 'v',
    } as any);
    expect(next.value).toBe('ready');
  });

  it('ready state handles UPDATE event', () => {
    const machine = getConfiguredMachine();
    const next = machine.transition('ready', {
      type: 'UPDATE',
      key: 'k',
      value: 'v',
    } as any);
    expect(next.value).toBe('ready');
  });

  it('ready state handles REMOVE event', () => {
    const machine = getConfiguredMachine();
    const next = machine.transition('ready', {
      type: 'REMOVE',
      key: 'k',
      value: 'v',
    } as any);
    expect(next.value).toBe('ready');
  });

  it('ready state handles REMOVE_VC_METADATA event', () => {
    const machine = getConfiguredMachine();
    const next = machine.transition('ready', {
      type: 'REMOVE_VC_METADATA',
      key: 'k',
      value: 'v',
    } as any);
    expect(next.value).toBe('ready');
  });

  it('ready state handles REMOVE_ITEMS event', () => {
    const machine = getConfiguredMachine();
    const next = machine.transition('ready', {
      type: 'REMOVE_ITEMS',
      key: 'k',
      values: ['v'],
    } as any);
    expect(next.value).toBe('ready');
  });

  it('ready state handles CLEAR event', () => {
    const machine = getConfiguredMachine();
    const next = machine.transition('ready', {type: 'CLEAR'});
    expect(next.value).toBe('ready');
  });

  it('ready state handles EXPORT event', () => {
    const machine = getConfiguredMachine();
    const next = machine.transition('ready', {type: 'EXPORT'});
    expect(next.value).toBe('ready');
  });

  it('ready state handles RESTORE_BACKUP event', () => {
    const machine = getConfiguredMachine();
    const next = machine.transition('ready', {
      type: 'RESTORE_BACKUP',
      data: {},
    } as any);
    expect(next.value).toBe('ready');
  });

  it('ready state handles FETCH_ALL_WELLKNOWN_CONFIG event', () => {
    const machine = getConfiguredMachine();
    const next = machine.transition('ready', {
      type: 'FETCH_ALL_WELLKNOWN_CONFIG',
    });
    expect(next.value).toBe('ready');
  });

  it('ready state handles GET_VCS_DATA event', () => {
    const machine = getConfiguredMachine();
    const next = machine.transition('ready', {
      type: 'GET_VCS_DATA',
      key: 'myVCs',
    } as any);
    expect(next.value).toBe('ready');
  });

  it('ready state handles BIOMETRIC_CANCELLED and transitions back to checkFreshInstall', () => {
    const machine = getConfiguredMachine();
    const next = machine.transition('ready', {
      type: 'BIOMETRIC_CANCELLED',
      requester: 'settings',
    } as any);
    expect(next.value).toBe('checkFreshInstall');
  });

  it('ready state handles DECRYPT_ERROR', () => {
    const machine = getConfiguredMachine();
    const next = machine.transition('ready', {type: 'DECRYPT_ERROR'});
    expect(next.value).toBe('ready');
  });

  it('global BIOMETRIC_CANCELLED transitions to checkFreshInstall', () => {
    const machine = getConfiguredMachine();
    const next = machine.transition('checkEncryptionKey', {
      type: 'BIOMETRIC_CANCELLED',
      requester: 'test',
    } as any);
    expect(next.value).toBe('checkFreshInstall');
  });

  it('checkStorageInitialisation handles ERROR to failedReadingKey', () => {
    const machine = getConfiguredMachine();
    const next = machine.transition('checkStorageInitialisation', {
      type: 'ERROR',
    });
    expect(next.value).toBe('failedReadingKey');
  });

  it('checkStorageInitialisation handles READY to generatingEncryptionKey', () => {
    const machine = getConfiguredMachine();
    const next = machine.transition('checkStorageInitialisation', {
      type: 'READY',
    });
    expect(next.value).toBe('generatingEncryptionKey');
  });
});

describe('storeMachine guards', () => {
  let storeMachine: any;

  beforeAll(() => {
    storeMachine = require('./store').storeMachine;
  });

  it('hasData guard returns true when event.data is not null', () => {
    const guards =
      storeMachine.options?.guards ||
      (storeMachine as any).__xstatenode?.options?.guards;
    expect(guards?.hasData).toBeDefined();
    expect(guards.hasData({}, {data: 'something'})).toBe(true);
    expect(guards.hasData({}, {data: null})).toBe(false);
  });
});

describe('storeMachine context', () => {
  let storeMachine: any;

  beforeAll(() => {
    storeMachine = require('./store').storeMachine;
  });

  it('should have initial context with empty encryptionKey', () => {
    expect(storeMachine.context).toBeDefined();
    expect(storeMachine.context.encryptionKey).toBe('');
  });

  it('setEncryptionKey action updates context', () => {
    const machine = storeMachine.withConfig({
      services: {
        checkFreshInstall: async () => null,
        clearKeys: async () => {},
        hasEncryptionKey: () => async () => {},
        getEncryptionKey: () => async () => {},
        checkStorageInitialisedOrNot: () => async () => {},
        generateEncryptionKey: () => async () => {},
        clear: async () => {},
        store: () => () => {},
      } as any,
      guards: {hasData: () => true, isCustomSecureKeystore: () => false},
    });
    const next = machine.transition('gettingEncryptionKey', {
      type: 'KEY_RECEIVED',
      key: 'my-enc-key',
    } as any);
    expect(next.context.encryptionKey).toBe('my-enc-key');
  });
});
