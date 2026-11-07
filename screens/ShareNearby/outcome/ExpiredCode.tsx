import {Theme} from '../../../components/ui/styleUtils';
import React from 'react';
import {Pressable, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import QRCode from 'react-native-qrcode-svg';
import {Button, Text} from '../../../components/ui';
import Timer from '../../../assets/shareNearby/timer.svg';

const styles = Theme.ShareNearbyStyles;
const engagementStyles = Theme.ShareNearbyEngagementStyles;
const outcomeStyles = Theme.ShareNearbyOutcomeStyles;

// A non-scannable placeholder qr pattern.
const PLACEHOLDER_QR = 'mobile-id-code-expired-'.repeat(8);

export function ExpiredCode({
  onNewCode,
  onCancel,
}: {
  onNewCode: () => void;
  onCancel: () => void;
}) {
  const {t} = useTranslation('ShareNearby');
  return (
    <>
      <View style={styles.center}>
        <Text
          weight="bold"
          style={[engagementStyles.heading, styles.centeredText]}>
          {t('outcome.codeExpired.title')}
        </Text>
        <Text style={[styles.body, styles.centeredText]}>
          {t('outcome.codeExpired.description')}
        </Text>
        <View style={engagementStyles.frame} testID="mdocExpiredQr">
          <View style={outcomeStyles.fadedQr}>
            <QRCode value={PLACEHOLDER_QR} size={176} quietZone={0} />
          </View>
          <View style={outcomeStyles.expiredOverlay}>
            <View style={outcomeStyles.timerBadge}>
              <Timer />
            </View>
            <Text weight="semibold" style={outcomeStyles.expiredLabel}>
              {t('outcome.codeExpired.badge')}
            </Text>
          </View>
        </View>
        <Text style={[styles.small, styles.centeredText]}>
          {t('outcome.codeExpired.note')}
        </Text>
      </View>
      <View style={styles.actions}>
        <Button
          styles={styles.buttonContainer}
          type="gradient"
          title={t('newCode')}
          onPress={onNewCode}
        />
        <Pressable
          accessibilityRole="button"
          onPress={onCancel}
          style={({pressed}) => [styles.linkButton, pressed && styles.pressed]}>
          <Text weight="semibold" style={styles.link}>
            {t('cancel')}
          </Text>
        </Pressable>
      </View>
    </>
  );
}
