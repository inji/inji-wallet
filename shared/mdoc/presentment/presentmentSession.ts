/**
 * Drives one ISO 18013-5 proximity presentation from advertising to DeviceResponse.
 *
 * Sequence (ISO 18013-5 §8.3.3.1.1 for the transport, §9.1 for the session):
 *
 *   1. advertise the GATT service UUID taken from the DeviceEngagement the QR already showed
 *   2. reader connects and sends `SessionEstablishment` (its ephemeral key + encrypted request)
 *   3. derive SKDevice / SKReader, decrypt, parse `DeviceRequest`
 *   4. narrow the ask to what this credential can serve, then ask the user
 *   5. on approve: build + sign `DeviceResponse`, encrypt, send, terminate
 *
 * The session is deliberately single-shot and single-credential. Readers may request several
 * docTypes at once; we answer for the one credential whose QR was scanned and report the rest
 * as unsatisfiable rather than silently disclosing something the user did not open.
 */

import type {
  MdocDisclosedElement,
  MdocPresentmentConsentElement,
  MdocPresentmentConsentRequest,
  MdocPresentmentRequestedElement,
  PresentmentPhase,
} from '../iso18013PresentmentInterop';
import {
  MDOC_PRESENTMENT_CANNOT_SATISFY,
  MDOC_PRESENTMENT_CONSENT_DISMISSED,
  MDOC_PRESENTMENT_CONSENT_REQUIRED,
  MDOC_PRESENTMENT_READER_CONNECTED,
  MDOC_PRESENTMENT_RESPONSE_SENT,
  type PresentmentEventName,
} from './events';
import {parseBlePeripheralUuidFromDeviceEngagement} from '../cborDecodeMinimal';
import {asMap, asTag, decodeCbor, toHex} from './cbor';
import {MdocBleTransport} from './bleTransport';
import {type Es256Signer} from './cose';
import {
  parseDeviceRequest,
  purposeFromRequestInfo,
  requestedDocTypes,
  selectDocRequestForDocType,
  verifierNameFromRequestInfo,
  type ParsedDocRequest,
} from './deviceRequest';
import {
  buildDeviceResponse,
  buildErrorDeviceResponse,
  DEVICE_RESPONSE_STATUS_GENERAL_ERROR,
} from './deviceResponse';
import {
  findElement,
  logCredentialShape,
  parseIssuerSignedCredential,
  type IndexedIssuerSignedItem,
  type ParsedIssuerSignedCredential,
} from './issuerSigned';
import {
  bleIdentValue,
  deriveSessionKeys,
  encodeSessionData,
  logByteCommitment,
  MdocSessionCipher,
  parseSessionData,
  parseSessionEstablishment,
  SESSION_STATUS_ERROR_CBOR_DECODING,
  SESSION_STATUS_ERROR_SESSION_ENCRYPTION,
  SESSION_STATUS_SESSION_TERMINATION,
} from './sessionCrypto';

/** How long to wait for a reader after the QR is shown before giving up and releasing BLE. */
const WAIT_FOR_READER_TIMEOUT_MS = 180_000;
/** How long to wait for the user to answer the consent sheet. */
const CONSENT_TIMEOUT_MS = 120_000;

export type {PresentmentEventName};

export type PresentmentEventListener = (payload: unknown) => void;

export interface MdocPresentmentSessionParams {
  credentialCompact: string;
  docType: string;
  deviceEngagementCbor: Uint8Array;
  ephemeralPrivateKey: Uint8Array;
  signer: Es256Signer;
  emit: (event: PresentmentEventName, payload: unknown) => void;
  onPhase?: (phase: PresentmentPhase, detail?: string) => void;
}

class Deferred<T> {
  readonly promise: Promise<T>;
  private resolveFn!: (value: T) => void;
  private rejectFn!: (reason: Error) => void;
  private settled = false;

  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolveFn = resolve;
      this.rejectFn = reject;
    });
  }

  resolve(value: T): void {
    if (!this.settled) {
      this.settled = true;
      this.resolveFn(value);
    }
  }

  reject(reason: Error): void {
    if (!this.settled) {
      this.settled = true;
      this.rejectFn(reason);
    }
  }

  get isSettled(): boolean {
    return this.settled;
  }
}

/**
 * `EDeviceKeyBytes` — the tagged COSE_Key from the engagement's Security element.
 *
 * Lifted out of the engagement rather than rebuilt from the private key, because the BLE Ident
 * value is an HMAC keyed with these exact bytes and the reader recomputes it from the QR it
 * scanned. Any re-encoding difference makes Ident mismatch and readers walk away.
 */
