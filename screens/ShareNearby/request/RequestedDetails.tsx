import React from 'react';
import {View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Text} from '../../../components/ui';
import type {
  MdocCandidate,
  MdocDocumentMatch,
  MdocRequestedElement,
} from '../../../shared/mdocPresentation/matching';
import {Icon} from 'react-native-elements';
import {Theme} from '../../../components/ui/styleUtils';
import {SelectedCardHeader} from './SelectedCardHeader';
import {RequestedField} from './RequestedField';
import {getCardExpiryDate, getRequestedFieldLabel} from './requestUtils';
import Warning from '../../../assets/shareNearby/warning-amber.svg';
import type {ToggleField} from './types';

const styles = Theme.ShareNearbyStyles;
const reviewStyles = Theme.ShareNearbyReviewStyles;

export function RequestedDetails({
  documentMatch,
  selectedCandidate,
  requestedElements,
  checkedFields,
  onToggleRequestedField,
  onOpenRetentionHelp,
}: {
  documentMatch: MdocDocumentMatch;
  selectedCandidate?: MdocCandidate;
  requestedElements: MdocRequestedElement[];
  checkedFields: string[];
  onToggleRequestedField: ToggleField;
  onOpenRetentionHelp: () => void;
}) {
  const {t} = useTranslation('ShareNearby');
  // Only the chosen card's details are shown; no other card stands in before a choice.
  const shownCandidate = selectedCandidate;
  if (!documentMatch.noMatch && !shownCandidate) {
    return (
      <View style={styles.card}>
        <SelectedCardHeader
          docType={documentMatch.requested.docType}
          requestedCount={requestedElements.length}
        />
        <View style={styles.inset}>
          <Text style={styles.body}>{t('request.chooseCardFirst')}</Text>
        </View>
      </View>
    );
  }
  const availableElements =
    shownCandidate?.availableElements ?? requestedElements;
  const missingElements = shownCandidate?.missingElements ?? [];
  return (
    <View style={styles.card}>
      <SelectedCardHeader
        selectedCandidate={selectedCandidate}
        docType={documentMatch.requested.docType}
        requestedCount={availableElements.length}
      />
      {selectedCandidate?.vc.vcMetadata.isExpired && (
        <View style={reviewStyles.expiredPanel}>
          <Warning width={16} height={16} />
          <Text
            style={[styles.small, styles.flexible, reviewStyles.expiredText]}>
            {getCardExpiryDate(selectedCandidate)
              ? t('request.expiredOn', {
                  date: getCardExpiryDate(selectedCandidate),
                })
              : t('request.expiredWarning')}
          </Text>
        </View>
      )}
      {documentMatch.noMatch ? (
        <View style={styles.inset}>
          <Text style={styles.body}>{t('request.noMatch')}</Text>
        </View>
      ) : (
        <>
          {missingElements.length > 0 && (
            <View style={reviewStyles.missingPanel}>
              <View style={reviewStyles.missingHeading}>
                <Icon
                  name="info-outline"
                  size={14}
                  color={Theme.Colors.GrayText}
                />
                <Text weight="semibold" style={styles.small}>
                  {t('request.notOnCard')}
                </Text>
              </View>
              <View style={reviewStyles.missingChips}>
                {missingElements.map(element => (
                  <View
                    key={JSON.stringify([
                      element.namespace,
                      element.elementIdentifier,
                    ])}
                    style={reviewStyles.missingChip}>
                    <Text style={styles.small}>
                      {getRequestedFieldLabel(shownCandidate, element)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          {availableElements.map(element => {
            const fieldKey = JSON.stringify([
              element.namespace,
              element.elementIdentifier,
            ]);
            return (
              <RequestedField
                key={fieldKey}
                label={getRequestedFieldLabel(shownCandidate, element)}
                checked={
                  !!selectedCandidate && checkedFields.includes(fieldKey)
                }
                disabled={!selectedCandidate}
                intentToRetain={element.intentToRetain}
                onToggleRequestedField={() =>
                  onToggleRequestedField(
                    documentMatch.requested.docType,
                    element.namespace,
                    element.elementIdentifier,
                  )
                }
                onOpenRetentionHelp={onOpenRetentionHelp}
              />
            );
          })}
        </>
      )}
    </View>
  );
}
