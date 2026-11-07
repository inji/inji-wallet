import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {countApprovedElements} from '../../../machines/mdocPresentation/mdocPresentationGuards';
import type {MdocOutcomeViewProps} from './types';

export function useMdocOutcome({
  matches,
  selection,
  checkedFields,
}: Pick<MdocOutcomeViewProps, 'matches' | 'selection' | 'checkedFields'>) {
  const {t} = useTranslation('ShareNearby');
  // The outcome screen opens as the session ends; that moment is the time shown.
  const [endedAt] = useState(() => new Date());
  const approvedCount = countApprovedElements(
    matches,
    selection,
    checkedFields,
  );
  const requestedCount = matches.reduce(
    (total, documentMatch) =>
      total +
      (documentMatch.candidates[0]?.availableElements.length ??
        Object.values(documentMatch.requested.nameSpaces).flatMap(Object.keys)
          .length),
    0,
  );
  const readerTrust = matches[0]?.requested.readerTrust;
  const selectedCardNames = matches.flatMap(documentMatch =>
    documentMatch.candidates
      .filter(
        candidate =>
          candidate.vc.vcMetadata.id ===
          selection[documentMatch.requested.docType],
      )
      .map(
        candidate =>
          candidate.vc.vcMetadata.credentialType ||
          documentMatch.requested.docType,
      ),
  );
  const time = t('outcome.today', {
    time: endedAt.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
  });
  return {
    approvedCount,
    requestedCount,
    verifierName: readerTrust?.readerName || t('request.unknownVerifier'),
    isVerifiedVerifier: readerTrust?.status === 'verified',
    cardName: selectedCardNames.join(', '),
    time,
  };
}
