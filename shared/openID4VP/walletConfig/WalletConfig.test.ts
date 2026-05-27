import {defaultWalletConfig} from './WalletConfig';

describe('defaultWalletConfig', () => {
  it('supports vp_token as a response type', () => {
    expect(defaultWalletConfig.response_types_supported).toEqual(['vp_token']);
  });

  describe('vp_formats_supported', () => {
    it('supports mso_mdoc format with correct alg values', () => {
      expect(defaultWalletConfig.vp_formats_supported.mso_mdoc).toEqual({
        issuerauth_alg_values: [-7],
        deviceauth_alg_values: [-7],
      });
    });

    it('supports ldp_vc format with Ed25519Signature2020 and JsonWebSignature2020', () => {
      expect(
        defaultWalletConfig.vp_formats_supported.ldp_vc.proof_type_values,
      ).toEqual(['Ed25519Signature2020', 'JsonWebSignature2020']);
    });

    it('supports dc+sd-jwt format with EdDSA and ES256 alg values', () => {
      const dcSdJwt = defaultWalletConfig.vp_formats_supported['dc+sd-jwt'];
      expect(dcSdJwt['sd-jwt_alg_values']).toEqual(['EdDSA', 'ES256']);
      expect(dcSdJwt['kb-jwt_alg_values']).toEqual(['ES256', 'EdDSA']);
    });

    it('supports vc+sd-jwt format with EdDSA and ES256 alg values', () => {
      const vcSdJwt = defaultWalletConfig.vp_formats_supported['vc+sd-jwt'];
      expect(vcSdJwt['sd-jwt_alg_values']).toEqual(['EdDSA', 'ES256']);
      expect(vcSdJwt['kb-jwt_alg_values']).toEqual(['ES256', 'EdDSA']);
    });
  });

  it('supports redirect_uri, decentralized_identifier and pre-registered client_id prefixes', () => {
    expect(defaultWalletConfig.client_id_prefixes_supported).toEqual([
      'redirect_uri',
      'decentralized_identifier',
      'pre-registered',
    ]);
  });

  it('supports EdDSA for request object signing', () => {
    expect(
      defaultWalletConfig.request_object_signing_alg_values_supported,
    ).toEqual(['EdDSA']);
  });

  it('supports ECDH-ES for authorization encryption alg', () => {
    expect(
      defaultWalletConfig.authorization_encryption_alg_values_supported,
    ).toEqual(['ECDH-ES']);
  });

  it('supports A256GCM for authorization encryption enc', () => {
    expect(
      defaultWalletConfig.authorization_encryption_enc_values_supported,
    ).toEqual(['A256GCM']);
  });

  it('has presentation_definition_uri_supported set to true', () => {
    expect(defaultWalletConfig.presentation_definition_uri_supported).toBe(
      true,
    );
  });

  it('supports get and post request_uri_methods', () => {
    expect(defaultWalletConfig.request_uri_methods_supported).toEqual([
      'get',
      'post',
    ]);
  });

  it('starts with an empty trusted_verifiers list', () => {
    expect(defaultWalletConfig.trusted_verifiers).toEqual([]);
  });
});
