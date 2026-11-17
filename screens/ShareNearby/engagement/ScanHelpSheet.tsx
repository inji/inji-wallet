import {Theme} from '../../../components/ui/styleUtils';
import React from 'react';
import {Pressable} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Modal} from '../../../components/ui/UpdatedModal';
import {Button, Text} from '../../../components/ui';
import Close from '../../../assets/shareNearby/close.svg';
import Sun from '../../../assets/shareNearby/sun.svg';
import Qr from '../../../assets/shareNearby/qr.svg';
import Bluetooth from '../../../assets/shareNearby/bluetooth.svg';
import {IconTip} from '../IconTip';
import testIDProps from '../../../shared/commonUtil';

const styles = Theme.ShareNearbyStyles;
const helpStyles = Theme.ShareNearbyHelpStyles;

export function ScanHelpSheet({
  visible,
  isBrightnessIncreased = false,
  onClose,
  onScanInstead,
}: {
  visible: boolean;
  isBrightnessIncreased?: boolean;
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
        description={t(
          isBrightnessIncreased
            ? 'helpContent.scanBrightnessDescription'
            : 'helpContent.scanReadableDescription',
        )}
      />
      <IconTip
        icon={<Bluetooth />}
        title={t('helpContent.scanCodeTypeTitle')}
        description={t('helpContent.scanCodeTypeDescription')}
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
        testID="mdocScanTryAgain"
        onPress={onClose}
      />
      <Pressable
        accessibilityRole="button"
        {...testIDProps('mdocScanInstead')}
        onPress={onScanInstead}
        style={({pressed}) => [styles.linkButton, pressed && styles.pressed]}>
        <Text weight="semibold" style={styles.link}>
          {t('helpContent.scanInstead')}
        </Text>
      </Pressable>
    </Modal>
  );
}
