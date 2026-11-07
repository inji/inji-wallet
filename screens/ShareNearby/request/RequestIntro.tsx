import {Theme} from '../../../components/ui/styleUtils';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Text} from '../../../components/ui';
import {
  BannerNotification,
  BannerStatusType,
} from '../../../components/BannerNotification';

const styles = Theme.ShareNearbyStyles;

export function RequestHeading({
  cardCount,
  isFollowUpRequest,
}: {
  cardCount: number;
  isFollowUpRequest: boolean;
}) {
  const {t} = useTranslation('ShareNearby');
  // No design frame for a further request in the same session; this copy is a stopgap.
  if (isFollowUpRequest) {
    return (
      <>
        <Text weight="bold" style={styles.title}>
          {t('request.followUpTitle')}
        </Text>
        <Text style={styles.body}>{t('request.followUpDescription')}</Text>
      </>
    );
  }
  return (
    <>
      <Text weight="bold" style={styles.title}>
        {t('request.title')}
      </Text>
      {cardCount === 1 && (
        <Text style={styles.body}>{t('request.description')}</Text>
      )}
    </>
  );
}

/** Frame 27: said after the verifier card when the reader asks for more than one card. */
export function MultipleCardsIntro({cardCount}: {cardCount: number}) {
  const {t} = useTranslation('ShareNearby');
  return (
    <Text style={styles.body}>
      {t('request.askingFrom')}{' '}
      <Text weight="bold" style={styles.body}>
        {t('request.cardCount', {count: cardCount})}
      </Text>
      {t('request.untickRest')}
    </Text>
  );
}

export function PreparationError() {
  const {t} = useTranslation('ShareNearby');
  return (
    <BannerNotification
      type={BannerStatusType.ERROR}
      message={t('request.prepareError')}
      testId="mdocPreparationError"
    />
  );
}
