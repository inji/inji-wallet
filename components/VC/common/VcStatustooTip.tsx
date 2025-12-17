import React from 'react';
import {useTranslation} from 'react-i18next';
import {View, StyleSheet} from 'react-native';
import {Column, Row} from '../../ui';
import {Theme} from '../../ui/styleUtils';
import {Text} from '../../ui';
import {VC_STATUS_KEYS} from './VCUtils';
import {SvgImage} from '../../ui/svg';

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'valid':
      return SvgImage.statusValidIcon(20, 20);
    case 'pending':
      return SvgImage.statusPendingIcon(20, 20);
    case 'expired':
      return SvgImage.statusExpiredIcon(20, 20);
    case 'revoked':
      return SvgImage.statusRevokedIcon(20, 20);
    default:
      return null;
  }
};

export const StatusTooltipContent = () => {
  const {t} = useTranslation('ViewVcModal');

  return (
    <Column style={styles.container}>
      {VC_STATUS_KEYS.map((key, index) => (
        <View key={key}>
          <Row style={styles.statusItem}>
            <View style={styles.iconContainer}>{getStatusIcon(key)}</View>
            <Column style={styles.textContainer}>
              <Text weight="semibold" style={styles.statusTitle}>
                {t(`statusToolTipContent.${key}.title`)}
              </Text>
              <Text weight="regular" style={styles.statusDescription}>
                {t(`statusToolTipContent.${key}.description`)}
              </Text>
            </Column>
          </Row>
          {index < VC_STATUS_KEYS.length - 1 && <View style={styles.divider} />}
        </View>
      ))}
    </Column>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 14,
    color: '#000',
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
});
