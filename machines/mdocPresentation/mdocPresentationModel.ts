import {createModel} from 'xstate/lib/model';
import type {EventFrom} from 'xstate';
import type {VC} from '../VerifiableCredential/VCMetaMachine/vc';
import type {
  MdocDocumentMatch,
  MdocRequestedElement,
} from '../../shared/mdocPresentation/matching';
import type {
  MdocDecision,
  MdocPresentationHandlers,
  MdocPresentationOptions,
  MdocProgress,
  MdocRequest,
  MdocResult,
  ReaderTrust,
} from '../../shared/mdocPresentation/types';

export type PrepareMdocForSharing = (
  vc: VC,
  elements: MdocRequestedElement[],
) => Promise<string>;
/** History entry kinds for in-person mdoc sharing; one record is logged per card. */
export type MdocShareLogType =
  | 'SHARED'
  | 'SHARED_WITH_FACE_VERIFICATION'
  | 'SENT_NOT_CONFIRMED'
  | 'SENDING_STOPPED'
  | 'SENDING_INTERRUPTED'
  | 'VERIFIER_REPORTED_PROBLEM'
  | 'SENDING_FAILED'
  | 'DECLINED'
  | 'FACE_VERIFICATION_FAILED';
export type MdocShareCard = {
  /** Undefined when the wallet had no card for a requested document. */
  credential?: VC;
  docType: string;
  /** Element identifiers sent; empty when nothing was sent. */
  details: string[];
  readerName?: string;
  readerTrust: ReaderTrust['status'];
};
export type MdocShareRecord = MdocShareCard & {type: MdocShareLogType};
/** A response sent in this session; its history entry is decided when the session ends. */
export type SentMdocResponse = {
  requestNumber: number;
  faceVerified: boolean;
  cards: MdocShareCard[];
};
export type MdocPresentationDependencies = {
  present: (
    options: MdocPresentationOptions,
    handlers: MdocPresentationHandlers,
  ) => Promise<MdocResult>;
  cancel: () => void;
  getCredentials: () => VC[];
  /** Builds the card to send from the approved details; tests replace it. */
  prepareMdocForSharing: PrepareMdocForSharing;
  recordActivity?: (records: MdocShareRecord[], timestamp: number) => void;
  showFaceAuthConsent: boolean;
  now: () => number;
};
/** How long a shown code waits for the reader; ISO 18013-5 8.2.3 recommends at least 30 s. */
export const ENGAGEMENT_TIMEOUT_SECONDS = 30;
/** Allowed silence between session messages once connected (9.1.1.4). */
export const INACTIVITY_TIMEOUT_SECONDS = 300;

export type MdocOutcome =
  | 'shared'
  | 'sentNotConfirmed'
  | 'declined'
  | 'stopped'
  | 'sessionEnded'
  | 'codeExpired'
  | 'couldntConnect'
  | 'connectionLost'
  | 'interrupted'
  | 'bluetoothOff'
  | 'timedOut'
  | 'verifierError'
  | 'requestUnreadable'
  | 'readerEnded'
  | 'error';

export const mdocPresentationModel = createModel(
  {
    qrText: '',
    codeExpiresAt: undefined as number | undefined,
    requestExpiresAt: undefined as number | undefined,
    progress: 'waitingForReader' as MdocProgress,
    request: undefined as MdocRequest | undefined,
    matches: [] as MdocDocumentMatch[],
    selection: {} as Record<string, string>,
    // The details the holder left ticked; only these are sent.
    checkedFields: {} as Record<string, string[]>,
    responseStarted: false,
    sentResponses: [] as SentMdocResponse[],
    identityVerified: false,
    result: undefined as MdocResult | undefined,
    outcome: undefined as MdocOutcome | undefined,
    error: '',
    dismissAfterStop: false,
  },
  {
    events: {
      QR_READY: (qrText: string) => ({qrText}),
      PROGRESS: (progress: MdocProgress) => ({progress}),
      REQUEST_RECEIVED: (request: MdocRequest) => ({request}),
      RESULT: (result: MdocResult) => ({result}),
      SELECT_CARD: (docType: string, credentialId: string) => ({
        docType,
        credentialId,
      }),
      TOGGLE_FIELD: (
        docType: string,
        namespace: string,
        elementIdentifier: string,
      ) => ({docType, namespace, elementIdentifier}),
      SELECT_ALL_FIELDS: (docType: string) => ({docType}),
      CLEAR_ALL_FIELDS: (docType: string) => ({docType}),
      SHARE: () => ({}),
      VERIFY_AND_SHARE: () => ({}),
      FACE_VERIFICATION_CONSENT: () => ({}),
      FACE_VALID: () => ({}),
      FACE_INVALID: () => ({}),
      RETRY_VERIFICATION: () => ({}),
      RETRY: () => ({}),
      DECLINE: () => ({}),
      CANCEL: () => ({}),
      STOP: () => ({}),
      APP_INACTIVE: () => ({}),
      DISMISS: () => ({}),
      DONE: () => ({}),
      NEW_CODE: () => ({}),
      ANSWER: (decision: MdocDecision) => ({decision}),
    },
  },
);
export type MdocPresentationContext =
  typeof mdocPresentationModel.initialContext;
export type MdocPresentationEvent = EventFrom<typeof mdocPresentationModel>;
export const MdocPresentationEvents = mdocPresentationModel.events;
