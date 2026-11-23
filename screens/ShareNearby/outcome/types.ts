import type {MdocOutcome} from '../../../machines/mdocPresentation/mdocPresentationModel';
import type {MdocDocumentMatch} from '../../../shared/mdocPresentation/matching';

export interface MdocOutcomeViewProps {
  outcome: MdocOutcome;
  matches: MdocDocumentMatch[];
  selection: Record<string, string>;
  checkedFields: Record<string, string[]>;
  /** Leaves the flow for Home; used after a share. */
  onDone: () => void;
  /** Leaves the flow for Share nearby, which notes when nothing was shared. */
  onBackToEntry: () => void;
  onNewCode: () => void;
  onViewHistory: () => void;
  onTurnOnBluetooth: () => void;
}
