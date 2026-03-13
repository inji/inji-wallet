const mockFileExists = jest.fn(() => Promise.resolve(false));
const mockReadFile = jest.fn(() => Promise.resolve(''));
const mockWriteFile = jest.fn(() => Promise.resolve());
const mockRemoveItem = jest.fn(() => Promise.resolve());
const mockRemoveItemIfExist = jest.fn(() => Promise.resolve());
const mockGetAllFilesInDirectory = jest.fn(() => Promise.resolve([]));

jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/docs',
}));

jest.mock('../constants', () => ({
  EXPIRED_VC_ERROR_CODE: 'EXPIRED_VC',
  MY_VCS_STORE_KEY: 'myVCs',
}));

jest.mock('../cryptoutil/cryptoUtil', () => ({
  decryptJson: jest.fn((key: string, data: string) => Promise.resolve(data)),
  encryptJson: jest.fn((key: string, data: string) => Promise.resolve(data)),
}));

jest.mock('../fileStorage', () => ({
  __esModule: true,
  default: {
    exists: mockFileExists,
    readFile: mockReadFile,
    writeFile: mockWriteFile,
    removeItem: mockRemoveItem,
    removeItemIfExist: mockRemoveItemIfExist,
    getAllFilesInDirectory: mockGetAllFilesInDirectory,
  },
}));

const mockStorageGetItem = jest.fn(() => Promise.resolve(null));
const mockStorageSetItem = jest.fn(() => Promise.resolve());
const mockMMKVGetItem = jest.fn(() => Promise.resolve(null));
const mockMMKVSetItem = jest.fn(() => Promise.resolve());