function eDeviceKeyBytesFromEngagement(
  deviceEngagementCbor: Uint8Array,
): Uint8Array {
  const root = asMap(decodeCbor(deviceEngagementCbor), 'DeviceEngagement');
  const security = root.get(1);
  if (!Array.isArray(security) || security.length < 2) {
    throw new Error('DeviceEngagement Security element is malformed');
  }
  return asTag(security[1], 'DeviceEngagement Security[1]').raw;
}

export class MdocPresentmentSession {
  private transport: MdocBleTransport | null = null;
  private cipher: MdocSessionCipher | null = null;
  private credential: ParsedIssuerSignedCredential | null = null;
  private pendingConsent: Deferred<boolean> | null = null;
  private disclosureOnApproval: IndexedIssuerSignedItem[] = [];
  private activeDocRequest: ParsedDocRequest | null = null;
  private readerTimeout: ReturnType<typeof setTimeout> | null = null;
  private consentTimeout: ReturnType<typeof setTimeout> | null = null;
  private finished = new Deferred<void>();
  private responseSent = false;
  private cancelled = false;

  constructor(private readonly params: MdocPresentmentSessionParams) {}

  private phase(phase: PresentmentPhase, detail?: string): void {
    this.params.onPhase?.(phase, detail);
  }

  /**
   * Runs the session to completion.
   *
   * Resolves once the DeviceResponse has gone out (or the session ended for a benign reason);
   * rejects on a real failure so the caller can surface it. BLE is always released.
   */
  async run(): Promise<void> {
    try {
      this.credential = parseIssuerSignedCredential(
        this.params.credentialCompact,
        this.params.docType,
      );
      logCredentialShape(this.credential);

      const serviceUuid = parseBlePeripheralUuidFromDeviceEngagement(
        this.params.deviceEngagementCbor,
      );
      const eDeviceKeyBytes = eDeviceKeyBytesFromEngagement(
        this.params.deviceEngagementCbor,
      );
      const ident = bleIdentValue(eDeviceKeyBytes);

      if (__DEV__) {
        console.log(
          '[mdoc presentment] advertising BLE service UUID (engagement key 10):',
          toHex(serviceUuid),
        );
      }

      this.transport = MdocBleTransport.create();
      this.phase('bleAdvertising');
      await this.transport.start(serviceUuid, ident, {
        onConnected: () => this.onConnected(),
        onMessage: message => {
          void this.onMessage(message).catch(e => this.fail(e));
        },
        onDisconnected: () => this.onDisconnected(),
        onError: error => this.fail(error),
      });

      this.phase('awaitingReader');
      this.readerTimeout = setTimeout(() => {
        this.fail(
          new Error(
            'No reader connected before the proximity session timed out.',
          ),
        );
      }, WAIT_FOR_READER_TIMEOUT_MS);

      await this.finished.promise;
    } finally {
      await this.cleanup();
    }
  }

  /** Cancels an in-flight session (QR closed, navigation away, app backgrounded). */
  cancel(): void {
    this.cancelled = true;
    this.pendingConsent?.resolve(false);
    this.finished.resolve();
  }

  /**
   * User approved the consent sheet. `disclosedElements`, when given, narrows the disclosure to
   * that subset of what the sheet showed; nothing left means nothing to send, so it is a denial.
   */
  approveConsent(disclosedElements?: MdocDisclosedElement[]): void {
    if (!this.pendingConsent) {
      return;
    }
    if (disclosedElements) {
      const agreed = new Set(
        disclosedElements.map(e => `${e.namespace}\u0000${e.element}`),
      );
      this.disclosureOnApproval = this.disclosureOnApproval.filter(item =>
        agreed.has(`${item.namespace}\u0000${item.elementIdentifier}`),
      );
    }
    this.pendingConsent.resolve(this.disclosureOnApproval.length > 0);
  }

  /** User denied the consent sheet — no DeviceResponse is sent. */
  denyConsent(): void {
    this.pendingConsent?.resolve(false);
  }

  private onConnected(): void {
    if (this.readerTimeout) {
      clearTimeout(this.readerTimeout);
      this.readerTimeout = null;
    }
    this.phase('sessionEstablishment');
    this.params.emit(MDOC_PRESENTMENT_READER_CONNECTED, {});
    if (__DEV__) {
      console.log('[mdoc presentment] reader connected over BLE');
    }
  }

  private onDisconnected(): void {
    // A disconnect after a successful send is the normal end of a session.
    if (this.responseSent || this.cancelled) {
      this.finished.resolve();
      return;
    }
    this.fail(new Error('Reader disconnected before the response was sent.'));
  }

