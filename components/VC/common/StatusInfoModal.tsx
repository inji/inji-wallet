import React from 'react';
import {Dimensions, View, TouchableOpacity, StyleSheet} from 'react-native';
import {Overlay} from 'react-native-elements';
import {Icon} from 'react-native-elements';
import {Column, Row, Text} from '../../ui';
import {useTranslation} from 'react-i18next';
import {VC_STATUS_KEYS} from './VCUtils';
import {SvgImage} from '../../ui/svg';
import testIDProps from '../../../shared/commonUtil';

interface StatusInfoModalProps {
  isVisible: boolean;
  onClose: () => void;
}

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

export const StatusInfoModal: React.FC<StatusInfoModalProps> = ({
  isVisible,
  onClose,
}) => {
  const {t} = useTranslation('ViewVcModal');

  return (
    <Overlay
      {...testIDProps('statusInfoModal')}
      isVisible={isVisible}
      overlayStyle={styles.overlay}
      onBackdropPress={onClose}>
      <Column style={styles.container}>
        {/* Header */}
        <Row style={styles.header}>
          <Text weight="bold" style={styles.headerTitle}>
            {t('statusInfoTitle')}
          </Text>
          <TouchableOpacity
            {...testIDProps('closeStatusInfoModal')}
            onPress={onClose}
            style={styles.closeButton}>
            <Icon name="close" type="material" color="#000" size={24} />
          </TouchableOpacity>
        </Row>

        {/* Status Items */}
        <Column style={styles.contentContainer}>
          {VC_STATUS_KEYS.map((key, index) => (
            <View key={key}>
              <Row style={styles.statusItem}>
                <View style={styles.iconContainer}>{getStatusIcon(key)}</View>
                <Column style={styles.statusTextContainer}>
                  <Text weight="semibold" style={styles.statusTitle}>
                    {t(`statusToolTipContent.${key}.title`)}
                  </Text>
                  <Text style={styles.statusDescription}>
                    {t(`statusToolTipContent.${key}.description`)}
                  </Text>
                </Column>
              </Row>
              {index < VC_STATUS_KEYS.length - 1 && (
                <View style={styles.divider} />
              )}
            </View>
          ))}
        </Column>
      </Column>
    </Overlay>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 0,
    margin: 0,
    width: Dimensions.get('screen').width,
  },
  container: {
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    color: '#000',
    flex: 1,
    marginRight: 12,
  },
  closeButton: {
    padding: 4,
    flexShrink: 0,
  },
  contentContainer: {
    marginTop: 10,
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
  statusTextContainer: {
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

export default StatusInfoModal;
