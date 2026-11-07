import type {
  MdocCandidate,
  MdocDocumentMatch,
  MdocRequestedElement,
} from '../../shared/mdocPresentation/matching';
import type {MdocPresentationContext} from './mdocPresentationModel';

/** The checked-field key of an element, as kept in context.checkedFields. */
export function fieldKey(element: MdocRequestedElement): string {
  return JSON.stringify([element.namespace, element.elementIdentifier]);
}

/** The requested details on [candidate] that the holder left ticked: what may be shared. */
export function checkedAvailableElements(
  candidate: MdocCandidate,
  checkedFieldKeys: readonly string[],
): MdocRequestedElement[] {
  return candidate.availableElements.filter(element =>
    checkedFieldKeys.includes(fieldKey(element)),
  );
}

/** How many details the holder approved across the selected cards: what the screens report. */
export function countApprovedElements(
  matches: readonly MdocDocumentMatch[],
  selection: Readonly<Record<string, string>>,
  checkedFields: Readonly<Record<string, readonly string[]>>,
): number {
  return matches.reduce((count, documentMatch) => {
    const docType = documentMatch.requested.docType;
    const selectedCandidate = documentMatch.candidates.find(
      candidate => candidate.vc.vcMetadata.id === selection[docType],
    );
    return selectedCandidate
      ? count +
          checkedAvailableElements(
            selectedCandidate,
            checkedFields[docType] ?? [],
          ).length
      : count;
  }, 0);
}

/** Revoked or suspended cards are blocked; expired ones may be shared with a warning (frame 37). */
export function isShareableCandidate(candidate: MdocCandidate): boolean {
  return candidate.vc.vcMetadata.isRevoked !== 'TRUE';
}

/**
 * One shareable card selected per docType, with at least one ticked detail that the card holds
 * (ticked details missing from the card do not count).
 */
export function hasCompleteSelection(
  context: MdocPresentationContext,
): boolean {
  if (!context.request?.documents.length || !context.matches.length)
    return false;
  if (
    new Set(context.request.documents.map(document => document.docType))
      .size !== context.matches.length
  )
    return false;
  return context.matches.every(documentMatch => {
    const docType = documentMatch.requested.docType;
    const selectedCandidate = documentMatch.candidates.find(
      candidate =>
        candidate.vc.vcMetadata.id === context.selection[docType] &&
        isShareableCandidate(candidate),
    );
    return (
      !!selectedCandidate &&
      checkedAvailableElements(
        selectedCandidate,
        context.checkedFields[docType] ?? [],
      ).length > 0
    );
  });
}
