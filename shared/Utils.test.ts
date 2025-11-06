import {
  getVCsOrderedByPinStatus,
  VCShareFlowType,
  VCItemContainerFlowType,
  CameraPosition,
  isMosipVC,
  parseJSON,
  isNetworkError,
  UUID,
  formatTextWithGivenLimit,
  DEEPLINK_FLOWS,
  base64ToByteArray,
  createCacheObject,
  isCacheExpired,
  getVerifierKey,
} from './Utils';
import {VCMetadata} from './VCMetadata';

describe('getVCsOrderedByPinStatus', () => {
  it('should be defined', () => {
    expect(getVCsOrderedByPinStatus).toBeDefined();
  });

  it('should return pinned VCs first', () => {
    const vcMetadatas = [
      new VCMetadata({id: '1', isPinned: false}),
      new VCMetadata({id: '2', isPinned: true}),
      new VCMetadata({id: '3', isPinned: false}),
      new VCMetadata({id: '4', isPinned: true}),
    ];

    const result = getVCsOrderedByPinStatus(vcMetadatas);

    expect(result[0].isPinned).toBe(true);
    expect(result[1].isPinned).toBe(true);
    expect(result[2].isPinned).toBe(false);
    expect(result[3].isPinned).toBe(false);
  });

  it('should handle empty array', () => {
    const result = getVCsOrderedByPinStatus([]);
    expect(result).toEqual([]);
  });

  it('should handle all pinned VCs', () => {
    const vcMetadatas = [
      new VCMetadata({id: '1', isPinned: true}),
      new VCMetadata({id: '2', isPinned: true}),
    ];

    const result = getVCsOrderedByPinStatus(vcMetadatas);
    expect(result.every(vc => vc.isPinned)).toBe(true);
  });

  it('should handle all unpinned VCs', () => {
    const vcMetadatas = [
      new VCMetadata({id: '1', isPinned: false}),
      new VCMetadata({id: '2', isPinned: false}),
    ];

    const result = getVCsOrderedByPinStatus(vcMetadatas);
    expect(result.every(vc => !vc.isPinned)).toBe(true);
  });
});

describe('VCShareFlowType enum', () => {
  it('should have SIMPLE_SHARE defined', () => {
    expect(VCShareFlowType.SIMPLE_SHARE).toBe('simple share');
  });

  it('should have MINI_VIEW_SHARE defined', () => {
    expect(VCShareFlowType.MINI_VIEW_SHARE).toBe('mini view share');
  });

  it('should have MINI_VIEW_SHARE_WITH_SELFIE defined', () => {
    expect(VCShareFlowType.MINI_VIEW_SHARE_WITH_SELFIE).toBe(
      'mini view share with selfie',
    );
  });

  it('should have MINI_VIEW_QR_LOGIN defined', () => {
    expect(VCShareFlowType.MINI_VIEW_QR_LOGIN).toBe('mini view qr login');
  });

  it('should have OPENID4VP defined', () => {
    expect(VCShareFlowType.OPENID4VP).toBe('OpenID4VP');
  });

  it('should have MINI_VIEW_SHARE_OPENID4VP defined', () => {
    expect(VCShareFlowType.MINI_VIEW_SHARE_OPENID4VP).toBe(
      'OpenID4VP share from mini view',
    );
  });

  it('should have MINI_VIEW_SHARE_WITH_SELFIE_OPENID4VP defined', () => {
    expect(VCShareFlowType.MINI_VIEW_SHARE_WITH_SELFIE_OPENID4VP).toBe(
      'OpenID4VP share with selfie from mini view',
    );
  });
});

describe('VCItemContainerFlowType enum', () => {
  it('should have QR_LOGIN defined', () => {
    expect(VCItemContainerFlowType.QR_LOGIN).toBe('qr login');
  });

  it('should have VC_SHARE defined', () => {
    expect(VCItemContainerFlowType.VC_SHARE).toBe('vc share');
  });

  it('should have VP_SHARE defined', () => {
    expect(VCItemContainerFlowType.VP_SHARE).toBe('vp share');
  });
});

describe('CameraPosition enum', () => {
  it('should have FRONT defined', () => {
    expect(CameraPosition.FRONT).toBe('front');
  });

  it('should have BACK defined', () => {
    expect(CameraPosition.BACK).toBe('back');
  });
});

