import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import {Overlay} from 'react-native-elements';
import {Icon} from 'react-native-elements';
import {Column, Row, Text} from '../../ui';
import {Theme} from '../../ui/styleUtils';
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
  const styles = Theme.StatusInfoModalStyles;

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

export default StatusInfoModal;