jest.mock('../storage', () => ({
  __esModule: true,
  default: {
    getItem: mockStorageGetItem,
    setItem: mockStorageSetItem,
    removeItem: jest.fn(() => Promise.resolve()),
  },
  MMKV: {
    getItem: mockMMKVGetItem,
    setItem: mockMMKVSetItem,
    removeItem: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock('../telemetry/TelemetryUtils', () => ({
  getErrorEventData: jest.fn(),
  sendErrorEvent: jest.fn(),
}));

jest.mock('../telemetry/TelemetryConstants', () => ({
  TelemetryConstants: {
    FlowType: {dataRestore: 'dataRestore', dataBackup: 'dataBackup'},
    ErrorId: {failure: 'failure'},
  },
}));

jest.mock('../VCMetadata', () => ({
  VCMetadata: class {
    timestamp: string;
    requestId: string;
    constructor(data: any) {
      Object.assign(this, data);
    }
    getVcKey() {
      return `VC_${this.requestId}_${this.timestamp}`;
    }
  },
}));

jest.mock('../openId4VCI/Utils', () => ({
  verifyCredentialData: jest.fn(() =>
    Promise.resolve({
      isVerified: true,
      isRevoked: 'FALSE',
      verificationErrorCode: '',
    }),
  ),
}));

jest.mock('../vcVerifier/VcVerifier', () => ({
  RevocationStatus: {
    TRUE: 'TRUE',
    FALSE: 'FALSE',
    UNDETERMINED: 'UNDETERMINED',
  },
}));

import {loadBackupData} from './restoreData';

describe('restoreData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFileExists.mockResolvedValue(false);
  });

  it('should process backup data with empty VC_Records', async () => {
    const mockData = JSON.stringify({
      VC_Records: {},
      dataFromDB: {myVCs: []},
    });
    await loadBackupData(mockData, 'enc-key');
    expect(mockWriteFile).toHaveBeenCalled();
    expect(mockRemoveItemIfExist).toHaveBeenCalledWith('/mock/docs/.prev');
  });

  it('should process and store VC records', async () => {
    const mockData = JSON.stringify({
      VC_Records: {
        VC_req1_123: {
          vcMetadata: {requestId: 'req1', timestamp: '123', format: 'ldp_vc'},
          verifiableCredential: {credential: {id: 'cred-1'}},
        },
      },
      dataFromDB: {
        myVCs: [{requestId: 'req1', timestamp: '123'}],
      },
    });
    await loadBackupData(mockData, 'enc-key');
    expect(mockStorageSetItem).toHaveBeenCalled();
  });

  it('should handle previous backup cleanup', async () => {
    mockFileExists.mockResolvedValue(true);
    mockReadFile.mockResolvedValue('1700000000000');
    mockGetAllFilesInDirectory.mockResolvedValue([]);
    mockMMKVGetItem.mockResolvedValue(null);

    const mockData = JSON.stringify({
      VC_Records: {},
      dataFromDB: {myVCs: []},
    });
    await loadBackupData(mockData, 'enc-key');
    expect(mockReadFile).toHaveBeenCalled();
  });

  it('should remove VC files created after cutoff timestamp during cleanup', async () => {
    mockFileExists.mockResolvedValue(true);
    mockReadFile.mockResolvedValue('1700000000000');
    mockGetAllFilesInDirectory.mockResolvedValue([
      {
        name: 'req1_1700000000001.json',
        path: '/mock/docs/inji/VC/req1_1700000000001.json',
      },
      {
        name: 'req2_1600000000000.json',
        path: '/mock/docs/inji/VC/req2_1600000000000.json',
      },
    ]);
    mockMMKVGetItem.mockResolvedValue(null);

    const mockData = JSON.stringify({
      VC_Records: {},
      dataFromDB: {myVCs: []},
    });
    await loadBackupData(mockData, 'enc-key');
    expect(mockRemoveItem).toHaveBeenCalledWith(
      '/mock/docs/inji/VC/req1_1700000000001.json',
    );
    expect(mockRemoveItem).not.toHaveBeenCalledWith(
      '/mock/docs/inji/VC/req2_1600000000000.json',
    );
  });

  it('should merge with existing VC list in MMKV', async () => {
    mockMMKVGetItem.mockResolvedValue(
      JSON.stringify([{requestId: 'existing', timestamp: '100'}]),
    );

    const mockData = JSON.stringify({
      VC_Records: {},
      dataFromDB: {
        myVCs: [{requestId: 'new', timestamp: '200'}],
      },
    });
    await loadBackupData(mockData, 'enc-key');
    // Should have called setItem with merged list
    expect(mockStorageSetItem).toHaveBeenCalled();
  });

  it('should update wellknown configs from backup', async () => {
    const mockData = JSON.stringify({
      VC_Records: {},
      dataFromDB: {
        myVCs: [],
        CACHE_FETCH_ISSUER_WELLKNOWN_CONFIG_issuer1: {issuer: 'data'},
      },
    });
    await loadBackupData(mockData, 'enc-key');
    // Should store the config key
    const setCalls = mockStorageSetItem.mock.calls;
    const configCall = setCalls.find((c: any) =>
      c[0].includes('CACHE_FETCH_ISSUER_WELLKNOWN_CONFIG_'),
    );
    expect(configCall).toBeDefined();
  });

  it('should verify credentials during restore', async () => {
    const {verifyCredentialData} = require('../openId4VCI/Utils');
    const mockData = JSON.stringify({
      VC_Records: {
        VC_req1_1: {
          vcMetadata: {requestId: 'req1', timestamp: '1', format: 'ldp_vc'},
          verifiableCredential: {credential: {id: 'c1'}},
        },
      },
      dataFromDB: {
        myVCs: [{requestId: 'req1', timestamp: '1'}],
      },
    });
    await loadBackupData(mockData, 'key');
    expect(verifyCredentialData).toHaveBeenCalledWith({id: 'c1'}, 'ldp_vc');
  });

  it('should throw on JSON parse error', async () => {
    await expect(loadBackupData('invalid json', 'key')).rejects.toThrow();
  });

  it('should remove previous backup state file on success', async () => {
    const mockData = JSON.stringify({
      VC_Records: {},
      dataFromDB: {myVCs: []},
    });
    await loadBackupData(mockData, 'key');
    expect(mockRemoveItemIfExist).toHaveBeenCalledWith('/mock/docs/.prev');
  });

  it('should handle expired VC verification result', async () => {
    const {verifyCredentialData} = require('../openId4VCI/Utils');
    verifyCredentialData.mockResolvedValue({
      isVerified: false,
      isRevoked: 'FALSE',
      verificationErrorCode: 'EXPIRED_VC',
    });
    const mockData = JSON.stringify({
      VC_Records: {
        VC_req1_1: {
          vcMetadata: {requestId: 'req1', timestamp: '1', format: 'ldp_vc'},
          verifiableCredential: {credential: {id: 'c1'}},
        },
      },
      dataFromDB: {
        myVCs: [{requestId: 'req1', timestamp: '1'}],
      },
    });
    await loadBackupData(mockData, 'key');
    // VC should still be stored even if expired
    expect(mockStorageSetItem).toHaveBeenCalled();
  });
});
