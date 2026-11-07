import {Theme} from '../../../components/ui/styleUtils';
import React from 'react';
import {ActivityIndicator, Platform, Pressable, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Modal} from '../../../components/ui/UpdatedModal';
import {Button, Text} from '../../../components/ui';
import BluetoothOff from '../../../assets/shareNearby/bluetooth-off.svg';
import Close from '../../../assets/shareNearby/close.svg';

const colors = Theme.ShareNearbyColors;
const styles = Theme.ShareNearbyStyles;
const helpStyles = Theme.ShareNearbyHelpStyles;
const readinessStyles = Theme.ShareNearbyReadinessStyles;

// NBY-03 (Android) and frame 13 (iOS): iOS cannot switch Bluetooth on for the app, so it
// sends the holder to Settings and continues once Bluetooth is on.
export function BluetoothOffSheet({
  visible,
  onTurnOn,
  onOpenSettings,
  onCancel,
}: {
  visible: boolean;
  onTurnOn: () => void;
  onOpenSettings: () => void;
  onCancel: () => void;
}) {
  const {t} = useTranslation('ShareNearby');
  const isIos = Platform.OS === 'ios';
  return (
    <Modal
      presentation="bottomSheet"
      isVisible={visible}
      contentContainerStyle={helpStyles.sheetContent}
      backdropStyle={helpStyles.backdrop}
      showHandle
      onDismiss={onCancel}>
      <View style={readinessStyles.sheetIcon}>
        <BluetoothOff
          width={22}
          height={22}
          color={Theme.ShareNearbyColors.secondary}
        />
      </View>
      <View style={readinessStyles.sheetHeader}>
        <Text weight="bold" style={[helpStyles.sheetTitle, styles.flexible]}>
          {t('readiness.bluetoothSheet.title')}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('close')}
          onPress={onCancel}
          style={readinessStyles.sheetClose}>
          <Close />
        </Pressable>
      </View>
      <Text style={styles.body}>
        {t(
          isIos
            ? 'readiness.bluetoothSheet.iosDescription'
            : 'readiness.bluetoothSheet.description',
        )}
      </Text>
      {isIos ? (
        <View style={readinessStyles.waiting}>
          <ActivityIndicator size="small" color={colors.accent} />
          <Text style={styles.small}>
            {t('readiness.bluetoothSheet.iosWaiting')}
          </Text>
        </View>
      ) : (
        <Text style={styles.small}>
          {t('readiness.bluetoothSheet.androidNote')}
        </Text>
      )}
      <Button
        styles={styles.buttonContainer}
        type="gradient"
        testID="turnOnBluetooth"
        title={t(
          isIos
            ? 'readiness.bluetoothSheet.openSettings'
            : 'readiness.bluetoothSheet.turnOn',
        )}
        onPress={isIos ? onOpenSettings : onTurnOn}
      />
      <Pressable
        accessibilityRole="button"
        onPress={onCancel}
        style={({pressed}) => [styles.linkButton, pressed && styles.pressed]}>
        <Text weight="semibold" style={styles.link}>
          {t('cancel')}
        </Text>
      </Pressable>
    </Modal>
  );
}
