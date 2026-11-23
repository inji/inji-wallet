import React from 'react';
import type {useMdocReadiness} from './MdocReadinessController';
import {ReadinessStatus} from './ReadinessStatus';
import {ReadinessActions} from './ReadinessActions';

export function MdocReadiness({
  readinessController,
}: {
  readinessController: ReturnType<typeof useMdocReadiness>;
}) {
  return (
    <>
      <ReadinessStatus
        readinessIssue={readinessController.readinessIssue}
        isCheckingReadiness={readinessController.isCheckingReadiness}
      />
      <ReadinessActions
        shouldOfferSettings={readinessController.shouldOfferSettings}
        shouldRequestLocationConsent={
          readinessController.shouldRequestLocationConsent
        }
        isAnotherShareActive={readinessController.isAnotherShareActive}
        onSettings={readinessController.OPEN_SETTINGS}
        onRetry={readinessController.RETRY}
        onContinue={readinessController.CONTINUE}
        onCancel={readinessController.CANCEL}
      />
    </>
  );
}
