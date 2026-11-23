import {Theme} from '../../../components/ui/styleUtils';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Text} from '../../../components/ui';

const styles = Theme.ShareNearbyStyles;
const entryStyles = Theme.ShareNearbyEntryStyles;

export function EntryTitle() {
  const {t} = useTranslation('ShareNearby');
  return (
    <>
      <Text weight="bold" style={entryStyles.title}>
        {t('entry.title')}
      </Text>
      <Text style={styles.body}>{t('entry.description')}</Text>
    </>
  );
}
