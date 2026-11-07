import {Theme} from '../../../components/ui/styleUtils';
import React from 'react';
import {View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Text} from '../../../components/ui';
import type {MdocCandidate} from '../../../shared/mdocPresentation/matching';
import {docTypeName, getIssuerDisplayName} from './requestUtils';
import {IssuerLogo} from './IssuerLogo';

const styles = Theme.ShareNearbyStyles;
const reviewStyles = Theme.ShareNearbyReviewStyles;

export function SelectedCardHeader({
  selectedCandidate,
  docType,
  requestedCount,
}: {
  selectedCandidate?: MdocCandidate;
  docType: string;
  requestedCount: number;
}) {
  const {t} = useTranslation('ShareNearby');

  return (
    <View style={reviewStyles.cardHeader}>
      <IssuerLogo candidate={selectedCandidate} />
      <View style={styles.flexible}>
        <Text weight="semibold" style={reviewStyles.cardTitle}>
          {selectedCandidate?.vc.vcMetadata.credentialType ||
            docTypeName(docType)}
        </Text>
        {getIssuerDisplayName(selectedCandidate) ? (
          <Text style={styles.small}>
            {getIssuerDisplayName(selectedCandidate)}
          </Text>
        ) : null}
      </View>
      {selectedCandidate?.vc.vcMetadata.isExpired ? (
        <Text weight="semibold" style={reviewStyles.expiredChip}>
          {t('request.expiredBadge')}
        </Text>
      ) : (
        <Text weight="semibold" style={reviewStyles.countChip}>
          {t('request.detailCount', {count: requestedCount})}
        </Text>
      )}
    </View>
  );
}
