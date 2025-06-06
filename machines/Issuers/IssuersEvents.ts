import { CredentialTypes } from '../VerifiableCredential/VCMetaMachine/vc';
import { issuerType } from './IssuersMachine';

export const IssuersEvents = {
  SELECTED_ISSUER: (id: string) => ({id}),
  DOWNLOAD_ID: () => ({}),
  BIOMETRIC_CANCELLED: (requester?: string) => ({requester}),
  COMPLETED: () => ({}),
  TRY_AGAIN: () => ({}),
  RESET_ERROR: () => ({}),
  CHECK_KEY_PAIR: () => ({}),
  CANCEL: () => ({}),
  STORE_RESPONSE: (response?: unknown) => ({response}),
  STORE_ERROR: (error: Error, requester?: string) => ({error, requester}),
  RESET_VERIFY_ERROR: () => ({}),
  SELECTED_CREDENTIAL_TYPE: (credType: CredentialTypes) => ({credType}),
  SCAN_CREDENTIAL_OFFER_QR_CODE: () => ({}),
  QR_CODE_SCANNED: (data: string) => ({data}),
  AUTH_ENDPOINT_RECEIVED: (authEndpoint: string) => ({authEndpoint}),
  PROOF_REQUEST: (
    accessToken: string,
    cNonce: string | undefined,
    issuerMetadata: object,
    issuer: issuerType,
    credentialtypes: CredentialTypes,
  ) => ({
    accessToken: accessToken,
    cNonce: cNonce,
    issuerMetadata: issuerMetadata,
    issuer: issuer,
    credentialtypes: credentialtypes,
  }),
  TX_CODE_REQUEST: () => ({}),
  TX_CODE_RECEIVED: (txCode: string) => ({txCode}),
  ON_CONSENT_GIVEN: () => ({}),
  TRUST_ISSUER_CONSENT_REQUEST: (issuerMetadata: object) => ({issuerMetadata})
};
