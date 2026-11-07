import {useCallback, useState} from 'react';
import type {ReaderTrust} from '../../../shared/mdocPresentation/types';

export type RequestHelp =
  | {kind: 'verifier'; readerTrust: ReaderTrust}
  | {kind: 'identity' | 'retention' | 'privacy'};

export function useRequestHelp() {
  const [activeHelpSheet, setActiveHelpSheet] = useState<RequestHelp>();
  const closeHelpSheet = useCallback(() => setActiveHelpSheet(undefined), []);
  return {
    activeHelpSheet,
    OPEN_VERIFIER_DETAILS: (readerTrust: ReaderTrust) =>
      setActiveHelpSheet({kind: 'verifier', readerTrust}),
    OPEN_IDENTITY_HELP: () => setActiveHelpSheet({kind: 'identity'}),
    OPEN_RETENTION_HELP: () => setActiveHelpSheet({kind: 'retention'}),
    OPEN_PRIVACY_HELP: () => setActiveHelpSheet({kind: 'privacy'}),
    CLOSE_HELP: closeHelpSheet,
  };
}