  private fail(error: Error): void {
    if (this.finished.isSettled) {
      return;
    }
    this.phase('failed', error.message);
    this.params.emit(MDOC_PRESENTMENT_CONSENT_DISMISSED, {});
    this.finished.reject(error);
  }

  private async onMessage(message: Uint8Array): Promise<void> {
    if (this.finished.isSettled) {
      return;
    }

    if (!this.cipher) {
      await this.handleSessionEstablishment(message);
      return;
    }

    // Post-establishment frames are SessionData. The only one we expect is termination, but a
    // reader may also send a follow-up request, which this single-shot session does not serve.
    const sessionData = parseSessionData(message);
    if (sessionData.status === SESSION_STATUS_SESSION_TERMINATION) {
      this.finished.resolve();
      return;
    }
    if (sessionData.data) {
      throw new Error(
        'Reader sent a second DeviceRequest; this session serves one request only.',
      );
    }
  }

  private async handleSessionEstablishment(message: Uint8Array): Promise<void> {
    let establishment;
    try {
      establishment = parseSessionEstablishment(message);
    } catch (e) {
      await this.sendStatusAndEnd(SESSION_STATUS_ERROR_CBOR_DECODING);
      throw e instanceof Error ? e : new Error(String(e));
    }

    const keys = deriveSessionKeys({
      ephemeralPrivateKey: this.params.ephemeralPrivateKey,
      readerPublicKeyUncompressed: establishment.readerPublicKeyUncompressed,
      deviceEngagementCbor: this.params.deviceEngagementCbor,
      eReaderKeyBytes: establishment.eReaderKeyBytes,
    });
    logByteCommitment('SessionTranscriptBytes', keys.sessionTranscriptBytes);
    this.cipher = new MdocSessionCipher(keys);

    let deviceRequestBytes: Uint8Array;
    try {
      deviceRequestBytes = this.cipher.decrypt(establishment.encryptedData);
    } catch (e) {
      // Decryption failure means the transcripts disagree — almost always an engagement-bytes
      // mismatch rather than a genuine attack, so say so explicitly.
      await this.sendStatusAndEnd(SESSION_STATUS_ERROR_SESSION_ENCRYPTION);
      throw new Error(
        'Could not decrypt the reader request. The SessionTranscript did not match — ' +
          'the DeviceEngagement advertised must be byte-identical to the one in the QR. ' +
          `(${e instanceof Error ? e.message : String(e)})`,
      );
    }
    logByteCommitment('DeviceRequest', deviceRequestBytes);
    this.phase('deviceRequestReceived');

    await this.handleDeviceRequest(deviceRequestBytes);
  }

  private async handleDeviceRequest(bytes: Uint8Array): Promise<void> {
    const credential = this.credential;
    if (!credential) {
      throw new Error('credential was not parsed before the request arrived');
    }

    const request = parseDeviceRequest(bytes);
    const docRequest = selectDocRequestForDocType(request, credential.docType);

    if (!docRequest) {
      const requested = requestedDocTypes(request);
      this.params.emit(MDOC_PRESENTMENT_CANNOT_SATISFY, {
        reason:
          'The reader asked for a document type this credential does not provide.',
        walletDocType: credential.docType,
        requestedDocTypes: requested,
      });
      await this.sendDeviceResponseBytes(
        buildErrorDeviceResponse(DEVICE_RESPONSE_STATUS_GENERAL_ERROR),
      );
      await this.sendStatusAndEnd(SESSION_STATUS_SESSION_TERMINATION);
      this.finished.resolve();
      return;
    }

    this.activeDocRequest = docRequest;

    // Narrow the ask to what this credential actually holds. `requestedElements` keeps the full
    // ask so the consent sheet can show what was requested but will not be sent.
    const disclosed: IndexedIssuerSignedItem[] = [];
    const consentElements: MdocPresentmentConsentElement[] = [];
    const requestedElements: MdocPresentmentRequestedElement[] = [];

    for (const requestedElement of docRequest.elements) {
      const found = findElement(
        credential,
        requestedElement.namespace,
        requestedElement.elementIdentifier,
      );
      requestedElements.push({
        namespace: requestedElement.namespace,
        element: requestedElement.elementIdentifier,
        intentToRetain: requestedElement.intentToRetain,
        servable: !!found,
        servedAs: null,
      });
      if (found) {
        disclosed.push(found);
        consentElements.push({
          namespace: requestedElement.namespace,
          element: requestedElement.elementIdentifier,
          intentToRetain: requestedElement.intentToRetain,
          optional: false,
        });
      }
    }

    if (disclosed.length === 0) {
      this.params.emit(MDOC_PRESENTMENT_CANNOT_SATISFY, {
        reason:
          'None of the requested data elements are present in this credential.',
        walletDocType: credential.docType,
        requestedDocTypes: [docRequest.docType],
      });
      await this.sendDeviceResponseBytes(
        buildErrorDeviceResponse(DEVICE_RESPONSE_STATUS_GENERAL_ERROR),
      );
      await this.sendStatusAndEnd(SESSION_STATUS_SESSION_TERMINATION);
      this.finished.resolve();
      return;
    }

    this.disclosureOnApproval = disclosed;
    const approved = await this.requestConsent(
      docRequest,
      consentElements,
      requestedElements,
    );

    if (!approved) {
      // Denial is a normal outcome, not an error: terminate cleanly with no DeviceResponse.
      await this.sendStatusAndEnd(SESSION_STATUS_SESSION_TERMINATION);
      this.finished.resolve();
      return;
    }

    await this.sendApprovedResponse();
  }

