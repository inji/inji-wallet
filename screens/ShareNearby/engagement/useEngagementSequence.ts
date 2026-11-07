import {useEffect, useState} from 'react';
import type {MdocPresentationRef} from '../../../machines/mdocPresentation/mdocPresentationMachine';
import type {EngagementStage} from './types';

const MINIMUM_PHASE_DURATION_MS = 2000;
type PresentationStage = EngagementStage | 'reviewingRequest';

/** Pace the visible connection phases without delaying native requests or cleanup. */
export function useEngagementSequence(
  presentationActor: MdocPresentationRef | undefined,
  nativeStage: PresentationStage | undefined,
): EngagementStage | undefined {
  const [visiblePhase, setVisiblePhase] = useState({
    actor: presentationActor,
    stage: 'showingCode' as PresentationStage,
    startedAt: Date.now(),
  });

  useEffect(() => {
    if (!presentationActor || !nativeStage) return;

    if (nativeStage === 'showingCode') {
      if (
        visiblePhase.actor !== presentationActor ||
        visiblePhase.stage !== 'showingCode'
      ) {
        setVisiblePhase({
          actor: presentationActor,
          stage: 'showingCode',
          startedAt: Date.now(),
        });
      }
      return;
    }

    // Native can deliver connected + request in one render, with no connecting callback.
    if (
      visiblePhase.actor !== presentationActor ||
      visiblePhase.stage === 'showingCode'
    ) {
      setVisiblePhase({
        actor: presentationActor,
        stage: 'connecting',
        startedAt: Date.now(),
      });
      return;
    }

    const nextStage =
      visiblePhase.stage === 'connecting' && nativeStage !== 'connecting'
        ? 'waitingForRequest'
        : visiblePhase.stage === 'waitingForRequest' &&
          nativeStage === 'reviewingRequest'
        ? 'reviewingRequest'
        : undefined;
    if (!nextStage) return;

    const remainingDuration = Math.max(
      0,
      MINIMUM_PHASE_DURATION_MS - (Date.now() - visiblePhase.startedAt),
    );
    const timer = setTimeout(() => {
      setVisiblePhase({
        actor: presentationActor,
        stage: nextStage,
        startedAt: Date.now(),
      });
    }, remainingDuration);
    return () => clearTimeout(timer);
  }, [presentationActor, nativeStage, visiblePhase]);

  // Outcomes/cancellation bypass the visual delay immediately.
  if (!presentationActor || !nativeStage) return undefined;
  if (nativeStage === 'showingCode') return 'showingCode';
  if (visiblePhase.actor !== presentationActor) return 'connecting';
  return visiblePhase.stage === 'reviewingRequest'
    ? undefined
    : visiblePhase.stage;
}
