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
    expect(
      walletMetadata.vp_formats_supported.ldp_vc.alg_values_supported,
    ).toContain('Ed25519Signature2018');
  });

  it('should support mso_mdoc format', () => {
    expect(walletMetadata.vp_formats_supported.mso_mdoc).toBeDefined();
    expect(
      walletMetadata.vp_formats_supported.mso_mdoc.alg_values_supported,
    ).toContain('ES256');
  });

  it('should support vc+sd-jwt format', () => {
    expect(walletMetadata.vp_formats_supported['vc+sd-jwt']).toBeDefined();
  });

  it('should support client_id_schemes', () => {
    expect(walletMetadata.client_id_schemes_supported).toContain(
      'redirect_uri',
    );
    expect(walletMetadata.client_id_schemes_supported).toContain('did');
    expect(walletMetadata.client_id_schemes_supported).toContain(
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
});
