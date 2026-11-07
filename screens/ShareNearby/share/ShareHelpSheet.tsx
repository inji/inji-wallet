import React from 'react';
import {View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Modal} from '../../../components/ui/UpdatedModal';
import {useTranslation} from 'react-i18next';
import {Text} from '../../../components/ui';
import {Theme} from '../../../components/ui/styleUtils';
import Qr from '../../../assets/shareNearby/qr.svg';
import IdBadge from '../../../assets/shareNearby/id-badge.svg';
import BluetoothBadge from '../../../assets/shareNearby/bluetooth-badge.svg';
import Close from '../../../assets/shareNearby/close.svg';
import Tick from '../../../assets/shareNearby/check.svg';

const styles = Theme.ShareNearbyStyles;
const helpStyles = Theme.ShareNearbyHelpStyles;
const shareStyles = Theme.ShareNearbyShareStyles;

function CodeKind({
  title,
  badge,
  description,
  icon,
}: {
  title: string;
  badge: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <View style={shareStyles.codeKind}>
      <LinearGradient
        colors={Theme.Colors.GradientColorsLight}
        start={Theme.LinearGradientDirection.start}
        end={Theme.LinearGradientDirection.end}
        style={shareStyles.codeKindIcon}>
        <Qr width={20} height={20} />
        <LinearGradient
          colors={Theme.Colors.GradientColors}
          style={shareStyles.codeKindBadge}>
          {icon}
        </LinearGradient>
      </LinearGradient>
      <View style={[styles.flexible, shareStyles.codeKindText]}>
        <View style={shareStyles.codeKindTitleRow}>
          <Text weight="semibold" style={shareStyles.codeKindTitle}>
            {title}
          </Text>
          <Text weight="semibold" style={shareStyles.codeKindTag}>
            {badge}
          </Text>
        </View>
        <Text style={shareStyles.codeKindDescription}>{description}</Text>
      </View>
    </View>
  );
}

export function ShareHelpSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const {t} = useTranslation('ShareNearby');
  return (
    <Modal
      presentation="bottomSheet"
      isVisible={visible}
      headerTitle={t('helpContent.title')}
      titleStyle={helpStyles.sheetTitle}
      contentContainerStyle={helpStyles.sheetContent}
      backdropStyle={helpStyles.backdrop}
      showHandle
      closeIcon={<Close />}
      closeAccessibilityLabel={t('close')}
      closeButtonType="gradient"
      closeLabel={t('requestHelp.gotIt')}
      onDismiss={onClose}>
      <Text style={styles.body}>{t('helpContent.description')}</Text>
      <View>
        <CodeKind
          title={t('entry.mdocTitle')}
          badge="mDoc"
          description={t('helpContent.mdocDescription')}
          icon={<IdBadge width={10} height={10} />}
        />
        <View style={shareStyles.divider} />
        <CodeKind
          title={t('entry.bleTitle')}
          badge="BLE"
          description={t('entry.bleDescription')}
          icon={<BluetoothBadge width={10} height={10} />}
        />
      </View>
      <View style={shareStyles.both}>
        <Text weight="semibold" style={shareStyles.bothTitle}>
          {t('helpContent.bothTitle')}
        </Text>
        {(['bothOffline', 'bothApproval', 'bothChoose'] as const).map(key => (
          <View key={key} style={shareStyles.bothRow}>
            <Tick color={Theme.ShareNearbyColors.detailTick} />
            <Text style={[styles.flexible, shareStyles.bothText]}>
              {t(`helpContent.${key}`)}
            </Text>
          </View>
        ))}
      </View>
    </Modal>
  );
}