describe('isMosipVC', () => {
  it('should be defined', () => {
    expect(isMosipVC).toBeDefined();
  });

  it('should return true for Mosip issuer', () => {
    const result = isMosipVC('Mosip');
    expect(result).toBe(true);
  });

  it('should return true for MosipOtp issuer', () => {
    const result = isMosipVC('MosipOtp');
    expect(result).toBe(true);
  });

  it('should return false for other issuers', () => {
    expect(isMosipVC('SomeOtherIssuer')).toBe(false);
    expect(isMosipVC('')).toBe(false);
    expect(isMosipVC('mosip')).toBe(false);
  });
});

describe('parseJSON', () => {
  it('should be defined', () => {
    expect(parseJSON).toBeDefined();
  });

  it('should parse valid JSON string', () => {
    const jsonStr = '{"key": "value"}';
    const result = parseJSON(jsonStr);
    expect(result).toEqual({key: 'value'});
  });

  it('should handle object input', () => {
    const obj = {key: 'value'};
    const result = parseJSON(obj);
    expect(result).toEqual({key: 'value'});
  });

  it('should handle invalid JSON gracefully', () => {
    const invalidJson = '{invalid json}';
    const result = parseJSON(invalidJson);
    expect(result).toBeDefined();
  });

  it('should handle nested objects', () => {
    const jsonStr = '{"key": {"nested": "value"}}';
    const result = parseJSON(jsonStr);
    expect(result.key.nested).toBe('value');
  });
});

describe('isNetworkError', () => {
  it('should be defined', () => {
    expect(isNetworkError).toBeDefined();
  });

  it('should return true for network request failed error', () => {
    const error = 'Network request failed';
    expect(isNetworkError(error)).toBe(true);
  });

  it('should return false for other errors', () => {
    expect(isNetworkError('Some other error')).toBe(false);
    expect(isNetworkError('')).toBe(false);
  });

  it('should handle partial matches', () => {
    const error = 'Error: Network request failed - timeout';
    expect(isNetworkError(error)).toBe(true);
  });
});

describe('UUID', () => {
  it('should be defined', () => {
    expect(UUID).toBeDefined();
  });

  it('should generate a valid UUID', () => {
    const uuid = UUID.generate();
    expect(uuid).toBeDefined();
    expect(typeof uuid).toBe('string');
    expect(uuid.length).toBeGreaterThan(0);
  });

  it('should generate unique UUIDs', () => {
    const uuid1 = UUID.generate();
    const uuid2 = UUID.generate();
    expect(uuid1).not.toBe(uuid2);
  });

  it('should match UUID format', () => {
    const uuid = UUID.generate();
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    expect(uuidRegex.test(uuid)).toBe(true);
  });
});

describe('formatTextWithGivenLimit', () => {
  it('should be defined', () => {
    expect(formatTextWithGivenLimit).toBeDefined();
  });

  it('should truncate text longer than limit', () => {
    const text = 'This is a very long text';
    const result = formatTextWithGivenLimit(text, 10);
    expect(result).toBe('This is a ...');
  });

  it('should return text as is if shorter than limit', () => {
    const text = 'Short text';
    const result = formatTextWithGivenLimit(text, 15);
    expect(result).toBe('Short text');
  });

  it('should use default limit of 15 if not provided', () => {
    const text = 'This is a longer text than 15 characters';
    const result = formatTextWithGivenLimit(text);
    expect(result).toBe('This is a longe...');
  });

  it('should handle empty string', () => {
    const result = formatTextWithGivenLimit('', 10);
    expect(result).toBe('');
  });

  it('should handle exact limit length', () => {
    const text = 'Exactly 10';
    const result = formatTextWithGivenLimit(text, 10);
    expect(result).toBe('Exactly 10');
  });
});

describe('DEEPLINK_FLOWS enum', () => {
  it('should have QR_LOGIN defined', () => {
    expect(DEEPLINK_FLOWS.QR_LOGIN).toBe('qrLoginFlow');
  });

  it('should have OVP defined', () => {
    expect(DEEPLINK_FLOWS.OVP).toBe('ovpFlow');
  });
});

