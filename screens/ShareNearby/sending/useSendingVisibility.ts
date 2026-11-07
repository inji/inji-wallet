import {useEffect, useState} from 'react';
import type {MdocPresentationRef} from '../../../machines/mdocPresentation/mdocPresentationMachine';

const MINIMUM_SENDING_DURATION_MS = 1000;

/** Hold only successful outcomes; native cancellation and failures remain immediate. */
export function useSendingVisibility(
  presentationActor: MdocPresentationRef | undefined,
  responseStarted: boolean,
  nativeStage: 'sending' | 'completed' | 'other',
) {
  const [sendingPhase, setSendingPhase] = useState({
    actor: presentationActor,
    startedAt: undefined as number | undefined,
    hasElapsed: false,
  });

  useEffect(() => {
    if (!presentationActor || !responseStarted) {
      if (sendingPhase.startedAt !== undefined) {
        setSendingPhase({
          actor: presentationActor,
          startedAt: undefined,
          hasElapsed: false,
        });
      }
      return;
    }
    if (
      sendingPhase.actor !== presentationActor ||
      sendingPhase.startedAt === undefined
    ) {
      setSendingPhase({
        actor: presentationActor,
        startedAt: Date.now(),
        hasElapsed: false,
      });
      return;
    }
    if (nativeStage !== 'completed' || sendingPhase.hasElapsed) return;

    const timer = setTimeout(() => {
      setSendingPhase(phase => ({...phase, hasElapsed: true}));
    }, Math.max(0, MINIMUM_SENDING_DURATION_MS - (Date.now() - sendingPhase.startedAt)));
    return () => clearTimeout(timer);
  }, [presentationActor, responseStarted, nativeStage, sendingPhase]);

  return (
    !!presentationActor &&
    responseStarted &&
    (nativeStage === 'sending' ||
      (nativeStage === 'completed' &&
        (sendingPhase.actor !== presentationActor || !sendingPhase.hasElapsed)))
  );
}
