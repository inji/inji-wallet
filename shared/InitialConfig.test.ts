import {INITIAL_CONFIG} from './InitialConfig';

describe('shared/InitialConfig', () => {
  it('should have modelDownloadMaxRetry', () => {
    expect(INITIAL_CONFIG.allProperties.modelDownloadMaxRetry).toBe('10');
  });

  it('should have audience', () => {
    expect(INITIAL_CONFIG.allProperties.audience).toBe('ida-binding');
  });

  it('should have vcDownloadMaxRetry', () => {
    expect(INITIAL_CONFIG.allProperties.vcDownloadMaxRetry).toBe('10');
  });

  it('should have minStorageRequired fields', () => {
    expect(INITIAL_CONFIG.allProperties.minStorageRequiredForAuditEntry).toBe(
      '2',
    );
    expect(INITIAL_CONFIG.allProperties.minStorageRequired).toBe('2');
  });

  it('should have vcDownloadPoolInterval', () => {
    expect(INITIAL_CONFIG.allProperties.vcDownloadPoolInterval).toBe('6000');
  });

  it('should have issuer as residentapp', () => {
    expect(INITIAL_CONFIG.allProperties.issuer).toBe('residentapp');
  });

  it('should have aboutInjiUrl', () => {
    expect(INITIAL_CONFIG.allProperties.aboutInjiUrl).toContain('https://');
  });

  it('should have openId4VCIDownloadVCTimeout', () => {
    expect(INITIAL_CONFIG.allProperties.openId4VCIDownloadVCTimeout).toBe(
      '30000',
    );
  });

  it('should have cacheTTLInMilliSeconds', () => {
    expect(INITIAL_CONFIG.allProperties.cacheTTLInMilliSeconds).toBe('3600000');
  });

  it('should have disableCredentialOfferVcVerification as false', () => {
    expect(
      INITIAL_CONFIG.allProperties.disableCredentialOfferVcVerification,
    ).toBe(false);
  });
});