describe('base64ToByteArray', () => {
  it('should be defined', () => {
    expect(base64ToByteArray).toBeDefined();
  });

  it('should convert base64 string to byte array', () => {
    const base64 = 'SGVsbG8gV29ybGQ='; // "Hello World"
    const result = base64ToByteArray(base64);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should handle base64url encoding', () => {
    const base64url = 'SGVsbG8gV29ybGQ'; // without padding
    const result = base64ToByteArray(base64url);
    expect(result).toBeInstanceOf(Uint8Array);
  });

  it('should throw error for invalid base64', () => {
    expect(() => {
      base64ToByteArray('!!!invalid base64!!!');
    }).toThrow();
  });

  it('should handle strings with whitespace', () => {
    const base64 = '  SGVsbG8gV29ybGQ=  ';
    const result = base64ToByteArray(base64);
    expect(result).toBeInstanceOf(Uint8Array);
  });

  it('should handle URL-safe base64 characters', () => {
    const base64 = 'SGVsbG8tV29ybGQ_'; // with - and _
    const result = base64ToByteArray(base64);
    expect(result).toBeInstanceOf(Uint8Array);
  });

  it('should handle empty string', () => {
    const result = base64ToByteArray('');
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(0);
  });
});

describe('createCacheObject', () => {
  it('should create cache object with response and timestamp', () => {
    const response = {data: 'test data'};
    const result = createCacheObject(response);

    expect(result).toHaveProperty('response');
    expect(result).toHaveProperty('cachedTime');
    expect(result.response).toBe(response);
    expect(typeof result.cachedTime).toBe('number');
  });

  it('should use current timestamp', () => {
    const before = Date.now();
    const result = createCacheObject({});
    const after = Date.now();

    expect(result.cachedTime).toBeGreaterThanOrEqual(before);
    expect(result.cachedTime).toBeLessThanOrEqual(after);
  });

  it('should handle null response', () => {
    const result = createCacheObject(null);
    expect(result.response).toBeNull();
    expect(result.cachedTime).toBeDefined();
  });

  it('should handle complex objects', () => {
    const complexResponse = {
      data: [1, 2, 3],
      metadata: {key: 'value'},
      nested: {deep: {value: true}},
    };
    const result = createCacheObject(complexResponse);
    expect(result.response).toBe(complexResponse);
  });
});

describe('isCacheExpired', () => {
  it('should return false for recent timestamp', () => {
    const recentTimestamp = Date.now() - 1000; // 1 second ago
    expect(isCacheExpired(recentTimestamp)).toBe(false);
  });

  it('should return true for old timestamp', () => {
    const oldTimestamp = Date.now() - (60 * 60 * 1000 + 1000); // Over 1 hour ago
    expect(isCacheExpired(oldTimestamp)).toBe(true);
  });

  it('should return false for current timestamp', () => {
    const currentTimestamp = Date.now();
    expect(isCacheExpired(currentTimestamp)).toBe(false);
  });

  it('should handle edge case at exact TTL boundary', () => {
    const boundaryTimestamp = Date.now() - 60 * 60 * 1000; // Exactly 1 hour ago
    const result = isCacheExpired(boundaryTimestamp);
    expect(typeof result).toBe('boolean');
  });
});

describe('getVerifierKey', () => {
  it('should create verifier key with prefix', () => {
    const verifier = 'example.com';
    const result = getVerifierKey(verifier);
    expect(result).toBe('trusted_verifier_example.com');
  });

  it('should handle empty string', () => {
    const result = getVerifierKey('');
    expect(result).toBe('trusted_verifier_');
  });

  it('should preserve verifier name exactly', () => {
    const verifier = 'TestVerifier123';
    const result = getVerifierKey(verifier);
    expect(result).toBe('trusted_verifier_TestVerifier123');
  });

  it('should handle special characters', () => {
    const verifier = 'verifier-with-dashes_and_underscores';
    const result = getVerifierKey(verifier);
    expect(result).toBe(
      'trusted_verifier_verifier-with-dashes_and_underscores',
    );
  });
});

describe('canonicalize', () => {
  it('should be defined', async () => {
    const {canonicalize} = await import('./Utils');
    expect(canonicalize).toBeDefined();
  });
});
