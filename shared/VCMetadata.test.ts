import {VCMetadata, parseMetadatas, getVCMetadata} from './VCMetadata';
import {VCFormat} from './VCFormat';
import {UUID} from './Utils';

describe('VCMetadata', () => {
  describe('constructor', () => {
    it('should create instance with default values', () => {
      const metadata = new VCMetadata();

      expect(metadata.idType).toBe('');
      expect(metadata.requestId).toBe('');
      expect(metadata.isPinned).toBe(false);
      expect(metadata.id).toBe('');
      expect(metadata.issuer).toBe('');
      expect(metadata.protocol).toBe('');
      expect(metadata.timestamp).toBe('');
      expect(metadata.isVerified).toBe(false);
      expect(metadata.mosipIndividualId).toBe('');
      expect(metadata.format).toBe('');
      expect(metadata.isExpired).toBe(false);
    });

    it('should create instance with provided values', () => {
      const metadata = new VCMetadata({
        idType: 'UIN',
        requestId: 'req123',
        isPinned: true,
        id: 'id123',
        issuer: 'TestIssuer',
        protocol: 'OpenId4VCI',
        timestamp: '2024-01-01',
        isVerified: true,
        mosipIndividualId: 'mosip123',
        format: 'ldp_vc',
        downloadKeyType: 'ED25519',
        isExpired: false,
        credentialType: 'NationalID',
        issuerHost: 'https://test.com',
      });

      expect(metadata.idType).toBe('UIN');
      expect(metadata.requestId).toBe('req123');
      expect(metadata.isPinned).toBe(true);
      expect(metadata.id).toBe('id123');
      expect(metadata.issuer).toBe('TestIssuer');
      expect(metadata.protocol).toBe('OpenId4VCI');
      expect(metadata.timestamp).toBe('2024-01-01');
      expect(metadata.isVerified).toBe(true);
      expect(metadata.mosipIndividualId).toBe('mosip123');
      expect(metadata.format).toBe('ldp_vc');
      expect(metadata.downloadKeyType).toBe('ED25519');
      expect(metadata.isExpired).toBe(false);
      expect(metadata.credentialType).toBe('NationalID');
      expect(metadata.issuerHost).toBe('https://test.com');
    });
  });

  describe('fromVC', () => {
    it('should create VCMetadata from VC object', () => {
      const vc = {
        idType: 'VID',
        requestId: 'req456',
        id: 'vc123',
        issuer: 'Issuer1',
        format: VCFormat.ldp_vc,
      };

      const metadata = VCMetadata.fromVC(vc);

      expect(metadata.idType).toBe('VID');
      expect(metadata.requestId).toBe('req456');
      expect(metadata.id).toBe('vc123');
      expect(metadata.issuer).toBe('Issuer1');
      expect(metadata.format).toBe(VCFormat.ldp_vc);
    });

    it('should use default format if not provided', () => {
      const vc = {id: 'vc123'};
      const metadata = VCMetadata.fromVC(vc);

      expect(metadata.format).toBe(VCFormat.ldp_vc);
    });

    it('should handle isPinned default value', () => {
      const vc = {id: 'vc123'};
      const metadata = VCMetadata.fromVC(vc);

      expect(metadata.isPinned).toBe(false);
    });
  });

  describe('fromVcMetadataString', () => {
    it('should parse JSON string to VCMetadata', () => {
      const jsonStr = JSON.stringify({
        id: 'vc123',
        issuer: 'TestIssuer',
        format: 'ldp_vc',
      });

      const metadata = VCMetadata.fromVcMetadataString(jsonStr);

      expect(metadata.id).toBe('vc123');
      expect(metadata.issuer).toBe('TestIssuer');
      expect(metadata.format).toBe('ldp_vc');
    });

    it('should handle object input', () => {
      const obj = {
        id: 'vc456',
        issuer: 'AnotherIssuer',
      };

      const metadata = VCMetadata.fromVcMetadataString(obj);

      expect(metadata.id).toBe('vc456');
      expect(metadata.issuer).toBe('AnotherIssuer');
    });

    it('should return empty VCMetadata on parse error', () => {
      const invalidJson = '{invalid json}';
      const metadata = VCMetadata.fromVcMetadataString(invalidJson);

      expect(metadata).toBeInstanceOf(VCMetadata);
      expect(metadata.id).toBe('');
    });
  });

  describe('isVCKey', () => {
    it('should return true for valid VC key', () => {
      expect(VCMetadata.isVCKey('VC_1234567890_abc123')).toBe(true);
      expect(VCMetadata.isVCKey('VC_timestamp_id')).toBe(true);
    });

    it('should return false for invalid VC key', () => {
      expect(VCMetadata.isVCKey('INVALID_KEY')).toBe(false);
      expect(VCMetadata.isVCKey('VC')).toBe(false);
      expect(VCMetadata.isVCKey('')).toBe(false);
      expect(VCMetadata.isVCKey('VC_')).toBe(false);
    });

    it('should handle keys with special characters properly', () => {
      expect(VCMetadata.isVCKey('VC_123_abc-def')).toBe(true);
      expect(VCMetadata.isVCKey('VC_123_abc_def')).toBe(true);
    });
  });

  describe('isFromOpenId4VCI', () => {
    it('should return true when protocol is OpenId4VCI', () => {
      const metadata = new VCMetadata({protocol: 'OpenId4VCI'});
      expect(metadata.isFromOpenId4VCI()).toBe(true);
    });

    it('should return false when protocol is not OpenId4VCI', () => {
      const metadata = new VCMetadata({protocol: 'OtherProtocol'});
      expect(metadata.isFromOpenId4VCI()).toBe(false);
    });

    it('should return false when protocol is empty', () => {
      const metadata = new VCMetadata();
      expect(metadata.isFromOpenId4VCI()).toBe(false);
    });
  });

  describe('getVcKey', () => {
    it('should generate VC key with timestamp', () => {
      const metadata = new VCMetadata({
        timestamp: '1234567890',
        id: 'abc123',
      });

      expect(metadata.getVcKey()).toBe('VC_1234567890_abc123');
    });

    it('should generate VC key without timestamp', () => {
      const metadata = new VCMetadata({
        timestamp: '',
        id: 'xyz789',
      });

      expect(metadata.getVcKey()).toBe('VC_xyz789');
    });

    it('should match the VC key regex pattern', () => {
      const metadata = new VCMetadata({
        timestamp: '1234567890',
        id: 'test-id_123',
      });

      const key = metadata.getVcKey();
      expect(VCMetadata.isVCKey(key)).toBe(true);
    });
  });

  describe('equals', () => {
    it('should return true for equal VCMetadata instances', () => {
      const metadata1 = new VCMetadata({
        timestamp: '1234567890',
        id: 'abc123',
      });
      const metadata2 = new VCMetadata({
        timestamp: '1234567890',
        id: 'abc123',
      });

      expect(metadata1.equals(metadata2)).toBe(true);
    });

    it('should return false for different VCMetadata instances', () => {
      const metadata1 = new VCMetadata({
        timestamp: '1234567890',
        id: 'abc123',
      });
      const metadata2 = new VCMetadata({
        timestamp: '0987654321',
        id: 'xyz789',
      });

      expect(metadata1.equals(metadata2)).toBe(false);
    });

    it('should return true when comparing instance with itself', () => {
      const metadata = new VCMetadata({
        timestamp: '1234567890',
        id: 'abc123',
      });

      expect(metadata.equals(metadata)).toBe(true);
    });
  });

  describe('vcKeyRegExp', () => {
    it('should be defined as a RegExp', () => {
      expect(VCMetadata.vcKeyRegExp).toBeInstanceOf(RegExp);
    });
  });
});