  private async requestConsent(
    docRequest: ParsedDocRequest,
    elements: MdocPresentmentConsentElement[],
    requestedElements: MdocPresentmentRequestedElement[],
  ): Promise<boolean> {
    const {purpose, purposeHintCode} = purposeFromRequestInfo(
      docRequest.requestInfo,
    );
    const consentRequest: MdocPresentmentConsentRequest = {
      docType: docRequest.docType,
      verifierName:
        verifierNameFromRequestInfo(docRequest.requestInfo) ??
        docRequest.readerName ??
        undefined,
      purpose: purpose ?? '',
      purposeHintCode,
      elements,
      requestedElements,
      requestInfo: docRequest.requestInfo
        ? (docRequest.requestInfo as MdocPresentmentConsentRequest['requestInfo'])
        : undefined,
    };

    this.phase('userConsent');
    const deferred = new Deferred<boolean>();
    this.pendingConsent = deferred;
    this.consentTimeout = setTimeout(() => {
      deferred.resolve(false);
    }, CONSENT_TIMEOUT_MS);

    this.params.emit(MDOC_PRESENTMENT_CONSENT_REQUIRED, consentRequest);

    try {
      return await deferred.promise;
    } finally {
      if (this.consentTimeout) {
        clearTimeout(this.consentTimeout);
        this.consentTimeout = null;
      }
      this.pendingConsent = null;
      this.params.emit(MDOC_PRESENTMENT_CONSENT_DISMISSED, {});
    }
  }

  private async sendApprovedResponse(): Promise<void> {
    const credential = this.credential;
    const cipher = this.cipher;
    const docRequest = this.activeDocRequest;
    if (!credential || !cipher || !docRequest) {
      throw new Error('session state is incomplete at response time');
    }

    this.phase('buildingDeviceResponse');
    const deviceResponse = await buildDeviceResponse({
      credential,
      docType: docRequest.docType,
      disclosed: this.disclosureOnApproval,
      sessionTranscriptBytes: cipher.sessionTranscriptBytes,
      signer: this.params.signer,
    });

    this.phase('sendingDeviceResponse');
    await this.sendDeviceResponseBytes(deviceResponse);

    this.responseSent = true;
    this.params.emit(MDOC_PRESENTMENT_RESPONSE_SENT, {});
    this.phase('completed');

    await this.sendStatusAndEnd(SESSION_STATUS_SESSION_TERMINATION);
    this.finished.resolve();
  }

  private async sendDeviceResponseBytes(bytes: Uint8Array): Promise<void> {
    const cipher = this.cipher;
    const transport = this.transport;
    if (!cipher || !transport) {
      throw new Error('cannot send a response before the session is set up');
    }
    const frame = encodeSessionData({data: cipher.encrypt(bytes)});
    await transport.send(frame);
  }

  private async sendStatusAndEnd(status: number): Promise<void> {
    const transport = this.transport;
    if (!transport) {
      return;
    }
    try {
      await transport.send(encodeSessionData({status}));
      await transport.sendSessionTermination();
    } catch {
      // The reader may have already gone; the session is over either way.
    }
  }

  private async cleanup(): Promise<void> {
    if (this.readerTimeout) {
      clearTimeout(this.readerTimeout);
      this.readerTimeout = null;
    }
    if (this.consentTimeout) {
      clearTimeout(this.consentTimeout);
      this.consentTimeout = null;
    }
    const transport = this.transport;
    this.transport = null;
    if (transport) {
      await transport.stop();
    }
  }
}
