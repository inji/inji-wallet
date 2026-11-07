import {MdocPresentation} from '../../shared/mdocPresentation/MdocPresentation';
import {matchRequest} from '../../shared/mdocPresentation/matching';
import {prepareApprovedElements} from '../../shared/mdocPresentation/prepareApprovedElements';
import type {
  MdocDecision,
  MdocResult,
} from '../../shared/mdocPresentation/types';
import {
  checkedAvailableElements,
  hasCompleteSelection,
} from './mdocPresentationGuards';
import {
  ENGAGEMENT_TIMEOUT_SECONDS,
  INACTIVITY_TIMEOUT_SECONDS,
  MdocPresentationEvents as presentationEvents,
} from './mdocPresentationModel';
import type {
  MdocOutcome,
  MdocPresentationContext,
  MdocPresentationDependencies,
  MdocPresentationEvent,
} from './mdocPresentationModel';

export function resolvePresentationDependencies(
  overrides: Partial<MdocPresentationDependencies>,
): MdocPresentationDependencies {
  return {
    present: MdocPresentation.present,
    cancel: MdocPresentation.cancel,
    getCredentials: () => [],
    prepareMdocForSharing: prepareApprovedElements,
    now: () => Date.now(),
    showFaceAuthConsent: true,
    ...overrides,
  };
}

export function getPresentationOutcome(
  result: MdocResult,
  responseStarted: boolean,
): MdocOutcome {
  switch (result.status) {
    case 'completed':
      return result.confirmedByReader ? 'shared' : 'sentNotConfirmed';
    case 'declined':
      return 'declined';
    case 'cancelled':
      return responseStarted ? 'stopped' : 'sessionEnded';
    case 'failed': {
      if (result.failure === 'connectionLost')
        return responseStarted ? 'interrupted' : 'connectionLost';
      const failureOutcomes: Record<string, MdocOutcome> = {
        noReaderFound: 'codeExpired',
        connectionFailed: 'couldntConnect',
        bluetoothOff: 'bluetoothOff',
        timedOut: 'timedOut',
        readerReportedError: 'verifierError',
        requestUnreadable: 'requestUnreadable',
        readerSecurityError: 'requestUnreadable',
        readerEnded: 'readerEnded',
      };
      return failureOutcomes[result.failure] ?? 'error';
    }
  }
}

export function MdocPresentationServices(
  dependencies: MdocPresentationDependencies,
) {
  return {
    present:
      () =>
      (
        sendToPresentationMachine: (event: MdocPresentationEvent) => void,
        receivePresentationEvent: (
          listener: (event: MdocPresentationEvent) => void,
        ) => void,
      ) => {
        let isDisposed = false;
        let hasFinished = false;
        let isCancelled = false;
        let resolvePendingDecision:
          | ((decision: MdocDecision) => void)
          | undefined;
        const resolveHolderDecision = (decision: MdocDecision) => {
          const resolveDecision = resolvePendingDecision;
          resolvePendingDecision = undefined;
          resolveDecision?.(decision);
        };
        const cancelNativePresentation = () => {
          if (isCancelled || hasFinished) return;
          isCancelled = true;
          // Release the JS consent promise as well as cancelling native's wait. The wrapper
          // suppresses this answer after cancel, so it cannot decline a later presentation.
          dependencies.cancel();
          resolveHolderDecision('decline');
        };
        receivePresentationEvent(event => {
          if (event.type === 'ANSWER' && !isCancelled && !hasFinished)
            resolveHolderDecision(event.decision);
          if (event.type === 'CANCEL') cancelNativePresentation();
        });
        const handlePresentationResult = (result: MdocResult) => {
          hasFinished = true;
          resolveHolderDecision('decline');
          if (!isDisposed)
            sendToPresentationMachine(presentationEvents.RESULT(result));
        };
        try {
          dependencies
            .present(
              {
                trustedReaderRoots: [],
                engagementTimeoutSeconds: ENGAGEMENT_TIMEOUT_SECONDS,
                inactivityTimeoutSeconds: INACTIVITY_TIMEOUT_SECONDS,
              },
              {
                onQrReady: qrText => {
                  if (!isDisposed && !isCancelled)
                    sendToPresentationMachine(
                      presentationEvents.QR_READY(qrText),
                    );
                },
                onProgress: progress => {
                  if (!isDisposed && !isCancelled)
                    sendToPresentationMachine(
                      presentationEvents.PROGRESS(progress),
                    );
                },
                onRequest: request => {
                  if (isDisposed || isCancelled || hasFinished)
                    return Promise.resolve('decline');
                  return new Promise(resolve => {
                    resolvePendingDecision = resolve;
                    sendToPresentationMachine(
                      presentationEvents.REQUEST_RECEIVED(request),
                    );
                  });
                },
              },
            )
            .then(handlePresentationResult, error =>
              handlePresentationResult({
                status: 'failed',
                failure: 'internalError',
                detail: error instanceof Error ? error.message : String(error),
              }),
            );
        } catch (error) {
          handlePresentationResult({
            status: 'failed',
            failure: 'internalError',
            detail: error instanceof Error ? error.message : String(error),
          });
        }
        return () => {
          isDisposed = true;
          cancelNativePresentation();
        };
      },
    prepare: (context: MdocPresentationContext) => async () => {
      if (!context.request) throw new Error('No mdoc request is pending');
      // Re-read credentials: a card may have been removed or revoked since review.
      const matches = matchRequest(
        context.request,
        dependencies.getCredentials(),
      );
      if (!hasCompleteSelection({...context, matches}))
        throw new Error(
          'The selected cards no longer satisfy the complete request',
        );
      const preparedMdocCredentials: string[] = [];
      for (const documentMatch of matches) {
        const selectedCandidate = documentMatch.candidates.find(
          item =>
            item.vc.vcMetadata.id ===
            context.selection[documentMatch.requested.docType],
        );
        if (!selectedCandidate) throw new Error('Selected mdoc is unavailable');
        const preparedMdoc = await dependencies.prepareMdocForSharing(
          selectedCandidate.vc,
          checkedAvailableElements(
            selectedCandidate,
            context.checkedFields[documentMatch.requested.docType] ?? [],
          ),
        );
        if (!preparedMdoc)
          throw new Error('Mdoc preparation returned an empty credential');
        preparedMdocCredentials.push(preparedMdoc);
      }
      return {share: preparedMdocCredentials};
    },
  };
}
