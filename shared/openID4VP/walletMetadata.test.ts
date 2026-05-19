import {walletMetadata} from './walletMetadata';

describe('shared/openID4VP/walletMetadata', () => {
  it('should export walletMetadata object', () => {
    expect(walletMetadata).toBeDefined();
  });

  it('should support vp_token response type', () => {
    expect(walletMetadata.response_types_supported).toContain('vp_token');
  });

  it('should support presentation_definition_uri', () => {
    expect(walletMetadata.presentation_definition_uri_supported).toBe(true);
  });

  it('should support ldp_vc format', () => {
    expect(walletMetadata.vp_formats_supported.ldp_vc).toBeDefined();
  });

  it('should support mso_mdoc format', () => {
    expect(walletMetadata.vp_formats_supported.mso_mdoc).toBeDefined();
  });

  it('should support vc+sd-jwt format', () => {
    expect(walletMetadata.vp_formats_supported['vc+sd-jwt']).toBeDefined();
  });

  it('should support client_id_prefixes', () => {
    expect(walletMetadata.client_id_prefixes_supported).toContain(
      'redirect_uri',
    );
    expect(walletMetadata.client_id_prefixes_supported).toContain(
      'decentralized_identifier',
    );
    expect(walletMetadata.client_id_prefixes_supported).toContain(
      'pre-registered',
    );
  });

  it('should support EdDSA signing algorithm', () => {
    expect(
      walletMetadata.request_object_signing_alg_values_supported,
    ).toContain('EdDSA');
  });

  it('should support ECDH-ES encryption', () => {
    expect(
      walletMetadata.authorization_encryption_alg_values_supported,
    ).toContain('ECDH-ES');
  });

  it('should support A256GCM enc', () => {
    expect(
      walletMetadata.authorization_encryption_enc_values_supported,
    ).toContain('A256GCM');
  });

  it('should support request uri methods', () => {
    expect(walletMetadata.supported_request_uri_methods).toContain('get');
    expect(walletMetadata.supported_request_uri_methods).toContain('post');
  });
});
