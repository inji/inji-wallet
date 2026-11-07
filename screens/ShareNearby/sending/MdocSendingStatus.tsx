import {Theme} from '../../../components/ui/styleUtils';
import React from 'react';
import {View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Text} from '../../../components/ui';
import Bluetooth from '../../../assets/shareNearby/bluetooth.svg';
import {ConnectionIllustration} from '../engagement/ConnectionIllustration';
import {TransferProgress} from './TransferProgress';

const styles = Theme.ShareNearbyStyles;

/** Frame 46. */
export function MdocSendingStatus({detailCount}: {detailCount: number}) {
  const {t} = useTranslation('ShareNearby');
  return (
    <View style={[styles.center, styles.flexible]}>
      <ConnectionIllustration phase="sending" />
      <Text weight="bold" style={[styles.title, styles.centeredText]}>
        {t('sending.title')}
      </Text>
      <Text style={[styles.body, styles.centeredText]}>
        {t('sending.details', {count: detailCount})}
      </Text>
      <TransferProgress label={t('sending.title')} />
      <View style={styles.row}>
        <Bluetooth />
        <Text style={styles.body}>{t('sending.description')}</Text>
      </View>
    </View>
  );
}
