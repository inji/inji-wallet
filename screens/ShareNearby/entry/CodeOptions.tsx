import {Theme} from '../../../components/ui/styleUtils';
import React from 'react';
import {Platform} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Text} from '../../../components/ui';
import IdBadge from '../../../assets/shareNearby/id-badge.svg';
import BluetoothBadge from '../../../assets/shareNearby/bluetooth-badge.svg';
import {CodeOption} from './CodeOption';

const styles = Theme.ShareNearbyStyles;

export function CodeOptions({
  hasMdocCredential,
  onPresent,
  onReceive,
}: {
  hasMdocCredential: boolean;
  onPresent: () => void;
  onReceive: () => void;
}) {
  const {t} = useTranslation('ShareNearby');
  return (
    <>
      <Text weight="semibold" style={styles.body}>
        {t('entry.choose')}
      </Text>
      <CodeOption
        title={t('entry.mdocTitle')}
        badge="mDoc"
        description={t('entry.mdocDescription')}
        disabled={!hasMdocCredential}
        onPress={onPresent}
        testID="presentMdoc"
        icon={<IdBadge />}
      />
      {!hasMdocCredential && (
        <Text style={styles.small}>{t('entry.noMdoc')}</Text>
      )}
      {/* iOS can't act as the Tuvali verifier yet, so the option is shown but greyed out. */}
      <CodeOption
        title={t('entry.bleTitle')}
        badge="BLE"
        description={t('entry.bleDescription')}
        disabled={Platform.OS !== 'android'}
        onPress={onReceive}
        testID="receiveBluetooth"
        icon={<BluetoothBadge />}
      />
      {Platform.OS !== 'android' && (
        <Text style={styles.small}>{t('entry.bleUnavailable')}</Text>
      )}
    </>
  );
}
