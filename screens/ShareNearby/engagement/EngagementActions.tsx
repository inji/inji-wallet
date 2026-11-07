import {Theme} from '../../../components/ui/styleUtils';
import React from 'react';
import {Pressable, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Text, Button} from '../../../components/ui';

const styles = Theme.ShareNearbyStyles;

export function EngagementActions({
  isShowingQrCode,
  isConnected,
  onCancel,
  onHelp,
}: {
  isShowingQrCode: boolean;
  isConnected: boolean;
  onCancel: () => void;
  onHelp: () => void;
}) {
  const {t} = useTranslation('ShareNearby');

  return (
    <View style={styles.actions}>
      {isShowingQrCode && (
        <Pressable
          accessibilityRole="button"
          style={styles.linkButton}
          onPress={onHelp}>
          <Text weight="semibold" style={styles.link}>
            {t('engagement.scanHelp')}
          </Text>
        </Pressable>
      )}
      <Button
        styles={styles.buttonContainer}
        type="outline"
        title={t(isConnected ? 'engagement.endSession' : 'cancel')}
        onPress={onCancel}
      />
    </View>
  );
}
