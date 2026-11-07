import React from 'react';
import {Pressable, Text as RNText, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Text} from '../../../components/ui';
import {Theme} from '../../../components/ui/styleUtils';
import type {ReaderTrust} from '../../../shared/mdocPresentation/types';
import Verified from '../../../assets/shareNearby/verified.svg';
import Chevron from '../../../assets/shareNearby/chevron.svg';
import QuestionGrey from '../../../assets/shareNearby/question-grey.svg';
import ShieldX from '../../../assets/shareNearby/shield-x.svg';

const styles = Theme.ShareNearbyStyles;
const reviewStyles = Theme.ShareNearbyReviewStyles;

function VerifiedVerifier({
  readerName,
  onPress,
}: {
  readerName: string;
  onPress: () => void;
}) {
  const {t} = useTranslation('ShareNearby');
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('request.verifierDetails', {name: readerName})}
      onPress={onPress}
      style={[styles.card, reviewStyles.verifier]}>
      <View style={reviewStyles.avatar}>
        <Text weight="semibold" style={reviewStyles.avatarText}>
          {Array.from(readerName).slice(0, 3).join('').toUpperCase()}
        </Text>
      </View>
      <View style={[styles.flexible, reviewStyles.gap]}>
        <Text weight="semibold" style={reviewStyles.cardTitle}>
          {readerName}
        </Text>
        <View style={[reviewStyles.trust, reviewStyles.verified]}>
          <Verified />
          <Text style={reviewStyles.verifiedText}>
            {t('requestHelp.trustLabel.verified')}
          </Text>
        </View>
      </View>
      <Chevron />
    </Pressable>
  );
}

/** Frames 25 (verified), 28 (unverified or unsigned) and 29 (failed check). */
export function VerifierCard({
  readerTrust,
  onPress,
  onLearnMore,
}: {
  readerTrust: ReaderTrust;
  onPress: () => void;
  onLearnMore: () => void;
}) {
  const {t} = useTranslation('ShareNearby');
  if (readerTrust.status === 'verified')
    return (
      <VerifiedVerifier
        readerName={readerTrust.readerName || t('request.unknownVerifier')}
        onPress={onPress}
      />
    );
  const isFailed = readerTrust.status === 'invalid';
  const copyKey = isFailed ? 'invalid' : 'unverified';
  return (
    <View
      style={[
        styles.card,
        reviewStyles.trustCard,
        isFailed && reviewStyles.failedCard,
      ]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t(`request.trustCard.${copyKey}.title`)}
        onPress={onPress}
        style={reviewStyles.trustCardHeader}>
        <View
          style={[reviewStyles.trustIcon, isFailed && reviewStyles.failedIcon]}>
          {isFailed ? <ShieldX /> : <QuestionGrey />}
        </View>
        <Text
          weight="semibold"
          style={[styles.flexible, reviewStyles.cardTitle]}>
          {t(`request.trustCard.${copyKey}.title`)}
        </Text>
        {!isFailed && <Chevron />}
      </Pressable>
      <Text
        style={[
          reviewStyles.trustCardText,
          isFailed && reviewStyles.failedText,
        ]}>
        {t(`request.trustCard.${copyKey}.description`)}{' '}
        <RNText
          accessibilityRole="link"
          onPress={onLearnMore}
          style={[
            Theme.TextStyles.semibold,
            reviewStyles.trustCardLink,
            isFailed && reviewStyles.failedLink,
          ]}>
          {t('requestHelp.learnMore')}
        </RNText>
      </Text>
    </View>
  );
}
