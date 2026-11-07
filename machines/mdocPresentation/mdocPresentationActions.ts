import {assign, forwardTo, raise, send, SpecialTargets} from 'xstate';
import {matchRequest} from '../../shared/mdocPresentation/matching';
import {
  checkedAvailableElements,
  isShareableCandidate,
} from './mdocPresentationGuards';
import type {
  MdocOutcome,
  MdocPresentationContext,
  MdocPresentationDependencies,
  MdocPresentationEvent,
  MdocShareCard,
  MdocShareLogType,
  MdocShareRecord,
} from './mdocPresentationModel';
import {
  ENGAGEMENT_TIMEOUT_SECONDS,
  INACTIVITY_TIMEOUT_SECONDS,
  mdocPresentationModel as presentationModel,
} from './mdocPresentationModel';
import {getPresentationOutcome} from './mdocPresentationServices';

// How the session's outcome reads for its last response.
const SENT_RESPONSE_LOG_TYPE: Partial<Record<MdocOutcome, MdocShareLogType>> = {
  shared: 'SHARED',
  sentNotConfirmed: 'SENT_NOT_CONFIRMED',
  timedOut: 'SENT_NOT_CONFIRMED',
  stopped: 'SENDING_STOPPED',
  interrupted: 'SENDING_INTERRUPTED',
  verifierError: 'VERIFIER_REPORTED_PROBLEM',
};

/** The card chosen for each requested document, with the ticked details it holds when sent. */
function selectedCards(
  context: MdocPresentationContext,
  withDetails: boolean,
): MdocShareCard[] {
  return context.matches.map(documentMatch => {
    const docType = documentMatch.requested.docType;
    const card = documentMatch.candidates.find(
      candidate => candidate.vc.vcMetadata.id === context.selection[docType],
    );
    return {
      credential: card?.vc,
      docType,
      details:
        withDetails && card
          ? checkedAvailableElements(
              card,
              context.checkedFields[docType] ?? [],
            ).map(element => element.elementIdentifier)
          : [],
      readerName: documentMatch.requested.readerTrust.readerName,
      readerTrust: documentMatch.requested.readerTrust.status,
    };
  });
}

