import React, {useEffect} from 'react';
import {
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import {Icon} from 'react-native-elements';
import {useTranslation} from 'react-i18next';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {VCMetadata} from '../../shared/VCMetadata';
import testIDProps from '../../shared/commonUtil';
import {ScaledText} from '../revamp/ScaledText';
import {CardSkeleton} from '../revamp/CardSkeleton';
import {CredentialCardFront, ScaledCard} from '../revamp/CredentialCard';
import {
  CredentialCardData,
  useCredentialCard,
} from '../revamp/useCredentialCard';
import {CARD_WIDTH, fonts, radii, shadows} from '../revamp/tokens';
import {useRevampTheme} from '../revamp/useRevampTheme';

/**
 * Shown once a downloaded credential is saved: the card itself, what was checked on the way
 * in, and a way into the wallet, where the new card is then highlighted.
 */
export const AddedToWalletScreen: React.FC<AddedToWalletScreenProps> = ({
  vcMetadata,
  onViewInWallet,
}) => {
  const {t} = useTranslation('IssuersScreen');
  const {c, reduceMotion} = useRevampTheme();
  const insets = useSafeAreaInsets();
  const {width} = useWindowDimensions();
  const {data} = useCredentialCard(vcMetadata);
  const cardWidth = Math.min(CARD_WIDTH, width - 48);

  // The credential is already saved, so going back means the same as View in Wallet.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onViewInWallet();
      return true;
    });
    return () => sub.remove();
  }, [onViewInWallet]);

  const checks = [
    {
      key: 'identityVerified',
      title: t('addedToWallet.identityVerified'),
      detail: t('addedToWallet.identityVerifiedDetail'),
    },
    {
      key: 'signedByIssuer',
      title: t('addedToWallet.signedByIssuer'),
      detail: data ? issuerIdentifier(data) : '',
    },
    {
      key: 'savedOnDevice',
      title: t('addedToWallet.savedOnDevice'),
      detail: t('addedToWallet.savedOnDeviceDetail'),
    },
  ];

  return (
    <View style={[styles.screen, {backgroundColor: c.canvas}]}>
      <View
        style={[
          styles.hero,
          {backgroundColor: c.sand, paddingTop: insets.top + 40},
        ]}>
        <View style={[shadows.card, {borderRadius: radii.card}]}>
          {data ? (
            <ScaledCard width={cardWidth}>
              <CredentialCardFront data={data} />
            </ScaledCard>
          ) : (
            <ScaledCard width={cardWidth}>
              <CardSkeleton reduceMotion={reduceMotion} />
            </ScaledCard>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}>
        <ScaledText
          {...testIDProps('addedToWalletTitle')}
          accessibilityRole="header"
          style={[styles.title, {color: c.ink}]}>
          {t('addedToWallet.title')}
        </ScaledText>
        <ScaledText style={[styles.subtitle, {color: c.inkMuted}]}>
          {data?.title
            ? t('addedToWallet.subtitle', {credential: data.title})
            : t('addedToWallet.subtitleGeneric')}
        </ScaledText>

        <View style={styles.checks}>
          {checks.map(check => (
            <View key={check.key} style={styles.check}>
              <View style={[styles.checkIcon, {backgroundColor: c.pass}]}>
                <Icon name="check" type="material" size={20} color="#ffffff" />
              </View>
              <View style={styles.checkText}>
                <ScaledText style={[styles.checkTitle, {color: c.ink}]}>
                  {check.title}
                </ScaledText>
                {check.detail ? (
                  <ScaledText
                    numberOfLines={1}
                    style={[styles.checkDetail, {color: c.inkMuted}]}>
                    {check.detail}
                  </ScaledText>
                ) : null}
              </View>
              <ScaledText style={[styles.checkDone, {color: c.pass}]}>
                {t('addedToWallet.done')}
              </ScaledText>
            </View>
          ))}
        </View>
      </ScrollView>

      <View
        style={[styles.footer, {paddingBottom: Math.max(insets.bottom, 16)}]}>
        <Pressable
          {...testIDProps('viewInWallet')}
          accessibilityRole="button"
          onPress={onViewInWallet}
          style={({pressed}) => [
            styles.button,
            shadows.raised,
            {backgroundColor: c.primary},
            pressed && styles.pressed,
          ]}>
          <ScaledText
            maxFontSizeMultiplier={1.3}
            style={[styles.buttonLabel, {color: c.onPrimary}]}>
            {t('addedToWallet.viewInWallet')}
          </ScaledText>
        </Pressable>
      </View>
    </View>
  );
};

/**
 * Who signed the credential: the W3C issuer id (often a DID), else the issuer's host, which is
 * all an SD-JWT or mDoc card carries without decoding it again.
 */
function issuerIdentifier(card: CredentialCardData): string {
  const issuer = card.credential?.credential?.issuer;
  const id = typeof issuer === 'string' ? issuer : issuer?.id;
  if (id) return id;
  if (card.claims?.iss) return card.claims.iss;
  const host = card.vcMetadata?.issuerHost ?? '';
  try {
    return new URL(host).host;
  } catch {
    return host;
  }
}

const styles = StyleSheet.create({
  screen: {flex: 1},
  hero: {
    alignItems: 'center',
    paddingBottom: 48,
    paddingHorizontal: 24,
  },
  body: {flex: 1},
  bodyContent: {paddingHorizontal: 24, paddingTop: 32, paddingBottom: 16},
  title: {fontFamily: fonts.bold, fontSize: 30, lineHeight: 38},
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 10,
  },
  checks: {marginTop: 28, gap: 22},
  check: {flexDirection: 'row', alignItems: 'center', gap: 16},
  checkIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {flex: 1, gap: 4},
  checkTitle: {fontFamily: fonts.semibold, fontSize: 17, lineHeight: 22},
  checkDetail: {fontFamily: fonts.mono, fontSize: 13, lineHeight: 18},
  checkDone: {fontFamily: fonts.semibold, fontSize: 14},
  footer: {paddingHorizontal: 24, paddingTop: 12},
  button: {
    height: 56,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: {fontFamily: fonts.semibold, fontSize: 17},
  pressed: {opacity: 0.85, transform: [{scale: 0.98}]},
});

interface AddedToWalletScreenProps {
  vcMetadata: VCMetadata;
  /** Leaves for the wallet, which highlights this card. */
  onViewInWallet: () => void;
}
