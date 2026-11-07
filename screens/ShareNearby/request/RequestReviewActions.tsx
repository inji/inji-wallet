import {Theme} from '../../../components/ui/styleUtils';
import React from 'react';
import {Pressable, View} from 'react-native';
import Clock from '../../../assets/shareNearby/clock.svg';
import {useTranslation} from 'react-i18next';
import {Text, Button} from '../../../components/ui';
import type {useCountdown} from '../useCountdown';
import type {MdocRequestReviewProps} from './types';

const styles = Theme.ShareNearbyStyles;
const reviewStyles = Theme.ShareNearbyReviewStyles;

export function RequestReviewActions({
  expiresAt,
  countdown,
  hasRequestExpired,
  hasPreparationFailed,
  canShareSelectedCards,
  canShareWithSelfieVerification,
  shareCount,
  availableCount,
  cardCount,
  hasFailedVerifierCheck,
  onRetryPreparation,
  onShareSelectedCards,
  onVerifyAndShare,
  onDeclineRequest,
}: Pick<
  MdocRequestReviewProps,
  | 'expiresAt'
  | 'hasPreparationFailed'
  | 'canShareSelectedCards'
  | 'canShareWithSelfieVerification'
  | 'onRetryPreparation'
  | 'onShareSelectedCards'
  | 'onVerifyAndShare'
  | 'onDeclineRequest'
> & {
  countdown: ReturnType<typeof useCountdown>;
  hasRequestExpired: boolean;
  shareCount: number;
  /** Requested details the selected cards hold; fewer ticked than this is a partial share. */
  availableCount: number;
  cardCount: number;
  hasFailedVerifierCheck: boolean;
}) {
  const {t} = useTranslation('ShareNearby');
  const isShareDisabled = !canShareSelectedCards || hasRequestExpired;
  const selfieShare = canShareWithSelfieVerification && (
    <Button
      styles={styles.buttonContainer}
      type="outline"
      title={t('request.verifyShare')}
      onPress={onVerifyAndShare}
      disabled={isShareDisabled}
      testID="verifyShareMdoc"
    />
  );

  const isPartialShare = shareCount > 0 && shareCount < availableCount;
  // Frame 34 only: a card is chosen but every detail is unticked (not "no card chosen yet").
  const isNothingTicked = shareCount === 0 && availableCount > 0;
  const shareTitle =
    shareCount === 0
      ? t('request.shareNothing')
      : cardCount > 1
      ? t('request.shareFromCards', {count: shareCount, cards: cardCount})
      : isPartialShare
      ? t('request.sharePartial', {count: shareCount, total: availableCount})
      : t('request.share', {count: shareCount});
  const selectionNote = isNothingTicked
    ? t('request.nothingSelected')
    : isPartialShare
    ? t('request.partialShareNote')
    : undefined;

  return (
    <View style={reviewStyles.actions}>
      {!hasPreparationFailed && selectionNote && (
        <Text style={[styles.small, reviewStyles.selectionNote]}>
          {selectionNote}
        </Text>
      )}
      {expiresAt !== undefined && (
        <View style={reviewStyles.sessionRow}>
          <Clock />
          <Text style={styles.small}>
            {t(hasRequestExpired ? 'request.expiring' : 'request.expires')}
          </Text>
          {!hasRequestExpired && (
            <Text weight="bold" style={reviewStyles.sessionTime}>
              {countdown.formattedTime}
            </Text>
          )}
        </View>
      )}
      {hasPreparationFailed ? (
        <>
          <Button
            styles={styles.buttonContainer}
            type="gradient"
            title={t('retry')}
            onPress={onRetryPreparation}
            disabled={hasRequestExpired}
          />
          <Button
            styles={styles.buttonContainer}
            type="outline"
            title={t('decline')}
            onPress={onDeclineRequest}
          />
        </>
      ) : hasFailedVerifierCheck ? (
        // Frame 29: declining is the safe default, sharing is still possible.
        <>
          <Button
            styles={styles.buttonContainer}
            type="gradient"
            title={t('decline')}
            onPress={onDeclineRequest}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityState={{disabled: isShareDisabled}}
            disabled={isShareDisabled}
            onPress={onShareSelectedCards}
            testID="shareMdoc"
            style={({pressed}) => [
              styles.linkButton,
              pressed && styles.pressed,
            ]}>
            <Text weight="semibold" style={styles.link}>
              {t('request.shareAnyway')}
            </Text>
          </Pressable>
          {selfieShare}
        </>
      ) : (
        <>
          <Button
            styles={styles.buttonContainer}
            type="gradient"
            title={shareTitle}
            onPress={onShareSelectedCards}
            disabled={isShareDisabled}
            testID="shareMdoc"
          />
          {selfieShare}
          <Button
            styles={styles.buttonContainer}
            type="outline"
            title={t('decline')}
            onPress={onDeclineRequest}
          />
        </>
      )}
    </View>
  );
}
