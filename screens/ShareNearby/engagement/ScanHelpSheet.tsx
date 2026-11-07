import {Theme} from '../../../components/ui/styleUtils';
import React from 'react';
import {Pressable} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Modal} from '../../../components/ui/UpdatedModal';
import {Button, Text} from '../../../components/ui';
import Close from '../../../assets/shareNearby/close.svg';
import Sun from '../../../assets/shareNearby/sun.svg';
import Qr from '../../../assets/shareNearby/qr.svg';
import {IconTip} from '../IconTip';

const styles = Theme.ShareNearbyStyles;
const helpStyles = Theme.ShareNearbyHelpStyles;

export function ScanHelpSheet({
  visible,
  onClose,
  onScanInstead,
}: {
  visible: boolean;
  onClose: () => void;
  onScanInstead: () => void;
}) {
  const {t} = useTranslation('ShareNearby');
  return (
    <Modal
      presentation="bottomSheet"
      isVisible={visible}
      headerTitle={t('helpContent.scanTitle')}
      titleStyle={helpStyles.sheetTitle}
      contentContainerStyle={helpStyles.sheetContent}
      backdropStyle={helpStyles.backdrop}
      showHandle
      closeIcon={<Close />}
      closeAccessibilityLabel={t('close')}
      onDismiss={onClose}>
      <IconTip
        icon={<Sun />}
        title={t('helpContent.scanReadableTitle')}
        description={t('helpContent.scanReadableDescription')}
      />
      <IconTip
        icon={<Qr width={16} height={16} />}
        title={t('helpContent.scanTheirsTitle')}
        description={t('helpContent.scanTheirsDescription')}
      />
      <Button
        styles={styles.buttonContainer}
        type="gradient"
        title={t('helpContent.scanTryAgain')}
        onPress={onClose}
      />
      <Pressable
        accessibilityRole="button"
        onPress={onScanInstead}
        style={({pressed}) => [styles.linkButton, pressed && styles.pressed]}>
        <Text weight="semibold" style={styles.link}>
          {t('helpContent.scanInstead')}
        </Text>
      </Pressable>
    </Modal>
  );
}
