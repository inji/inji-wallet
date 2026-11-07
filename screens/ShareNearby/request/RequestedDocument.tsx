import {Theme} from '../../../components/ui/styleUtils';
import React from 'react';
import {Pressable, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Text} from '../../../components/ui';
import type {MdocDocumentMatch} from '../../../shared/mdocPresentation/matching';
import {isShareableCandidate} from '../../../machines/mdocPresentation/mdocPresentationGuards';
import {CardChoices} from './CardChoices';
import {RequestedDetails} from './RequestedDetails';
import {getRequestedElements} from './requestUtils';
import type {SelectCard, ToggleField} from './types';

const styles = Theme.ShareNearbyStyles;
const reviewStyles = Theme.ShareNearbyReviewStyles;

// Frame 32 offers Select all / Clear all on a long list; the 5-detail frames don't.
const LONG_LIST_LENGTH = 6;

export function RequestedDocument({
  documentMatch,
  selectedCredentialId,
  checkedFields,
  onSelectCard,
  onToggleRequestedField,
  onOpenRetentionHelp,
  onSelectAllFields,
  onClearAllFields,
}: {
  documentMatch: MdocDocumentMatch;
  selectedCredentialId?: string;
  checkedFields: string[];
  onSelectCard: SelectCard;
  onToggleRequestedField: ToggleField;
  onOpenRetentionHelp: () => void;
  onSelectAllFields?: (docType: string) => void;
  onClearAllFields?: (docType: string) => void;
}) {
  const {t} = useTranslation('ShareNearby');
  const selectedCandidate = documentMatch.candidates.find(
    candidate => candidate.vc.vcMetadata.id === selectedCredentialId,
  );
  const requestedElements = getRequestedElements(documentMatch);
  return (
    <View style={reviewStyles.document}>
      <CardChoices
        candidates={documentMatch.candidates}
        selectedCandidate={selectedCandidate}
        docType={documentMatch.requested.docType}
        onSelectCard={onSelectCard}
      />
      {selectedCandidate &&
        selectedCandidate.availableElements.length >= LONG_LIST_LENGTH &&
        onSelectAllFields &&
        onClearAllFields && (
          <View style={reviewStyles.bulkRow}>
            <Text weight="semibold" style={[styles.small, styles.flexible]}>
              {t('request.detailsRequested', {
                count: selectedCandidate.availableElements.length,
              })}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                onSelectAllFields(documentMatch.requested.docType)
              }>
              <Text weight="semibold" style={styles.link}>
                {t('request.selectAll')}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => onClearAllFields(documentMatch.requested.docType)}>
              <Text weight="semibold" style={styles.link}>
                {t('request.clearAll')}
              </Text>
            </Pressable>
          </View>
        )}
      <RequestedDetails
        documentMatch={documentMatch}
        selectedCandidate={selectedCandidate}
        requestedElements={requestedElements}
        checkedFields={checkedFields}
        onToggleRequestedField={onToggleRequestedField}
        onOpenRetentionHelp={onOpenRetentionHelp}
      />
      {selectedCandidate && !isShareableCandidate(selectedCandidate) && (
        <Text style={styles.body}>{t('request.revokedCard')}</Text>
      )}
    </View>
  );
}