describe('parseMetadatas', () => {
  it('should be defined', () => {
    expect(parseMetadatas).toBeDefined();
  });

  it('should parse array of metadata objects', () => {
    const metadataObjects = [
      {id: 'vc1', issuer: 'Issuer1'},
      {id: 'vc2', issuer: 'Issuer2'},
      {id: 'vc3', issuer: 'Issuer3'},
    ];

    const result = parseMetadatas(metadataObjects);

    expect(result).toHaveLength(3);
    expect(result[0]).toBeInstanceOf(VCMetadata);
    expect(result[0].id).toBe('vc1');
    expect(result[1].id).toBe('vc2');
    expect(result[2].id).toBe('vc3');
  });

  it('should handle empty array', () => {
    const result = parseMetadatas([]);
    expect(result).toEqual([]);
  });

  it('should create VCMetadata instances for each object', () => {
    const metadataObjects = [
      {id: 'test1', format: 'ldp_vc', isPinned: true},
      {id: 'test2', format: 'mso_mdoc', isPinned: false},
    ];

    const result = parseMetadatas(metadataObjects);

    expect(result[0].id).toBe('test1');
    expect(result[0].format).toBe('ldp_vc');
    expect(result[0].isPinned).toBe(true);

    expect(result[1].id).toBe('test2');
    expect(result[1].format).toBe('mso_mdoc');
    expect(result[1].isPinned).toBe(false);
  });
});

