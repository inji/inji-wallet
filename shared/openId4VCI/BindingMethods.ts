/**
 * Cryptographic key binding methods the wallet can represent in a holder proof header, as
 * advertised by an issuer under `cryptographic_binding_methods_supported` (OpenID4VCI 1.0).
 */
export enum BindingMethod {
  JWK = 'jwk',
  DID_JWK = 'did:jwk',
  DID_KEY = 'did:key',
}

export const WALLET_BINDING_PREFERENCE = [
  BindingMethod.JWK,
  BindingMethod.DID_JWK,
  BindingMethod.DID_KEY,
];

export const GENERIC_DID_BINDING_METHOD = 'did';

export const DEFAULT_BINDING_METHOD = BindingMethod.DID_JWK;
