import {Theme} from '../../../components/ui/styleUtils';
import React from 'react';
import {Pressable, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Text, Button} from '../../../components/ui';
import TickGreen from '../../../assets/shareNearby/check.svg';
import CrossRed from '../../../assets/shareNearby/cross-red.svg';

const styles = Theme.ShareNearbyStyles;
const helpStyles = Theme.ShareNearbyHelpStyles;

function SeeList({
  title,
  items,
  isSeen,
}: {
  title: string;
  items: string[];
  isSeen: boolean;
}) {
  return (
    <View
      style={[
        helpStyles.seePanel,
        isSeen ? helpStyles.seen : helpStyles.unseen,
      ]}>
      <Text weight="semibold" style={helpStyles.seeTitle}>
        {title}
      </Text>
      {items.map(item => (
        <View key={item} style={helpStyles.seeRow}>
          {isSeen ? (
            <TickGreen color={Theme.ShareNearbyColors.success} />
          ) : (
            <CrossRed />
          )}
          <Text style={[styles.flexible, helpStyles.description]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export function PrivacyHelp({
  onClose,
  onOpenRetentionHelp,
}: {
  onClose: () => void;
  onOpenRetentionHelp: () => void;
}) {
  const {t} = useTranslation('ShareNearby');
  const list = (key: string) => {
    const items = t(key, {returnObjects: true, defaultValue: []});
    return Array.isArray(items) ? (items as string[]) : [];
  };
  return (
    <>
      <Text style={styles.body}>{t('helpContent.privacyDescription')}</Text>
      <SeeList
        title={t('requestHelp.seeTitle')}
        items={list('requestHelp.seeItems')}
        isSeen
      />
      <SeeList
        title={t('requestHelp.notSeeTitle')}
        items={list('requestHelp.notSeeItems')}
        isSeen={false}
      />
      <Text style={styles.small}>{t('requestHelp.keptCopies')}</Text>
      <Button
        styles={styles.buttonContainer}
        type="gradient"
        title={t('requestHelp.gotIt')}
        onPress={onClose}
      />
      <Pressable
        accessibilityRole="button"
        onPress={onOpenRetentionHelp}
        style={({pressed}) => [styles.linkButton, pressed && styles.pressed]}>
        <Text weight="semibold" style={styles.link}>
          {t('request.retentionHelp')}
        </Text>
      </Pressable>
    </>
  );
}
