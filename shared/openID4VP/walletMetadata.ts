export const walletMetadata = {
  response_types_supported: ['vp_token'],
  presentation_definition_uri_supported: true,
  vp_formats_supported: {
    ldp_vc: {
      alg_values_supported: [
        'Ed25519Signature2018',
        'Ed25519Signature2020',
        'RSASignature2018',
      ],
    },
    mso_mdoc: {
      alg_values_supported: ['ES256'],
    },
  },
  client_id_schemes_supported: ['redirect_uri', 'did', 'pre-registered'],
  request_object_signing_alg_values_supported: ['EdDSA'],
  authorization_encryption_alg_values_supported: ['ECDH-ES'],
  authorization_encryption_enc_values_supported: ['A256GCM'],
};
