export type MdocPresentationOptions = {
  /** Trusted reader root certificates, DER encoded as base64. */
  trustedReaderRoots?: string[];
  engagementTimeoutSeconds?: number;
  inactivityTimeoutSeconds?: number;
};

export type ReaderTrust = {
  status: 'notSigned' | 'verified' | 'unverified' | 'invalid';
  readerName?: string;
  reason?: string;
};

export type RequestedDocument = {
  docType: string;
  nameSpaces: Record<string, Record<string, boolean>>;
  readerTrust: ReaderTrust;
};

/** A reader's request; requestNumber is 1 for the first and counts further ones in the session. */
export type MdocRequest = {
  requestNumber: number;
  documents: RequestedDocument[];
};

/** Share the approved mdoc credentials (filtered to the approved details) as base64url CBOR, or decline. */
export type MdocDecision = {share: string[]} | 'decline';

/** Session progress reported by the native layers; values match their camelCase names. */
export enum MdocProgress {
  WaitingForReader = 'waitingForReader',
  Connecting = 'connecting',
  Connected = 'connected',
  RequestReceived = 'requestReceived',
  SendingResponse = 'sendingResponse',
}

export type MdocSigningInput = {
  dataToSign: string;
  signatureAlgorithm: string;
  holderKeyReference: string;
};

export type MdocResult =
  | {status: 'completed'; confirmedByReader: boolean}
  | {status: 'declined'}
  | {status: 'cancelled'}
  | {status: 'failed'; failure: string; detail?: string};

export type MdocPresentationHandlers = {
  onQrReady: (qrText: string) => void;
  onProgress?: (progress: MdocProgress) => void;
  onRequest: (request: MdocRequest) => Promise<MdocDecision>;
  sign?: (input: MdocSigningInput) => Promise<string>;
};
