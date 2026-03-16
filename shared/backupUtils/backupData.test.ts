jest.mock('../constants', () => ({
  MY_VCS_STORE_KEY: 'myVCs',
}));

jest.mock('../cryptoutil/cryptoUtil', () => ({
  decryptJson: jest.fn((key: string, data: string) => Promise.resolve(data)),
  encryptJson: jest.fn((key: string, data: string) => Promise.resolve(data)),
}));

jest.mock('../storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
  },
  MMKV: {
    indexer: {
      strings: {
        getKeys: jest.fn(() => Promise.resolve([])),
      },
    },
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock('../telemetry/TelemetryUtils', () => ({
  getErrorEventData: jest.fn(),
  sendErrorEvent: jest.fn(),
}));

jest.mock('../telemetry/TelemetryConstants', () => ({
  TelemetryConstants: {
    FlowType: {dataBackup: 'dataBackup'},
  },
}));

jest.mock('../VCMetadata', () => ({
  VCMetadata: class {
    isPinned: boolean;
    constructor(data: any) {
      Object.assign(this, data);
      this.isPinned = data?.isPinned || false;
    }
    getVcKey() {
      return this['vcKey'] || 'vc-key';
    }
  },
}));

import {exportData} from './backupData';

const {MMKV} = require('../storage');
const Storage = require('../storage').default;
const {decryptJson} = require('../cryptoutil/cryptoUtil');

describe('backupData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('exportData', () => {
    it('returns an object with VC_Records and dataFromDB when no keys', async () => {
      MMKV.indexer.strings.getKeys.mockResolvedValue([]);
      const result = await exportData('test-encryption-key');
      expect(result).toBeDefined();
      expect(result).toHaveProperty('VC_Records');
      expect(result).toHaveProperty('dataFromDB');
      expect(result.VC_Records).toEqual({});
    });

    it('exports config data for CACHE_FETCH_ISSUER_WELLKNOWN_CONFIG_ keys', async () => {
      MMKV.indexer.strings.getKeys.mockResolvedValue([
        'CACHE_FETCH_ISSUER_WELLKNOWN_CONFIG_issuer1',
        'myVCs',
      ]);
      MMKV.getItem
        .mockResolvedValueOnce(JSON.stringify({issuer: 'config1'}))
        .mockResolvedValueOnce(JSON.stringify([]));
      decryptJson
        .mockResolvedValueOnce(JSON.stringify({issuer: 'config1'}))
        .mockResolvedValueOnce(JSON.stringify([]));
      const result = await exportData('key');
      expect(result.dataFromDB).toHaveProperty(
        'CACHE_FETCH_ISSUER_WELLKNOWN_CONFIG_issuer1',
      );
    });

    it('sets isPinned to false for all VC metadata entries', async () => {
      MMKV.indexer.strings.getKeys.mockResolvedValue(['myVCs']);
      MMKV.getItem.mockResolvedValue(
        JSON.stringify([
          {id: 'vc1', isPinned: true},
          {id: 'vc2', isPinned: true},
        ]),
      );
      decryptJson.mockResolvedValue(
        JSON.stringify([
          {id: 'vc1', isPinned: true},
          {id: 'vc2', isPinned: true},
        ]),
      );
      const result = await exportData('key');
      const myVcs = result.dataFromDB.myVCs;
      expect(myVcs).toBeDefined();
      myVcs.forEach((vc: any) => expect(vc.isPinned).toBe(false));
    });

    it('extracts VC_Records for keys starting with VC_', async () => {
      MMKV.indexer.strings.getKeys.mockResolvedValue(['VC_cred1', 'myVCs']);
      MMKV.getItem.mockResolvedValue(JSON.stringify([]));
      decryptJson.mockResolvedValue(JSON.stringify([]));
      Storage.getItem.mockResolvedValue(
        JSON.stringify({
          vcMetadata: {id: 'vc1'},
          walletBindingResponse: {key: 'val'},
          publicKey: 'pub',
          privateKey: 'priv',
        }),
      );

      const result = await exportData('key');
      expect(result.VC_Records).toHaveProperty('VC_cred1');
    });

    it('removes wallet binding data from VCs before backup', async () => {
      MMKV.indexer.strings.getKeys.mockResolvedValue(['VC_cred1', 'myVCs']);
      MMKV.getItem.mockResolvedValue(JSON.stringify([]));
      decryptJson.mockResolvedValue(JSON.stringify([]));
      Storage.getItem.mockResolvedValue(
        JSON.stringify({
          vcMetadata: {id: 'vc1'},
          walletBindingResponse: {key: 'val'},
          publicKey: 'pub-key',
          privateKey: 'priv-key',
        }),
      );

      const result = await exportData('key');
      const vcData = result.VC_Records['VC_cred1'];
      expect(vcData.walletBindingResponse).toBeNull();
      expect(vcData.publicKey).toBeNull();
      expect(vcData.privateKey).toBeNull();
    });

    it('removes metadata for VCs that return null from storage', async () => {
      MMKV.indexer.strings.getKeys.mockResolvedValue(['VC_missing', 'myVCs']);
      MMKV.getItem.mockResolvedValue(JSON.stringify([]));
      decryptJson.mockResolvedValue(JSON.stringify([]));
      Storage.getItem.mockResolvedValue(null);

      const result = await exportData('key');
      expect(result.VC_Records).not.toHaveProperty('VC_missing');
    });

    it('sends telemetry error event on failure', async () => {
      const {sendErrorEvent} = require('../telemetry/TelemetryUtils');
      MMKV.indexer.strings.getKeys.mockRejectedValue(new Error('DB error'));
      await expect(exportData('key')).rejects.toThrow('DB error');
      expect(sendErrorEvent).toHaveBeenCalled();
    });
  });
});