export function MdocPresentationActions(
  dependencies: MdocPresentationDependencies,
) {
  return {
    resetSession: presentationModel.assign({
      ...presentationModel.initialContext,
      selection: {},
      checkedFields: {},
      matches: [],
    }),
    setQr: presentationModel.assign((_, event) =>
      event.type === 'QR_READY'
        ? {
            qrText: event.qrText,
            codeExpiresAt:
              dependencies.now() + ENGAGEMENT_TIMEOUT_SECONDS * 1000,
          }
        : {},
    ),
    setProgress: presentationModel.assign((_, event) => {
      if (event.type !== 'PROGRESS') return {};
      // Once connected, the session ends after the inactivity time-out with no message.
      return event.progress === 'connected'
        ? {
            progress: event.progress,
            requestExpiresAt:
              dependencies.now() + INACTIVITY_TIMEOUT_SECONDS * 1000,
          }
        : {progress: event.progress};
    }),
    hideQr: presentationModel.assign({qrText: '', codeExpiresAt: undefined}),
    setRequest: presentationModel.assign((_, event) => {
      if (event.type !== 'REQUEST_RECEIVED') return {};
      const matches = matchRequest(
        event.request,
        dependencies.getCredentials(),
      );
      // Frame 26 opens with a card chosen: a valid card before an expired one, then the one
      // holding the most requested details, then wallet order. Revoked cards are never chosen.
      const selection = Object.fromEntries(
        matches.flatMap(documentMatch => {
          const [preferred] = documentMatch.candidates
            .filter(isShareableCandidate)
            .map((candidate, order) => ({candidate, order}))
            .sort(
              (a, b) =>
                Number(a.candidate.vc.vcMetadata.isExpired) -
                  Number(b.candidate.vc.vcMetadata.isExpired) ||
                b.candidate.availableElements.length -
                  a.candidate.availableElements.length ||
                a.order - b.order,
            );
          return preferred
            ? [
                [
                  documentMatch.requested.docType,
                  preferred.candidate.vc.vcMetadata.id,
                ],
              ]
            : [];
        }),
      );
      return {
        request: event.request,
        identityVerified: false,
        matches,
        selection,
        checkedFields: Object.fromEntries(
          matches.map(documentMatch => [
            documentMatch.requested.docType,
            Object.entries(documentMatch.requested.nameSpaces).flatMap(
              ([namespace, fields]) =>
                Object.keys(fields).map(field =>
                  JSON.stringify([namespace, field]),
                ),
            ),
          ]),
        ),
        qrText: '',
        codeExpiresAt: undefined,
        requestExpiresAt:
          dependencies.now() + INACTIVITY_TIMEOUT_SECONDS * 1000,
        responseStarted: false,
        error: '',
      };
    }),
    toggleField: presentationModel.assign((context, event) => {
      if (event.type !== 'TOGGLE_FIELD') return {};
      const requestedDocument = context.request?.documents.find(
        item => item.docType === event.docType,
      );
      if (
        !requestedDocument ||
        !Object.prototype.hasOwnProperty.call(
          requestedDocument.nameSpaces[event.namespace] ?? {},
          event.elementIdentifier,
        )
      )
        return {};
      const fieldKey = JSON.stringify([
        event.namespace,
        event.elementIdentifier,
      ]);
      const checkedFieldKeys = context.checkedFields[event.docType] ?? [];
      return {
        checkedFields: {
          ...context.checkedFields,
          [event.docType]: checkedFieldKeys.includes(fieldKey)
            ? checkedFieldKeys.filter(item => item !== fieldKey)
            : [...checkedFieldKeys, fieldKey],
        },
      };
    }),
    // Frame 32: tick every requested detail of a document again, or none.
    setAllFields: presentationModel.assign((context, event) => {
      if (
        event.type !== 'SELECT_ALL_FIELDS' &&
        event.type !== 'CLEAR_ALL_FIELDS'
      )
        return {};
      const requestedDocument = context.request?.documents.find(
        item => item.docType === event.docType,
      );
      if (!requestedDocument) return {};
      return {
        checkedFields: {
          ...context.checkedFields,
          [event.docType]:
            event.type === 'SELECT_ALL_FIELDS'
              ? Object.entries(requestedDocument.nameSpaces).flatMap(
                  ([namespace, fields]) =>
                    Object.keys(fields).map(field =>
                      JSON.stringify([namespace, field]),
                    ),
                )
              : [],
        },
      };
    }),
    selectCard: presentationModel.assign((context, event) => {
      if (event.type !== 'SELECT_CARD') return {};
      const documentMatch = context.matches.find(
        item => item.requested.docType === event.docType,
      );
      if (
        !documentMatch?.candidates.some(
          candidate =>
            candidate.vc.vcMetadata.id === event.credentialId &&
            isShareableCandidate(candidate),
        )
      )
        return {};
      return {
        selection: {...context.selection, [event.docType]: event.credentialId},
      };
    }),
    setResult: presentationModel.assign((context, event) =>
      event.type === 'RESULT'
        ? {
            result: event.result,
            outcome: getPresentationOutcome(
              event.result,
              context.responseStarted,
            ),
            error:
              event.result.status === 'failed' ? event.result.detail ?? '' : '',
            qrText: '',
            codeExpiresAt: undefined,
            requestExpiresAt: undefined,
          }
        : {},
    ),
    rememberResponse: presentationModel.assign(context => ({
      sentResponses: [
        ...context.sentResponses,
        {
          requestNumber: context.request?.requestNumber ?? 0,
          faceVerified: context.identityVerified,
          cards: selectedCards(context, true),
        },
      ],
    })),
    markIdentityVerified: presentationModel.assign({identityVerified: true}),
    recordFaceVerificationFailure: (context: MdocPresentationContext) =>
      dependencies.recordActivity?.(
        selectedCards(context, false).map(card => ({
          ...card,
          type: 'FACE_VERIFICATION_FAILED',
        })),
        dependencies.now(),
      ),
    // One history entry per card for every response sent, plus a declined request. A response
    // followed by a further request reached the reader; the last one takes the session's outcome.
    recordActivity: (
      context: MdocPresentationContext,
      event: MdocPresentationEvent,
    ) => {
      if (event.type !== 'RESULT') return;
      const currentRequestNumber = context.request?.requestNumber ?? 0;
      const records: MdocShareRecord[] = context.sentResponses.flatMap(
        response => {
          const type =
            response.requestNumber < currentRequestNumber
              ? 'SHARED'
              : SENT_RESPONSE_LOG_TYPE[context.outcome ?? 'error'] ??
                'SENDING_FAILED';
          return response.cards.map(card => ({
            ...card,
            type:
              type === 'SHARED' && response.faceVerified
                ? 'SHARED_WITH_FACE_VERIFICATION'
                : type,
          }));
        },
      );
      if (event.result.status === 'declined')
        records.push(
          ...selectedCards(context, false).map(card => ({
            ...card,
            type: 'DECLINED' as const,
          })),
        );
      if (records.length)
        dependencies.recordActivity?.(records, dependencies.now());
    },
    setPreparationError: assign<
      MdocPresentationContext,
      MdocPresentationEvent & {data?: unknown}
    >({
      error: (_, event) =>
        event.data instanceof Error ? event.data.message : String(event.data),
    }),
    clearError: presentationModel.assign({error: ''}),
    markSending: presentationModel.assign({
      responseStarted: true,
      requestExpiresAt: undefined,
    }),
    dismissAfterStop: presentationModel.assign({dismissAfterStop: true}),
    cancelPresentation: send({type: 'CANCEL'}, {to: 'presentation'}),
    declineRequest: raise({type: 'ANSWER', decision: 'decline'}),
    shareRequest: send(
      (
        _: MdocPresentationContext,
        event: MdocPresentationEvent & {data?: {share: string[]}},
      ) => ({type: 'ANSWER', decision: event.data ?? 'decline'}),
      {to: SpecialTargets.Internal},
    ),
    forwardAnswerToPresentation: forwardTo('presentation'),
  };
}
