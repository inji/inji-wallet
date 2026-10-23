import React from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {CardSkeleton} from '../revamp/CardSkeleton';
import {Page, PageButton, PageHeading} from '../revamp/Page';
import {ScaledText} from '../revamp/ScaledText';
import {ShieldCheckIcon} from '../revamp/Icons';
import {fonts, radii} from '../revamp/tokens';
import {useRevampTheme} from '../revamp/useRevampTheme';

/**
 * Shown while a card downloads: the card's outline stands where the card will appear, with the
 * card type and issuer from the offer. Other waits (setting up, preparing the request) show the
 * same page without the card.
 */
export const DownloadingCard: React.FC<{
  reason: string;
  cardType?: string;
  issuerName?: string;
  issuerTrusted?: boolean;
  onCancel?: () => void;
}> = ({reason, cardType, issuerName, issuerTrusted, onCancel}) => {
  const {t} = useTranslation('IssuersScreen');
  const {c, reduceMotion} = useRevampTheme();
  const downloading = reason === 'downloadingCredentials';

  return (
    <Page
      testID="downloadingCard"
      footer={
        onCancel ? (
          <PageButton
            testID="cancelDownload"
            variant="mutedLink"
            title={t('common:cancel')}
            onPress={onCancel}
          />
        ) : undefined
      }>
      <View style={styles.content}>
        {downloading ? (
          <View>
            <CardSkeleton reduceMotion={reduceMotion} />
            <View style={[styles.pill, {backgroundColor: c.tintAzure}]}>
              <ActivityIndicator size="small" color={c.azureInk} />
              <ScaledText style={[styles.pillText, {color: c.azureInk}]}>
                {t('downloadingPill')}
              </ScaledText>
            </View>
          </View>
        ) : (
          <ActivityIndicator size="large" color={c.ink} />
        )}
        <PageHeading
          testID="loaderTitle"
          size="medium"
          title={
            downloading
              ? cardType
                ? t('addingCard', {card: cardType})
                : t('addingYourCard')
              : t(`loaders.subTitle.${reason}`)
          }
          body={
            downloading
              ? issuerName
                ? t('issuerSending', {issuer: issuerName})
                : t('loaders.subTitle.inProgress')
              : t('loaders.subTitle.inProgress')
          }
        />
        {downloading && issuerTrusted ? (
          <View style={[styles.trusted, {backgroundColor: c.tintPass}]}>
            <ShieldCheckIcon color={c.pass} size={14} />
            <ScaledText style={[styles.pillText, {color: c.pass}]}>
              {t('issuerTrusted')}
            </ScaledText>
          </View>
        ) : null}
      </View>
    </Page>
  );
};

const styles = StyleSheet.create({
  content: {flex: 1, alignItems: 'center', paddingTop: 72, gap: 28},
  pill: {
    position: 'absolute',
    left: 134,
    bottom: 12,
    height: 28,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pillText: {fontFamily: fonts.semibold, fontSize: 12, lineHeight: 15},
  trusted: {
    height: 28,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: -10,
  },
});
