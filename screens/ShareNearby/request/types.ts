import type {ReaderTrust} from '../../../shared/mdocPresentation/types';
import type {MdocDocumentMatch} from '../../../shared/mdocPresentation/matching';

export type SelectCard = (docType: string, credentialId: string) => void;
export type ToggleField = (
  docType: string,
  namespace: string,
  elementIdentifier: string,
) => void;

export interface MdocRequestReviewProps {
  matches: MdocDocumentMatch[];
  selection: Record<string, string>;
  checkedFields: Record<string, string[]>;
  /** 1 for the first request; higher for further requests in the same session. */
  requestNumber?: number;
  canShareSelectedCards: boolean;
  canShareWithSelfieVerification: boolean;
  expiresAt?: number;
  hasPreparationFailed: boolean;
  onOpenVerifierDetails: (readerTrust: ReaderTrust) => void;
  onOpenRetentionHelp: () => void;
  onOpenIdentityHelp: () => void;
  onSelectCard: SelectCard;
  onToggleRequestedField: ToggleField;
  onShareSelectedCards: () => void;
  onVerifyAndShare: () => void;
  onDeclineRequest: () => void;
  onRetryPreparation: () => void;
  /** Frame 36: end the session and open the issuer list to add the missing card. */
  onAddCard?: () => void;
  /** Frame 32: tick or untick every requested detail of a document. */
  onSelectAllFields?: (docType: string) => void;
  onClearAllFields?: (docType: string) => void;
}
