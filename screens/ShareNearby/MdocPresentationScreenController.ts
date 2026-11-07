import {useCallback, useEffect, useState, useSyncExternalStore} from 'react';
import {AppState, BackHandler, Linking, Platform} from 'react-native';
import BluetoothStateManager from 'react-native-bluetooth-state-manager';
import type {MdocPresentationRef} from '../../machines/mdocPresentation/mdocPresentationMachine';
import {MdocPresentationEvents as presentationEvents} from '../../machines/mdocPresentation/mdocPresentationModel';
import {selectCanShareMdoc} from '../../machines/mdocPresentation/mdocPresentationSelectors';
import {getFaceAttribute} from '../../components/VC/common/VCUtils';
import {useRequestHelp} from './request/RequestHelpController';
import {useEngagementSequence} from './engagement/useEngagementSequence';
import {useSendingVisibility} from './sending/useSendingVisibility';

export function useMdocPresentationScreen(
  presentationActor: MdocPresentationRef | undefined,
  onDone: () => void,
  onScanInstead: () => void,
  onViewHistory: () => void,
  onAddCard: () => void,
) {
  // The child actor exists only during presentation; entry/readiness have no subscription.
  const subscribe = useCallback(
    (onChange: () => void) => {
      const subscription = presentationActor?.subscribe(onChange);
      return () => subscription?.unsubscribe();
    },
    [presentationActor],
  );
  const getSnapshot = useCallback(
    () => presentationActor?.getSnapshot(),
    [presentationActor],
  );
  const presentationState = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot,
  );
  const canShareSelectedCards = presentationState
    ? selectCanShareMdoc(presentationState)
    : false;
  const presentationContext = presentationState?.context;
  const [isScanHelpVisible, setScanHelpVisible] = useState(false);
  const requestHelpController = useRequestHelp();
  const closeRequestHelp = requestHelpController.CLOSE_HELP;
  const [isStopConfirmationVisible, setStopConfirmationVisible] =
    useState(false);
  const isNativeSendingResponse =
    !!presentationState?.matches('presenting.sending');
  const hasNativeOutcome = !!presentationState?.matches('outcome');
  const isSendingResponse = useSendingVisibility(
    presentationActor,
    !!presentationContext?.responseStarted,
    isNativeSendingResponse
      ? 'sending'
      : hasNativeOutcome && presentationContext?.result?.status === 'completed'
      ? 'completed'
      : 'other',
  );
  const isStoppingPresentation = presentationState?.matches(
    'presenting.stopping',
  );
  const isShowingOutcome = hasNativeOutcome && !isSendingResponse;
  const isShowingExpiredCode =
    isShowingOutcome && presentationContext?.outcome === 'codeExpired';
  const selectedCards =
    presentationContext?.matches.flatMap(documentMatch =>
      documentMatch.candidates
        .filter(
          candidate =>
            candidate.vc.vcMetadata.id ===
            presentationContext.selection[documentMatch.requested.docType],
        )
        .map(candidate => candidate.vc),
    ) ?? [];
  const selectedCardFaces = selectedCards.map(vc => ({
    face: getFaceAttribute(vc.verifiableCredential, vc.vcMetadata.format),
  }));
  const canShareWithSelfieVerification =
    canShareSelectedCards && selectedCardFaces.some(data => !!data.face);
  const handleBackOrCancel = useCallback(() => {
    if (!presentationActor || isStoppingPresentation) return;
    if (hasNativeOutcome) {
      presentationActor.send(presentationEvents.DONE());
      onDone();
    } else if (isSendingResponse) setStopConfirmationVisible(true);
    else presentationActor.send(presentationEvents.CANCEL());
  }, [
    presentationActor,
    isStoppingPresentation,
    isSendingResponse,
    hasNativeOutcome,
    onDone,
  ]);
  useEffect(() => {
    if (!presentationActor) return;
    const subscription = AppState.addEventListener('change', next => {
      if (next === 'background')
        presentationActor.send(presentationEvents.APP_INACTIVE());
    });
    return () => subscription.remove();
  }, [presentationActor]);
  useEffect(() => {
    if (!presentationActor) return;
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        handleBackOrCancel();
        return true;
      },
    );
    return () => subscription.remove();
  }, [presentationActor, handleBackOrCancel]);
  useEffect(() => {
    setStopConfirmationVisible(false);
  }, [presentationActor, isSendingResponse]);
  const hasRequestToReview =
    presentationState?.matches('presenting.reviewingRequest') ||
    presentationState?.matches('presenting.preparationFailed');
  const engagementStage = useEngagementSequence(
    presentationActor,
    presentationState?.matches('presenting.showingCode')
      ? 'showingCode'
      : presentationState?.matches('presenting.connecting')
      ? 'connecting'
      : presentationState?.matches('presenting.waitingForRequest')
      ? 'waitingForRequest'
      : hasRequestToReview
      ? 'reviewingRequest'
      : undefined,
  );
  const isShowingEngagement = engagementStage !== undefined;
  const isReviewingRequest = hasRequestToReview && !isShowingEngagement;
  useEffect(() => {
    setScanHelpVisible(false);
    closeRequestHelp();
  }, [
    presentationActor,
    isShowingEngagement,
    isReviewingRequest,
    isShowingOutcome,
    closeRequestHelp,
  ]);
  if (!presentationActor || !presentationState || !presentationContext)
    return undefined;
  return {
    presentationState,
    presentationContext,
    canShareSelectedCards,
    canShareWithSelfieVerification,
    isSendingResponse,
    isNativeSendingResponse,
    isStoppingPresentation,
    isShowingOutcome,
    isShowingEngagement,
    isReviewingRequest,
    engagementStage,
    selectedCards,
    selectedCardFaces,
    handleBackOrCancel,
    isScanHelpVisible,
    requestHelpController,
    isStopConfirmationVisible,
    isShowingExpiredCode,
    OPEN_HELP:
      isShowingEngagement || isShowingExpiredCode
        ? () => setScanHelpVisible(true)
        : requestHelpController.OPEN_PRIVACY_HELP,
    OPEN_SCAN_HELP: () => setScanHelpVisible(true),
    CLOSE_SCAN_HELP: () => setScanHelpVisible(false),
    OPEN_STOP_CONFIRMATION: () => setStopConfirmationVisible(true),
    CLOSE_STOP_CONFIRMATION: () => setStopConfirmationVisible(false),
    CONFIRM_STOP: () => {
      setStopConfirmationVisible(false);
      presentationActor.send(presentationEvents.STOP());
    },
    DONE: () => {
      presentationActor.send(presentationEvents.DONE());
      onDone();
    },
    // Back to Share nearby, where the entry screen says nothing was shared.
    BACK_TO_ENTRY: () => presentationActor.send(presentationEvents.DONE()),
    DISMISS: () => {
      presentationActor.send(presentationEvents.DISMISS());
      onDone();
    },
    VIEW_HISTORY: () => {
      presentationActor.send(presentationEvents.DONE());
      onViewHistory();
    },
    // Frame 23: iOS can't switch Bluetooth on for the app, so it opens Settings instead.
    TURN_ON_BLUETOOTH: () => {
      if (Platform.OS === 'ios') {
        void Linking.openSettings();
        return;
      }
      BluetoothStateManager.requestToEnable()
        .then(() => presentationActor.send(presentationEvents.NEW_CODE()))
        .catch(() => undefined);
    },
    SCAN_INSTEAD: () => {
      setScanHelpVisible(false);
      presentationActor.send(presentationEvents.DISMISS());
      onScanInstead();
    },
    // Frame 36: end the session quietly (no outcome screen) and go add the missing card.
    ADD_CARD: () => {
      presentationActor.send(presentationEvents.DISMISS());
      onAddCard();
    },
    sendPresentationEvent: presentationActor.send,
  };
}

export type MdocPresentationController = NonNullable<
  ReturnType<typeof useMdocPresentationScreen>
>;
