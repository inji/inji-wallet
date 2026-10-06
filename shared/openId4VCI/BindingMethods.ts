/**
 * Cryptographic key binding methods the wallet can represent in a holder proof header, as
 * advertised by an issuer under `cryptographic_binding_methods_supported` (OpenID4VCI 1.0).
 */
export enum BindingMethod {
  JWK = 'jwk',
  DID_JWK = 'did:jwk',
  DID_KEY = 'did:key',
}

/**
 * Wallet preference order, most preferred first. `jwk` is first because it is the most widely
 * accepted and needs no DID resolution on the issuer side.
 */
export const WALLET_BINDING_PREFERENCE = [
  BindingMethod.JWK,
  BindingMethod.DID_JWK,
  BindingMethod.DID_KEY,
];

/**
 * Used when an issuer advertises no `cryptographic_binding_methods_supported`, or advertises only
 * methods the wallet cannot produce. This is what the wallet has always sent, so issuers that
 * omit the field keep working unchanged.
 */
export const DEFAULT_BINDING_METHOD = BindingMethod.DID_JWK;
