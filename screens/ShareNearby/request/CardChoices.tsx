import {Theme} from '../../../components/ui/styleUtils';
import React from 'react';
import {View} from 'react-native';
import {Checkbox} from '../../../components/ui/checkbox/Checkbox';
import {useTranslation} from 'react-i18next';
import {Text} from '../../../components/ui';
import {isShareableCandidate} from '../../../machines/mdocPresentation/mdocPresentationGuards';
import type {MdocCandidate} from '../../../shared/mdocPresentation/matching';
import type {SelectCard} from './types';
import {docTypeName, getIssuerLabel} from './requestUtils';
import {IssuerLogo} from './IssuerLogo';

const styles = Theme.ShareNearbyStyles;
const reviewStyles = Theme.ShareNearbyReviewStyles;

export function CardChoices({
  candidates,
  selectedCandidate,
  docType,
  onSelectCard,
}: {
  candidates: MdocCandidate[];
  selectedCandidate?: MdocCandidate;
  docType: string;
  onSelectCard: SelectCard;
}) {
  const {t} = useTranslation('ShareNearby');
  if (candidates.length <= 1) return null;

  return (
    <View accessibilityRole="radiogroup" style={reviewStyles.gap}>
      <Text weight="semibold" style={styles.body}>
        {t('request.chooseCard')}
      </Text>
      {candidates.map(candidate => {
        const cardMetadata = candidate.vc.vcMetadata;
        const isShareable = isShareableCandidate(candidate);
        const cardTitle = cardMetadata.credentialType || docTypeName(docType);
        const issuerLabel = getIssuerLabel(candidate);
        const statusLabel = !isShareable
          ? t('request.revokedCard')
          : cardMetadata.isExpired
          ? t('request.expiredBadge')
          : undefined;
        return (
          <Checkbox
            key={cardMetadata.id}
            testId={cardMetadata.id}
            accessibilityLabel={[cardTitle, issuerLabel, statusLabel]
              .filter(Boolean)
              .join(', ')}
            checked={selectedCandidate === candidate}
            size={22}
            checkedColor={Theme.ShareNearbyColors.accent}
            disabled={!isShareable}
            onPress={() => onSelectCard(docType, cardMetadata.id)}
            containerStyle={[
              reviewStyles.checkboxBase,
              styles.card,
              reviewStyles.choice,
              selectedCandidate === candidate && reviewStyles.selectedChoice,
            ]}
            wrapperStyle={reviewStyles.choiceContents}
            title={
              <>
                <IssuerLogo candidate={candidate} />
                <View style={styles.flexible}>
                  <Text weight="semibold" style={reviewStyles.cardTitle}>
                    {cardTitle}
                  </Text>
                  {issuerLabel ? (
                    <Text style={styles.small}>{issuerLabel}</Text>
                  ) : null}
                  {!isShareable ? (
                    <Text style={styles.small}>{t('request.revokedCard')}</Text>
                  ) : (
                    cardMetadata.isExpired && (
                      <Text style={[styles.small, reviewStyles.expiredText]}>
                        {t('request.expiredBadge')}
                      </Text>
                    )
                  )}
                </View>
              </>
            }
          />
        );
      })}
    </View>
  );
}