describe('getVCMetadata', () => {
  beforeEach(() => {
    jest.spyOn(UUID, 'generate').mockReturnValue('test-uuid-12345');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create VCMetadata with generated credential ID', () => {
    const mockContext: any = {
      selectedIssuer: {
        credential_issuer_host: 'https://issuer.example.com',
        issuer_id: 'TestIssuer',
        protocol: 'OpenId4VCI',
      },
      timestamp: '1234567890',
      vcMetadata: {
        isVerified: false,
        isExpired: false,
      },
      verifiableCredential: null,
      credentialWrapper: {
        format: VCFormat.ldp_vc,
      },
      selectedCredentialType: null,
    };

    const result = getVCMetadata(mockContext, 'ED25519');

    expect(result.requestId).toContain('test-uuid-12345');
    expect(result.requestId).toContain('issuer');
    expect(result.issuer).toBe('TestIssuer');
    expect(result.protocol).toBe('OpenId4VCI');
    expect(result.timestamp).toBe('1234567890');
    expect(result.downloadKeyType).toBe('ED25519');
    expect(result.format).toBe(VCFormat.ldp_vc);
  });

  it('should handle credential_issuer when credential_issuer_host is not available', () => {
    const mockContext: any = {
      selectedIssuer: {
        credential_issuer: 'https://backup.example.com',
        issuer_id: 'BackupIssuer',
        protocol: 'OpenId4VCI',
      },
      timestamp: '',
      vcMetadata: {},
      verifiableCredential: null,
      credentialWrapper: {
        format: VCFormat.mso_mdoc,
      },
      selectedCredentialType: null,
    };

    const result = getVCMetadata(mockContext, 'RSA');

    expect(result.issuer).toBe('BackupIssuer');
    expect(result.issuerHost).toBe('https://backup.example.com');
    expect(result.format).toBe(VCFormat.mso_mdoc);
  });

  it('should use credential_issuer as fallback for issuer_id', () => {
    const mockContext: any = {
      selectedIssuer: {
        credential_issuer_host: 'https://issuer.test.com',
        credential_issuer: 'FallbackIssuer',
        protocol: 'OIDC',
      },
      timestamp: '9876543210',
      vcMetadata: {
        isVerified: true,
        isExpired: false,
      },
      verifiableCredential: null,
      credentialWrapper: {
        format: VCFormat.vc_sd_jwt,
      },
      selectedCredentialType: null,
    };

    const result = getVCMetadata(mockContext, 'ECDSA');

    expect(result.issuer).toBe('FallbackIssuer');
    expect(result.isVerified).toBe(true);
    expect(result.downloadKeyType).toBe('ECDSA');
  });

  it('should extract issuer name from URL', () => {
    const mockContext: any = {
      selectedIssuer: {
        credential_issuer_host: 'https://subdomain.example.org',
        issuer_id: 'ExampleOrg',
        protocol: 'OpenId4VCI',
      },
      timestamp: '',
      vcMetadata: {},
      verifiableCredential: null,
      credentialWrapper: {format: VCFormat.ldp_vc},
      selectedCredentialType: null,
    };

    const result = getVCMetadata(mockContext, 'ED25519');

    expect(result.requestId).toContain('subdomain');
  });

  it('should handle invalid URL gracefully', () => {
    const mockContext: any = {
      selectedIssuer: {
        credential_issuer_host: 'not-a-valid-url',
        issuer_id: 'TestIssuer',
        protocol: 'OpenId4VCI',
      },
      timestamp: '',
      vcMetadata: {},
      verifiableCredential: null,
      credentialWrapper: {format: VCFormat.ldp_vc},
      selectedCredentialType: null,
    };

    const result = getVCMetadata(mockContext, 'ED25519');

    expect(result.requestId).toContain('not-a-valid-url');
    expect(result.issuerHost).toBe('not-a-valid-url');
  });

  it('should handle Mosip VC with UIN', () => {
    const mockContext: any = {
      selectedIssuer: {
        credential_issuer_host: 'https://mosip.example.com',
        issuer_id: 'Mosip',
        protocol: 'OpenId4VCI',
      },
      timestamp: '',
      vcMetadata: {},
      verifiableCredential: {
        credential: {
          credentialSubject: {
            UIN: '1234567890',
          },
        },
      },
      credentialWrapper: {format: VCFormat.ldp_vc},
      selectedCredentialType: null,
    };

    const result = getVCMetadata(mockContext, 'ED25519');

    expect(result.mosipIndividualId).toBe('1234567890');
  });

  it('should handle Mosip VC with VID', () => {
    const mockContext: any = {
      selectedIssuer: {
        credential_issuer_host: 'https://mosip.example.com',
        issuer_id: 'Mosip',
        protocol: 'OpenId4VCI',
      },
      timestamp: '',
      vcMetadata: {},
      verifiableCredential: {
        credential: {
          credentialSubject: {
            VID: '9876543210',
          },
        },
      },
      credentialWrapper: {format: VCFormat.ldp_vc},
      selectedCredentialType: null,
    };

    const result = getVCMetadata(mockContext, 'ED25519');

    expect(result.mosipIndividualId).toBe('9876543210');
  });

  it('should set credential type when provided', () => {
    const mockContext: any = {
      selectedIssuer: {
        credential_issuer_host: 'https://issuer.example.com',
        issuer_id: 'TestIssuer',
        protocol: 'OpenId4VCI',
      },
      timestamp: '1234567890',
      vcMetadata: {},
      verifiableCredential: null,
      credentialWrapper: {format: VCFormat.mso_mdoc},
      selectedCredentialType: 'org.iso.18013.5.1.mDL',
    };

    const result = getVCMetadata(mockContext, 'RSA');

    expect(result.credentialType).toBeDefined();
    expect(result.format).toBe(VCFormat.mso_mdoc);
  });

  it('should handle different key types', () => {
    const mockContext: any = {
      selectedIssuer: {
        credential_issuer_host: 'https://issuer.example.com',
        issuer_id: 'TestIssuer',
        protocol: 'OpenId4VCI',
      },
      timestamp: '',
      vcMetadata: {},
      verifiableCredential: null,
      credentialWrapper: {format: VCFormat.vc_sd_jwt},
      selectedCredentialType: null,
    };

    const resultRSA = getVCMetadata(mockContext, 'RS256');
    expect(resultRSA.downloadKeyType).toBe('RS256');

    const resultEC = getVCMetadata(mockContext, 'ES256');
    expect(resultEC.downloadKeyType).toBe('ES256');
  });
});
