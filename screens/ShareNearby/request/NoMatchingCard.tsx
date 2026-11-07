import {Theme} from '../../../components/ui/styleUtils';
import React from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Button, Text} from '../../../components/ui';
import type {MdocDocumentMatch} from '../../../shared/mdocPresentation/matching';
import type {ReaderTrust} from '../../../shared/mdocPresentation/types';
import IdBadge from '../../../assets/shareNearby/id-badge.svg';
import {VerifierCard} from './VerifierCard';
import {docTypeName, getRequestedElements} from './requestUtils';

const styles = Theme.ShareNearbyStyles;
const reviewStyles = Theme.ShareNearbyReviewStyles;

/** Frame 36: no card in the wallet answers any requested document, so there is nothing to review. */
export function NoMatchingCard({
  matches,
  readerTrust,
  onOpenVerifierDetails,
  onOpenIdentityHelp,
  onEndSession,
  onAddCard,
}: {
  matches: MdocDocumentMatch[];
  readerTrust?: ReaderTrust;
  onOpenVerifierDetails: (readerTrust: ReaderTrust) => void;
  onOpenIdentityHelp: () => void;
  onEndSession: () => void;
  onAddCard?: () => void;
}) {
  const {t} = useTranslation('ShareNearby');
  return (
    <View style={styles.flexible}>
      <ScrollView
        style={styles.flexible}
        contentContainerStyle={styles.content}>
        <Text weight="bold" style={styles.title}>
          {t('request.noCard.title')}
        </Text>
        {readerTrust && (
          <VerifierCard
            readerTrust={readerTrust}
            onPress={() => onOpenVerifierDetails(readerTrust)}
            onLearnMore={onOpenIdentityHelp}
          />
        )}
        <View style={reviewStyles.askedFor}>
          <Text style={styles.small}>{t('request.noCard.askedFor')}</Text>
          {matches.map((documentMatch, index) => (
            <View
              key={`${documentMatch.requested.docType}:${index}`}
              style={reviewStyles.askedForRow}>
              <IdBadge width={24} height={24} />
              <View style={styles.flexible}>
                <Text weight="semibold" style={reviewStyles.cardTitle}>
                  {docTypeName(documentMatch.requested.docType)}
                </Text>
                <Text style={styles.small}>
                  {t('request.noCard.notInWallet', {
                    count: getRequestedElements(documentMatch).length,
                  })}
                </Text>
              </View>
            </View>
          ))}
        </View>
        <Text style={styles.body}>{t('request.noCard.description')}</Text>
      </ScrollView>
      <View style={[reviewStyles.footer, reviewStyles.actions]}>
        <Button
          styles={styles.buttonContainer}
          type="gradient"
          title={t('engagement.endSession')}
          onPress={onEndSession}
        />
        {onAddCard && (
          <Pressable
            accessibilityRole="button"
            onPress={onAddCard}
            style={({pressed}) => [
              styles.linkButton,
              pressed && styles.pressed,
            ]}>
            <Text weight="semibold" style={styles.link}>
              {t('request.noCard.addCard')}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
